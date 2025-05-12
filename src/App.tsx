import { Refine } from "@refinedev/core";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import routerBindings from "@refinedev/react-router";
import { App as AntdApp } from "antd";

import LoginPage from "./pages/login/LoginPage";
import DashboardPage from "./pages/dashboard";
import UsersPage from "./pages/users/UsersPage";
import UserDetailPage from "./pages/users/UserDetailPage";
import CreateInvoicePage from "./pages/sales/CreateInvoicePage";
import InvoicesPage from "./pages/sales/InvoicesPage";
import InvoiceViewPage from "./pages/sales/InvoiceViewPage";

import { authProvider } from "./authProvider";
import dataProvider from "@refinedev/simple-rest";
import "@refinedev/antd/dist/reset.css";

function App() {
  return (
    <BrowserRouter>
      <AntdApp>
        <Refine
          routerProvider={routerBindings}
          authProvider={authProvider}
          dataProvider={dataProvider("http://127.0.0.1:8000")}
          LoginPage={LoginPage}
          resources={[
            { name: "dashboard", list: "/dashboard" },
            { name: "users", list: "/users" },
            { name: "sales", list: "/sales/invoices" }, // Grouping sales-related routes
          ]}
        >
          <Routes>
            {/* Auth & Dashboard */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Users */}
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/:id" element={<UserDetailPage />} />

            {/* Invoices */}
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
