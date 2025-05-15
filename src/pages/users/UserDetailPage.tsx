import React, { useEffect, useState } from "react";
import {
  Layout, Button, Descriptions, Card, Form, Input,
  Row, Col, Divider, message
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  SaveOutlined
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import Topbar from "../dashboard/components/Topbar";
import Sidebar from "../dashboard/components/Sidebar";
import { API_BASE_URL } from "../../config";

const { Content, Sider } = Layout;

const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [user, setUser] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      const found = data.users.find((u: any) => u._id === id);
      if (!found) throw new Error("User not found");

      setUser(found);
      const loc = found.location || {};
      form.setFieldsValue({
        ...found,
        location: {
          addressLine: loc.addressLine || "",
          city: loc.city || "",
          state: loc.state || "",
          pincode: loc.pincode || "",
          lat: loc.lat?.toString() || "",
          lng: loc.lng?.toString() || "",
        },
      });
    } catch (err: any) {
      message.error(err.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchUser();
  }, [id]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const rawLoc = values.location || {};
      const location: Record<string, any> = {
        addressLine: rawLoc.addressLine || null,
        city: rawLoc.city || null,
        state: rawLoc.state || null,
        pincode: rawLoc.pincode || null,
        lat: rawLoc.lat ? parseFloat(rawLoc.lat) : null,
        lng: rawLoc.lng ? parseFloat(rawLoc.lng) : null,
      };

      const payload: Record<string, any> = {
        full_name: values.full_name || null,
        email: values.email || null,
        phone: values.phone || null,
        role: values.role || null,
        business_name: values.business_name || null,
        garage_name: values.garage_name || null,
        business_type: values.business_type || null,
        garage_size: values.garage_size || null,
        distributor_size: values.distributor_size || null,
        pan_number: values.pan_number || null,
        gstin: values.gstin || null,
        kyc_status: values.kyc_status || null,
        location,
      };

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
        throw new Error(data.detail || "Update failed");
      }
    } catch (err: any) {
      message.error(err.message || "Validation failed");
    }
  };

  const userFields = [
    { key: "full_name", label: "Full Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone", disabled: true },
    { key: "role", label: "Role", disabled: true },
    { key: "business_name", label: "Business Name" },
    { key: "garage_name", label: "Garage Name" },
    { key: "business_type", label: "Business Type" },
    { key: "garage_size", label: "Garage Size" },
    { key: "distributor_size", label: "Distributor Size" },
    { key: "gstin", label: "GSTIN" },
    { key: "pan_number", label: "PAN Number" },
    { key: "kyc_status", label: "KYC Status" },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Topbar />
      <Layout>
        <Sider width={220}><Sidebar /></Sider>
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
                      <Button icon={<SaveOutlined />} type="primary" onClick={handleSave} loading={loading}>
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
                      {userFields.map(({ key, label, disabled }) => (
                        <Col span={12} key={key}>
                          <Form.Item name={key} label={label}>
                            <Input disabled={!!disabled} />
                          </Form.Item>
                        </Col>
                      ))}
                    </Row>

                    <Divider />
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
                      <Col span={12}>
                        <Form.Item name={["location", "lat"]} label="Latitude">
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name={["location", "lng"]} label="Longitude">
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
                    <Descriptions.Item label="Referral Code">{user?.referral_code || "N/A"}</Descriptions.Item>
                    <Descriptions.Item label="Referred By">{user?.referred_by || "N/A"}</Descriptions.Item>
                    <Descriptions.Item label="Referral Count">{user?.referral_count ?? 0}</Descriptions.Item>
                    <Descriptions.Item label="KYC Status">{user?.kyc_status || "N/A"}</Descriptions.Item>
                    <Descriptions.Item label="Created At">{user?.created_at ? new Date(user.created_at).toLocaleString() : "N/A"}</Descriptions.Item>
                    <Descriptions.Item label="Updated At">{user?.updated_at ? new Date(user.updated_at).toLocaleString() : "N/A"}</Descriptions.Item>
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
