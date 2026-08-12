import { useState } from "react";
import { Eye, EyeOff, Phone, Lock } from "lucide-react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { showError } from "@/lib/alerts";

export default function SalesLogin() {
  const router = useRouter();

  const [showPassword, setShowPassword] =
    useState(false);

  const [form, setForm] = useState({
    mobileNumber: "",
    password: "",
  });

  const [loading, setLoading] =
    useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (
      !form.mobileNumber ||
      !form.password
    ) {
      showError(
        "Missing login fields",
        "Please enter Mobile Number and Password."
      );

      return;
    }

    setLoading(true);

    try {
      const {
        data,
        error: loginError,
      } = await supabase
        .from("sales_executives")
        .select(
          "id, employee_id, full_name, email, mobile_number, assigned_area, status, created_at"
        )
        .eq(
          "mobile_number",
          form.mobileNumber.trim()
        )
        .eq(
          "password",
          form.password
        )
        .maybeSingle();

      if (loginError) {
        console.error(
          "SALES LOGIN ERROR:",
          loginError
        );

        showError(
          "Login Failed",
          "We could not sign you in. Please try again."
        );

        return;
      }

      if (
        !data ||
        data.status !== "Active"
      ) {
        showError(
          "Login Failed",
          "Invalid Mobile Number or password."
        );

        return;
      }

      localStorage.setItem(
        "salesExecutiveSession",
        JSON.stringify(data)
      );

      router.push(
        "/salesexecutive/dashboard"
      );
    } catch (error) {
      console.error(
        "SALES LOGIN EXCEPTION:",
        error
      );

      showError(
        "Login Failed",
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * =====================================================
   * FORGOT PASSWORD
   * =====================================================
   */

  const handleForgotPassword = () => {
    router.push(
      "/salesexecutive/reset-password"
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7] px-4">

      <div className="bg-white rounded-3xl shadow-lg w-full max-w-md p-8">

        {/* LOGO */}

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

        {/* LOGIN FORM */}

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          {/* MOBILE NUMBER */}

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
                  focus:ring-orange-200
                "
                required
              />

            </div>

          </div>

          {/* PASSWORD */}

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
                  focus:ring-orange-200
                "
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="
                  absolute
                  right-4
                  top-4
                  text-gray-500
                "
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>

            </div>

          </div>

          {/* LOGIN BUTTON */}

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

        {/* FORGOT PASSWORD */}

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