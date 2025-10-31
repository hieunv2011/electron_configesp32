from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sock import Sock
import serial
import serial.tools.list_ports
import threading
import time

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}},supports_credentials=True)
sock = Sock(app)

ser = None
clients = set()

# ------------------- Serial -------------------
@app.route("/list_ports", methods=["GET"])
def list_ports():
    ports = serial.tools.list_ports.comports()
    port_list = [
        {"device": p.device, "description": p.description, "hwid": p.hwid}
        for p in ports
    ]
    return jsonify(port_list)

@app.route("/open", methods=["POST"])
def open_port():
    global ser
    data = request.json
    port = data.get("port", "COM3")
    baud = data.get("baud", 115200)

    try:
        ser = serial.Serial(port, baud, timeout=1)
        thread = threading.Thread(target=read_serial_realtime, daemon=True)
        thread.start()
        return jsonify({"status": "opened", "port": port})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/send", methods=["POST"])
def send_command():
    """Send a raw command (string) to the opened serial port.

    Returns 400 if the serial port is not open or if payload is missing.
    """
    global ser
    if not ser or not getattr(ser, "is_open", False):
        return jsonify({"error": "serial not open"}), 400

    data = request.json or {}
    raw_cmd = data.get("raw")
    if not raw_cmd:
        return jsonify({"error": "missing raw command"}), 400

    try:
        # ensure newline and encoding
        ser.write((raw_cmd + "\n").encode())
        return jsonify({"status": "sent", "command": raw_cmd})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/close", methods=["POST"])
def close_port():
    global ser
    if ser and ser.is_open:
        ser.close()
        return jsonify({"status": "closed"})
    return jsonify({"status": "already closed"})

# ------------------- WebSocket -------------------
@sock.route("/ws")
def websocket(ws):
    clients.add(ws)
    try:
        while True:
            msg = ws.receive()  # nhận dữ liệu từ client nếu muốn 2 chiều
            if msg:
                print("From client:", msg)
    except:
        pass
    finally:
        clients.remove(ws)

def broadcast(data):
    """Gửi dữ liệu tới tất cả client WebSocket"""
    for ws in list(clients):
        try:
            ws.send(data)
        except:
            clients.remove(ws)

def read_serial_realtime():
    global ser
    while ser and ser.is_open:
        try:
            line = ser.readline().decode(errors="ignore").strip()
            if line:
                print(f"[ESP32] {line}")
                broadcast(line)
        except Exception as e:
            print("❌ Lỗi đọc serial:", e)
            break
        time.sleep(0.05)

# ------------------- Main -------------------
if __name__ == "__main__":
    app.run(port=5000, debug=True)
