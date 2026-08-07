import { useState } from "react";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";

export default function SalesLogin() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    employeeId: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
  e.preventDefault();

  if (!form.employeeId || !form.password) {
    setError("Please enter Employee ID and Password");
    return;
  }
  setLoading(true);
  setError("");
  const { data, error: loginError } = await supabase
    .from("sales_executives")
    .select("id, employee_id, full_name, email, mobile_number, assigned_area, status, created_at")
    .eq("employee_id", form.employeeId)
    .eq("password", form.password)
    .maybeSingle();
  setLoading(false);
  if (loginError) {
    setError(loginError.message);
    return;
  }
  if (!data || data.status !== "Active") {
    setError("Invalid credentials or inactive account.");
    return;
  }
  localStorage.setItem("salesExecutiveSession", JSON.stringify(data));
  router.push("/salesexecutive/dashboard");
};

  return (
    <div className="min-h-screen bg-[#f7f8fb] flex items-center justify-center p-4">

      <div className="bg-white rounded-3xl shadow-lg w-full  p-8">

        <div className="text-center mb-8">

          <div className="w-20 h-20 bg-[#13273c] rounded-full flex items-center justify-center mx-auto mb-4">

            <User className="text-white" size={40} />

          </div>

          <h1 className="text-3xl font-bold">
            Sales Login
          </h1>

          <p className="text-gray-500 mt-2">
            Login to continue
          </p>

        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          <div>

            <label className="block mb-2 font-medium">
              Employee ID
            </label>

            <div className="relative">

              <User
                className="absolute left-4 top-4 text-gray-400"
                size={20}
              />

              <input
                type="text"
                name="employeeId"
                value={form.employeeId}
                onChange={handleChange}
                placeholder="Enter Employee ID"
                className="w-full border border-[#b56a38] rounded-xl pl-12 pr-4 py-3 outline-none  focus:ring-orange-200"
                required
              />

            </div>

          </div>

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
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter Password"
                className="w-full border border-[#b56a38] rounded-xl pl-12 pr-12 py-3 outline-none focus:ring-orange-200"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-4 top-4 text-gray-500"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>

            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#13273c] hover:bg-[#1d3650] text-white py-3 rounded-xl font-semibold transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {error && <p className="mt-3 text-center text-sm text-red-500">{error}</p>}

        <div className="mt-6 text-center">

          <button
            className="text-[#b56a38] hover:underline"
            onClick={() => alert("Contact Administrator")}
          >
            Forgot Password?
          </button>

        </div>

      </div>

    </div>
  );
}
