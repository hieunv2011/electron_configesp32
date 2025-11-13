import { useState, useRef } from "react";
import { Input, Button, Tour } from "antd";

export default function GuideDemo() {
  const [open, setOpen] = useState(false);

  const refName = useRef(null);
  const refEmail = useRef(null);
  const refSubmit = useRef(null);

  const steps = [
    {
      title: "Nhập tên",
      description: "Đây là thông tin quan trọng cần nhập đầu tiên.",
      target: () => refName.current,
    },
    {
      title: "Nhập email",
      description: "Nhập email để liên hệ.",
      target: () => refEmail.current,
    },
    {
      title: "Gửi form",
      description: "Nhấn nút này để hoàn tất.",
      target: () => refSubmit.current,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div ref={refName}>
        <Input placeholder="Tên" style={{ width: 300, marginBottom: 16 }} />
      </div>

      <div ref={refEmail}>
        <Input placeholder="Email" style={{ width: 300, marginBottom: 16 }} />
      </div>

      <Button ref={refSubmit} type="primary">
        Gửi
      </Button>

      <div style={{ marginTop: 24 }}>
        <Button onClick={() => setOpen(true)}>Hướng dẫn</Button>
      </div>

      <Tour
        open={open}
        onClose={() => setOpen(false)}
        steps={steps}
      />
    </div>
  );
}
