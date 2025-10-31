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

//sendWifi
export const sendWifiTh = async (serial, ssid, password) => {
  if (!ssid || !password) throw new Error("Thiếu SSID hoặc password");
  const raw = `@,CONFIG,${serial || ""},WIFI1,${ssid},${password}$`;
  const res = await sendCommand(raw);
  return res;
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


export const closePort = async () => {
  const res = await api.post("/close");
  return res.data;
};

export default api;
