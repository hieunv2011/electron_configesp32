
import win32serviceutil
import win32service
import win32event
import servicemanager
import subprocess
import os

class ESP32Service(win32serviceutil.ServiceFramework):
    _svc_name_ = "ESP32ManagerService"
    _svc_display_name_ = "ESP32 Manager Backend Service"
    _svc_description_ = "Flask backend service for ESP32 Manager"

    def __init__(self, args):
        super().__init__(args)
        self.hWaitStop = win32event.CreateEvent(None, 0, 0, None)
        self.process = None

    def SvcStop(self):
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        if self.process:
            self.process.terminate()
        win32event.SetEvent(self.hWaitStop)

    def SvcDoRun(self):
        servicemanager.LogInfoMsg("ESP32 Manager Service starting...")
        python_exe = "python"  # hoặc đường dẫn tuyệt đối tới python.exe
        script_path = os.path.join(os.path.dirname(__file__), "serial_service.py")
        self.process = subprocess.Popen([python_exe, script_path])
        win32event.WaitForSingleObject(self.hWaitStop, win32event.INFINITE)

if __name__ == '__main__':
    win32serviceutil.HandleCommandLine(ESP32Service)
