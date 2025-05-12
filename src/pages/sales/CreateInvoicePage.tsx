// ...imports
import React, { useEffect, useState } from "react";
import {
  Layout, Input, Button, Card, Space, Row, Col, Table,
  Typography, InputNumber, Divider, Select, Form, message
} from "antd";
import { PlusOutlined, DeleteOutlined, SaveOutlined, FilePdfOutlined } from "@ant-design/icons";
import axios from "axios";
import Topbar from "../dashboard/components/Topbar";
import Sidebar from "../dashboard/components/Sidebar";
import html2pdf from "html2pdf.js";
import { generateInvoiceHTML } from "../../components/invoice/generateInvoiceHtml";

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
  const [form] = Form.useForm();
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
    axios.get("http://localhost:8000/api/admin/users", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }).then(res => {
      const allUsers: any[] = res.data.users || [];

      const formatAddress = (location: any) => {
        if (!location) return "";
        const { addressLine, city, state, pincode } = location;
        return [addressLine, city, state, pincode].filter(Boolean).join(", ");
      };

      setGarages(allUsers
        .filter((u: any) => u.role === "garage")
        .map((u: any) => ({
          label: u.full_name || u.username,
          value: u._id,
          address: formatAddress(u.location),
          phone: u.phone,
          email: u.email,
          gstin: u.gstin || "",
          name: u.full_name || u.username
        }))
      );

      setVendors(allUsers
        .filter((u: any) => u.role === "vendor")
        .map((u: any) => ({
          label: u.full_name || u.username,
          value: u._id,
          address: formatAddress(u.location),
          phone: u.phone,
          email: u.email,
          gstin: u.gstin || "",
          name: u.full_name || u.username
        }))
      );
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
    setItems([...items, {
      partName: "", modelNo: "", category: "",
      unitPrice: 0, quantity: 1, discountAmount: 0, discountPercent: 0, gst: 18
    }]);
  };

  const handleRemoveItem = (index: number) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const calculateTotal = () => {
    let subtotal = 0, tax = 0;
    for (const item of items) {
      const base = item.unitPrice * item.quantity;
      const discounted = base - item.discountAmount;
      const gstAmount = (discounted * item.gst) / 100;
      subtotal += discounted;
      tax += gstAmount;
    }
    return { subtotal, tax, total: subtotal + tax + deliveryCharge };
  };

  const handleDownloadInvoice = async (type: "customer" | "platform") => {
    if (!selectedVendor || !selectedGarage || !items.length) return message.error("Fill all fields");

    const invoiceDate = new Date().toISOString().split("T")[0];
    const total = calculateTotal().total;
    const payload = {
      invoiceType: "customer",
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
    const opt = {
      margin: 0,
      filename: `${type}_invoice_${Date.now()}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(htmlContent).set(opt).save();
  };

  const handleSaveInvoice = async () => {
    if (!selectedVendor || !selectedGarage || !items.length) return message.error("Fill all fields");

    const invoiceDate = new Date().toISOString().split("T")[0];
    const payload = {
      invoiceType: "customer",
      buyer: {
        userId: selectedGarage.value,
        name: selectedGarage.label,
        address: selectedGarage.address || "",
        phone: selectedGarage.phone || "",
        email: selectedGarage.email || "",
        gstin: selectedGarage.gstin || ""
      },
      seller: {
        userId: selectedVendor.value,
        name: selectedVendor.label,
        address: selectedVendor.address || "",
        phone: selectedVendor.phone || "",
        email: selectedVendor.email || "",
        gstin: selectedVendor.gstin || ""
      },
      items,
      deliveryCharge,
      paymentMode,
      platformFee,
      invoiceDate,
    };

    try {
      setLoading(true);
      await axios.post("http://localhost:8000/api/invoices/api/invoices/create", payload, {
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

  const totals = calculateTotal();

  const columns = [
    {
      title: "Part Name",
      render: (_: any, __: any, i: number) => (
        <Input value={items[i]?.partName} onChange={(e) => handleItemChange(i, "partName", e.target.value)} />
      )
    },
    {
      title: "Model No.",
      render: (_: any, __: any, i: number) => (
        <Input value={items[i]?.modelNo} onChange={(e) => handleItemChange(i, "modelNo", e.target.value)} />
      )
    },
    {
      title: "Category",
      render: (_: any, __: any, i: number) => (
        <Input value={items[i]?.category} onChange={(e) => handleItemChange(i, "category", e.target.value)} />
      )
    },
    {
      title: "Unit Price",
      render: (_: any, __: any, i: number) => (
        <InputNumber value={items[i]?.unitPrice} onChange={(v) => handleItemChange(i, "unitPrice", v ?? 0)} />
      )
    },
    {
      title: "Qty",
      render: (_: any, __: any, i: number) => (
        <InputNumber value={items[i]?.quantity} onChange={(v) => handleItemChange(i, "quantity", v ?? 1)} />
      )
    },
    {
      title: "₹ Discount",
      render: (_: any, __: any, i: number) => (
        <InputNumber value={items[i]?.discountAmount} onChange={(v) => handleItemChange(i, "discountAmount", v ?? 0)} />
      )
    },
    {
      title: "% Discount",
      render: (_: any, __: any, i: number) => (
        <InputNumber value={items[i]?.discountPercent} onChange={(v) => handleItemChange(i, "discountPercent", v ?? 0)} />
      )
    },
    {
      title: "GST %",
      render: (_: any, __: any, i: number) => (
        <InputNumber value={items[i]?.gst} onChange={(v) => handleItemChange(i, "gst", v ?? 0)} />
      )
    },
    {
      title: "Total",
      render: (_: any, __: any, i: number) => {
        const it = items[i];
        if (!it) return "";
        const base = it.unitPrice * it.quantity;
        const discount = base - it.discountAmount;
        const gst = (discount * it.gst) / 100;
        return `₹${(discount + gst).toFixed(2)}`;
      }
    },
    {
      render: (_: any, __: any, i: number) => (
        <Button icon={<DeleteOutlined />} danger onClick={() => handleRemoveItem(i)} />
      )
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

            <Card title="🧾 Parties & Payment Info">
              <Row gutter={24}>
                <Col span={8}>
                  <Title level={5}>👤 Buyer (Garage)</Title>
                  <Select placeholder="Select Garage" options={garages} style={{ width: "100%" }}
                    onChange={(val) => setSelectedGarage(garages.find(g => g.value === val) || null)} />
                  {selectedGarage && (
                    <>
                      <p><strong>Name:</strong> {selectedGarage.name}</p>
                      <p><strong>Phone:</strong> {selectedGarage.phone}</p>
                      <p><strong>Email:</strong> {selectedGarage.email}</p>
                      <p><strong>Address:</strong> {selectedGarage.address}</p>
                    </>
                  )}
                </Col>
                <Col span={8}>
                  <Title level={5}>🏢 Seller (Vendor)</Title>
                  <Select placeholder="Select Vendor" options={vendors} style={{ width: "100%" }}
                    onChange={(val) => setSelectedVendor(vendors.find(v => v.value === val) || null)} />
                  {selectedVendor && (
                    <>
                      <p><strong>Name:</strong> {selectedVendor.name}</p>
                      <p><strong>Phone:</strong> {selectedVendor.phone}</p>
                      <p><strong>Email:</strong> {selectedVendor.email}</p>
                      <p><strong>Address:</strong> {selectedVendor.address}</p>
                      <p><strong>GSTIN:</strong> {selectedVendor.gstin}</p>
                    </>
                  )}
                </Col>
                <Col span={8}>
                  <Title level={5}>💳 Payment Mode</Title>
                  <Select value={paymentMode} options={paymentModes.map(m => ({ label: m, value: m }))}
                    style={{ width: "100%" }} onChange={setPaymentMode} />
                  <br /><br />
                  <InputNumber
                    style={{ width: "100%" }}
                    value={platformFee}
                    addonBefore="Platform Fee"
                    onChange={(val) => setPlatformFee(val ?? 0)}
                  />
                </Col>
              </Row>
            </Card>

            <Card title="🔧 Spare Parts / Services">
              <Table columns={columns} dataSource={items} pagination={false} rowKey={(_, i) => i.toString()} />
              <Divider />
              <Button block icon={<PlusOutlined />} type="dashed" onClick={handleAddNewRow}>Add Item</Button>
            </Card>

            <Card title="📊 Invoice Summary" style={{ maxWidth: 420 }}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Row justify="space-between"><Col>Subtotal:</Col><Col>₹{totals.subtotal.toFixed(2)}</Col></Row>
                <Row justify="space-between"><Col>Total GST:</Col><Col>₹{totals.tax.toFixed(2)}</Col></Row>
                <Row justify="space-between"><Col>Delivery Charges:</Col>
                  <Col><InputNumber value={deliveryCharge} onChange={(val) => setDeliveryCharge(val ?? 0)} /></Col></Row>
                <Divider />
                <Row justify="space-between"><Col><strong>Total:</strong></Col>
                  <Col><strong>₹{totals.total.toFixed(2)}</strong></Col></Row>
              </Space>
            </Card>

            <Divider />
            <Space>
              <Button icon={<SaveOutlined />} type="primary" loading={loading} onClick={handleSaveInvoice}>Save</Button>
              <Button icon={<FilePdfOutlined />} onClick={() => handleDownloadInvoice("customer")}>Customer PDF</Button>
              <Button icon={<FilePdfOutlined />} onClick={() => handleDownloadInvoice("platform")}>Platform PDF</Button>
            </Space>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default CreateInvoicePage;

