import React, { useEffect, useState, useRef } from "react";
import { Button, Tag, message } from "antd";
import { DeleteOutlined, CopyOutlined } from "@ant-design/icons";

const Esp32Log = ({ isPortOpen }) => {
  const [logs, setLogs] = useState([]);
  const wsRef = useRef(null);
  const logContainerRef = useRef(null);
  const [deviceUUID, setDeviceUUID] = useState(null);

  const handleClearLog = () => {
    setLogs([]);
    setDeviceUUID(null);
  };

  // ✅ hiển thị thông báo sau khi copy
  const handleCopy = async () => {
    if (deviceUUID) {
      try {
        await navigator.clipboard.writeText(deviceUUID);
        message.success({
          content: "✅ Đã sao chép Access Token vào bộ nhớ tạm",
          duration: 2,
        });
      } catch (err) {
        message.error("Không thể sao chép, vui lòng thử lại!");
      }
    }
  };

  useEffect(() => {
    if (!isPortOpen) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    const ws = new WebSocket("ws://127.0.0.1:5000/ws");
    wsRef.current = ws;

    ws.onopen = () => console.log("✅ WS connected");
    ws.onmessage = (event) => {
      const msg = event.data;
      const match = msg.match(
        /([0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4})/i
      );
      if (match) setDeviceUUID(match[1]);

      setLogs((prev) => [...prev.slice(-200), msg]);
    };
    ws.onclose = () => console.log("❌ WS disconnected");

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [isPortOpen]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div
      ref={logContainerRef}
      style={{
        position: "relative",
        backgroundColor: "#000",
        color: "#0f0",
        fontFamily: "monospace",
        padding: "10px",
        height: "300px",
        overflowY: "auto",
        borderRadius: "5px",
        opacity: isPortOpen ? 1 : 0.4,
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 8,
          background: "rgba(0, 0, 0, 0)",
          padding: "4px 0",
          zIndex: 2,
        }}
      >
        {deviceUUID ? (
          <>
            <Tag color="green" style={{ fontSize: 13, padding: "3px 8px" }}>
              📟 Access Token: <b>{deviceUUID}</b>
            </Tag>
            <Button
              icon={<CopyOutlined />}
              size="small"
              onClick={handleCopy}
              title="Copy Access Token"
            />
          </>
        ) : (
          <Tag color="default" style={{ fontSize: 13, padding: "3px 8px" }}>
            Chưa nhận Access Token
          </Tag>
        )}
        <Button
          icon={<DeleteOutlined />}
          danger
          size="small"
          onClick={handleClearLog}
          style={{ minWidth: 30 }}
        >
          Clear log
        </Button>
      </div>

      {logs.length === 0 && (
        <div style={{ color: "#888" }}>
          {isPortOpen ? "Đang chờ dữ liệu từ ESP32..." : "Cổng serial chưa mở."}
        </div>
      )}
      {logs.map((line, index) => (
        <div key={index}>{line}</div>
      ))}
    </div>
  );
};

export default Esp32Log;
