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
  sendWifiDt,
  sendServerTh,
  sendServerDt,
  sendCapture,
  sendOTA,
  sendFram,
  sendSocketTh,
  sendDeviceSerial,
  sendReadInfo,
  sendDebugCpu,
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
  AutoComplete,
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
  InfoCircleOutlined,
  CarOutlined,
} from "@ant-design/icons";
import { Tooltip } from "antd";
import Esp32Log from "./Esp32Log";
import commandList from "../const/commandList";

const { Text } = Typography;
const { Option } = Select;

export default function WifiConfigForm() {
  const [serial, setSerial] = useState(123);
  const [deviceSerial, setDeviceSerial] = useState("DTA12345678");

  const [carNumber, setCarNumber] = useState("");

  const [ssidTh, setSsidTh] = useState("");
  const [ssidDt, setSsidDt] = useState("");

  const [passwordTh, setPasswordTh] = useState("");
  const [passwordDt, setPasswordDt] = useState("");

  const [serverTh, setServerTh] = useState("");
  const [serverDt, setServerDt] = useState("");

  const [tbServerTh, setTbServerTh] = useState("");
  const [tbServerDt, setTbServerDt] = useState("");

  const [serverWsTh, setServerWsTh] = useState("");
  const [portWsTh, setPortWsTh] = useState("");

  const [cpu, setCpu] = useState("0");
  const [debug, setDebug] = useState("0");

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
      const res = await openPort(selectedPort);
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

  const handleReadInfo = async () => {
    try {
      await sendReadInfo(serial);
      messageApi.success("Đã gửi lệnh đọc thông tin thiết bị");
    } catch (err) {
      console.error(err);
      messageApi.error("Gửi lệnh info thất bại");
    }
  };

  const handleCapture = async () => {
    try {
      await sendCapture(serial);
      messageApi.success("Đã gửi lệnh chụp ảnh");
    } catch (err) {
      console.error(err);
      messageApi.error("Gửi lệnh chụp ảnh thất bại");
    }
  };

  const handleSendOta = async () => {
    try {
      await sendOTA(serial);
      messageApi.success("Đã gửi lệnh OTA Update");
    } catch (err) {
      console.error(err);
      messageApi.error("Gửi lệnh OTA Update thất bại");
    }
  };

  const handleSendFram = async () => {
    try {
      await sendFram(serial);
      messageApi.success("Đã gửi lệnh FRAM");
    } catch (err) {
      console.error(err);
      messageApi.error("Gửi lệnh FRAM thất bại");
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

  const handleSendWifiDt = async () => {
    try {
      await sendWifiDt(serial, ssidDt, passwordDt);
      messageApi.success("Đã gửi lệnh WiFi Đường trường thành công");
    } catch (err) {
      console.error(err);
      messageApi.error("Gửi thất bại");
    }
  };

  const handleSendTbServerTh = async () => {
    try {
      await sendServerTh(serial, tbServerTh);
      messageApi.success("Đã gửi lệnh Thingsboard Trong hình thành công");
    } catch (err) {
      console.error(err);
      messageApi.error("Gửi thất bại");
    }
  };

  const handleSendTbServerDt = async () => {
    try {
      await sendServerDt(serial, tbServerDt);
      messageApi.success("Đã gửi lệnh Thingsboard Đường trường thành công");
    } catch (err) {
      console.error(err);
      messageApi.error("Gửi thất bại");
    }
  };

  const handleSendServerTh = async () => {
    try {
      await sendServerTh(serial, serverTh);
      messageApi.success("Đã gửi lệnh Server Trong hình thành công");
    } catch (err) {
      console.error(err);
      messageApi.error("Gửi thất bại");
    }
  };

  const handleSendServerDt = async () => {
    try {
      await sendServerDt(serial, serverDt);
      messageApi.success("Đã gửi lệnh Server Đường trường thành công");
    } catch (err) {
      console.error(err);
      messageApi.error("Gửi thất bại");
    }
  };

  const handleSendSocketTh = async () => {
    try {
      await sendSocketTh(serial, serverWsTh, portWsTh);
      messageApi.success("Đã gửi lệnh Socket Trong hình thành công");
    } catch (err) {
      console.error(err);
      messageApi.error("Gửi thất bại");
    }
  };

  const handleSendCpuDebug = async () => {
    try {
      await sendDebugCpu(serial, cpu, debug);
      messageApi.success("Đã gửi lệnh CPU và Debug thành công");
    } catch (err) {
      console.error(err);
      messageApi.error("Gửi lệnh CPU và Debug thất bại");
    }
  };

  const handleSendDeviceSerial = async () => {
    const pattern = /^DTA\d{8}$/;

    if (!pattern.test(deviceSerial)) {
      messageApi.error(
        "Mã thiết bị phải bắt đầu bằng DTA và có 8 số đằng sau!"
      );
      return;
    }

    try {
      await sendDeviceSerial(deviceSerial);
      messageApi.success("Đã gửi lệnh Device Serial thành công");
    } catch (err) {
      console.error(err);
      messageApi.error("Gửi lệnh Serial thất bại");
    }
  };

  const handleSendCar = async () => {
    try {
      await sendCar(serial, carNumber);
      messageApi.success("Đã gửi lệnh Car thành công");
    } catch (err) {
      console.error(err);
      messageApi.error("Gửi lệnh Car thất bại");
    }
  };

  return (
    <Form layout="vertical" style={{}}>
      {contextHolder}
      {/* COM control */}
      <Form.Item>
        <Flex gap={16}>
          <AutoComplete
            value={userCommand}
            options={commandList.map((cmd) => ({
              value: cmd.value,
              label: cmd.label,
            }))}
            placeholder="USER COMMAND"
            filterOption={(inputValue, option) =>
              option?.value.toLowerCase().includes(inputValue.toLowerCase())
            }
            onChange={setUserCommand}
            onSelect={setUserCommand}
          >
            <Input />
          </AutoComplete>
          <Button
            type="primary"
            icon={<SendOutlined />}
            size="middle"
            onClick={handleSendUserCommand}
          >
            Gửi
          </Button>
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
            shape="circle"
          />
          <Button type="primary" onClick={handleOpenPort} disabled={isPortOpen}>
            Mở cổng
          </Button>
          <Button danger onClick={handleClosePort} disabled={!isPortOpen}>
            Đóng cổng
          </Button>
        </Flex>
      </Form.Item>
      {/* WiFi config */}
      <Form.Item>
        <Flex vertical gap={8}>
          <Flex gap={16}>
            <Input
              placeholder="Số xe"
              value={carNumber}
              onChange={(e) => setCarNumber(e.target.value)}
              prefix={<CarOutlined />}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              size="middle"
              onClick={handleSendCar}
            >
              Gửi số xe
            </Button>
            <Select
              placeholder="Chọn cặp CPU/Debug"
              style={{ width: 800 }}
              value={`${cpu} ${debug}`}
              onChange={(value) => {
                const [cpuVal, debugVal] = value.split(" ");
                setCpu(cpuVal);
                setDebug(debugVal);
              }}
              options={[
                { label: "CPU 0 - Debug 0", value: "0 0" },
                { label: "CPU 0 - Debug 1", value: "0 1" },
                { label: "CPU 1 - Debug 1", value: "1 1" },
                { label: "CPU 2 - Debug 1", value: "2 1" },
              ]}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              size="middle"
              onClick={handleSendCpuDebug}
            >
              Gửi CPU/Debug
            </Button>
            <Input
              placeholder="Device Serial"
              value={deviceSerial}
              onChange={(e) => setDeviceSerial(e.target.value)}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              size="middle"
              onClick={handleSendDeviceSerial}
            >
              Gửi Serial
            </Button>
            {/* <Input
              placeholder="USER COMMAND"
              value={userCommand}
              onChange={(e) => setUserCommand(e.target.value)}
            /> */}
            <Flex gap={8}>
              <Tooltip title="OTA Update">
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  disabled
                  onClick={handleSendOta}
                />
              </Tooltip>
              <Tooltip title="Chụp ảnh">
                <Button
                  type="primary"
                  icon={<CameraOutlined />}
                  onClick={handleCapture}
                />
              </Tooltip>
              <Button type="primary" onClick={handleSendFram}>
                FRAM
              </Button>
              <Button
                type="primary"
                style={{
                  backgroundColor: "#13c2c2",
                  borderColor: "#13c2c2",
                }}
                icon={<InfoCircleOutlined />}
                onClick={handleReadInfo}
              >
                INFO
              </Button>
              {/* <Button
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
              </Button> */}
            </Flex>
          </Flex>
          <Divider size="small"/>
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
                  disabled={!ssidTh || !passwordTh}
                />
              </Tooltip>
            </Flex>

            <Flex gap={16}>
              {/* Server TH */}
              <Input
                placeholder="Nhập server máy chủ trong hình"
                value={serverTh}
                onChange={(e) => setServerTh(e.target.value)}
                prefix={<CloudServerOutlined />}
              />
              <Tooltip title="Gửi Server TH" placement="left">
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  size="middle"
                  onClick={handleSendServerTh}
                  style={{ minWidth: 30 }}
                  disabled={!serverTh}
                />
                {/* Server Thingsboard TH */}
              </Tooltip>
              <Input
                placeholder="Nhập server Thingsboard trong hình"
                value={tbServerTh}
                onChange={(e) => setTbServerTh(e.target.value)}
                prefix={<DatabaseOutlined />}
              />
              <Tooltip title="Gửi Server Thingsboard TH" placement="left">
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendTbServerTh}
                  size="middle"
                  style={{ minWidth: 30 }}
                  disabled={!tbServerTh}
                />
              </Tooltip>
            </Flex>

            {/* Server WS TH */}
            <Flex gap={16}>
              <Input
                placeholder="Nhập server socket trong hình"
                value={serverWsTh}
                onChange={(e) => setServerWsTh(e.target.value)}
                prefix={<ApiOutlined />}
              />
              <Input
                placeholder="Nhập cổng server socket trong hình"
                value={portWsTh}
                onChange={(e) => setPortWsTh(e.target.value)}
                prefix={<ApiOutlined />}
              />
              <Tooltip title="Gửi Server WS TH" placement="left">
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  size="middle"
                  onClick={handleSendSocketTh}
                  disabled={!serverWsTh || !portWsTh}
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
                value={ssidDt}
                onChange={(e) => setSsidDt(e.target.value)}
                prefix={<WifiOutlined />}
              />
              <Input.Password
                placeholder="Nhập mật khẩu wifi đường trường"
                value={passwordDt}
                onChange={(e) => setPasswordDt(e.target.value)}
                prefix={<LockOutlined />}
              />
              <Tooltip title="Gửi Wifi ĐT" placement="left">
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  size="middle"
                  onClick={handleSendWifiDt}
                  style={{ minWidth: 30 }}
                  disabled={!ssidDt || !passwordDt}
                />
              </Tooltip>
            </Flex>

            {/* Server ĐT */}
            <Flex gap={16}>
              <Input
                placeholder="Nhập server máy chủ đường trường"
                value={serverDt}
                onChange={(e) => setServerDt(e.target.value)}
                prefix={<CloudServerOutlined />}
              />
              <Tooltip title="Gửi Server ĐT" placement="left">
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendServerDt}
                  size="middle"
                  style={{ minWidth: 30 }}
                  disabled={!serverDt}
                />
              </Tooltip>
            </Flex>

            {/* Server Thingsboard ĐT */}
            <Flex gap={16}>
              <Input
                placeholder="Nhập server Thingsboard đường trường"
                value={tbServerDt}
                onChange={(e) => setTbServerDt(e.target.value)}
                prefix={<DatabaseOutlined />}
              />
              <Tooltip title="Gửi Server Thingsboard ĐT" placement="left">
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendTbServerDt}
                  size="middle"
                  style={{ minWidth: 30 }}
                  disabled={!tbServerDt}
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
