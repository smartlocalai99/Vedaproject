import Document, { Html, Head, Main, NextScript } from "next/document";

export default class VedaDocument extends Document {
  static async getInitialProps(context) {
    const initialProps = await Document.getInitialProps(context);
    return { ...initialProps, pathname: context.pathname };
  }

  render() {
    const isSuperAdmin = this.props.pathname === "/" || this.props.pathname?.startsWith("/superadmin");
    return <Html lang="en">
      <Head>
        {isSuperAdmin && <>
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#171d2b" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="Veda Admin" />
          <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        </>}
      </Head>
      <body className="antialiased"><Main /><NextScript /></body>
    </Html>;
  }
}
