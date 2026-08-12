import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import Image from "next/image";
import { showError, showSuccess } from "@/lib/alerts";

export default function NewPassword() {
  const router = useRouter();

  const [email, setEmail] = useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const emailFromQuery = router.query.email;

    if (!emailFromQuery) {
      router.replace(
        "/salesexecutive/reset-password"
      );
      return;
    }

    setEmail(String(emailFromQuery));
  }, [router.isReady, router.query.email]);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!newPassword) {
      showError(
        "Password Required",
        "Please enter a new password."
      );
      return;
    }

    if (newPassword.length < 6) {
      showError(
        "Invalid Password",
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (!confirmPassword) {
      showError(
        "Confirm Password",
        "Please confirm your password."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showError(
        "Password Mismatch",
        "New password and confirm password do not match."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/change-reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        showError(
          "Password Change Failed",
          data.message ||
            "Unable to change password."
        );
        return;
      }

      showSuccess(
        "Password Changed",
        "Your password has been changed successfully."
      );

      setTimeout(() => {
        router.push("/salesexecutive/login");
      }, 1200);
    } catch (error) {
      console.error(
        "CHANGE PASSWORD ERROR:",
        error
      );

      showError(
        "Error",
        "Unable to change password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7] px-4">

      <div className="bg-white rounded-3xl shadow-lg w-full max-w-md p-8">

        <div className="text-center mb-8">

          <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4">

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
            New Password
          </h1>

          <p className="text-gray-500 mt-2">
            Create your new password
          </p>

          <p className="text-[#b56a38] text-sm mt-2 break-all">
            {email}
          </p>

        </div>

        <form
          onSubmit={handleChangePassword}
          className="space-y-5"
        >

          {/* NEW PASSWORD */}

          <div>

            <label className="block mb-2 font-medium">
              New Password
            </label>

            <div className="relative">

              <Lock
                className="absolute left-4 top-4 text-gray-400"
                size={20}
              />

              <input
                type={
                  showNewPassword
                    ? "text"
                    : "password"
                }
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
                placeholder="Enter New Password"
                className="
                  w-full
                  border
                  border-[#b56a38]
                  rounded-xl
                  pl-12
                  pr-12
                  py-3
                  outline-none
                "
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowNewPassword(
                    !showNewPassword
                  )
                }
                className="
                  absolute
                  right-4
                  top-4
                  text-gray-500
                "
              >
                {showNewPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>

            </div>

          </div>

          {/* CONFIRM PASSWORD */}

          <div>

            <label className="block mb-2 font-medium">
              Confirm Password
            </label>

            <div className="relative">

              <Lock
                className="absolute left-4 top-4 text-gray-400"
                size={20}
              />

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                placeholder="Confirm New Password"
                className="
                  w-full
                  border
                  border-[#b56a38]
                  rounded-xl
                  pl-12
                  pr-12
                  py-3
                  outline-none
                "
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                className="
                  absolute
                  right-4
                  top-4
                  text-gray-500
                "
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>

            </div>

          </div>

          {/* CHANGE PASSWORD */}

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
              disabled:opacity-60
            "
          >
            {loading
              ? "Changing Password..."
              : "Change Password"}
          </button>

        </form>

      </div>

    </div>
  );
}