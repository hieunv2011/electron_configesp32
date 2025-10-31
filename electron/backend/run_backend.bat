@echo off
cd /d "%~dp0"

echo === Activating virtual environment ===
call .venv\Scripts\activate

echo === Installing dependencies ===
pip install -r requirements.txt >nul 2>&1

echo === Starting Flask backend ===
python serial_service.py

pause
