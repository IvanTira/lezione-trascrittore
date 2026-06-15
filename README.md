# Trascrittore Lezioni

App desktop per trascrivere audio e video di lezioni usando OpenAI Whisper.

## Requisiti
- Python 3.9+
- Node.js 18+
- ffmpeg (per video)

## Installazione

### Backend (Python + Whisper)
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend (Electron)
```bash
cd frontend
npm install
npm start
```

## Utilizzo
1. Avvia il backend: `backend/start.bat` (Windows) oppure `backend/start.sh` (Mac/Linux)
2. Avvia il frontend: `cd frontend && npm start`
3. Trascina un file audio/video o registra direttamente
4. Clicca **Trascrivi** e attendi il risultato

## Modelli Whisper disponibili
- `tiny` – velocissimo, meno preciso
- `base` – buon bilanciamento
- `small` – più preciso
- `medium` – alta qualità
- `large` – massima qualità (lento)
