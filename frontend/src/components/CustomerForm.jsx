import React, { useState, useEffect } from "react";
import {
  Layout,
  Avatar,
  Typography,
  Drawer,
  Form,
  Input,
  Button,
  Checkbox,
  message,
  Select,
  Tooltip,
  Space,
} from "antd";
import { UserOutlined, LoginOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import CustomerTable from "./CustomerTable";

const { Header, Content } = Layout;
const { Text } = Typography;
const { Option } = Select;

const CustomerForm = ({ initialPage = 0, initialPageSize = 10 }) => {
  const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken") || null);
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const username = localStorage.getItem("username");
    if (token && username) {
      setUser({ username });
    }
  }, []);
  const [showLogoutTooltip, setShowLogoutTooltip] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await axios.post(
        "http://tb.giamsatdinhvi.com:8080/api/auth/login",
        {
          username: values.username,
          password: values.password,
        }
      );

      localStorage.setItem("accessToken", res.data.token);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      localStorage.setItem("username", values.username);

      setUser({ username: values.username });
      setAccessToken(res.data.token); // <-- cập nhật token
      messageApi.success("Đăng nhập thành công!");
      setOpen(false);
    } catch (err) {
      messageApi.error("Sai tài khoản hoặc lỗi kết nối!");
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("❌ Failed:", errorInfo);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    setUser(null);
    messageApi.info("Đã đăng xuất");
    setShowLogoutTooltip(false);
  };

  return (
    <Form layout="vertical" style={{ padding: 16 }}>
      {contextHolder}
      <Form.Item>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0 }}>Danh sách khách hàng</h2>
          <Space>
            <Tooltip
              title={
                user ? (
                  <Button type="link" onClick={handleLogout}>
                    Đăng xuất
                  </Button>
                ) : null
              }
              open={showLogoutTooltip && !!user}
              placement="bottomRight"
            >
              <div
                onClick={() => {
                  if (!user) {
                    setOpen(true); // mở drawer login
                  } else {
                    setShowLogoutTooltip(!showLogoutTooltip); // toggle tooltip
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                }}
              >
                <Text type={user ? "success" : "secondary"}>
                  {user ? user.username : "Chưa đăng nhập"}
                </Text>
                <Avatar
                  size={28}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: user ? "#87d068" : "#ccc" }}
                />
              </div>
            </Tooltip>
          </Space>
        </div>
      </Form.Item>
      <Form.Item style={{ padding: 16 }}>
        <CustomerTable accessToken={accessToken}/>
      </Form.Item>

      <Drawer
        title="Đăng nhập tài khoản"
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
        width={380}
      >
        <Form
          name="login"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          initialValues={{
            username: "tenant@thingsboard.org",
            password: "]93V!W8roecJ",
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="remember"
            valuePropName="checked"
            wrapperCol={{ offset: 6, span: 18 }}
          >
            <Checkbox>Ghi nhớ đăng nhập</Checkbox>
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<LoginOutlined />}
              loading={loading}
              block
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </Form>
  );
};

export default CustomerForm;
