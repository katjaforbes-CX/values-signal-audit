declare module "html2pdf.js" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type Html2PdfOptions = Record<string, any>;

  interface Html2PdfInstance {
    set(options: Html2PdfOptions): Html2PdfInstance;
    from(element: HTMLElement | string): Html2PdfInstance;
    save(): Promise<void>;
  }

  function html2pdf(): Html2PdfInstance;
  export default html2pdf;
}
