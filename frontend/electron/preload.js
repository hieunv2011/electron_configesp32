const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  onData: (callback) => ipcRenderer.on("serial:data", (_, data) => callback(data)),
});
