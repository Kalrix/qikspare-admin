import React from "react";
import "./invoice.css";
import logo from "../../../qikspare-logo.png";

const InvoiceHTMLCustomer = ({ invoice }: { invoice: any }) => {
  const {
    invoiceDate,
    invoiceNumber = "INV123456",
    buyer = {},
    seller = {},
    items = [],
    deliveryCharge = 0,
    paymentMode = "-",
    platformFee = 0,
    total: passedTotal,
  } = invoice;

  const subtotal = items.reduce((sum: number, item: any) => {
    const base = (item.unitPrice || 0) * (item.quantity || 0);
    return sum + (base - (item.discountAmount || 0));
  }, 0);

  const totalGst = items.reduce((sum: number, item: any) => {
    const base = (item.unitPrice || 0) * (item.quantity || 0) - (item.discountAmount || 0);
    return sum + ((base * (item.gst || 0)) / 100);
  }, 0);

  const grandTotal = passedTotal || subtotal + totalGst + deliveryCharge;

  return (
    <div className="invoice-container">
      <div className="invoice-header">
        <img src={logo} alt="QikSpare Logo" className="invoice-logo" />
        <div>
          <h2>Tax Invoice (On Behalf of Seller)</h2>
          <p><strong>Invoice #:</strong> {invoiceNumber}</p>
          <p><strong>Date:</strong> {invoiceDate}</p>
        </div>
      </div>

      <div className="invoice-parties">
        <div>
          <h4>Buyer (Garage)</h4>
          <p><strong>Name:</strong> {buyer.name || buyer.label || "-"}</p>
          <p><strong>Phone:</strong> {buyer.phone || "-"}</p>
          <p><strong>Email:</strong> {buyer.email || "-"}</p>
          <p><strong>Address:</strong> {buyer.address || "-"}</p>
        </div>
        <div>
          <h4>Seller (Vendor)</h4>
          <p><strong>Name:</strong> {seller.name || seller.label || "-"}</p>
          <p><strong>Phone:</strong> {seller.phone || "-"}</p>
          <p><strong>Email:</strong> {seller.email || "-"}</p>
          <p><strong>Address:</strong> {seller.address || "-"}</p>
          <p><strong>GSTIN:</strong> {seller.gstin || "-"}</p>
        </div>
      </div>

      <table className="invoice-table">
        <thead>
          <tr>
            <th>Part</th>
            <th>Model</th>
            <th>Category</th>
            <th>Qty</th>
            <th>Unit ₹</th>
            <th>Disc ₹</th>
            <th>GST%</th>
            <th>GST ₹</th>
            <th>Total ₹</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item: any, idx: number) => {
            const base = (item.unitPrice || 0) * (item.quantity || 0);
            const discounted = base - (item.discountAmount || 0);
            const gstAmt = (discounted * (item.gst || 0)) / 100;
            const rowTotal = discounted + gstAmt;

            return (
              <tr key={idx}>
                <td>{item.partName || "-"}</td>
                <td>{item.modelNo || "-"}</td>
                <td>{item.category || "-"}</td>
                <td>{item.quantity}</td>
                <td>{(item.unitPrice || 0).toFixed(2)}</td>
                <td>{(item.discountAmount || 0).toFixed(2)}</td>
                <td>{item.gst || 0}%</td>
                <td>{gstAmt.toFixed(2)}</td>
                <td>{rowTotal.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="invoice-summary">
        <p><strong>Subtotal:</strong> ₹{subtotal.toFixed(2)}</p>
        <p><strong>Total GST:</strong> ₹{totalGst.toFixed(2)}</p>
        <p><strong>Delivery Charge:</strong> ₹{deliveryCharge.toFixed(2)}</p>
        <p className="total"><strong>Grand Total:</strong> ₹{grandTotal.toFixed(2)}</p>
        <p><strong>Mode of Payment:</strong> {paymentMode}</p>
      </div>

      <div className="invoice-footer">
        <p>For <strong>Amirag AutoCare LLP</strong></p>
        <p>Authorised Signatory</p>
      </div>
    </div>
  );
};

export default InvoiceHTMLCustomer;
