import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import { showError, showSuccess } from "@/lib/alerts";

export default function VerifyOTP() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [secondsLeft, setSecondsLeft] = useState(300);
  const [resendSeconds, setResendSeconds] = useState(30);

  const [showOtp, setShowOtp] = useState(false);

  /*
   * =====================================================
   * GET EMAIL FROM QUERY
   * =====================================================
   */
  useEffect(() => {
    if (!router.isReady) return;

    const emailFromQuery = router.query.email;

    if (!emailFromQuery) {
      router.replace("/salesexecutive/reset-password");
      return;
    }

    setEmail(String(emailFromQuery));
  }, [router.isReady, router.query.email]);

  /*
   * =====================================================
   * OTP TIMER - 5 MINUTES
   * =====================================================
   */
  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  /*
   * =====================================================
   * RESEND TIMER - 30 SECONDS
   * =====================================================
   */
  useEffect(() => {
    if (resendSeconds <= 0) return;

    const timer = setInterval(() => {
      setResendSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendSeconds]);

  /*
   * =====================================================
   * FORMAT TIMER
   * =====================================================
   */
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  /*
   * =====================================================
   * VERIFY OTP
   * =====================================================
   */
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!email) {
      showError(
        "Email Missing",
        "Email information is missing."
      );
      return;
    }

    const cleanOtp = String(otp).trim();

    if (!cleanOtp) {
      showError(
        "Invalid OTP",
        "Please enter the OTP."
      );
      return;
    }

    if (!/^\d{6}$/.test(cleanOtp)) {
      showError(
        "Invalid OTP",
        "Please enter a valid 6-digit OTP."
      );
      return;
    }

    if (secondsLeft <= 0) {
      showError(
        "OTP Expired",
        "OTP has expired. Please request a new OTP."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/verify-reset-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            otp: cleanOtp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        showError(
          "OTP Verification Failed",
          data.message || "Invalid OTP."
        );
        return;
      }

      showSuccess(
        "OTP Verified",
        "You can now create a new password."
      );

      /*
       * GO TO NEW PASSWORD PAGE
       */
      router.push(
        `/salesexecutive/new-password?email=${encodeURIComponent(
          email.trim().toLowerCase()
        )}`
      );
    } catch (error) {
      console.error(
        "VERIFY OTP ERROR:",
        error
      );

      showError(
        "Error",
        "Unable to verify OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * =====================================================
   * RESEND OTP
   * =====================================================
   */
  const handleResendOTP = async () => {
    if (resending) return;

    if (resendSeconds > 0) return;

    if (!email) {
      showError(
        "Email Missing",
        "Email information is missing."
      );
      return;
    }

    setResending(true);

    try {
      const response = await fetch(
        "/api/auth/send-reset-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        showError(
          "Unable to Resend OTP",
          data.message || "Please try again."
        );
        return;
      }

      setOtp("");
      setSecondsLeft(300);
      setResendSeconds(30);

      showSuccess(
        "OTP Sent",
        "A new OTP has been sent to your email."
      );
    } catch (error) {
      console.error(
        "RESEND OTP ERROR:",
        error
      );

      showError(
        "Error",
        "Unable to resend OTP. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  /*
   * =====================================================
   * BACK
   * =====================================================
   */
  const handleBack = () => {
    router.push("/salesexecutive/reset-password");
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4 py-8 -translate-y-12">
      <div className="w-full max-w-[440px]">

        <div className="bg-white rounded-[28px] border border-[#eee5de] shadow-[0_12px_40px_rgba(80,50,30,0.08)] overflow-hidden">

          {/* HEADER */}
          <div className="px-7 pt-7">
            <button
              type="button"
              onClick={handleBack}
              className="w-10 h-10 rounded-full border border-[#eee5de] flex items-center justify-center text-[#5f554e] hover:bg-[#f8f4f0] transition"
            >
              <ArrowLeft size={19} />
            </button>
          </div>

          {/* CONTENT */}
          <div className="px-7 pb-10  -mt-9">

            {/* ICON / LOGO */}
            <div className="flex justify-center mb-6">
              <div className="w-[74px] h-[74px] rounded-[22px] bg-[#f5f1ed] flex items-center justify-center">
                <Lock
                  size={32}
                  strokeWidth={1.8}
                  className="text-[#8a451a]"
                />
              </div>
            </div>

            {/* TITLE */}
            <div className="text-center">

              <h1 className="text-[27px] font-semibold text-[#16120e]">
                Verify OTP
              </h1>

              <p className="mt-2 text-[14px] leading-6 text-[#756b63]">
                Enter the 6-digit OTP sent to your email
              </p>

              {email && (
                <p className="mt-1 text-[14px] font-medium text-[#8a451a] break-all">
                  {email}
                </p>
              )}

            </div>

            {/* OTP FORM */}
            <form
              onSubmit={handleVerifyOTP}
              className="mt-2"
            >

              <label
                htmlFor="otp"
                className="block text-[14px] font-medium text-[#332b25] mb-2"
              >
                Enter OTP
              </label>

              <div className="relative">

                <input
                  id="otp"
                  type={showOtp ? "text" : "password"}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    const value =
                      e.target.value.replace(/\D/g, "");

                    setOtp(value.slice(0, 6));
                  }}
                  placeholder="Enter 6-digit OTP"
                  className="w-full h-[54px] rounded-[14px] border border-[#ddd4cc] bg-white px-4 pr-12 text-[16px] tracking-[5px] text-[#16120e] outline-none focus:border-[#8a451a] focus:ring-2 focus:ring-[#8a451a]/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowOtp((prev) => !prev)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#81766e] hover:text-[#8a451a]"
                >
                  {showOtp ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>

              </div>

              {/* TIMER */}
              <div className="flex items-center justify-center mt-3">

                {secondsLeft > 0 ? (
                  <p className="text-[13px] text-[#756b63]">
                    OTP expires in{" "}
                    <span className="font-semibold text-[#8a451a]">
                      {formatTime(secondsLeft)}
                    </span>
                  </p>
                ) : (
                  <p className="text-[13px] text-red-600">
                    OTP has expired
                  </p>
                )}

              </div>

              {/* VERIFY BUTTON */}
              <button
                type="submit"
                disabled={
                  loading ||
                  otp.length !== 6 ||
                  secondsLeft <= 0
                }
                className="w-full h-[54px] mt-4 rounded-[14px] bg-[#8a451a] text-white text-[15px] font-semibold transition hover:bg-[#753a17] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Verifying..."
                  : "Verify OTP"}
              </button>

            </form>

            {/* RESEND */}
            <div className="text-center mt-4">

              <p className="text-[13px] text-[#756b63]">
                Didn't receive the OTP?
              </p>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={
                  resending ||
                  resendSeconds > 0
                }
                className="mt-1 text-[14px] font-semibold text-[#8a451a] disabled:text-[#aaa09a] disabled:cursor-not-allowed"
              >
                {resending
                  ? "Sending..."
                  : resendSeconds > 0
                  ? `Resend OTP in ${resendSeconds}s`
                  : "Resend OTP"}
              </button>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}