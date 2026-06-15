@echo off
cd /d "%~dp0"
if not exist ".venv" (
    echo Creo virtualenv...
    python -m venv .venv
)
call .venv\Scripts\activate.bat
pip install -q -r requirements.txt
echo Avvio backend su http://localhost:8765 ...
uvicorn main:app --host 0.0.0.0 --port 8765
pause
