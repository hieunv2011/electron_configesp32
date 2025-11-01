const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const axios = require("axios");

let pyProc = null;

// ------------------- Backend -------------------
function startBackend() {
  const script = path.join(__dirname, "backend/run_backend_electron.bat");
  pyProc = spawn("cmd.exe", ["/c", script], { stdio: "inherit" });
  console.log("🔌 Backend started");
}

function stopBackend() {
  if (pyProc) {
    pyProc.kill(); // kill process backend
    pyProc = null;
    console.log("❌ Backend stopped");
  }

  // Đồng thời gửi request để đóng cổng serial nếu backend vẫn chạy
  axios.post("http://127.0.0.1:5000/close").catch(() => {
    console.log("Serial port may already be closed");
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
