// import nodemailer from "nodemailer";
// import { createClient } from "@supabase/supabase-js";

// const supabaseAdmin = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

// const transporter = nodemailer.createTransport({
//   service: "gmail",

//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },

//   logger: true,
//   debug: true,
// });

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({
//       success: false,
//       message: "Method not allowed",
//     });
//   }

//   try {
//     const { email } = req.body || {};

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is required.",
//       });
//     }

//     const cleanEmail = String(email)
//       .trim()
//       .toLowerCase();

//     console.log("=================================");
//     console.log("SEND RESET OTP");
//     console.log("To:", cleanEmail);
//     console.log("SMTP USER:", process.env.SMTP_USER);
//     console.log("=================================");

//     // CHECK SALES EXECUTIVE
//     const { data: sales, error: salesError } =
//       await supabaseAdmin
//         .from("sales_executives")
//         .select("id, email, status")
//         .eq("email", cleanEmail)
//         .maybeSingle();

//     if (salesError) {
//       console.error(
//         "SALES CHECK ERROR:",
//         salesError
//       );

//       return res.status(500).json({
//         success: false,
//         message: "Unable to verify email.",
//       });
//     }

//     if (!sales) {
//       return res.status(404).json({
//         success: false,
//         message: "No account found with this email.",
//       });
//     }

//     // CHECK ACTIVE STATUS
//     if (
//       sales.status &&
//       String(sales.status).toLowerCase() !== "active"
//     ) {
//       return res.status(403).json({
//         success: false,
//         message: "This account is inactive.",
//       });
//     }

//     // GENERATE OTP
//     const otp = Math.floor(
//       100000 + Math.random() * 900000
//     ).toString();

//     console.log("OTP GENERATED:", otp);

//     // 5 MINUTES
//     const expiresAt = new Date(
//       Date.now() + 5 * 60 * 1000
//     ).toISOString();

//     // DELETE OLD OTP
//     const { error: deleteError } =
//       await supabaseAdmin
//         .from("password_reset_otps")
//         .delete()
//         .eq("email", cleanEmail);

//     if (deleteError) {
//       console.error(
//         "DELETE OLD OTP ERROR:",
//         deleteError
//       );

//       return res.status(500).json({
//         success: false,
//         message: "Unable to create OTP.",
//       });
//     }

//     // SAVE OTP
//     const { error: insertError } =
//       await supabaseAdmin
//         .from("password_reset_otps")
//         .insert([
//           {
//             email: cleanEmail,
//             otp: otp,
//             expires_at: expiresAt,
//             verified: false,
//           },
//         ]);

//     if (insertError) {
//       console.error(
//         "OTP INSERT ERROR:",
//         insertError
//       );

//       return res.status(500).json({
//         success: false,
//         message: "Unable to save OTP.",
//       });
//     }

//     console.log("OTP SAVED TO DATABASE");

//     // VERIFY SMTP CONNECTION
//     try {
//       console.log("VERIFYING GMAIL SMTP...");

//       await transporter.verify();

//       console.log(
//         "GMAIL SMTP CONNECTION SUCCESS"
//       );
//     } catch (smtpVerifyError) {
//       console.error(
//         "GMAIL SMTP VERIFY ERROR:",
//         smtpVerifyError
//       );

//       await supabaseAdmin
//         .from("password_reset_otps")
//         .delete()
//         .eq("email", cleanEmail);

//       return res.status(500).json({
//         success: false,
//         message:
//           "Gmail SMTP connection failed. Check SMTP_USER and SMTP_PASS.",
//       });
//     }

//     // SEND EMAIL
//     try {
//       console.log("SENDING OTP EMAIL...");

//       const info = await transporter.sendMail({
//         from: `"Veda Minds" <${process.env.SMTP_USER}>`,
//         to: cleanEmail,
//         subject: "Veda Minds - Password Reset OTP",

//         text: `
// Your Veda Minds password reset OTP is:

// ${otp}

// This OTP is valid for 5 minutes.

// If you did not request a password reset, you can safely ignore this email.
//         `,

//         html: `
//           <div style="
//             font-family: Arial, sans-serif;
//             background: #f7f7f7;
//             padding: 30px;
//           ">

//             <div style="
//               max-width: 500px;
//               margin: auto;
//               background: white;
//               border-radius: 16px;
//               padding: 30px;
//               border: 1px solid #eee5de;
//             ">

//               <h2 style="
//                 margin: 0;
//                 color: #16120e;
//               ">
//                 Veda Minds
//               </h2>

//               <p style="
//                 color: #756b63;
//                 margin-top: 20px;
//               ">
//                 You requested to reset your password.
//               </p>

//               <p style="
//                 color: #756b63;
//               ">
//                 Use the OTP below to continue:
//               </p>

//               <div style="
//                 margin: 25px 0;
//                 text-align: center;
//               ">

//                 <span style="
//                   display: inline-block;
//                   background: #f5f1ed;
//                   color: #8a451a;
//                   font-size: 32px;
//                   font-weight: bold;
//                   letter-spacing: 8px;
//                   padding: 15px 25px;
//                   border-radius: 12px;
//                 ">
//                   ${otp}
//                 </span>

//               </div>

//               <p style="
//                 color: #756b63;
//                 font-size: 14px;
//               ">
//                 This OTP is valid for 5 minutes.
//               </p>

//               <p style="
//                 color: #756b63;
//                 font-size: 14px;
//               ">
//                 If you did not request a password reset,
//                 you can safely ignore this email.
//               </p>

//               <hr style="
//                 border: none;
//                 border-top: 1px solid #eee5de;
//                 margin: 25px 0;
//               ">

//               <p style="
//                 color: #999;
//                 font-size: 12px;
//                 margin: 0;
//               ">
//                 Veda Minds
//               </p>

//             </div>

//           </div>
//         `,
//       });

//       console.log(
//         "EMAIL SENT SUCCESSFULLY"
//       );

//       console.log(
//         "MESSAGE ID:",
//         info.messageId
//       );

//       console.log(
//         "RESPONSE:",
//         info.response
//       );

//     } catch (emailError) {
//       console.error(
//         "GMAIL SEND ERROR:",
//         emailError
//       );

//       await supabaseAdmin
//         .from("password_reset_otps")
//         .delete()
//         .eq("email", cleanEmail);

//       return res.status(500).json({
//         success: false,
//         message:
//           "Unable to send OTP email. Check Gmail SMTP settings.",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "OTP sent successfully.",
//     });

//   } catch (error) {
//     console.error(
//       "SEND RESET OTP ERROR:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong.",
//     });
//   }
// }









import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/*
 * =====================================================
 * GMAIL SMTP
 * =====================================================
 */

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  logger: true,
  debug: true,
});

