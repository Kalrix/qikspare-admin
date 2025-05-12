import ReactDOMServer from "react-dom/server";
import InvoiceHTMLCustomer from "./InvoiceHTML-Customer";
import InvoiceHTMLPlatform from "./InvoiceHTML-Platform";

// ✅ Type definition for invoice
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
    type === "customer" ? (
      <InvoiceHTMLCustomer invoice={invoice} />
    ) : (
      <InvoiceHTMLPlatform invoice={invoice} />
    );

  return ReactDOMServer.renderToStaticMarkup(component);
};
