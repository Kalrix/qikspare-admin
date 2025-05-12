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
} from "antd";
import {
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import Topbar from "../dashboard/components/Topbar";
import Sidebar from "../dashboard/components/Sidebar";

const { Content, Sider } = Layout;
const { TabPane } = Tabs;

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeUser, setActiveUser] = useState<any | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      } else {
        message.error(data.detail || "Failed to fetch users");
      }
    } catch (err) {
      message.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showEditModal = (user: any) => {
    setActiveUser(user);
    form.setFieldsValue(user);
    setIsModalVisible(true);
  };

  const showCreateModal = () => {
    setActiveUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const expectedFields = [
        "full_name", "email", "business_name", "garage_name",
        "business_type", "garage_size", "brands_served", "vehicle_types",
        "distributor_size", "brands_carried", "category_focus",
        "pan_number", "gstin", "location", "phone", "role"
      ];

      const payload: any = {};
      for (const field of expectedFields) {
        if (field === "location") {
          const loc = values.location || {};
          payload.location = Object.keys(loc).length > 0 ? loc : null;
        } else {
          payload[field] = values[field] || null;
        }
      }

      const url = activeUser
        ? `http://localhost:8000/api/admin/update-user/${activeUser._id}`
        : `http://localhost:8000/api/admin/create-user`; // 🔁 Replace with actual endpoint

      const method = activeUser ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        message.success(
          activeUser ? "✅ User updated successfully" : "✅ User created successfully"
        );
        setIsModalVisible(false);
        fetchUsers();
      } else {
        console.error("❌ Failed:", data);
        message.error(data.detail || "Operation failed");
      }
    } catch (err) {
      console.error("Form validation error:", err);
      message.error("Please fill form correctly");
    }
  };

  const columns = [
    { title: "Name", dataIndex: "full_name", key: "name" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Business", dataIndex: "business_name", key: "business" },
    {
      title: "City",
      dataIndex: ["location", "city"],
      key: "city",
      render: (_: any, record: any) => record.location?.city || "N/A",
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
            onClick={() => window.location.href = `/users/${record._id}`}
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
              </Tabs>
            </div>
          </Content>
        </Layout>
      </Layout>

      <Modal
        title={activeUser ? "Edit User" : "Create User"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmit}
        okText={activeUser ? "Update" : "Create"}
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="full_name" label="Full Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
          <Form.Item name="business_name" label="Business Name">
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Input placeholder="admin | garage | vendor" />
          </Form.Item>
          <Form.Item name={["location", "city"]} label="City">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default UsersPage;
