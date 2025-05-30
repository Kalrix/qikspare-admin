import React from "react";
import { Layout, Input, Avatar, Badge, Space } from "antd";
import { BellOutlined, SearchOutlined } from "@ant-design/icons";
import "../../../styles/dashboard.css";

const { Header } = Layout;

const Topbar = () => {
  const name = localStorage.getItem("name") || "Admin";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Header className="topbar white">
      <div className="topbar-left">
        <a href="/dashboard">
          <img src="/qikspare-logo.png" alt="QikSpare" className="topbar-logo" />
        </a>
        <Input
          className="topbar-search"
          placeholder="Search orders, agents, SKUs..."
          prefix={<SearchOutlined />}
        />
      </div>

      <div className="topbar-right">
        <Space size="large">
          <Badge count={3} size="small">
            <BellOutlined style={{ fontSize: "18px", color: "#1e293b" }} aria-label="Notifications" />
          </Badge>
          <Avatar style={{ backgroundColor: "#1677ff" }}>{initials}</Avatar>
        </Space>
      </div>
    </Header>
  );
};

export default Topbar;
