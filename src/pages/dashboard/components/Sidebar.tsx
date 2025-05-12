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

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <Menu
        mode="inline"
        defaultSelectedKeys={["dashboard"]}
        style={{ borderRight: 0, background: "transparent", color: "#fff" }}
        onClick={({ key }) => navigate(`/${key}`)}
      >
        <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
          Dashboard
        </Menu.Item>

        <Menu.Item key="users" icon={<UserOutlined />}>
          Users
        </Menu.Item>

        {/* ✅ Sales Section */}
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
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          Logout
        </Button>

        <Typography.Text className="sidebar-version">v1.0.0</Typography.Text>
      </div>
    </div>
  );
};

export default Sidebar;
