import Document, { Html, Head, Main, NextScript } from "next/document";

export default class VedaDocument extends Document {
  static async getInitialProps(context) {
    const initialProps = await Document.getInitialProps(context);
    return { ...initialProps, pathname: context.pathname };
  }

  render() {
    const isSuperAdmin = this.props.pathname === "/" || this.props.pathname?.startsWith("/superadmin");
    const isQrPrinter = this.props.pathname?.startsWith("/qr-printer");
    return <Html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        {isSuperAdmin && <>
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#171d2b" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="Veda Admin" />
          <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        </>}
        {isQrPrinter && <>
          <link rel="manifest" href="/qr-printer-manifest.json" />
          <meta name="theme-color" content="#172033" />
          <meta name="description" content="VEDA Minds QR Printer Partner application for managing QR printer members and QR codes." />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="Veda QR Printer" />
          <link rel="apple-touch-icon" href="/icons/veda-192.png" />
        </>}
      </Head>
      <body className="antialiased"><Main /><NextScript /></body>
    </Html>;
  }
}
