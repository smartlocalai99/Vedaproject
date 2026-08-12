// import { createClient } from "@supabase/supabase-js";

// const supabaseAdmin = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({
//       success: false,
//       message: "Method not allowed",
//     });
//   }

//   try {
//     const { email, otp } = req.body || {};

//     if (!email || !otp) {
//       return res.status(400).json({
//         success: false,
//         message: "Email and OTP are required.",
//       });
//     }

//     const cleanEmail = String(email)
//       .trim()
//       .toLowerCase();

//     const cleanOtp = String(otp).trim();

//     if (!/^\d{6}$/.test(cleanOtp)) {
//       return res.status(400).json({
//         success: false,
//         message: "Enter a valid 6-digit OTP.",
//       });
//     }

//     /*
//      * =====================================================
//      * GET OTP
//      * =====================================================
//      */

//     const { data, error } =
//       await supabaseAdmin
//         .from("password_reset_otps")
//         .select(
//           "email, otp, expires_at, verified"
//         )
//         .eq("email", cleanEmail)
//         .maybeSingle();

//     if (error) {
//       console.error(
//         "GET OTP ERROR:",
//         error
//       );

//       return res.status(500).json({
//         success: false,
//         message: "Unable to verify OTP.",
//       });
//     }

//     if (!data) {
//       return res.status(404).json({
//         success: false,
//         message:
//           "OTP not found. Please request a new OTP.",
//       });
//     }

//     /*
//      * =====================================================
//      * ALREADY VERIFIED
//      * =====================================================
//      */

//     if (data.verified === true) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "This OTP has already been used.",
//       });
//     }

//     /*
//      * =====================================================
//      * CHECK EXPIRY
//      * =====================================================
//      */

//     const expiryTime =
//       new Date(data.expires_at).getTime();

//     if (
//       !Number.isFinite(expiryTime) ||
//       Date.now() > expiryTime
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "OTP has expired. Please request a new OTP.",
//       });
//     }

//     /*
//      * =====================================================
//      * CHECK OTP
//      * =====================================================
//      */

//     if (String(data.otp) !== cleanOtp) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid OTP.",
//       });
//     }

//     /*
//      * =====================================================
//      * MARK VERIFIED
//      * =====================================================
//      */

//     const { error: updateError } =
//       await supabaseAdmin
//         .from("password_reset_otps")
//         .update({
//           verified: true,
//         })
//         .eq("email", cleanEmail)
//         .eq("otp", cleanOtp);

//     if (updateError) {
//       console.error(
//         "VERIFY OTP UPDATE ERROR:",
//         updateError
//       );

//       return res.status(500).json({
//         success: false,
//         message:
//           "Unable to complete OTP verification.",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "OTP verified successfully.",
//     });

//   } catch (error) {
//     console.error(
//       "VERIFY RESET OTP ERROR:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong.",
//     });
//   }
// }






// import { createClient } from "@supabase/supabase-js";

// const supabaseAdmin = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({
//       success: false,
//       message: "Method not allowed",
//     });
//   }

//   try {
//     const {
//       email,
//       otp,
//       newPassword,
//     } = req.body || {};

//     /*
//      * =====================================================
//      * VALIDATE INPUT
//      * =====================================================
//      */

//     if (!email || !otp || !newPassword) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Email, OTP and new password are required.",
//       });
//     }

//     const cleanEmail = String(email)
//       .trim()
//       .toLowerCase();

//     const cleanOtp = String(otp).trim();

//     const cleanPassword = String(
//       newPassword
//     );

//     /*
//      * =====================================================
//      * VALIDATE OTP FORMAT
//      * =====================================================
//      */

//     if (!/^\d{6}$/.test(cleanOtp)) {
//       return res.status(400).json({
//         success: false,
//         message: "Enter a valid 6-digit OTP.",
//       });
//     }

//     /*
//      * =====================================================
//      * VALIDATE PASSWORD
//      * =====================================================
//      */

//     if (cleanPassword.length < 6) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Password must be at least 6 characters.",
//       });
//     }

//     /*
//      * =====================================================
//      * CHECK SALES EXECUTIVE
//      * =====================================================
//      */

