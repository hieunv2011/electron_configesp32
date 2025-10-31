import React, { useState, useEffect, useRef } from "react";
import {
  Input,
  Button,
  Space,
  Form,
  Divider,
  Typography,
  Select,
  Flex,
} from "antd";

import { SendOutlined, WifiOutlined, LockOutlined } from "@ant-design/icons";

import { buildCommand } from "../utils/commandBuilder";

const { Text } = Typography;
const { Option } = Select;

export default function WifiConfigForm() {
  const [comPort, setComPort] = useState("");
  const [comPorts, setComPorts] = useState([]);
  const [serial, setSerial] = useState("");
  const [ssidTh, setSsidTh] = useState("");
  const [passwordTh, setPasswordTh] = useState("");
  const [ssidDt, setSsidDt] = useState("");
  const [passwordDt, setPasswordDt] = useState("");
  const [response, setResponse] = useState("");
  const [lastCommand, setLastCommand] = useState("");
  const [portOpened, setPortOpened] = useState(false);
  const responseRef = useRef(null);

  // Lấy danh sách cổng COM
  const refreshPorts = async () => {
    try {
      const ports = await window.electron.invoke("serial:list");
      setComPorts(ports);

      // Tự động chọn cổng ESP32 (Silicon Labs CP210x)
      const esp32Port = ports.find(
        (port) =>
          port.manufacturer?.includes("Silicon Labs") ||
          port.friendlyName?.includes("CP210x")
      );

      if (esp32Port && !portOpened) {
        setComPort(esp32Port.path);
        setResponse(
          (prev) => prev + `🔍 Đã tìm thấy ESP32 tại cổng ${esp32Port.path}\n`
        );
      }
    } catch (err) {
      setResponse(
        (prev) =>
          prev + "❌ Không thể lấy danh sách cổng: " + err.message + "\n"
      );
    }
  };

  // Nhận dữ liệu từ Electron (phản hồi từ ESP32)
  useEffect(() => {
    window.electron.onData((data) => {
      setResponse((prev) => prev + data + "\n");
    });
    // Lấy danh sách cổng khi component được mount
    refreshPorts();
  }, []);

  // Tự động cuộn xuống cuối khi có log mới
  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [response]);

  const handleOpen = async () => {
    try {
      await window.electron.invoke("serial:open", comPort, 115200);
      setPortOpened(true);
      setResponse((prev) => prev + "✅ Cổng Serial đã mở\n");
    } catch (err) {
      setResponse(
        (prev) => prev + "❌ Không mở được cổng: " + err.message + "\n"
      );
    }
  };

  //Config wifi Th
  const handleSendConfigWifiTh = async () => {
    if (!portOpened) {
      setResponse((prev) => prev + "⚠️ Vui lòng mở cổng trước khi gửi lệnh!\n");
      return;
    }
    const cmd = buildCommand("CONFIG", serial, "WIFI1", ssidTh, passwordTh);
    setLastCommand(cmd);
    try {
      await window.electron.invoke("serial:send", cmd);
      setResponse((prev) => prev + `➡️ Gửi lệnh CONFIG: ${cmd}\n`);
    } catch (err) {
      setResponse((prev) => prev + "❌ Lỗi gửi lệnh: " + err.message + "\n");
    }
  };

  //Config wifi Dt
  const handleSendConfigWifiDt = async () => {
    if (!portOpened) {
      setResponse((prev) => prev + "⚠️ Vui lòng mở cổng trước khi gửi lệnh!\n");
      return;
    }
    const cmd = buildCommand("CONFIG", serial, "WIFI2", ssidDt, passwordDt);
    setLastCommand(cmd);
    try {
      await window.electron.invoke("serial:send", cmd);
      setResponse((prev) => prev + `➡️ Gửi lệnh CONFIG: ${cmd}\n`);
    } catch (err) {
      setResponse((prev) => prev + "❌ Lỗi gửi lệnh: " + err.message + "\n");
    }
  };

  const handleSendReboot = async () => {
    if (!portOpened) {
      setResponse((prev) => prev + "⚠️ Vui lòng mở cổng trước khi gửi lệnh!\n");
      return;
    }
    const cmd = buildCommand("REBOOT", serial);
    setLastCommand(cmd);
    try {
      await window.electron.invoke("serial:send", cmd);
      setResponse((prev) => prev + `➡️ Gửi lệnh REBOOT: ${cmd}\n`);
      await new Promise((resolve) => setTimeout(resolve, 500));
      await window.electron.invoke("serial:close");
      setPortOpened(false);
      setResponse(
        (prev) => prev + "🔌 Đã tự động đóng cổng Serial để ESP32 reboot\n"
      );
    } catch (err) {
      setResponse((prev) => prev + "❌ Lỗi gửi lệnh: " + err.message + "\n");
    }
  };

  const handleClose = async () => {
    try {
      await window.electron.invoke("serial:close");
      setPortOpened(false);
      setResponse((prev) => prev + "🔌 Cổng Serial đã đóng\n");
    } catch (err) {
      setResponse((prev) => prev + "❌ Lỗi đóng cổng: " + err.message + "\n");
    }
  };

  const handleClearLog = () => {
    setResponse("");
  };

  return (
    <Form layout="vertical" style={{ padding: 16 }}>
      {/* COM control */}
      <Form.Item>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text strong>ESP32 Serial</Text>
          <Space>
            <Select
              value={comPort}
              onChange={setComPort}
              placeholder="Chọn cổng COM"
              style={{ width: 250 }}
              disabled={portOpened}
            >
              {comPorts.map((port) => (
                <Option key={port.path} value={port.path}>
                  {port.path} -{" "}
                  {port.manufacturer || port.friendlyName || "Unknown device"}
                </Option>
              ))}
            </Select>
            <Button onClick={refreshPorts} disabled={portOpened}>
              🔄
            </Button>
            <Button
              type="primary"
              onClick={handleOpen}
              disabled={portOpened || !comPort}
            >
              Mở cổng
            </Button>
            <Button danger onClick={handleClose} disabled={!portOpened}>
              Đóng cổng
            </Button>
          </Space>
        </div>
      </Form.Item>

      <Divider />

      {/* WiFi config */}
      <Form.Item label="CONFIG">
        <Flex vertical gap={8}>
          <Flex gap={16}>
            <Input
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              placeholder="Serial"
            />
            <Button type="primary" danger onClick={handleSendReboot}>
              Reboot ESP32
            </Button>
          </Flex>

          <Flex gap={16}>
            <Input
              value={ssidTh}
              onChange={(e) => setSsidTh(e.target.value)}
              placeholder="Nhập wifi trong hình"
              prefix={<WifiOutlined />}
            />
            <Input.Password
              value={passwordTh}
              onChange={(e) => setPasswordTh(e.target.value)}
              placeholder="Nhập mật khẩu wifi trong hình"
              prefix={<LockOutlined />}
            />
            <Button
              type="primary"
              onClick={handleSendConfigWifiTh}
              icon={<SendOutlined />}
              size="middle"
            >
              Gửi
            </Button>
          </Flex>
          <Flex gap={16}>
            <Input
              value={ssidDt}
              onChange={(e) => setSsidDt(e.target.value)}
              placeholder="Nhập wifi đường trường"
              prefix={<WifiOutlined />}
            />
            <Input.Password
              value={passwordDt}
              onChange={(e) => setPasswordDt(e.target.value)}
              placeholder="Nhập mật khẩu wifi đường trường"
              prefix={<LockOutlined />}
            />
            <Button
              type="primary"
              onClick={handleSendConfigWifiDt}
              icon={<SendOutlined />}
              size="middle"
            >
              Gửi
            </Button>
          </Flex>
        </Flex>
      </Form.Item>

      <Divider />
      <Text strong>Lệnh vừa gửi:</Text>
      <Text code>{lastCommand}</Text>
      <br />

      {/* LOG */}
      <Form.Item
        label={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>ESP32 Logs</span>
            <Button size="small" onClick={handleClearLog}>
              Clear log
            </Button>
          </div>
        }
        style={{ flex: 1 }}
      >
        <div
          ref={responseRef}
          style={{
            backgroundColor: "#000",
            color: "#0f0",
            fontFamily: "monospace",
            borderRadius: 4,
            border: "1px solid #333",
            width: "100%",
            height: "50vh",
            overflowY: "auto",
            padding: 8,
            whiteSpace: "pre-wrap",
          }}
        >
          {response}
        </div>
      </Form.Item>
    </Form>
  );
}
