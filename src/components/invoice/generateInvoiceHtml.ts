import ReactDOMServer from "react-dom/server";
import React from "react";
import InvoiceHTMLCustomer from "./InvoiceHTML-Customer";
import InvoiceHTMLPlatform from "./InvoiceHTML-Platform";

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  buyer: any;
  seller?: any;
  items?: any[];
  deliveryCharge?: number;
  paymentMode?: string;
  platformFee?: number;
  total?: number;
  orderId?: string;
}

export const generateInvoiceHTML = (
  invoice: InvoiceData,
  type: "customer" | "platform"
): string => {
  const component =
    type === "customer"
      ? React.createElement(InvoiceHTMLCustomer, { invoice })
      : React.createElement(InvoiceHTMLPlatform, { invoice });

  return ReactDOMServer.renderToStaticMarkup(component);
};
