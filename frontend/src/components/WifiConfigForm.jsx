import React from "react";
import { useState, useEffect } from "react";
import {
  listPorts,
  sendCommand,
  openPort,
  closePort,
  sendWifiTh,
  sendReboot,
  sendReset,
} from "../utils/api";
import { message } from "antd";
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

import {
  SendOutlined,
  WifiOutlined,
  LockOutlined,
  DownloadOutlined,
  CameraOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  ApiOutlined,
  UndoOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import { Tooltip } from "antd";
import Esp32Log from "./Esp32Log";

const { Text } = Typography;
const { Option } = Select;

export default function WifiConfigForm() {
  const [serial, setSerial] = useState(123);
  const [ssidTh, setSsidTh] = useState("");
  const [passwordTh, setPasswordTh] = useState("");

  const [userCommand, setUserCommand] = useState("");
  const [ports, setPorts] = useState([]);
  const [selectedPort, setSelectedPort] = useState(null);
  const [loadingPorts, setLoadingPorts] = useState(false);
  const [isPortOpen, setIsPortOpen] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  const handleSendUserCommand = async () => {
    if (!userCommand.trim()) return;
    try {
      const res = await sendCommand(userCommand);
      console.log("✅ Sent:", res);
    } catch (err) {
      console.error("❌ Error sending:", err);
    }
  };

  useEffect(() => {
    fetchPorts();
  }, []);

  const fetchPorts = async () => {
    setLoadingPorts(true);
    try {
      const data = await listPorts();
      setPorts(data);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách cổng:", err);
      messageApi.error("Không thể tải danh sách cổng COM");
    } finally {
      setLoadingPorts(false);
    }
  };

  const handleOpenPort = async () => {
    if (!selectedPort) {
      messageApi.warning("Vui lòng chọn cổng COM trước!");
      return;
    }

    try {
      const res = await openPort(selectedPort); // gọi API
      messageApi.success(`Đã mở ${res.port}`);
      console.log("✅ Opened:", res);
      setIsPortOpen(true);
    } catch (err) {
      console.error("❌ Error opening port:", err);
      messageApi.error("Không thể mở cổng!");
    }
  };

  const handleClosePort = async () => {
    try {
      await closePort();
      messageApi.info("Đã đóng cổng serial");
      setIsPortOpen(false);
    } catch (err) {
      console.error("❌ Error closing port:", err);
      messageApi.error("Không thể đóng cổng!");
    }
  };

  const handleReboot = async () => {
    try {
      await sendReboot(serial);
      messageApi.success("Đã gửi lệnh reboot ESP32");
    } catch (err) {
      console.error(err);
      messageApi.error("Gửi lệnh reboot thất bại");
    }
  };
  const handleReset = async () => {
    try {
      await sendReset(serial);
      messageApi.success("Đã gửi lệnh reset ESP32");
    } catch (err) {
      console.error(err);
      messageApi.error("Gửi lệnh reset thất bại");
    }
  };

  const handleSendWifiTh = async () => {
    try {
      await sendWifiTh(serial, ssidTh, passwordTh);
      messageApi.success("Đã gửi lệnh WiFi Trong hình thành công");
    } catch (err) {
      console.error(err);
      messageApi.error("Gửi thất bại");
    }
  };

  return (
    <Form layout="vertical" style={{ padding: 16 }}>
      {contextHolder}
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
              placeholder="Chọn cổng COM"
              style={{ width: 250 }}
              loading={loadingPorts}
              onChange={setSelectedPort}
              value={selectedPort}
              disabled={isPortOpen}
            >
              {ports.map((p) => (
                <Option key={p.device} value={p.device}>
                  {p.device} - {p.manufacturer || p.description || "Unknown"}
                </Option>
              ))}
            </Select>
            <Button
              onClick={fetchPorts}
              disabled={isPortOpen}
              icon={<UndoOutlined />}
            />
            <Button
              type="primary"
              onClick={handleOpenPort}
              disabled={isPortOpen}
            >
              Mở cổng
            </Button>
            <Button danger onClick={handleClosePort} disabled={!isPortOpen}>
              Đóng cổng
            </Button>
          </Space>
        </div>
      </Form.Item>
      {/* WiFi config */}
      <Form.Item label="CONFIG">
        <Flex vertical gap={8}>
          <Flex gap={16}>
            <Input
              placeholder="Serial"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
            />
            <Input placeholder="COMMAND" disabled />
            <Input
              placeholder="USER COMMAND"
              value={userCommand}
              onChange={(e) => setUserCommand(e.target.value)}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              size="middle"
              onClick={handleSendUserCommand}
            >
              Gửi
            </Button>
            <Flex gap={8}>
              <Tooltip title="OTA Update">
                <Button type="primary" icon={<DownloadOutlined />} disabled />
              </Tooltip>
              <Tooltip title="Chụp ảnh">
                <Button type="primary" icon={<CameraOutlined />} />
              </Tooltip>
              <Button type="primary">FRAM</Button>
              <Button
                type="primary"
                style={{
                  backgroundColor: "#faad14",
                  borderColor: "#faad14",
                }}
                onClick={handleReboot}
                icon={<RedoOutlined />}
              >
                Reboot ESP32
              </Button>
              <Button type="primary" danger onClick={handleReset}>
                Reset ESP32
              </Button>
            </Flex>
          </Flex>
          {/* Trong hình */}
          <Flex vertical gap={8}>
            <Text>Trong hình</Text>

            {/* Wifi TH */}
            <Flex gap={16}>
              <Input
                placeholder="Nhập wifi trong hình"
                value={ssidTh}
                onChange={(e) => setSsidTh(e.target.value)}
                prefix={<WifiOutlined />}
              />
              <Input.Password
                placeholder="Nhập mật khẩu wifi trong hình"
                value={passwordTh}
                onChange={(e) => setPasswordTh(e.target.value)}
                prefix={<LockOutlined />}
              />
              <Tooltip title="Gửi Wifi TH" placement="left">
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  size="middle"
                  onClick={handleSendWifiTh}
                  style={{ minWidth: 30 }}
                />
              </Tooltip>
            </Flex>

            {/* Server TH */}
            <Flex gap={16}>
              <Input
                placeholder="Nhập server trong hình"
                prefix={<CloudServerOutlined />}
              />
              <Tooltip title="Gửi Server TH" placement="left">
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  size="middle"
                  style={{ minWidth: 30 }}
                />
              </Tooltip>
            </Flex>

            {/* Server Thingsboard TH */}
            <Flex gap={16}>
              <Input
                placeholder="Nhập server Thingsboard trong hình"
                prefix={<DatabaseOutlined />}
              />
              <Tooltip title="Gửi Server Thingsboard TH" placement="left">
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  size="middle"
                  style={{ minWidth: 30 }}
                />
              </Tooltip>
            </Flex>

            {/* Server WS TH */}
            <Flex gap={16}>
              <Input
                placeholder="Nhập server socket trong hình"
                prefix={<ApiOutlined />}
              />
              <Input
                placeholder="Nhập cổng server socket trong hình"
                prefix={<ApiOutlined />}
              />
              <Tooltip title="Gửi Server WS TH" placement="left">
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  size="middle"
                  style={{ minWidth: 30 }}
                />
              </Tooltip>
            </Flex>
          </Flex>

          <Divider size="small" />

          {/* Đường trường */}
          <Flex vertical gap={8}>
            <Text>Đường trường</Text>

            {/* Wifi ĐT */}
            <Flex gap={16}>
              <Input
                placeholder="Nhập wifi đường trường"
                prefix={<WifiOutlined />}
              />
              <Input.Password
                placeholder="Nhập mật khẩu wifi đường trường"
                prefix={<LockOutlined />}
              />
              <Tooltip title="Gửi Wifi ĐT" placement="left">
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  size="middle"
                  style={{ minWidth: 30 }}
                />
              </Tooltip>
            </Flex>

            {/* Server ĐT */}
            <Flex gap={16}>
              <Input
                placeholder="Nhập server đường trường"
                prefix={<CloudServerOutlined />}
              />
              <Tooltip title="Gửi Server ĐT" placement="left">
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  size="middle"
                  style={{ minWidth: 30 }}
                />
              </Tooltip>
            </Flex>

            {/* Server Thingsboard ĐT */}
            <Flex gap={16}>
              <Input
                placeholder="Nhập server Thingsboard đường trường"
                prefix={<DatabaseOutlined />}
              />
              <Tooltip title="Gửi Server Thingsboard ĐT" placement="left">
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  size="middle"
                  style={{ minWidth: 30 }}
                />
              </Tooltip>
            </Flex>
          </Flex>
        </Flex>
      </Form.Item>
      <Divider />

      {/* LOG */}
      <Esp32Log isPortOpen={isPortOpen} />
    </Form>
  );
}
