const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 700,
    minHeight: 500,
    title: 'Trascrittore Lezioni',
    icon: path.join(__dirname, 'renderer', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'))
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// Apri dialogo file
ipcMain.handle('open-file-dialog', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Seleziona file audio/video',
    filters: [
      { name: 'Audio/Video', extensions: ['mp3', 'mp4', 'wav', 'm4a', 'ogg', 'flac', 'mkv', 'avi', 'mov', 'webm'] },
      { name: 'Tutti i file', extensions: ['*'] },
    ],
    properties: ['openFile'],
  })
  return canceled ? null : filePaths[0]
})

// Salva testo
ipcMain.handle('save-text', async (_, text) => {
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Salva trascrizione',
    defaultPath: 'trascrizione.txt',
    filters: [{ name: 'Testo', extensions: ['txt'] }],
  })
  if (canceled) return false
  require('fs').writeFileSync(filePath, text, 'utf-8')
  return true
})
