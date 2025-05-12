import React from "react";
import "./invoice.css";
import logo from "../../../qikspare-logo.png";

const InvoiceHTMLPlatform = ({ invoice }: { invoice: any }) => {
  const {
    invoiceNumber = "REV123456",
    invoiceDate,
    buyer = {},
    platformFee = 0,
    deliveryCharge = 0,
    orderId,
    paymentMode = "UPI"
  } = invoice;

  const gstRate = 18;
  const calcGST = (amount: number) => (amount * gstRate) / 100;

  const rows = [
    {
      label: "Platform Fee",
      amount: platformFee,
      gst: calcGST(platformFee),
    },
    {
      label: "Logistics Fee",
      amount: deliveryCharge,
      gst: calcGST(deliveryCharge),
    },
  ];

  const totalAmount = rows.reduce((sum, r) => sum + r.amount, 0);
  const totalGst = rows.reduce((sum, r) => sum + r.gst, 0);
  const grandTotal = totalAmount + totalGst;

  return (
    <div className="invoice-container">
      <div className="invoice-header">
        <img src={logo} alt="QikSpare Logo" className="invoice-logo" />
        <div>
          <h2>Platform Service Fee Invoice</h2>
          <p><strong>Invoice #:</strong> {invoiceNumber}</p>
          <p><strong>Date:</strong> {invoiceDate}</p>
          <p><strong>Order ID:</strong> {orderId}</p>
        </div>
      </div>

      <div className="invoice-parties">
        <div>
          <p><strong>Billed To (Buyer)</strong></p>
          <p><strong>Name:</strong> {buyer.name || "-"}</p>
          <p><strong>Phone:</strong> {buyer.phone || "-"}</p>
          <p><strong>Email:</strong> {buyer.email || "-"}</p>
          <p><strong>Address:</strong> {buyer.address || "-"}</p>
          <p><strong>GSTIN:</strong> {buyer.gstin || "-"}</p>
        </div>
      </div>

      <table className="invoice-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Description</th>
            <th>Amount ₹</th>
            <th>GST%</th>
            <th>GST ₹</th>
            <th>Total ₹</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{row.label}</td>
              <td>{row.amount.toFixed(2)}</td>
              <td>{gstRate}%</td>
              <td>{row.gst.toFixed(2)}</td>
              <td>{(row.amount + row.gst).toFixed(2)}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={5}><strong>Grand Total</strong></td>
            <td><strong>{grandTotal.toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>

      <div className="invoice-summary">
        <p><strong>Mode of Payment:</strong> {paymentMode}</p>
      </div>

      <div className="invoice-footer">
        <p>For <strong>Amirag AutoCare LLP</strong></p>
        <p>Authorised Signatory</p>
      </div>
    </div>
  );
};

export default InvoiceHTMLPlatform;
