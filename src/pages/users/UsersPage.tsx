import React, { useEffect, useState } from "react";
import {
  Layout,
  Tabs,
  Table,
  Tag,
  message,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Select,
} from "antd";
import { EyeOutlined, PlusOutlined } from "@ant-design/icons";
import Topbar from "../dashboard/components/Topbar";
import Sidebar from "../dashboard/components/Sidebar";
import { API_BASE_URL } from "../../config";
import { useNavigate } from "react-router-dom";

const { Content, Sider } = Layout;
const { TabPane } = Tabs;

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // ✅ Step 1: Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("No token found. Please login again.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (res.ok) {
        console.log("✅ Users fetched:", data.users);
        setUsers(data.users || []);
      } else {
        console.error("❌ Failed to fetch users:", data);
        message.error(data.detail || "Failed to fetch users");
      }
    } catch (err) {
      console.error("❌ Network error:", err);
      message.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("📦 Stored token:", localStorage.getItem("token"));
    fetchUsers();
  }, []);

  const showCreateModal = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const columns = [
    { title: "Name", dataIndex: "full_name", key: "name" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Business", dataIndex: "business_name", key: "business" },
    {
      title: "City",
      key: "city",
      render: (_: any, record: any) => record?.location?.city || "N/A",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => {
        const colorMap: Record<string, string> = {
          admin: "red",
          garage: "blue",
          vendor: "green",
          delivery: "purple",
        };
        return <Tag color={colorMap[role] || "default"}>{role?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => navigate(`/users/${record._id}`)}
          />
        </Space>
      ),
    },
  ];

  const renderTab = (role: string) => (
    <Table
      dataSource={users.filter((u) => u.role === role)}
      columns={columns}
      rowKey="_id"
      loading={loading}
      pagination={{ pageSize: 5 }}
    />
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Topbar />
      <Layout>
        <Sider width={220}>
          <Sidebar />
        </Sider>
        <Layout style={{ padding: "0 24px" }}>
          <Content style={{ background: "#fff", marginTop: 16 }}>
            <div style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h2>All Users</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={showCreateModal}>
                  Create User
                </Button>
              </div>
              <Tabs defaultActiveKey="admin" type="card">
                <TabPane tab="Admins" key="admin">
                  {renderTab("admin")}
                </TabPane>
                <TabPane tab="Garages" key="garage">
                  {renderTab("garage")}
                </TabPane>
                <TabPane tab="Vendors" key="vendor">
                  {renderTab("vendor")}
                </TabPane>
                <TabPane tab="Delivery Boys" key="delivery">
                  {renderTab("delivery")}
                </TabPane>
              </Tabs>
            </div>
          </Content>
        </Layout>
      </Layout>

      <Modal
        title="Create User"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="full_name"
            label="Full Name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[
              { required: true, message: "Phone number is required" },
              { pattern: /^\d{10}$/, message: "Enter a valid 10-digit number" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Role is required" }]}
          >
            <Select placeholder="Select role">
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="garage">Garage</Select.Option>
              <Select.Option value="vendor">Vendor</Select.Option>
              <Select.Option value="delivery">Delivery</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default UsersPage;
