const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const axios = require("axios");

let pyProc = null;

// ------------------- Backend -------------------
function startBackend() {
  // Kiểm tra xem đang chạy từ exe hay development
  const isDev = !app.isPackaged;
  
  // Trong development: ../backend/dist/app.exe
  // Trong production: resources/backend/dist/app.exe
  const exePath = isDev
    ? path.join(__dirname, "..", "backend", "dist", "serial_service.exe")
    : path.join(process.resourcesPath, "backend", "dist", "serial_service.exe");

  try {
    console.log("Starting backend from:", exePath);
    
    // Thêm working directory và environment
    const options = {
      detached: false,  // Để process được quản lý bởi parent
      stdio: 'pipe',    // Capture tất cả output
      windowsHide: false,
      shell: false,     // Không chạy qua shell để tránh vấn đề với path
      cwd: path.dirname(exePath), // Set working directory là thư mục chứa exe
      env: {
        ...process.env,
        PYTHONUNBUFFERED: '1'  // Force Python flush output ngay lập tức
      }
    };

    pyProc = spawn(exePath, [], options);
    
    // Capture và log output
    if (pyProc.stdout) {
      pyProc.stdout.on('data', (data) => {
        console.log(`Backend stdout: ${data.toString()}`);
      });
    }
    
    if (pyProc.stderr) {
      pyProc.stderr.on('data', (data) => {
        console.error(`Backend stderr: ${data.toString()}`);
      });
    }
    
    pyProc.on('error', (err) => {
      console.error('Backend process error:', err);
    });

    pyProc.on('exit', (code, signal) => {
      console.log(`Backend exited with code ${code} and signal ${signal}`);
      if (code !== 0) {
        console.error('Backend crashed. Attempting restart...');
        // Thử restart sau 1 giây nếu crash
        setTimeout(startBackend, 1000);
      }
    });

    // Kiểm tra process có start thành công không
    if (pyProc.pid) {
      console.log('🔌 Backend started successfully with PID:', pyProc.pid);
    } else {
      throw new Error('Backend process failed to start');
    }

  } catch (err) {
    console.error('❌ Failed to start backend:', err);
    // Log full stack trace
    if (err.stack) console.error(err.stack);
  }
}

function stopBackend() {
  if (pyProc) {
    pyProc.kill(); // Dừng process backend
    pyProc = null;
    console.log("❌ Backend stopped");
  }

  // Gửi request để backend đóng cổng serial nếu vẫn còn chạy
  axios.post("http://127.0.0.1:5000/close").catch(() => {
    console.log("Serial port may already be closed or backend not responding");
  });
}

// ------------------- Electron window -------------------
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile(path.join(__dirname, "frontend/dist/index.html"));
}

app.whenReady().then(() => {
  startBackend();
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// ------------------- Quit events -------------------
app.on("before-quit", () => {
  stopBackend(); // trước khi quit thì dừng backend & đóng cổng
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
