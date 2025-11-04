import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import WifiConfigForm from "./components/WifiConfigForm";
import CustomerForm from "./components/CustomerForm";
import DeviceList from "./components/DeviceList";
import { Layout, Menu, Button } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  DesktopOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useState,useEffect } from "react";

const { Header, Sider, Content } = Layout;

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const [selectedLabel, setSelectedLabel] = useState("Cấu hình ICM");

  const menuItems = [
    { key: "1", icon: <DesktopOutlined />, label: "Cấu hình ICM", path: "/" },
    {
      key: "2",
      icon: <TeamOutlined />,
      label: "Cấu hình khách hàng",
      path: "/customers",
    },
    {
      key: "3",
      icon: <UploadOutlined />,
      label: "Danh sách thiết bị",
      path: "/devices",
    },
  ];
  useEffect(() => {
    const current = menuItems.find((m) => m.path === location.pathname);
    setSelectedLabel(current ? current.label : "");
  }, [location.pathname]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        theme="dark"
        trigger={null}
        style={{ paddingTop: 16 }}
      >
        <Menu
          mode="inline"
          theme="dark"
          defaultSelectedKeys={["1"]}
          onClick={(e) => navigate(menuItems.find((m) => m.key === e.key).path)}
          items={menuItems}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: "0 16px",
            background: "#fff",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16, width: 64, height: 64 }}
          />
          <div style={{ fontSize: 18, fontWeight: 500, marginLeft: 16 }}>
            {selectedLabel}
          </div>
        </Header>
        <Content style={{ padding: "16px", backgroundColor: "#fff" }}>
          <Routes>
            <Route path="/" element={<WifiConfigForm />} />
            <Route path="/customers" element={<CustomerForm />} />
            <Route path="/devices" element={<DeviceList />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
