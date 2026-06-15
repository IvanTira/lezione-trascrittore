const API_BASE = 'http://localhost:8765'

let selectedFilePath = null

const dropZone = document.getElementById('drop-zone')
const filePicker = document.getElementById('btn-pick')
const fileNameEl = document.getElementById('file-name')
const btnTranscribe = document.getElementById('btn-transcribe')
const btnCheck = document.getElementById('btn-check')
const btnCopy = document.getElementById('btn-copy')
const btnSave = document.getElementById('btn-save')
const resultSection = document.getElementById('result-section')
const resultText = document.getElementById('result-text')
const statusBar = document.getElementById('status-bar')
const progress = document.getElementById('progress')
const progressText = document.getElementById('progress-text')
const modelSelect = document.getElementById('model-select')
const langSelect = document.getElementById('lang-select')

function setStatus(msg, type = 'info') {
  statusBar.textContent = msg
  statusBar.className = `status-bar ${type}`
  statusBar.classList.remove('hidden')
}

function showProgress(msg) {
  progressText.textContent = msg
  progress.classList.remove('hidden')
}
function hideProgress() { progress.classList.add('hidden') }

function setFile(name, path) {
  selectedFilePath = path
  fileNameEl.textContent = `📄 ${name}`
  fileNameEl.classList.remove('hidden')
  btnTranscribe.disabled = false
}

// Drag & Drop
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over') })
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'))
dropZone.addEventListener('drop', e => {
  e.preventDefault()
  dropZone.classList.remove('drag-over')
  const file = e.dataTransfer.files[0]
  if (file) setFile(file.name, file.path)
})

// File picker (Electron)
filePicker.addEventListener('click', async () => {
  const path = await window.electronAPI.openFile()
  if (path) {
    const name = path.split(/[\\/]/).pop()
    setFile(name, path)
  }
})

// Verifica backend
btnCheck.addEventListener('click', async () => {
  try {
    const r = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) })
    if (r.ok) setStatus('✅ Backend attivo e pronto!', 'success')
    else setStatus('⚠️ Backend risponde ma con errore', 'warning')
  } catch {
    setStatus('❌ Backend non raggiungibile. Avvia backend/start.bat prima.', 'error')
  }
})

// Trascrivi
btnTranscribe.addEventListener('click', async () => {
  if (!selectedFilePath) return
  btnTranscribe.disabled = true
  resultSection.classList.add('hidden')
  showProgress(`Invio file al backend (modello: ${modelSelect.value})…`)

  try {
    const resp = await fetch(selectedFilePath.startsWith('http') ? selectedFilePath : `file://${selectedFilePath}`)
    const blob = await resp.blob()
    const name = selectedFilePath.split(/[\\/]/).pop()
    const formData = new FormData()
    formData.append('file', blob, name)
    formData.append('model', modelSelect.value)
    formData.append('language', langSelect.value)

    progressText.textContent = 'Trascrizione in corso… (può richiedere qualche minuto)'

    const r = await fetch(`${API_BASE}/transcribe`, { method: 'POST', body: formData })
    if (!r.ok) {
      const err = await r.json().catch(() => ({ detail: r.statusText }))
      throw new Error(err.detail || 'Errore sconosciuto')
    }
    const data = await r.json()
    resultText.value = data.text
    resultSection.classList.remove('hidden')
    setStatus(`✅ Trascrizione completata! Lingua rilevata: ${data.language || '—'}`, 'success')
  } catch (e) {
    setStatus(`❌ Errore: ${e.message}`, 'error')
  } finally {
    hideProgress()
    btnTranscribe.disabled = false
  }
})

// Copia
btnCopy.addEventListener('click', () => {
  navigator.clipboard.writeText(resultText.value)
    .then(() => setStatus('📋 Testo copiato negli appunti!', 'success'))
})

// Salva
btnSave.addEventListener('click', async () => {
  const ok = await window.electronAPI.saveText(resultText.value)
  if (ok) setStatus('💾 File salvato con successo!', 'success')
})
