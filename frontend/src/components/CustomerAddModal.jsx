import React, { useState } from "react";
import { Drawer, Form, Input, Button, message, Space } from "antd";
import axios from "axios";

const CustomerAddDrawer = ({ open, onClose, onAdded }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const handleAdd = async (values) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Chưa đăng nhập");

      await axios.post(
        "http://tb.giamsatdinhvi.com:8080/api/customer",
        {
          title: values.title,
          email: values.email,
          country: values.country,
          state: values.state,
          city: values.city,
          address: values.address,
          phone: values.phone,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      messageApi.success("Thêm khách hàng thành công!");
      form.resetFields();
      onClose(); // đóng drawer
      if (onAdded) onAdded(); // reload table
    } catch (err) {
      console.error("❌ Lỗi thêm khách hàng:", err);
      messageApi.error("Thêm khách hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Drawer
        title="Thêm khách hàng"
        placement="right"
        width={600}
        onClose={onClose}
        open={open}
        destroyOnHidden
        styles={{
          paddingBottom: 24,
          overflowY: "auto",
          maxHeight: "80vh",
        }}
      >
        <Form
          form={form}
          layout="horizontal"
          labelAlign="left"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          onFinish={handleAdd}
        >
          <Form.Item
            label="Tên khách hàng"
            name="title"
            rules={[
              { required: true, message: "Vui lòng nhập tên khách hàng" },
            ]}
          >
            <Input placeholder="Nhập tên khách hàng" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            label="Quốc gia"
            name="country"
            rules={[{ required: true, message: "Vui lòng nhập quốc gia" }]}
          >
            <Input placeholder="Nhập quốc gia" />
          </Form.Item>

          <Form.Item
            label="Tỉnh/Thành phố"
            name="state"
            rules={[
              { required: true, message: "Vui lòng nhập tỉnh/thành phố" },
            ]}
          >
            <Input placeholder="Nhập tỉnh/thành phố" />
          </Form.Item>

          <Form.Item
            label="Thành phố/Quận/Huyện"
            name="city"
            rules={[
              { required: true, message: "Vui lòng nhập thành phố/quận/huyện" },
            ]}
          >
            <Input placeholder="Nhập thành phố/quận/huyện" />
          </Form.Item>

          <Form.Item
            label="Địa chỉ"
            name="address"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
          >
            <Input placeholder="Nhập địa chỉ" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại" },
              {
                pattern: /^\+?[0-9]{7,15}$/,
                message: "Số điện thoại không hợp lệ",
              },
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8 }}>
            <Space>
              <Button onClick={onClose}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Thêm khách hàng
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default CustomerAddDrawer;
