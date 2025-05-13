// Updated CreateInvoicePage.tsx
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
    axios.get("${API_BASE_URL}/api/admin/users", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }).then(res => {
      const allUsers: any[] = res.data.users || [];

      const formatAddress = (location: any) => {
        if (!location) return "";
        const { addressLine, city, state, pincode } = location;
        return [addressLine, city, state, pincode].filter(Boolean).join(", ");
      };

      setGarages(allUsers.filter((u: any) => u.role === "garage")
        .map((u: any) => ({
          label: u.full_name || u.username,
          value: u._id,
          address: formatAddress(u.location),
          phone: u.phone,
          email: u.email,
          gstin: u.gstin || "",
          name: u.full_name || u.username
        })));

      setVendors(allUsers.filter((u: any) => u.role === "vendor")
        .map((u: any) => ({
          label: u.full_name || u.username,
          value: u._id,
          address: formatAddress(u.location),
          phone: u.phone,
          email: u.email,
          gstin: u.gstin || "",
          name: u.full_name || u.username
        })));
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
    html2pdf().from(htmlContent).set({
      margin: 0,
      filename: `${type}_invoice_${Date.now()}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).save();
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
      await axios.post("${API_BASE_URL}/api/invoices/api/invoices/create", payload, {
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
      render: (_: any, __: any, i: number | undefined) =>
        i !== undefined ? (
          <Input value={items[i]?.partName} onChange={(e) => handleItemChange(i, "partName", e.target.value)} />
        ) : null
    },
    {
      title: "Model No.",
      render: (_: any, __: any, i: number | undefined) =>
        i !== undefined ? (
          <Input value={items[i]?.modelNo} onChange={(e) => handleItemChange(i, "modelNo", e.target.value)} />
        ) : null
    },
    {
      title: "Category",
      render: (_: any, __: any, i: number | undefined) =>
        i !== undefined ? (
          <Input value={items[i]?.category} onChange={(e) => handleItemChange(i, "category", e.target.value)} />
        ) : null
    },
    {
      title: "Unit Price",
      render: (_: any, __: any, i: number | undefined) =>
        i !== undefined ? (
          <InputNumber value={items[i]?.unitPrice} onChange={(v) => handleItemChange(i, "unitPrice", v ?? 0)} />
        ) : null
    },
    {
      title: "Qty",
      render: (_: any, __: any, i: number | undefined) =>
        i !== undefined ? (
          <InputNumber value={items[i]?.quantity} onChange={(v) => handleItemChange(i, "quantity", v ?? 1)} />
        ) : null
    },
    {
      title: "₹ Discount",
      render: (_: any, __: any, i: number | undefined) =>
        i !== undefined ? (
          <InputNumber value={items[i]?.discountAmount} onChange={(v) => handleItemChange(i, "discountAmount", v ?? 0)} />
        ) : null
    },
    {
      title: "% Discount",
      render: (_: any, __: any, i: number | undefined) =>
        i !== undefined ? (
          <InputNumber value={items[i]?.discountPercent} onChange={(v) => handleItemChange(i, "discountPercent", v ?? 0)} />
        ) : null
    },
    {
      title: "GST %",
      render: (_: any, __: any, i: number | undefined) =>
        i !== undefined ? (
          <InputNumber value={items[i]?.gst} onChange={(v) => handleItemChange(i, "gst", v ?? 0)} />
        ) : null
    },
    {
      title: "Total",
      render: (_: any, __: any, i: number | undefined) => {
        if (i === undefined) return null;
        const it = items[i];
        if (!it) return "";
        const base = it.unitPrice * it.quantity;
        const discount = base - it.discountAmount;
        const gst = (discount * it.gst) / 100;
        return `₹${(discount + gst).toFixed(2)}`;
      }
    },
    {
      render: (_: any, __: any, i: number | undefined) =>
        i !== undefined ? <Button icon={<DeleteOutlined />} danger onClick={() => handleRemoveItem(i)} /> : null
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
            {/* UI sections as-is */}
            {/* Table below fixed */}
            <Card title="🔧 Spare Parts / Services">
              <Table
                columns={columns}
                dataSource={items}
                pagination={false}
                rowKey={(_, i) => (i !== undefined ? i.toString() : Math.random().toString())}
              />
              <Divider />
              <Button block icon={<PlusOutlined />} type="dashed" onClick={handleAddNewRow}>Add Item</Button>
            </Card>
            {/* Remaining UI unchanged */}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default CreateInvoicePage;
