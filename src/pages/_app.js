import "@/styles/globals.css";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isSales = router.pathname.startsWith("/salesexecutive");
  const isQrPrinter = router.pathname.startsWith("/qr-printer");
  const isSuperAdmin = router.pathname.startsWith("/superadmin") || router.pathname === "/";

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    }
  }, []);

  const manifest = isQrPrinter ? "/qr-printer-manifest.json" : isSales ? "/sales-manifest.json" : null;
  const themeColor = isQrPrinter ? "#172033" : isSales ? "#13273C" : "#111827";
  const icon = isQrPrinter ? "/Logo%20veda.png" : "/icons/veda-192.png";

  return <><Head>{manifest && <><link rel="manifest" href={manifest} /><meta name="theme-color" content={themeColor} /><link rel="icon" href={icon} /></>}</Head><Component {...pageProps} /></>;
}
