import { ipcMain, BrowserWindow } from "electron";
import { SerialPort } from "serialport";

let port;
let buffer = "";

// Thêm API để lấy danh sách cổng COM
ipcMain.handle("serial:list", async () => {
  try {
    const ports = await SerialPort.list();
    return ports.map(port => ({
      path: port.path,
      manufacturer: port.manufacturer,
      productId: port.productId,
      vendorId: port.vendorId,
      pnpId: port.pnpId,
      friendlyName: port.friendlyName
    }));
  } catch (err) {
    throw new Error("Không thể lấy danh sách cổng: " + err.message);
  }
});

ipcMain.handle("serial:open", async (_, path, baudRate = 115200) => {
  try {
    if (port && port.isOpen) port.close();

    port = new SerialPort({
      path,
      baudRate,
      autoOpen: false,
    });

    await new Promise((resolve, reject) => {
      port.open((err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    port.on("data", (data) => {
      buffer += data.toString();
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop();
      for (const line of lines) {
        if (line.trim() !== "")
          BrowserWindow.getAllWindows()[0]?.webContents.send("serial:data", line.trim());
      }
    });

    port.on("error", (err) => {
      BrowserWindow.getAllWindows()[0]?.webContents.send("serial:data", `[ERROR] ${err.message}`);
    });

    port.on("close", () => {
      BrowserWindow.getAllWindows()[0]?.webContents.send("serial:data", "[INFO] Serial port closed");
    });

    return "opened";
  } catch (err) {
    throw new Error("Không thể mở cổng " + path + ": " + err.message);
  }
});

ipcMain.handle("serial:send", async (_, message) => {
  if (port && port.isOpen) {
    port.write(message + "\n");
    return "sent";
  } else {
    throw new Error("Serial not open");
  }
});

ipcMain.handle("serial:close", async () => {
  if (port && port.isOpen) {
    port.close();
    return "closed";
  } else {
    return "chưa mở cổng";
  }
});
