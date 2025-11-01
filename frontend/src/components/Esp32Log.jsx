import React, { useEffect, useState, useRef } from "react";
import { Button, Tooltip } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const Esp32Log = ({ isPortOpen }) => {
  const [logs, setLogs] = useState([]);
  const wsRef = useRef(null);
  const logEndRef = useRef(null);

  const handleClearLog = () => setLogs([]);

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
    ws.onmessage = (event) =>
      setLogs((prev) => [...prev.slice(-200), event.data]);
    ws.onclose = () => console.log("❌ WS disconnected");

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [isPortOpen]);

  useEffect(() => {
    // Chỉ cuộn container, không cuộn trang
    const container = logEndRef.current?.parentElement?.parentElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [logs]);

  return (
    <div
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
      {/* Nút clear log (sticky góc phải) */}
      <div
        style={{
          position: "sticky",
          top: 0,
          display: "flex",
          justifyContent: "flex-end",
          background: "rgba(0, 0, 0, 0)",
          padding: "4px 0",
          zIndex: 2,
        }}
      >
          <Button
            icon={<DeleteOutlined />}
            danger
            size="small"
            onClick={handleClearLog}
            style={{ minWidth: 30 }}
          >Clear log</Button>
      </div>

      {/* Nội dung log */}
      {logs.length === 0 && (
        <div style={{ color: "#888" }}>
          {isPortOpen
            ? "Đang chờ dữ liệu từ ESP32..."
            : "Cổng serial chưa mở."}
        </div>
      )}
      {logs.map((line, index) => (
        <div key={index}>{line}</div>
      ))}
      <div ref={logEndRef} />
    </div>
  );
};

export default Esp32Log;
