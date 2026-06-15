"""
Trascrittore Lezioni — Backend FastAPI + Whisper
Avvia con: uvicorm main:app --reload --port 8765
"""
import os
import tempfile
from pathlib import Path

import whisper
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI(title="Trascrittore Lezioni", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cache del modello caricato
_model = None
_model_name = None

def get_model(name: str = "base"):
    global _model, _model_name
    if _model is None or _model_name != name:
        print(f"Carico modello Whisper '{name}'...")
        _model = whisper.load_model(name)
        _model_name = name
        print("Modello pronto.")
    return _model


@app.get("/")
def root():
    return {"status": "ok", "service": "Trascrittore Lezioni"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    model: str = Form("base"),
    language: str = Form("it"),
):
    """Trascrive il file audio/video caricato."""
    allowed = {".mp3", ".mp4", ".wav", ".m4a", ".ogg", ".flac", ".mkv", ".avi", ".mov", ".webm"}
    ext = Path(file.filename).suffix.lower()
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"Formato non supportato: {ext}")

    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        whisper_model = get_model(model)
        options = {"language": language if language != "auto" else None}
        result = whisper_model.transcribe(tmp_path, **{k: v for k, v in options.items() if v})
        text = result["text"].strip()
        segments = [
            {"start": round(s["start"], 2), "end": round(s["end"], 2), "text": s["text"].strip()}
            for s in result.get("segments", [])
        ]
        return JSONResponse({"text": text, "segments": segments, "language": result.get("language", "")})
    finally:
        os.unlink(tmp_path)


@app.get("/models")
def list_models():
    return {"models": ["tiny", "base", "small", "medium", "large"]}
