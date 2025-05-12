import ReactDOMServer from "react-dom/server";
import InvoiceHTMLCustomer from "./InvoiceHTML-Customer";
import InvoiceHTMLPlatform from "./InvoiceHTML-Platform";

export const generateInvoiceHTML = (invoice: any, type: "customer" | "platform") => {
  const component =
    type === "customer" ? (
      <InvoiceHTMLCustomer invoice={invoice} />
    ) : (
      <InvoiceHTMLPlatform invoice={invoice} />
    );

  return ReactDOMServer.renderToStaticMarkup(component);
};
