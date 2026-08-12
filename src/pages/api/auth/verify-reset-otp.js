import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const { email, otp } = req.body || {};

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    // CHECK OTP FORMAT
    if (!/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 6-digit OTP.",
      });
    }

    // GET OTP
    const { data: otpRecord, error: otpError } =
      await supabaseAdmin
        .from("password_reset_otps")
        .select("*")
        .eq("email", cleanEmail)
        .eq("otp", cleanOtp)
        .eq("verified", false)
        .maybeSingle();

    if (otpError) {
      console.error("OTP CHECK ERROR:", otpError);

      return res.status(500).json({
        success: false,
        message: "Unable to verify OTP.",
      });
    }

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    // CHECK EXPIRY
    const expiresAt = new Date(otpRecord.expires_at);

    if (expiresAt.getTime() < Date.now()) {
      await supabaseAdmin
        .from("password_reset_otps")
        .delete()
        .eq("email", cleanEmail);

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // MARK OTP AS VERIFIED
    const { error: updateError } = await supabaseAdmin
      .from("password_reset_otps")
      .update({
        verified: true,
      })
      .eq("id", otpRecord.id);

    if (updateError) {
      console.error("OTP UPDATE ERROR:", updateError);

      return res.status(500).json({
        success: false,
        message: "Unable to verify OTP.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
    });
  } catch (error) {
    console.error("VERIFY RESET OTP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
}