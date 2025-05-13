import { Refine } from "@refinedev/core";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import routerBindings from "@refinedev/react-router";
import { App as AntdApp } from "antd";
import axios from "axios";

import LoginPage from "./pages/login/LoginPage";
import DashboardPage from "./pages/dashboard";
import UsersPage from "./pages/users/UsersPage";
import UserDetailPage from "./pages/users/UserDetailPage";
import CreateInvoicePage from "./pages/sales/CreateInvoicePage";
import InvoicesPage from "./pages/sales/InvoicesPage";
import InvoiceViewPage from "./pages/sales/InvoiceViewPage";

import { authProvider } from "./authProvider";
import dataProviderFactory from "@refinedev/simple-rest";

const API_BASE = import.meta.env.PROD
  ? "https://qikspare-api.onrender.com"
  : "http://127.0.0.1:8000";

// ✅ Axios instance with token injection
const axiosInstance = axios.create({
  baseURL: API_BASE,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const dataProvider = dataProviderFactory(API_BASE, axiosInstance);

function App() {
  return (
    <BrowserRouter>
      <AntdApp>
        <Refine
          routerProvider={routerBindings}
          authProvider={authProvider}
          dataProvider={dataProvider}
          LoginPage={LoginPage}
          resources={[
            { name: "dashboard", list: "/dashboard" },
            { name: "users", list: "/users" },
            { name: "sales", list: "/sales/invoices" },
          ]}
        >
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/:id" element={<UserDetailPage />} />
            <Route path="/sales/invoices" element={<InvoicesPage />} />
            <Route path="/sales/create-invoice" element={<CreateInvoicePage />} />
            <Route path="/sales/invoice/:id" element={<InvoiceViewPage />} />
          </Routes>
        </Refine>
      </AntdApp>
    </BrowserRouter>
  );
}

export default App;
