import ReactDOMServer from "react-dom/server";
import InvoiceHTMLCustomer from "./InvoiceHTML-Customer";
import InvoiceHTMLPlatform from "./InvoiceHTML-Platform";

type InvoiceType = {
  invoiceNumber: string;
  items: any[];
  buyer: any;
  seller: any;
  subTotal: number;
  totalTax: number;
  totalAmount: number;
  deliveryCharge?: number;
  platformFee?: number;
  [key: string]: any;
};

export const generateInvoiceHTML = (
  invoice: InvoiceType,
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
