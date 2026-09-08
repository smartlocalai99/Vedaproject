import {
  ArrowLeft,
  LogOut,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import { getQrPrinterPartnerUser } from "@/lib/qrPrinterPartner";

function formatPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");

  if (digits.startsWith("91") && digits.length === 12) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }

  return phone || "-";
}

export default function QrPrinterProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    let cancelled = false;

    getQrPrinterPartnerUser().then(async (partnerUser) => {
      if (cancelled) return;

      if (!partnerUser) {
        if (
          localStorage.getItem(
            "qr_printer_logged_in"
          ) === "true"
        ) {
          setUser({
            local: true,
            phone: "+919182742990",
            user_metadata: {
              full_name: "Annad",
            },
          });

          return;
        }

        await supabase.auth.signOut();

        if (
          router.pathname !==
          "/qr-printer/login"
        ) {
          router.replace("/qr-printer/login");
        }

        return;
      }

      setUser(partnerUser);
    });

    return () => {
      cancelled = true;
    };
  }, [router]);

  const logout = async () => {
    localStorage.removeItem(
      "qr_printer_logged_in"
    );

    await supabase.auth.signOut();

    if (
      router.pathname !==
      "/qr-printer/login"
    ) {
      router.replace("/qr-printer/login");
    }
  };

  if (!user) {
    return (
      <main className="qr-printer-safe-top min-h-screen w-full overflow-x-hidden bg-[#F7F7F7]" />
    );
  }

  const name =
    user.user_metadata?.full_name ||
    "QR Printer Partner";

  return (
    <main className="qr-printer-safe-top qr-printer-safe-bottom min-h-screen w-full overflow-x-hidden bg-[#F7F7F7] text-[#172033]">

      {/* PROFILE CONTENT */}

      <section className="mx-auto max-w-3xl px-4 py-7 sm:px-6">

        <button
          onClick={() =>
            router.push(
              "/qr-printer/dashboard"
            )
          }
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#8a5028] hover:underline"
        >
          <ArrowLeft size={17} />
        </button>

        <div className="mt-5 rounded-2xl border border-[#E9E2DC] bg-white p-4 shadow-sm sm:p-6">

          {/* PROFILE HEADER */}

          <div className="flex items-center gap-4 border-b border-[#E9E2DC] pb-5">

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fff4eb] text-[#B97943]">
              <UserRound size={28} />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                {name}
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                QR Printer Partner
              </p>
            </div>

          </div>

          {/* DETAILS */}

          <dl className="mt-5 space-y-4">

            {/* MOBILE */}

            <div className="flex items-center gap-3">

              <Phone
                className="text-[#B97943]"
                size={20}
              />

              <div>

                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Mobile number
                </dt>

                <dd className="mt-1 font-medium">
                  {formatPhone(user.phone)}
                </dd>

              </div>

            </div>

            {/* ACCESS */}

            <div className="flex items-center gap-3">

              <ShieldCheck
                className="text-[#B97943]"
                size={20}
              />

              <div>

                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Access
                </dt>

                

              </div>

            </div>

          </dl>

        </div>

        {/* LOGOUT */}

        <button
          onClick={logout}
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#172033] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#111827] sm:w-auto"
        >
          <LogOut size={17} />
          Logout
        </button>

      </section>

    </main>
  );
}