//     const {
//       data: sales,
//       error: salesError,
//     } = await supabaseAdmin
//       .from("sales_executives")
//       .select("id, email, status")
//       .eq("email", cleanEmail)
//       .maybeSingle();

//     if (salesError) {
//       console.error(
//         "SALES CHECK ERROR:",
//         salesError
//       );

//       return res.status(500).json({
//         success: false,
//         message: "Unable to verify account.",
//       });
//     }

//     if (!sales) {
//       return res.status(404).json({
//         success: false,
//         message: "Sales account not found.",
//       });
//     }

//     /*
//      * =====================================================
//      * CHECK ACCOUNT STATUS
//      * =====================================================
//      */

//     if (
//       sales.status &&
//       String(sales.status).toLowerCase() !==
//         "active"
//     ) {
//       return res.status(403).json({
//         success: false,
//         message: "This account is inactive.",
//       });
//     }

//     /*
//      * =====================================================
//      * GET OTP
//      * =====================================================
//      */

//     const {
//       data: otpData,
//       error: otpError,
//     } = await supabaseAdmin
//       .from("password_reset_otps")
//       .select(
//         "email, otp, expires_at, verified"
//       )
//       .eq("email", cleanEmail)
//       .maybeSingle();

//     if (otpError) {
//       console.error(
//         "GET OTP ERROR:",
//         otpError
//       );

//       return res.status(500).json({
//         success: false,
//         message: "Unable to verify OTP.",
//       });
//     }

//     if (!otpData) {
//       return res.status(404).json({
//         success: false,
//         message:
//           "OTP not found. Please request a new OTP.",
//       });
//     }

//     /*
//      * =====================================================
//      * CHECK OTP ALREADY USED
//      * =====================================================
//      */

//     if (otpData.verified === true) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "This OTP has already been used.",
//       });
//     }

//     /*
//      * =====================================================
//      * CHECK OTP EXPIRY
//      * =====================================================
//      */

//     const expiryTime = new Date(
//       otpData.expires_at
//     ).getTime();

//     if (
//       !Number.isFinite(expiryTime) ||
//       Date.now() > expiryTime
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "OTP has expired. Please request a new OTP.",
//       });
//     }

//     /*
//      * =====================================================
//      * CHECK OTP
//      * =====================================================
//      */

//     if (
//       String(otpData.otp) !== cleanOtp
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid OTP.",
//       });
//     }

//     /*
//      * =====================================================
//      * UPDATE PASSWORD
//      * =====================================================
//      */

//     const {
//       error: passwordError,
//     } = await supabaseAdmin
//       .from("sales_executives")
//       .update({
//         password: cleanPassword,
//       })
//       .eq("id", sales.id);

//     if (passwordError) {
//       console.error(
//         "PASSWORD UPDATE ERROR:",
//         passwordError
//       );

//       return res.status(500).json({
//         success: false,
//         message:
//           "Unable to update password.",
//       });
//     }

//     /*
//      * =====================================================
//      * MARK OTP VERIFIED
//      * =====================================================
//      */

//     const {
//       error: verifyError,
//     } = await supabaseAdmin
//       .from("password_reset_otps")
//       .update({
//         verified: true,
//       })
//       .eq("email", cleanEmail)
//       .eq("otp", cleanOtp);

//     if (verifyError) {
//       console.error(
//         "OTP VERIFY UPDATE ERROR:",
//         verifyError
//       );

//       /*
//        * Password has already changed.
//        * Return success because the main operation
//        * was completed.
//        */

//       return res.status(200).json({
//         success: true,
//         message:
//           "Password reset successfully.",
//       });
//     }

//     /*
//      * =====================================================
//      * DELETE OTP AFTER SUCCESS
//      * =====================================================
//      */

//     await supabaseAdmin
//       .from("password_reset_otps")
//       .delete()
//       .eq("email", cleanEmail);

//     /*
//      * =====================================================
//      * SUCCESS
//      * =====================================================
//      */

//     return res.status(200).json({
//       success: true,
//       message:
//         "Password reset successfully.",
//     });

//   } catch (error) {
//     console.error(
//       "VERIFY RESET OTP ERROR:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong.",
//     });
//   }
// }











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