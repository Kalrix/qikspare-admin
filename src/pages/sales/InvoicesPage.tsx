import React, { useEffect, useState } from "react";
import {
  Layout, Table, Button, Input, DatePicker, Space, message, Row, Col, Typography
} from "antd";
import {
  EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import Topbar from "../dashboard/components/Topbar";
import Sidebar from "../dashboard/components/Sidebar";
import { API_BASE_URL } from "../../config";

dayjs.extend(isBetween);

const { Content, Sider } = Layout;
const { Title } = Typography;
const { RangePicker } = DatePicker;

const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/invoices/api/invoices/list`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = res.data || [];
      setInvoices(data);
      setFilteredInvoices(data);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch invoices");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/invoices/api/invoices/delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      message.success("Invoice deleted");
      fetchInvoices();
    } catch (err) {
      console.error(err);
      message.error("Failed to delete invoice");
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    const lower = value.toLowerCase();

    const filtered = invoices.filter((inv) =>
      inv?.buyer?.name?.toLowerCase().includes(lower) ||
      inv?.seller?.name?.toLowerCase().includes(lower) ||
      inv?.invoiceNumber?.toLowerCase().includes(lower)
    );

    setFilteredInvoices(filtered);
  };

  const handleDateFilter = (
    dates: [Dayjs | null, Dayjs | null] | null
  ) => {
    setDateRange(dates ?? [null, null]);

    if (!dates || !dates[0] || !dates[1]) {
      setFilteredInvoices(invoices);
      return;
    }

    const [start, end] = dates;

    const filtered = invoices.filter((inv) =>
      dayjs(inv.invoiceDate).isBetween(start, end, "day", "[]")
    );

    setFilteredInvoices(filtered);
  };

  const columns = [
    {
      title: "Invoice No.",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
    },
    {
      title: "Date",
      dataIndex: "invoiceDate",
      key: "invoiceDate",
    },
    {
      title: "Buyer",
      key: "buyer",
      render: (_: any, record: any) => record?.buyer?.name || "-",
    },
    {
      title: "Seller",
      key: "seller",
      render: (_: any, record: any) => record?.seller?.name || "-",
    },
    {
      title: "Total",
      key: "total",
      render: (_: any, record: any) =>
        `₹${record?.totalAmount?.toFixed(2) || "0.00"}`,
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
      ),
    },
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
                  placeholder="Search buyer, seller, invoice #"
                  value={searchText}
                  onChange={(e) => handleSearch(e.target.value)}
                  prefix={<SearchOutlined />}
                />
              </Col>
              <Col>
                <RangePicker
                  value={dateRange}
                  onChange={handleDateFilter}
                />
              </Col>
            </Row>

            <Table
              rowKey="_id"
              columns={columns}
              dataSource={filteredInvoices}
              pagination={{ pageSize: 10 }}
            />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default InvoicesPage;
