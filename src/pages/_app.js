import "@/styles/globals.css";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isSales = router.pathname.startsWith("/salesexecutive");
  const isSuperAdmin = router.pathname.startsWith("/superadmin") || router.pathname === "/";

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    }
  }, []);

  const manifest = isSales ? "/sales-manifest.json" : null;
  const themeColor = isSales ? "#13273C" : "#111827";

  return <><Head>{manifest && <><link rel="manifest" href={manifest} /><meta name="theme-color" content={themeColor} /><link rel="icon" href="/icons/veda-192.png" /></>}</Head><Component {...pageProps} /></>;
}
