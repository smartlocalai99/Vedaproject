import { useState } from "react";
import {
  Eye,
  EyeOff,
  Phone,
  Lock,
} from "lucide-react";
import { useRouter } from "next/router";
import Image from "next/image";

import { supabase } from "@/lib/supabase";
import { showError } from "@/lib/alerts";

export default function SalesLogin() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    mobileNumber: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  /* =========================================================
     HANDLE INPUT
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     NORMALIZE MOBILE NUMBER
  ========================================================= */

  const normalizeMobileNumber = (value) => {
    const digits = String(value || "").replace(/\D/g, "");

    if (digits.length >= 10) {
      return digits.slice(-10);
    }

    return digits;
  };

  /* =========================================================
     LOGIN
  ========================================================= */

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    const mobileNumber = normalizeMobileNumber(
      form.mobileNumber
    );

    const password = String(form.password || "").trim();

    /* =======================================================
       VALIDATION
    ======================================================= */

    if (!mobileNumber || !password) {
      showError(
        "Missing login fields",
        "Please enter Mobile Number and Password."
      );
      return;
    }

    if (mobileNumber.length !== 10) {
      showError(
        "Invalid Mobile Number",
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    setLoading(true);

    try {
      /* =====================================================
         FIND SALES EXECUTIVE
      ===================================================== */

      const {
        data: salesData,
        error: mobileError,
      } = await supabase
        .from("sales_executives")
        .select(
          `
            id,
            employee_id,
            full_name,
            email,
            mobile_number,
            password,
            assigned_area,
            status,
            created_at
          `
        )
        .eq("mobile_number", mobileNumber)
        .maybeSingle();

      /* =====================================================
         SUPABASE ERROR
      ===================================================== */

      if (mobileError) {
        console.error(
          "SALES LOGIN SUPABASE ERROR:",
          mobileError
        );

        showError(
          "Login Failed",
          mobileError.message ||
            "Unable to verify your account. Please try again."
        );

        return;
      }

      /* =====================================================
         ACCOUNT NOT FOUND
      ===================================================== */

      if (!salesData) {
        console.error(
          "SALES LOGIN: ACCOUNT NOT FOUND",
          mobileNumber
        );

        showError(
          "Login Failed",
          "Invalid Mobile Number or password."
        );

        return;
      }

      /* =====================================================
         PASSWORD CHECK
      ===================================================== */

      const storedPassword = String(
        salesData.password || ""
      ).trim();

      if (!storedPassword) {
        console.error(
          "SALES LOGIN: PASSWORD IS EMPTY IN DATABASE"
        );

        showError(
          "Login Failed",
          "Your account password is not configured. Please contact the administrator."
        );

        return;
      }

      if (storedPassword !== password) {
        console.error(
          "SALES LOGIN: PASSWORD DOES NOT MATCH"
        );

        showError(
          "Login Failed",
          "Invalid Mobile Number or password."
        );

        return;
      }

      /* =====================================================
         STATUS CHECK
      ===================================================== */

      const accountStatus = String(
        salesData.status || ""
      )
        .trim()
        .toLowerCase();

      if (accountStatus !== "active") {
        showError(
          "Account Inactive",
          "Your account is inactive. Please contact the administrator."
        );

        return;
      }

      /* =====================================================
         CREATE SESSION
         DO NOT STORE PASSWORD
      ===================================================== */

      const sessionData = {
        id: salesData.id,
        employee_id: salesData.employee_id,
        full_name: salesData.full_name,
        email: salesData.email,
        mobile_number: salesData.mobile_number,
        assigned_area: salesData.assigned_area,
        status: salesData.status,
        created_at: salesData.created_at,
      };

      /* =====================================================
         SAVE SESSION
      ===================================================== */

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "salesExecutiveSession",
          JSON.stringify(sessionData)
        );
      }

      /* =====================================================
         LOGIN SUCCESS
      ===================================================== */

      await router.replace(
        "/salesexecutive/dashboard"
      );
    } catch (error) {
      console.error(
        "SALES LOGIN EXCEPTION:",
        error
      );

      showError(
        "Login Failed",
        error?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     FORGOT PASSWORD
  ========================================================= */

  const handleForgotPassword = () => {
    router.push(
      "/salesexecutive/reset-password"
    );
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7] px-4">

      <div className="bg-white rounded-3xl shadow-lg w-full max-w-md p-8">

        {/* ===================================================
            LOGO
        =================================================== */}

        <div className="text-center mb-8">

          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">

            <Image
              src="/Logo veda.png"
              alt="Veda Minds"
              width={85}
              height={85}
              className="object-contain"
              priority
            />

          </div>

          <h1 className="text-3xl font-bold">
            Sales Login
          </h1>

          <p className="text-gray-500 mt-2">
            Login to continue
          </p>

        </div>

        {/* ===================================================
            LOGIN FORM
        =================================================== */}

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          {/* =================================================
              MOBILE NUMBER
          ================================================= */}

          <div>

            <label className="block mb-2 font-medium">
              Mobile Number
            </label>

            <div className="relative">

              <Phone
                className="absolute left-4 top-4 text-gray-400"
                size={20}
              />

              <input
                type="tel"
                name="mobileNumber"
                value={form.mobileNumber}
                onChange={handleChange}
                placeholder="Enter Mobile Number"
                className="
                  w-full
                  border
                  border-[#b56a38]
                  rounded-xl
                  pl-12
                  pr-4
                  py-3
                  outline-none
                  focus:ring-2
                  focus:ring-orange-200
                "
                inputMode="numeric"
                autoComplete="tel"
                maxLength={13}
                required
              />

            </div>

          </div>

          {/* =================================================
              PASSWORD
          ================================================= */}

          <div>

            <label className="block mb-2 font-medium">
              Password
            </label>

            <div className="relative">

              <Lock
                className="absolute left-4 top-4 text-gray-400"
                size={20}
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter Password"
                className="
                  w-full
                  border
                  border-[#b56a38]
                  rounded-xl
                  pl-12
                  pr-12
                  py-3
                  outline-none
                  focus:ring-2
                  focus:ring-orange-200
                "
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (previous) => !previous
                  )
                }
                className="
                  absolute
                  right-4
                  top-4
                  text-gray-500
                  hover:text-gray-700
                "
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

            </div>

          </div>

          {/* =================================================
              LOGIN BUTTON
          ================================================= */}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-[#13273c]
              hover:bg-[#1d3650]
              text-white
              py-3
              rounded-xl
              font-semibold
              transition
              disabled:opacity-60
              disabled:cursor-not-allowed
            "
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        {/* ===================================================
            FORGOT PASSWORD
        =================================================== */}

        <div className="mt-6 text-center">

          <button
            type="button"
            className="
              text-[#b56a38]
              hover:underline
            "
            onClick={handleForgotPassword}
          >
            Forgot Password?
          </button>

        </div>

      </div>

    </div>
  );
}
