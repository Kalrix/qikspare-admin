import React from "react";
import { Menu, Typography, Button } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  PlusCircleOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "../../../styles/dashboard.css";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(`/${key}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="sidebar">
      <Menu
        mode="inline"
        defaultSelectedKeys={["dashboard"]}
        style={{ borderRight: 0, background: "transparent", color: "#fff" }}
        onClick={handleMenuClick}
      >
        <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
          Dashboard
        </Menu.Item>

        <Menu.Item key="users" icon={<UserOutlined />}>
          Users
        </Menu.Item>

        <Menu.SubMenu key="sales" title="Sales" icon={<FileTextOutlined />}>
          <Menu.Item key="sales/create-invoice" icon={<PlusCircleOutlined />}>
            Create Invoice
          </Menu.Item>
          <Menu.Item key="sales/invoices" icon={<FileTextOutlined />}>
            Invoices
          </Menu.Item>
        </Menu.SubMenu>
      </Menu>

      <div className="sidebar-bottom">
        <Button
          type="text"
          icon={<LogoutOutlined />}
          danger
          onClick={handleLogout}
        >
          Logout
        </Button>
        <Typography.Text className="sidebar-version">v1.0.0</Typography.Text>
      </div>
    </div>
  );
};

export default Sidebar;
