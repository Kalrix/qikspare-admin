import React, { useState } from "react";
import { Card, Col, Row, Button, Collapse } from "antd";
import {
  DashboardOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExpandAltOutlined,
  CompressOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const { Panel } = Collapse;

const COLORS = ["#1677ff", "#13c2c2", "#facc15", "#f87171"];

const kpiStats = [
  { title: "Orders Today", value: "248", icon: <DashboardOutlined />, color: "#1677ff" },
  { title: "Avg Delivery Time", value: "27.2 min", icon: <ClockCircleOutlined />, color: "#10b981" },
  { title: "Exceptions", value: "8", icon: <WarningOutlined />, color: "#ef4444" },
  { title: "SLA Compliance", value: "92%", icon: <CheckCircleOutlined />, color: "#facc15" },
];

const orderTrend = [
  { hour: "9AM", orders: 15 },
  { hour: "10AM", orders: 38 },
  { hour: "11AM", orders: 62 },
  { hour: "12PM", orders: 90 },
  { hour: "1PM", orders: 75 },
  { hour: "2PM", orders: 52 },
  { hour: "3PM", orders: 40 },
];

const orderCategories = [
  { name: "Tyres", value: 40 },
  { name: "Brakes", value: 30 },
  { name: "Filters", value: 20 },
  { name: "Others", value: 10 },
];

const demandHeatmapData = [
  { zone: "Sector 12", orders: 35 },
  { zone: "DLF Phase 3", orders: 28 },
  { zone: "Rajiv Chowk", orders: 19 },
  { zone: "Sadar Bazar", orders: 43 },
];

const OverviewTab = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ padding: 12 }}>
      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        {kpiStats.map((stat) => (
          <Col xs={24} sm={12} md={6} key={stat.title}>
            <Card
              style={{
                borderLeft: `5px solid ${stat.color}`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <h4 style={{ margin: 0 }}>{stat.title}</h4>
                  <h2 style={{ color: stat.color }}>{stat.value}</h2>
                </div>
                <div style={{ fontSize: 28, color: stat.color }}>{stat.icon}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Chart + Pie */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={16}>
          <Card title="Order Volume Trend">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={orderTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="orders" stroke="#1677ff" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="Orders by Category">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderCategories}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                  dataKey="value"
                >
                  {orderCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Expandable Demand Heatmap */}
      <Card
        title="Demand Heatmap"
        extra={
          <Button
            type="link"
            icon={expanded ? <CompressOutlined /> : <ExpandAltOutlined />}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Collapse" : "Expand"}
          </Button>
        }
        style={{ marginTop: 24 }}
      >
        <Row gutter={[16, 16]}>
          {demandHeatmapData.map((zone) => (
            <Col xs={24} sm={12} md={6} key={zone.zone}>
              <Card
                style={{
                  background: "#eff6ff",
                  textAlign: "center",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                <h3 style={{ color: "#1e40af" }}>{zone.zone}</h3>
                <p style={{ fontSize: 24, fontWeight: 600 }}>{zone.orders} orders</p>
              </Card>
            </Col>
          ))}
        </Row>

        {expanded && (
          <div style={{ marginTop: 16 }}>
            <img
              src="/heatmap-placeholder.png"
              alt="Heatmap Visualization"
              style={{ width: "100%", borderRadius: 8, border: "1px solid #e2e8f0" }}
            />
            <p style={{ textAlign: "center", color: "#64748b", marginTop: 8 }}>
              * Real-time demand concentration by zone
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default OverviewTab;
