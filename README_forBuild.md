---
cd backend
Tại thư mục `backend`, chạy:
```bash
python -m venv venv
```
Kích hoạt môi trường ảo:
- **Windows:**
  ```bash
  .venv\Scripts\activate
  ```
Cài PyInstaller:
```bash
pip install pyinstaller
```
Build:
```bash
pyinstaller --onefile --hidden-import=flask --hidden-import=serial --hidden-import=serial.tools.list_ports --collect-submodules flask --collect-submodules serial --collect-submodules werkzeug --copy-metadata flask --copy-metadata pyserial serial_service.py
```
Kết quả: `backend/dist/serial_service.exe`

---

--- 

cd frontend
```bash
npm run build
```
Kết quả sau khi build:
```
frontend/dist/
├── index.html
├── assets/
└── ...
```
---


---
cd electron
copy 2 file dist sang backend/frontend
```bash
npm run build.exe
npx serve dist
```