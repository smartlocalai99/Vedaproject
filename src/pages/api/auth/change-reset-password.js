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
    const { email, newPassword } =
      req.body || {};

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Email and new password are required.",
      });
    }

    const cleanEmail = String(email)
      .trim()
      .toLowerCase();

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 6 characters.",
      });
    }

    /*
     * CHECK VERIFIED OTP
     */

    const {
      data: otpData,
      error: otpError,
    } = await supabaseAdmin
      .from("password_reset_otps")
      .select(
        "id, email, verified, expires_at"
      )
      .eq("email", cleanEmail)
      .eq("verified", true)
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (otpError) {
      console.error(
        "OTP CHECK ERROR:",
        otpError
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to verify password reset.",
      });
    }

    if (!otpData) {
      return res.status(403).json({
        success: false,
        message:
          "Please verify OTP before changing your password.",
      });
    }

    /*
     * CHECK OTP EXPIRY
     */

    if (
      new Date(otpData.expires_at).getTime() <
      Date.now()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "OTP has expired. Please request a new OTP.",
      });
    }

    /*
     * CHECK SALES EXECUTIVE
     */

    const {
      data: sales,
      error: salesError,
    } = await supabaseAdmin
      .from("sales_executives")
      .select("id, email, status")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (salesError) {
      console.error(
        "SALES CHECK ERROR:",
        salesError
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to find sales executive.",
      });
    }

    if (!sales) {
      return res.status(404).json({
        success: false,
        message:
          "Sales executive account not found.",
      });
    }

    /*
     * SAVE NEW PASSWORD
     */

    const {
      error: updateError,
    } = await supabaseAdmin
      .from("sales_executives")
      .update({
        password: newPassword,
      })
      .eq("id", sales.id);

    if (updateError) {
      console.error(
        "PASSWORD UPDATE ERROR:",
        updateError
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to change password.",
      });
    }

    /*
     * DELETE USED OTP
     */

    const {
      error: deleteError,
    } = await supabaseAdmin
      .from("password_reset_otps")
      .delete()
      .eq("id", otpData.id);

    if (deleteError) {
      console.error(
        "OTP DELETE ERROR:",
        deleteError
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Password changed successfully.",
    });
  } catch (error) {
    console.error(
      "CHANGE PASSWORD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong.",
    });
  }
}