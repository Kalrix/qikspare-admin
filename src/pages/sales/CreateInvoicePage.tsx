import React, { useEffect, useState } from "react";
import {
  Layout, Input, Button, Card, Space, Row, Col, Table,
  Typography, InputNumber, Divider, Select, Form, message
} from "antd";
import {
  PlusOutlined, DeleteOutlined, SaveOutlined, FilePdfOutlined
} from "@ant-design/icons";
import axios from "axios";
import Topbar from "../dashboard/components/Topbar";
import Sidebar from "../dashboard/components/Sidebar";
import html2pdf from "html2pdf.js";
import { generateInvoiceHTML } from "../../components/invoice/generateInvoiceHtml";
import { API_BASE_URL } from "../../config";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const paymentModes = ["UPI", "Cash", "Card", "NetBanking", "Wallet"];

type PartyOption = {
  label: string;
  value: string;
  address: string;
  phone: string;
  email: string;
  gstin: string;
  name: string;
};

const CreateInvoicePage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(100);
  const [platformFee, setPlatformFee] = useState<number>(299);
  const [selectedVendor, setSelectedVendor] = useState<PartyOption | null>(null);
  const [selectedGarage, setSelectedGarage] = useState<PartyOption | null>(null);
  const [paymentMode, setPaymentMode] = useState<string>("UPI");
  const [loading, setLoading] = useState(false);
  const [garages, setGarages] = useState<PartyOption[]>([]);
  const [vendors, setVendors] = useState<PartyOption[]>([]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }).then(res => {
      const users: any[] = res.data.users || [];

      const formatAddress = (location: any) => {
        if (!location) return "";
        const { addressLine, city, state, pincode } = location;
        return [addressLine, city, state, pincode].filter(Boolean).join(", ");
      };

      const formatUser = (u: any): PartyOption => ({
        label: u.full_name || u.username,
        value: u._id,
        address: formatAddress(u.location),
        phone: u.phone,
        email: u.email,
        gstin: u.gstin || "",
        name: u.full_name || u.username,
      });

      setGarages(users.filter(u => u.role === "garage").map(formatUser));
      setVendors(users.filter(u => u.role === "vendor").map(formatUser));
    }).catch(() => message.error("Failed to fetch users."));
  }, []);

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    const item = updated[index];
    item[field] = value;
    const base = item.unitPrice * item.quantity;
    if (field === "discountAmount") item.discountPercent = base ? (value / base) * 100 : 0;
    if (field === "discountPercent") item.discountAmount = base ? (value / 100) * base : 0;
    setItems(updated);
  };

  const handleAddNewRow = () => {
    setItems([
      ...items,
      {
        partName: "",
        modelNo: "",
        category: "",
        unitPrice: 0,
        quantity: 1,
        discountAmount: 0,
        discountPercent: 0,
        gst: 18,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const calculateTotal = () => {
    let subtotal = 0;
    let tax = 0;
    for (const item of items) {
      const base = item.unitPrice * item.quantity;
      const discounted = base - item.discountAmount;
      const gstAmount = (discounted * item.gst) / 100;
      subtotal += discounted;
      tax += gstAmount;
    }
    const total = subtotal + tax + deliveryCharge + platformFee;
    return { subtotal, tax, total };
  };

  const handleDownloadInvoice = async (type: "customer" | "platform") => {
    if (!selectedVendor || !selectedGarage || !items.length) {
      return message.error("Fill all fields");
    }

    const invoiceDate = new Date().toISOString().split("T")[0];
    const { total } = calculateTotal();

    const payload = {
      invoiceType: type,
      buyer: selectedGarage,
      seller: selectedVendor,
      items,
      deliveryCharge,
      paymentMode,
      platformFee,
      invoiceDate,
      orderId: `ORD-${Date.now()}`,
      invoiceNumber: `INV-${Date.now()}`,
      total,
    };

    const htmlContent = generateInvoiceHTML(payload, type);
    html2pdf().from(htmlContent).set({
      margin: 0,
      filename: `${type}_invoice_${Date.now()}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }).save();
  };

  const handleSaveInvoice = async () => {
    if (!selectedVendor || !selectedGarage || !items.length) {
      return message.error("Fill all fields");
    }

    const invoiceDate = new Date().toISOString().split("T")[0];
    const payload = {
      invoiceType: "customer",
      buyer: {
        userId: selectedGarage.value,
        name: selectedGarage.label,
        address: selectedGarage.address,
        phone: selectedGarage.phone,
        email: selectedGarage.email,
        gstin: selectedGarage.gstin,
      },
      seller: {
        userId: selectedVendor.value,
        name: selectedVendor.label,
        address: selectedVendor.address,
        phone: selectedVendor.phone,
        email: selectedVendor.email,
        gstin: selectedVendor.gstin,
      },
      items,
      deliveryCharge,
      paymentMode,
      platformFee,
      invoiceDate,
    };

    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/api/invoices/api/invoices/create`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      message.success("Invoice saved successfully.");
    } catch (err) {
      console.error(err);
      message.error("Failed to save invoice.");
    } finally {
      setLoading(false);
    }
  };

  const renderPartyInfo = (party: PartyOption | null, label: string) =>
    party && (
      <div style={{ marginBottom: 12 }}>
        <Card size="small" title={`${label} Info`} style={{ width: 400 }}>
          <p><b>Name:</b> {party.name}</p>
          <p><b>Address:</b> {party.address}</p>
          <p><b>Phone:</b> {party.phone}</p>
          <p><b>Email:</b> {party.email}</p>
          <p><b>GSTIN:</b> {party.gstin}</p>
        </Card>
      </div>
    );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Topbar />
      <Layout>
        <Sider width={220}><Sidebar /></Sider>
        <Layout style={{ padding: 24 }}>
          <Content>
            <Title level={3}>🧾 Create Invoice</Title>

            <Card title="🔧 Spare Parts / Services">
              <Table
                columns={columns}
                dataSource={items}
                pagination={false}
                rowKey={(_, i) => (i !== undefined ? i.toString() : Math.random().toString())}
              />
              <Divider />
              <Button block icon={<PlusOutlined />} type="dashed" onClick={handleAddNewRow}>
                Add Item
              </Button>
            </Card>

            <Divider />

            <Space style={{ marginBottom: 12 }}>
              <Select
                value={selectedGarage?.value}
                onChange={(val) => setSelectedGarage(garages.find(g => g.value === val) || null)}
                options={garages}
                placeholder="Select Garage (Buyer)"
                style={{ width: 250 }}
              />
              <Select
                value={selectedVendor?.value}
                onChange={(val) => setSelectedVendor(vendors.find(v => v.value === val) || null)}
                options={vendors}
                placeholder="Select Vendor (Seller)"
                style={{ width: 250 }}
              />
              <Select
                value={paymentMode}
                onChange={setPaymentMode}
                options={paymentModes.map((m) => ({ label: m, value: m }))}
                style={{ width: 180 }}
              />
            </Space>

            {renderPartyInfo(selectedGarage, "Buyer")}
            {renderPartyInfo(selectedVendor, "Seller")}

            <Row gutter={16} style={{ margin: "16px 0" }}>
              <Col>
                <InputNumber
                  value={deliveryCharge}
                  addonBefore="Delivery Fee ₹"
                  onChange={(v) => setDeliveryCharge(v || 0)}
                />
              </Col>
              <Col>
                <InputNumber
                  value={platformFee}
                  addonBefore="Platform Fee ₹"
                  onChange={(v) => setPlatformFee(v || 0)}
                />
              </Col>
            </Row>

            <Divider />

            <Row gutter={12}>
              <Col>
                <Button icon={<SaveOutlined />} onClick={handleSaveInvoice} loading={loading}>
                  Save
                </Button>
              </Col>
              <Col>
                <Button icon={<FilePdfOutlined />} onClick={() => handleDownloadInvoice("customer")}>
                  Download Customer PDF
                </Button>
              </Col>
              <Col>
                <Button icon={<FilePdfOutlined />} onClick={() => handleDownloadInvoice("platform")}>
                  Download Platform PDF
                </Button>
              </Col>
            </Row>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default CreateInvoicePage;
