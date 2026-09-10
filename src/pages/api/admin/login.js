
import { adminCookie, createAdminToken } from "@/lib/adminAuth";

const ADMIN_MOBILE = "9959015364";
const ADMIN_PASSWORD = "Shiva@12";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed.",
    });
  }

  try {
    const mobile = String(req.body?.mobile || "").replace(/\D/g, "");
    const password = String(req.body?.password || "");

    if (mobile !== ADMIN_MOBILE || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        message: "Invalid admin credentials.",
      });
    }

    const token = createAdminToken();

    res.setHeader("Set-Cookie", adminCookie(token));

    return res.status(200).json({
      ok: true,
    });
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);

    return res.status(500).json({
      message: "Unable to sign in. Please try again.",
    });
  }
}

