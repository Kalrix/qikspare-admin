import React, { useEffect, useState } from "react";
import {
  Layout, Table, Input, InputNumber, Button, Space, Typography,
  Card, Row, Col, Divider, message
} from "antd";
import { PlusOutlined, SaveOutlined, FilePdfOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import axios from "axios";
import Topbar from "../dashboard/components/Topbar";
import Sidebar from "../dashboard/components/Sidebar";
import html2pdf from "html2pdf.js";
import { generateInvoiceHTML } from "../../components/invoice/generateInvoiceHtml";

const { Content, Sider } = Layout;
const { Title } = Typography;

const InvoiceDetailPage = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, []);

  const fetchInvoice = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/invoices/api/invoices/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setInvoice(res.data);
    } catch (err) {
      message.error("Failed to fetch invoice");
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...invoice.items];
    const item = updated[index];
    item[field] = value;
    const base = item.unitPrice * item.quantity;
    if (field === "discountAmount") item.discountPercent = base ? (value / base) * 100 : 0;
    if (field === "discountPercent") item.discountAmount = base ? (value / 100) * base : 0;
    setInvoice({ ...invoice, items: updated });
  };

  const handleAddItem = () => {
    setInvoice({
      ...invoice,
      items: [
        ...invoice.items,
        {
          partName: "", modelNo: "", quantity: 1,
          unitPrice: 0, discountAmount: 0, discountPercent: 0, gst: 18
        }
      ]
    });
  };

  const calculateTotals = () => {
    let subTotal = 0, totalTax = 0;
    invoice.items.forEach((item: any) => {
      const base = item.unitPrice * item.quantity;
      const discounted = base - item.discountAmount;
      const gst = (discounted * item.gst) / 100;
      subTotal += discounted;
      totalTax += gst;
    });

    const delivery = Number(invoice.deliveryCharge || 0);
    const platform = Number(invoice.platformFee || 0);
    const totalAmount = subTotal + totalTax + delivery + platform;
    return { subTotal, totalTax, totalAmount };
  };

  const { subTotal, totalTax, totalAmount } = invoice
    ? calculateTotals()
    : { subTotal: 0, totalTax: 0, totalAmount: 0 };

  const columns = [
    {
      title: "Part", render: (_: any, __: any, i: number | undefined) => {
        if (typeof i !== "number") return "";
        return (
          <Input
            value={invoice.items[i]?.partName}
            onChange={e => handleItemChange(i, "partName", e.target.value)}
          />
        );
      }
    },
    {
      title: "Model No", render: (_: any, __: any, i: number | undefined) => {
        if (typeof i !== "number") return "";
        return (
          <Input
            value={invoice.items[i]?.modelNo}
            onChange={e => handleItemChange(i, "modelNo", e.target.value)}
          />
        );
      }
    },
    {
      title: "Qty", render: (_: any, __: any, i: number | undefined) => {
        if (typeof i !== "number") return "";
        return (
          <InputNumber
            value={invoice.items[i]?.quantity}
            onChange={v => handleItemChange(i, "quantity", v ?? 1)}
          />
        );
      }
    },
    {
      title: "Unit ₹", render: (_: any, __: any, i: number | undefined) => {
        if (typeof i !== "number") return "";
        return (
          <InputNumber
            value={invoice.items[i]?.unitPrice}
            onChange={v => handleItemChange(i, "unitPrice", v ?? 0)}
          />
        );
      }
    },
    {
      title: "Disc ₹", render: (_: any, __: any, i: number | undefined) => {
        if (typeof i !== "number") return "";
        return (
          <InputNumber
            value={invoice.items[i]?.discountAmount}
            onChange={v => handleItemChange(i, "discountAmount", v ?? 0)}
          />
        );
      }
    },
    {
      title: "Disc %", render: (_: any, __: any, i: number | undefined) => {
        if (typeof i !== "number") return "";
        return (
          <InputNumber
            value={invoice.items[i]?.discountPercent}
            onChange={v => handleItemChange(i, "discountPercent", v ?? 0)}
          />
        );
      }
    },
    {
      title: "GST %", render: (_: any, __: any, i: number | undefined) => {
        if (typeof i !== "number") return "";
        return (
          <InputNumber
            value={invoice.items[i]?.gst}
            onChange={v => handleItemChange(i, "gst", v ?? 18)}
          />
        );
      }
    },
    {
      title: "Total ₹", render: (_: any, __: any, i: number | undefined) => {
        if (typeof i !== "number") return "";
        const item = invoice.items[i];
        const base = item.unitPrice * item.quantity;
        const discounted = base - item.discountAmount;
        const gst = (discounted * item.gst) / 100;
        return (discounted + gst).toFixed(2);
      }
    }
  ];

  const handleSave = async () => {
    try {
      setLoading(true);
      await axios.patch(`http://localhost:8000/api/invoices/api/invoices/update/${id}`, {
        ...invoice,
        subTotal,
        totalTax,
        totalAmount
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      message.success("Invoice updated");
    } catch (err) {
      message.error("Failed to update invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const html = generateInvoiceHTML({ ...invoice, subTotal, totalTax, totalAmount }, "customer");
    html2pdf().from(html).set({
      filename: `invoice_${invoice.invoiceNumber}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).save();
  };

  if (!invoice) return null;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Topbar />
      <Layout>
        <Sider width={220}><Sidebar /></Sider>
        <Layout style={{ padding: 24 }}>
          <Content>
            <Title level={3}>🧾 View/Edit Invoice - {invoice.invoiceNumber}</Title>

            <Card>
              <Row gutter={32}>
                <Col span={12}>
                  <h4>Buyer</h4>
                  <p><strong>Name:</strong> {invoice.buyer?.name}</p>
                  <p><strong>Phone:</strong> {invoice.buyer?.phone}</p>
                  <p><strong>Address:</strong> {invoice.buyer?.address}</p>
                </Col>
                <Col span={12}>
                  <h4>Seller</h4>
                  <p><strong>Name:</strong> {invoice.seller?.name}</p>
                  <p><strong>Phone:</strong> {invoice.seller?.phone}</p>
                  <p><strong>Address:</strong> {invoice.seller?.address}</p>
                  <p><strong>GSTIN:</strong> {invoice.seller?.gstin}</p>
                </Col>
              </Row>
            </Card>

            <Divider />
            <Table
              columns={columns}
              dataSource={invoice.items}
              pagination={false}
              rowKey={(_, i) => (i !== undefined ? i.toString() : String(Math.random()))}

            />
            <Button
              block icon={<PlusOutlined />}
              onClick={handleAddItem}
              type="dashed"
              style={{ marginTop: 12 }}
            >
              Add New Item
            </Button>

            <Divider />
            <Row gutter={32}>
              <Col span={12}>
                <InputNumber
                  addonBefore="Delivery ₹"
                  value={invoice.deliveryCharge}
                  onChange={v => setInvoice({ ...invoice, deliveryCharge: v ?? 0 })}
                  style={{ width: "100%" }}
                />
              </Col>
              <Col span={12}>
                <InputNumber
                  addonBefore="Platform Fee ₹"
                  value={invoice.platformFee}
                  onChange={v => setInvoice({ ...invoice, platformFee: v ?? 0 })}
                  style={{ width: "100%" }}
                />
              </Col>
            </Row>

            <Divider />
            <Space>
              <Button icon={<SaveOutlined />} type="primary" loading={loading} onClick={handleSave}>
                Save Changes
              </Button>
              <Button icon={<FilePdfOutlined />} onClick={handleDownload}>
                Download PDF
              </Button>
            </Space>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default InvoiceDetailPage;