/*
 * =====================================================
 * API HANDLER
 * =====================================================
 */

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const { email } = req.body || {};

    /*
     * =================================================
     * CHECK EMAIL
     * =================================================
     */

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const cleanEmail = String(email)
      .trim()
      .toLowerCase();

    console.log("=================================");
    console.log("SEND RESET OTP");
    console.log("To:", cleanEmail);
    console.log("SMTP USER:", process.env.SMTP_USER);
    console.log("=================================");

    /*
     * =================================================
     * CHECK SALES EXECUTIVE
     * =================================================
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
        message: "Unable to verify email.",
      });
    }

    /*
     * =================================================
     * EMAIL NOT FOUND
     * =================================================
     */

    if (!sales) {
      return res.status(404).json({
        success: false,
        message:
          "No account found with this email.",
      });
    }

    /*
     * =================================================
     * CHECK ACTIVE STATUS
     * =================================================
     */

    if (
      sales.status &&
      String(sales.status).toLowerCase() !== "active"
    ) {
      return res.status(403).json({
        success: false,
        message: "This account is inactive.",
      });
    }

    /*
     * =================================================
     * GENERATE 6 DIGIT OTP
     * =================================================
     */

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    console.log("OTP GENERATED:", otp);

    /*
     * =================================================
     * OTP VALID FOR 5 MINUTES
     * =================================================
     */

    const expiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    ).toISOString();

    /*
     * =================================================
     * DELETE OLD OTP
     * =================================================
     */

    const {
      error: deleteError,
    } = await supabaseAdmin
      .from("password_reset_otps")
      .delete()
      .eq("email", cleanEmail);

    if (deleteError) {
      console.error(
        "DELETE OLD OTP ERROR:",
        deleteError
      );

      return res.status(500).json({
        success: false,
        message: "Unable to create OTP.",
      });
    }

    /*
     * =================================================
     * SAVE NEW OTP
     * =================================================
     */

    const {
      error: insertError,
    } = await supabaseAdmin
      .from("password_reset_otps")
      .insert([
        {
          email: cleanEmail,
          otp: otp,
          expires_at: expiresAt,
          verified: false,
        },
      ]);

    if (insertError) {
      console.error(
        "OTP INSERT ERROR:",
        insertError
      );

      return res.status(500).json({
        success: false,
        message: "Unable to save OTP.",
      });
    }

    console.log("OTP SAVED TO DATABASE");

    /*
     * =================================================
     * VERIFY GMAIL SMTP CONNECTION
     * =================================================
     */

    try {
      console.log(
        "VERIFYING GMAIL SMTP..."
      );

      await transporter.verify();

      console.log(
        "GMAIL SMTP CONNECTION SUCCESS"
      );
    } catch (smtpVerifyError) {
      console.error(
        "GMAIL SMTP VERIFY ERROR:",
        smtpVerifyError
      );

      /*
       * Remove OTP if SMTP connection failed
       */

      await supabaseAdmin
        .from("password_reset_otps")
        .delete()
        .eq("email", cleanEmail);

      return res.status(500).json({
        success: false,
        message:
          "Gmail SMTP connection failed. Check SMTP_USER and SMTP_PASS.",
      });
    }

    /*
     * =================================================
     * SEND OTP EMAIL
     * =================================================
     */

    try {
      console.log(
        "SENDING OTP EMAIL..."
      );

      const info = await transporter.sendMail({
        from: `"Veda Minds" <${process.env.SMTP_USER}>`,

        to: cleanEmail,

        subject:
          "Veda Minds - Password Reset OTP",

        /*
         * =============================================
         * PLAIN TEXT EMAIL
         * =============================================
         */

        text: `
Hello,

We received a request to reset your Salesexecutive account password.

Your OTP is:

${otp}

This OTP is valid for 5 Minutes.

If you did not request a password reset, please ignore this email.

Veda Minds
        `.trim(),

        /*
         * =============================================
         * HTML EMAIL
         * =============================================
         */

        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Veda Minds - Password Reset OTP</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background: #f7f7f7;
  font-family: Arial, Helvetica, sans-serif;
">

  <div style="
    width: 100%;
    padding: 40px 15px;
    box-sizing: border-box;
    background: #f7f7f7;
  ">

    <div style="
      max-width: 520px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #eeeeee;
      border-radius: 12px;
      padding: 35px;
      box-sizing: border-box;
    ">

      <!-- GREETING -->

      <p style="
        margin: 0 0 22px 0;
        font-size: 16px;
        line-height: 1.6;
        color: #333333;
      ">
        Hello,
      </p>

      <!-- MESSAGE -->

      <p style="
        margin: 0 0 22px 0;
        font-size: 16px;
        line-height: 1.7;
        color: #333333;
      ">
        We received a request to reset your
        Salesexecutive account password.
      </p>

      <!-- OTP TEXT -->

      <p style="
        margin: 0 0 12px 0;
        font-size: 16px;
        line-height: 1.6;
        color: #333333;
      ">
        Your OTP is:
      </p>

      <!-- OTP -->

      <div style="
        margin: 20px 0 25px 0;
        text-align: center;
      ">

        <div style="
          display: inline-block;
          padding: 14px 24px;
          background: #f5f1ed;
          border-radius: 10px;
          color: #8a451a;
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          line-height: 1.2;
        ">
          ${otp}
        </div>

      </div>

      <!-- EXPIRY -->

      <p style="
        margin: 0 0 20px 0;
        font-size: 15px;
        line-height: 1.6;
        color: #333333;
      ">
        This OTP is valid for
        <strong>5 Minutes</strong>.
      </p>

      <!-- SECURITY MESSAGE -->

      <p style="
        margin: 0;
        font-size: 15px;
        line-height: 1.7;
        color: #555555;
      ">
        If you did not request a password reset,
        please ignore this email.
      </p>

      <!-- FOOTER -->

      <div style="
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #eeeeee;
      ">

        <p style="
          margin: 0;
          font-size: 13px;
          color: #999999;
        ">
          Veda Minds
        </p>

      </div>

    </div>

  </div>

</body>
</html>
        `,
      });

      console.log(
        "EMAIL SENT SUCCESSFULLY"
      );

      console.log(
        "MESSAGE ID:",
        info.messageId
      );

      console.log(
        "RESPONSE:",
        info.response
      );
    } catch (emailError) {
      console.error(
        "GMAIL SEND ERROR:",
        emailError
      );

      /*
       * Remove OTP if email sending failed
       */

      await supabaseAdmin
        .from("password_reset_otps")
        .delete()
        .eq("email", cleanEmail);

      return res.status(500).json({
        success: false,
        message:
          "Unable to send OTP email. Check Gmail SMTP settings.",
      });
    }

    /*
     * =================================================
     * SUCCESS
     * =================================================
     */

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully.",
    });
  } catch (error) {
    console.error(
      "SEND RESET OTP ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
}