import {
  Eye,
  EyeOff,
  Lock,
  Phone,
} from "lucide-react";

import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function QrPrinterLogin() {
  const router = useRouter();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =====================================================
     CHECK EXISTING LOCAL LOGIN
     ===================================================== */

  useEffect(() => {
    if (!router.isReady) return;

    const loggedIn = localStorage.getItem(
      "qr_printer_logged_in"
    );

    if (
      loggedIn === "true" &&
      router.pathname === "/qr-printer/login"
    ) {
      router.replace(
        "/qr-printer/dashboard"
      );
    }
  }, [router]);

  /* =====================================================
     LOGIN
     ===================================================== */

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");

    const cleanMobile =
      mobile.replace(/\D/g, "");

    if (!cleanMobile || !password) {
      setError(
        "Please enter your mobile number and password."
      );
      return;
    }

    setLoading(true);

    try {
      if (
        cleanMobile === "9182742990" &&
        password === "123456"
      ) {
        localStorage.setItem(
          "qr_printer_logged_in",
          "true"
        );

        await router.replace(
          "/qr-printer/dashboard"
        );

        return;
      }

      setError(
        "Invalid mobile number or password."
      );
    } catch (loginError) {
      console.error(
        "QR PRINTER LOGIN ERROR:",
        loginError
      );

      setError(
        "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     UI
     ===================================================== */

  return (
    <main className="qr-printer-safe-top qr-printer-safe-bottom flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-[#F7F7F7] px-4">

      <section className="w-full max-w-md rounded-3xl border border-[#E9E2DC] bg-white p-7 shadow-lg sm:p-8">

        {/* LOGO */}

        <div className="mb-8 text-center">

          <Image
            src="/Logo veda.png"
            alt="VEDA MINDS"
            width={86}
            height={86}
            className="mx-auto object-contain"
            priority
          />

          <h1 className="mt-4 text-3xl font-bold text-[#172033]">
            QR Printer Partner
          </h1>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          {/* MOBILE */}

          <label className="block">

            <span className="mb-2 block font-medium text-[#172033]">
              Mobile Number
            </span>

            <span className="relative block">

              <Phone
                size={20}
                className="absolute left-4 top-3.5 text-gray-400"
              />

              <span className="absolute left-11 top-3.5 text-sm text-gray-500">
                +91
              </span>

              <input
                type="tel"
                value={mobile}
                onChange={(event) => {
                  const value =
                    event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);

                  setMobile(value);
                }}
                className="w-full rounded-xl border border-[#B97943] py-3 pl-[72px] pr-4 text-base outline-none focus:ring-orange-200"
                placeholder="Enter mobile number"
                inputMode="numeric"
                autoComplete="tel"
                disabled={loading}
              />

            </span>

          </label>

          {/* PASSWORD */}

          <label className="block">

            <span className="mb-2 block font-medium text-[#172033]">
              Password
            </span>

            <span className="relative block">

              <Lock
                size={20}
                className="absolute left-4 top-3.5 text-gray-400"
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-[#B97943] py-3 pl-12 pr-12 text-base outline-none focus:ring-orange-200"
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (value) => !value
                  )
                }
                className="absolute right-4 top-3.5 text-gray-500"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>

            </span>

          </label>

          {/* ERROR */}

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {/* LOGIN */}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              rounded-xl
              bg-[#172033]
              py-3
              font-semibold
              text-white
              transition
              hover:bg-[#111827]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

      </section>

    </main>
  );
}