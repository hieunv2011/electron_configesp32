import axios from "axios";

const API_BASE = "http://127.0.0.1:5000";
const api = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
});

export const listPorts = async () => {
  const res = await api.get("/list_ports");
  return res.data;
};

export const openPort = async (port, baud = 115200) => {
  const res = await api.post("/open", { port, baud });
  return res.data;
};

export const sendCommand = async (raw) => {
  const res = await api.post("/send", { raw });
  return res.data;
};

//sendWifiTh
export const sendWifiTh = async (serial, ssid, password) => {
  if (!ssid || !password) throw new Error("Thiếu SSID hoặc password");
  const raw = `@,CONFIG,${serial || ""},WIFI1,${ssid},${password}$`;
  const res = await sendCommand(raw);
  return res;
};

//sendWifiDt
export const sendWifiDt = async (serial, ssid, password) => {
  if (!ssid || !password) throw new Error("Thiếu SSID hoặc password");
  const raw = `@,CONFIG,${serial || ""},WIFI2,${ssid},${password}$`;
  const res = await sendCommand(raw);
  return res;
};

//sendServerTh
export const sendServerTh = async (serial, server) => {
  if (!server) throw new Error("Thiếu server");
  const raw = `@,CONFIG,${serial || ""},http_server1,${server}$`;
  const res = await sendCommand(raw);
  return res;
}

//sendServerTbTh
export const sendServerTbTh = async (serial, server) => {
  if (!server) throw new Error("Thiếu server");
  const raw = `@,CONFIG,${serial || ""},tb_server,${server}$`;
  const res = await sendCommand(raw);
  return res;
}

//sendServerDt
export const sendServerDt = async (serial, server) => {
  if (!server) throw new Error("Thiếu server");
  const raw = `@,CONFIG,${serial || ""},http_server2,${server}$`;
  const res = await sendCommand(raw);
  return res;
};

//sendServerTbDt
export const sendServerTbDt = async (serial, server) => {
  if (!server) throw new Error("Thiếu server");
  const raw = `@,CONFIG,${serial || ""},tb_server_dt,${server}$`;
  const res = await sendCommand(raw);
  return res;
}

//sendSocketTh
export const sendSocketTh = async (serial, ws_server,ws_port) => {
  if (!ws_server || !ws_port) throw new Error("Thiếu ws_server hoặc ws_port");
  const raw1 = `@,CONFIG,${serial || ""},ws_server,${ws_server}$`;
  const raw2 = `@,CONFIG,${serial || ""},ws_port,${ws_port}$`;
  const res1 = await sendCommand(raw1);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const res2 = await sendCommand(raw2);
  return { first: res1, second: res2 };
};

//sendReboot
export const sendReboot = async (serial) => {
  if (!serial) throw new Error("Thiếu Serial");
  const raw = `@,REBOOT,${serial}$`;
  const res = await sendCommand(raw);
  return res;
};

//sendReset
export const sendReset = async (serial) => {
  if (!serial) throw new Error("Thiếu Serial");
  const raw = `@,RESET,${serial}$`;
  const res = await sendCommand(raw);
  return res;
}

//sendCapture
export const sendCapture = async (serial) => {
  if (!serial) throw new Error("Thiếu Serial");
  const raw = `@,CAPTURE,${serial}$`;
  const res = await sendCommand(raw);
  return res;
}

//SendFram
export const sendFram = async (serial) => {
  if (!serial) throw new Error("Thiếu Serial");
  const raw = `@,FRAM,${serial}$`;
  const res = await sendCommand(raw);
  return res;
}

//SendOTA
export const sendOTA = async (serial, ota_url) => {
  if (!serial) throw new Error("Thiếu Serial");
  const raw = `@,OTA,${serial}$`;
  const res = await sendCommand(raw);
  return res;
}

export const closePort = async () => {
  const res = await api.post("/close");
  return res.data;
};

export default api;
