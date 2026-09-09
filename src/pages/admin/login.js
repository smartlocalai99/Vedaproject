import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ mobile, password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Invalid admin credentials.");
      await router.replace("/admin/dashboard");
    } catch (err) {
      console.error("ADMIN LOGIN ERROR:", err);
      setError(err.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="safe-area-top safe-area-bottom safe-area-x min-h-[100dvh] bg-[#F7F7F7] px-4 flex items-center justify-center">
      <section className="w-full max-w-md rounded-3xl border border-[#E9E2DC] bg-white p-7 shadow-lg sm:p-8">
        
        {/* Logo */}
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
            Admin Login
          </h1>

         
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Mobile Number */}
          <div>
            <label
              htmlFor="mobile"
              className="mb-2 block font-medium text-[#172033]"
            >
              Mobile Number
            </label>

            <input
              id="mobile"
              type="tel"
              required
              value={mobile}
              onChange={(event) => {
                setMobile(event.target.value.replace(/\D/g, ""));
                setError("");
              }}
              inputMode="numeric"
              autoComplete="username"
              maxLength={10}
              placeholder="Enter mobile number"
              className="w-full rounded-xl border border-[#B97943] px-4 py-3 text-base outline-none  focus:ring-orange-200"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block font-medium text-[#172033]"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                autoComplete="current-password"
                placeholder="Enter password"
                className="w-full rounded-xl border border-[#B97943] px-4 py-3 pr-12 text-base outline-none  focus:ring-orange-200"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-[#172033]"
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

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#172033] py-3 font-semibold text-white transition hover:bg-[#222d43] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}
