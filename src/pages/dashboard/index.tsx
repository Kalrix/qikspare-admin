import React from "react";
import "../../styles/dashboard.css";

import { Layout, Tabs } from "antd";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import FilterBar from "./components/FilterBar";
import OverviewTab from "./components/OverviewTab";
import OrdersTab from "./components/OrdersTab";

const { Content, Sider } = Layout;

const DashboardPage = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Topbar />
      <Layout>
        <Sider width={220}>
          <Sidebar />
        </Sider>
        <Layout style={{ padding: "0 24px" }}>
          <FilterBar />
          <Content style={{ background: "#fff", marginTop: 16 }}>
            <Tabs defaultActiveKey="overview" type="card">
              <Tabs.TabPane tab="Overview" key="overview">
                <OverviewTab />
              </Tabs.TabPane>
              <Tabs.TabPane tab="Live Orders" key="orders">
                <OrdersTab />
              </Tabs.TabPane>
              <Tabs.TabPane tab="Agents" key="agents">
                <div>Agents Section</div>
              </Tabs.TabPane>
              <Tabs.TabPane tab="Parts / SKUs" key="inventory">
                <div>Inventory Insights</div>
              </Tabs.TabPane>
              <Tabs.TabPane tab="Exceptions" key="exceptions">
                <div>Exceptions & SLA Breaches</div>
              </Tabs.TabPane>
            </Tabs>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default DashboardPage;
