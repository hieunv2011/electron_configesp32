import { useState } from "react";
import "./App.css";
import WifiConfigForm from "./components/WifiConfigForm";
import CustomerForm from "./components/CustomerForm";
import { Layout, Menu, Button, Divider } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  DesktopOutlined,
  TeamOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("1"); // lưu nav đang chọn

  const componentsMap = {
    1: <WifiConfigForm />,
    2: <CustomerForm />,
  };
  const menuItems = [
    {
      key: "1",
      icon: <DesktopOutlined />,
      label: "Cấu hình ICM",
      component: <WifiConfigForm />,
    },
    {
      key: "2",
      icon: <TeamOutlined />,
      label: "Cấu hình khách hàng",
      component: <CustomerForm />,
    },
    {
      key: "3",
      icon: <UploadOutlined />,
      label: "Nav 3",
      component: <div>Nav 3 content</div>,
    },
  ];

  return (
    <Layout style={{ height: "100vh" }}>
      <Sider collapsible collapsed={collapsed} theme="dark" trigger={null} style={{paddingTop: 16}}>
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[selectedKey]}
          onClick={(e) => setSelectedKey(e.key)}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: "#fff" }}>
          <Header
            style={{
              padding: 0,
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
              {menuItems.find((item) => item.key === selectedKey)?.label}
            </div>
          </Header>
        </Header>
        <Content style={{ padding: "16px", backgroundColor: "#fff" }}>
          {menuItems.find((item) => item.key === selectedKey)?.component}
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
