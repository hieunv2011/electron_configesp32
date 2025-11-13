const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const { exec } = require("child_process");
const axios = require("axios");

let pyProc = null;

// ------------------- Backend -------------------
function startBackend() {
  const exePath = app.isPackaged
    ? path.join(process.resourcesPath, "backend", "dist", "serial_service.exe")
    : path.join(__dirname, "..", "backend", "dist", "serial_service.exe");

  console.log("Starting backend:", exePath);

  const options = {
    detached: false,
    stdio: "pipe",
    windowsHide: true,
    shell: false,
    env: {
      ...process.env,
      WERKZEUG_RUN_MAIN: "true",
      PYTHONUNBUFFERED: "1",
    },
    cwd: path.dirname(exePath),
  };

  try {
    pyProc = spawn(exePath, [], options);

    if (pyProc.stdout) {
      pyProc.stdout.on("data", (d) => {
        console.log(`[backend stdout] ${d.toString()}`);
      });
    }
    if (pyProc.stderr) {
      pyProc.stderr.on("data", (d) => {
        console.error(`[backend stderr] ${d.toString()}`);
      });
    }

    pyProc.on("error", (err) => {
      console.error("Backend process error:", err);
    });

    pyProc.on("exit", (code, signal) => {
      console.log(`Backend exited with code ${code}, signal ${signal}`);
      pyProc = null;
    });

    console.log("Backend started, PID:", pyProc.pid);
  } catch (e) {
    console.error("Failed to start backend:", e);
    pyProc = null;
  }
}

function stopBackend() {
  if (!pyProc) {
    // fallback: vẫn cố kill theo tên nếu có process cũ còn sống
    try {
      if (process.platform === "win32") {
        exec(`taskkill /IM serial_service.exe /F`, (err) => {
          if (err) console.error("Fallback taskkill by name failed:", err);
          else console.log("Fallback: killed serial_service.exe by name");
        });
      }
    } catch (e) {}
    return;
  }

  const pid = pyProc.pid;
  console.log("Stopping backend, PID:", pid);

  // 1) Thử kill "theo PID" trước
  exec(`taskkill /PID ${pid} /T /F`, (err, stdout, stderr) => {
    if (err) {
      console.error("taskkill by PID failed:", err);
    } else {
      console.log("taskkill by PID stdout:", stdout);
    }

    // 2) Sau 300ms, kiểm tra và kill theo tên (dùng làm kế hoạch B)
    setTimeout(() => {
      // Kiểm tra còn process với tên exe hay không, nếu còn thì kill theo tên
      if (process.platform === "win32") {
        exec(`tasklist /FI "IMAGENAME eq serial_service.exe"`, (err2, out2) => {
          if (!err2 && out2 && out2.includes("serial_service.exe")) {
            exec(`taskkill /IM serial_service.exe /F`, (err3) => {
              if (err3)
                console.error("Fallback taskkill by name failed:", err3);
              else console.log("Fallback: killed serial_service.exe by name");
            });
          } else {
            console.log(
              "No serial_service.exe processes remain (by name check)."
            );
          }
        });
      }
    }, 300);
  });

  // ensure we clear reference
  pyProc = null;

  // Optional: close serial port politely via HTTP request (không chặn)
  axios.post("http://127.0.0.1:5000/close").catch(() => {});
}

// ------------------- Electron window -------------------

//Version function
// Version function
let buildVersion = "unknown";
try {
  const versionPath = app.isPackaged
    ? path.join(process.resourcesPath, "version.json")
    : path.join(__dirname, "version.json");

  const data = fs.readFileSync(versionPath, "utf8");
  buildVersion = JSON.parse(data).version;
} catch (e) {
  console.error("Failed to read version.json", e);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  win.loadFile(path.join(__dirname, "frontend/dist/index.html"));
  win.webContents.on("did-finish-load", () => {
    win.setTitle(`ESP32 Manager - v${buildVersion}`);
  });
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

app.on("window-all-closed", async () => {
  await stopBackend();
  if (process.platform !== "darwin") {
    setTimeout(() => app.quit(), 500);
  }
});
