import React, { useEffect, useState } from "react";
import {
  Layout, Input, Button, Card, Space, Row, Col, Table,
  Typography, InputNumber, Divider, Select, message
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
const { Title } = Typography;
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
      const formatAddress = (loc: any) =>
        loc ? [loc.addressLine, loc.city, loc.state, loc.pincode].filter(Boolean).join(", ") : "";

      const mapUser = (u: any): PartyOption => ({
        label: u.full_name || u.username,
        value: u._id,
        name: u.full_name || u.username,
        phone: u.phone,
        email: u.email,
        gstin: u.gstin || "",
        address: formatAddress(u.location),
      });

      setGarages(users.filter(u => u.role === "garage").map(mapUser));
      setVendors(users.filter(u => u.role === "vendor").map(mapUser));
    }).catch(() => message.error("Failed to fetch users"));
  }, []);

  const handleItemChange = (i: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[i][field] = value;
    const base = newItems[i].unitPrice * newItems[i].quantity;
    if (field === "discountAmount") newItems[i].discountPercent = base ? (value / base) * 100 : 0;
    if (field === "discountPercent") newItems[i].discountAmount = base ? (value / 100) * base : 0;
    setItems(newItems);
  };

  const handleAddItem = () =>
    setItems([
      ...items,
      {
        partName: "", modelNo: "", category: "", unitPrice: 0,
        quantity: 1, discountAmount: 0, discountPercent: 0, gst: 18,
      },
    ]);

  const handleRemoveItem = (i: number) => {
    const updated = [...items];
    updated.splice(i, 1);
    setItems(updated);
  };

  const calculateTotal = () => {
    let subtotal = 0, tax = 0;
    items.forEach(it => {
      const base = it.unitPrice * it.quantity;
      const discounted = base - it.discountAmount;
      const gst = (discounted * it.gst) / 100;
      subtotal += discounted;
      tax += gst;
    });
    return { subtotal, tax, total: subtotal + tax + deliveryCharge + platformFee };
  };

  const handleDownload = (type: "customer" | "platform") => {
    if (!selectedVendor || !selectedGarage || !items.length) return message.error("Fill all fields");

    const invoiceDate = new Date().toISOString().split("T")[0];
    const total = calculateTotal().total;
    const payload = {
      invoiceType: type,
      buyer: selectedGarage,
      seller: selectedVendor,
      items,
      deliveryCharge,
      platformFee,
      paymentMode,
      invoiceDate,
      orderId: `ORD-${Date.now()}`,
      invoiceNumber: `INV-${Date.now()}`,
      total,
    };

    const html = generateInvoiceHTML(payload, type);
    html2pdf().from(html).set({
      margin: 0,
      filename: `${type}_invoice_${Date.now()}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4' },
    }).save();
  };

  const handleSaveInvoice = async () => {
    if (!selectedVendor || !selectedGarage || !items.length) return message.error("Fill all fields");

    const invoiceDate = new Date().toISOString().split("T")[0];
    const payload = {
      invoiceType: "customer",
      buyer: {
        userId: selectedGarage.value,
        name: selectedGarage.name,
        address: selectedGarage.address,
        phone: selectedGarage.phone,
        email: selectedGarage.email,
        gstin: selectedGarage.gstin,
      },
      seller: {
        userId: selectedVendor.value,
        name: selectedVendor.name,
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
      message.success("Invoice saved successfully");
    } catch (err) {
      console.error(err);
      message.error("Failed to save invoice");
    } finally {
      setLoading(false);
    }
  };

  const renderPartyCard = (party: PartyOption | null, label: string) =>
    party && (
      <Card size="small" title={`${label} Info`} style={{ flex: 1 }}>
        <p><b>Name:</b> {party.name}</p>
        <p><b>Address:</b> {party.address}</p>
        <p><b>Phone:</b> {party.phone}</p>
        <p><b>Email:</b> {party.email}</p>
        <p><b>GSTIN:</b> {party.gstin}</p>
      </Card>
    );

  const summary = calculateTotal();

  const columns = [
    { title: "Part Name", render: (_: any, __: any, i: number) => <Input value={items[i]?.partName} onChange={e => handleItemChange(i, "partName", e.target.value)} /> },
    { title: "Model No.", render: (_: any, __: any, i: number) => <Input value={items[i]?.modelNo} onChange={e => handleItemChange(i, "modelNo", e.target.value)} /> },
    { title: "Category", render: (_: any, __: any, i: number) => <Input value={items[i]?.category} onChange={e => handleItemChange(i, "category", e.target.value)} /> },
    { title: "Unit Price", render: (_: any, __: any, i: number) => <InputNumber value={items[i]?.unitPrice} onChange={v => handleItemChange(i, "unitPrice", v || 0)} /> },
    { title: "Qty", render: (_: any, __: any, i: number) => <InputNumber value={items[i]?.quantity} onChange={v => handleItemChange(i, "quantity", v || 1)} /> },
    { title: "₹ Discount", render: (_: any, __: any, i: number) => <InputNumber value={items[i]?.discountAmount} onChange={v => handleItemChange(i, "discountAmount", v || 0)} /> },
    { title: "% Discount", render: (_: any, __: any, i: number) => <InputNumber value={items[i]?.discountPercent} onChange={v => handleItemChange(i, "discountPercent", v || 0)} /> },
    { title: "GST %", render: (_: any, __: any, i: number) => <InputNumber value={items[i]?.gst} onChange={v => handleItemChange(i, "gst", v || 0)} /> },
    {
      title: "Total", render: (_: any, __: any, i: number) => {
        const it = items[i];
        const base = it.unitPrice * it.quantity;
        const discounted = base - it.discountAmount;
        const gst = (discounted * it.gst) / 100;
        return `₹${(discounted + gst).toFixed(2)}`;
      }
    },
    {
      render: (_: any, __: any, i: number) => (
        <Button icon={<DeleteOutlined />} danger onClick={() => handleRemoveItem(i)} />
      ),
    }
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Topbar />
      <Layout>
        <Sider width={220}><Sidebar /></Sider>
        <Layout style={{ padding: 24 }}>
          <Content>
            <Title level={3}>🧾 Create Invoice</Title>

            <Space style={{ marginBottom: 16 }} wrap>
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

            <Row gutter={16}>
              <Col span={12}>{renderPartyCard(selectedGarage, "Buyer")}</Col>
              <Col span={12}>{renderPartyCard(selectedVendor, "Seller")}</Col>
            </Row>

            <Card title="🔧 Spare Parts / Services" style={{ marginTop: 16 }}>
            <Table columns={columns} dataSource={items} pagination={false} rowKey={(_, index) => index.toString()} />

              <Divider />
              <Button block icon={<PlusOutlined />} type="dashed" onClick={handleAddItem}>
                Add Item
              </Button>
            </Card>

            <Row gutter={16} style={{ marginTop: 24 }}>
              <Col span={6}>
                <InputNumber value={deliveryCharge} addonBefore="Delivery Fee ₹" onChange={(v) => setDeliveryCharge(v || 0)} style={{ width: "100%" }} />
              </Col>
              <Col span={6}>
                <InputNumber value={platformFee} addonBefore="Platform Fee ₹" onChange={(v) => setPlatformFee(v || 0)} style={{ width: "100%" }} />
              </Col>
              <Col span={12}>
                <Card size="small" title="💰 Summary">
                  <p><b>Subtotal:</b> ₹{summary.subtotal.toFixed(2)}</p>
                  <p><b>Tax:</b> ₹{summary.tax.toFixed(2)}</p>
                  <p><b>Grand Total:</b> ₹{summary.total.toFixed(2)}</p>
                </Card>
              </Col>
            </Row>

            <Divider />

            <Row gutter={16}>
              <Col><Button icon={<SaveOutlined />} onClick={handleSaveInvoice} loading={loading}>Save</Button></Col>
              <Col><Button icon={<FilePdfOutlined />} onClick={() => handleDownload("customer")}>Download Customer PDF</Button></Col>
              <Col><Button icon={<FilePdfOutlined />} onClick={() => handleDownload("platform")}>Download Platform PDF</Button></Col>
            </Row>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default CreateInvoicePage;
