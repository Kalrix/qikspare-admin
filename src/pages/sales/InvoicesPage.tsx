import React, { useEffect, useState } from "react";
import {
  Layout, Table, Button, Input, DatePicker, Space, message, Row, Col, Typography
} from "antd";
import {
  EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined
} from "@ant-design/icons";
import axios from "axios";
import Topbar from "../dashboard/components/Topbar";
import Sidebar from "../dashboard/components/Sidebar";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const { Content, Sider } = Layout;
const { Title } = Typography;
const { RangePicker } = DatePicker;

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/invoices/api/invoices/list", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = res.data || [];
      setInvoices(data);
      setFilteredData(data);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch invoices");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:8000/api/invoices/api/invoices/delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      message.success("Invoice deleted");
      fetchInvoices();
    } catch (err) {
      console.error(err);
      message.error("Failed to delete invoice");
    }
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    const filtered = invoices.filter((inv: any) =>
      inv.buyer?.name?.toLowerCase().includes(text.toLowerCase()) ||
      inv.seller?.name?.toLowerCase().includes(text.toLowerCase()) ||
      inv.invoiceNumber?.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleDateFilter = (dates: any[]) => {
    setDateRange(dates);
    if (!dates || dates.length !== 2) {
      setFilteredData(invoices);
      return;
    }

    const [start, end] = dates;
    const filtered = invoices.filter((inv: any) => {
      const date = moment(inv.invoiceDate);
      return date.isBetween(start, end, "day", "[]");
    });
    setFilteredData(filtered);
  };

  const columns = [
    { title: "Invoice No.", dataIndex: "invoiceNumber", key: "invoiceNumber" },
    { title: "Date", dataIndex: "invoiceDate", key: "invoiceDate" },
    {
      title: "Buyer",
      key: "buyer",
      render: (_: any, record: any) => record?.buyer?.name || "-"
    },
    {
      title: "Seller",
      key: "seller",
      render: (_: any, record: any) => record?.seller?.name || "-"
    },
    {
      title: "Total",
      key: "total",
      render: (_: any, record: any) => `₹${record?.totalAmount?.toFixed(2) || "0.00"}`
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => navigate(`/sales/invoice/${record._id}?mode=view`)}
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/sales/invoice/${record._id}?mode=edit`)}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record._id)}
          />
        </Space>
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
            <Title level={3}>📄 All Invoices</Title>

            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Input
                  placeholder="Search by buyer, seller, invoice #"
                  value={searchText}
                  onChange={(e) => handleSearch(e.target.value)}
                  prefix={<SearchOutlined />}
                />
              </Col>
              <Col>
                <RangePicker value={dateRange} onChange={handleDateFilter} />
              </Col>
            </Row>

            <Table
              rowKey="_id"
              dataSource={filteredData}
              columns={columns}
              pagination={{ pageSize: 10 }}
            />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default InvoicesPage;
