import React, { useEffect, useState } from "react";
import {
  Layout,
  Button,
  Descriptions,
  Card,
  Form,
  Input,
  Row,
  Col,
  Divider,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import Topbar from "../dashboard/components/Topbar";
import Sidebar from "../dashboard/components/Sidebar";
import { API_BASE_URL } from "../../config";


const { Content, Sider } = Layout;

interface User {
  _id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  role?: string;
  referral_code?: string;
  referred_by?: string;
  referral_count?: number;
  kyc_status?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await fetch("${API_BASE_URL}/api/admin/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        const found = data.users.find((u: User) => u._id === id);
        if (!found) throw new Error("User not found");
        setUser(found);
        form.setFieldsValue(found);
      } else {
        message.error(data.detail || "Failed to fetch user");
      }
    } catch {
      message.error("Error loading user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const payload: any = {};
      const fieldsToSend = [
        "full_name", "email", "business_name", "garage_name",
        "business_type", "garage_size", "brands_served", "vehicle_types",
        "distributor_size", "brands_carried", "category_focus",
        "pan_number", "gstin", "location", "phone", "role"
      ];

      fieldsToSend.forEach((key) => {
        const value = values[key];
        if (key === "location") {
          const cleanedLoc = Object.fromEntries(
            Object.entries(value || {}).filter(([_, v]) => v !== undefined && v !== "")
          );
          payload.location = Object.keys(cleanedLoc).length ? cleanedLoc : null;
        } else if (Array.isArray(value)) {
          payload[key] = value.length ? value : null;
        } else {
          payload[key] = value !== undefined && value !== "" ? value : null;
        }
      });

      const res = await fetch(`${API_BASE_URL}/api/admin/update-user/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        message.success("✅ User updated");
        setEditMode(false);
        fetchUser();
      } else {
        console.error("❌ Update failed:", data);
        message.error(data.detail || "Update failed");
      }
    } catch (err) {
      console.error("⚠️ Form error:", err);
      message.error("Validation failed");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Topbar />
      <Layout>
        <Sider width={220}>
          <Sidebar />
        </Sider>
        <Layout style={{ padding: 24 }}>
          <Content style={{ background: "#fff", padding: 24 }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/users")}
              style={{ marginBottom: 16 }}
            >
              Back to Users
            </Button>

            <Row gutter={24}>
              <Col span={16}>
                <Card
                  title="User Information"
                  extra={
                    editMode ? (
                      <Button icon={<SaveOutlined />} type="primary" onClick={handleSave}>
                        Save
                      </Button>
                    ) : (
                      <Button icon={<EditOutlined />} onClick={() => setEditMode(true)}>
                        Edit
                      </Button>
                    )
                  }
                >
                  <Form layout="vertical" form={form} disabled={!editMode}>
                    <Row gutter={16}>
                      {[
                        ["full_name", "Full Name"],
                        ["email", "Email"],
                        ["phone", "Phone", true],
                        ["business_name", "Business Name"],
                        ["garage_name", "Garage Name"],
                        ["business_type", "Business Type"],
                        ["garage_size", "Garage Size"],
                        ["distributor_size", "Distributor Size"],
                        ["gstin", "GSTIN"],
                        ["pan_number", "PAN Number"],
                        ["role", "Role", true],
                      ].map(([key, label, disabled]) => (
                        <Col span={12} key={String(key)}>
                          <Form.Item name={key as string} label={label as string}>
                            <Input disabled={!!disabled} />
                          </Form.Item>
                        </Col>
                      ))}
                    </Row>

                    <Divider style={{ margin: "12px 0" }} />

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name={["location", "addressLine"]} label="Address Line">
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name={["location", "city"]} label="City">
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name={["location", "state"]} label="State">
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name={["location", "pincode"]} label="Pincode">
                          <Input />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                </Card>
              </Col>

              <Col span={8}>
                <Card title="Referral & Metadata">
                  <Descriptions column={1}>
                    <Descriptions.Item label="Referral Code">
                      {typeof user?.referral_code === "string" ? user.referral_code : "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Referred By">
                      {typeof user?.referred_by === "string" ? user.referred_by : "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Referral Count">
                      {typeof user?.referral_count === "number" ? user.referral_count : 0}
                    </Descriptions.Item>
                    <Descriptions.Item label="KYC Status">
                      {user?.kyc_status || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Created At">
                      {user?.created_at ? new Date(user.created_at).toLocaleString() : "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Updated At">
                      {user?.updated_at ? new Date(user.updated_at).toLocaleString() : "N/A"}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>

            <Divider />

            <Card title="Sales Pipeline (Coming Soon)">
              <p>This section will track onboarding, KYC, purchases, issues, and conversions.</p>
            </Card>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default UserDetailPage;
