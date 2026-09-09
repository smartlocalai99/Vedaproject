import { adminCookie, createAdminToken } from "@/lib/adminAuth";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed." });
  const mobile = String(req.body?.mobile || "").replace(/\D/g, "");
  const password = String(req.body?.password || "");
  if (!process.env.ADMIN_MOBILE || !process.env.ADMIN_PASSWORD || mobile !== String(process.env.ADMIN_MOBILE).replace(/\D/g, "") || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Invalid admin credentials." });
  }
  try {
    res.setHeader("Set-Cookie", adminCookie(createAdminToken()));
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("ADMIN SESSION CONFIGURATION ERROR:", error.message);
    return res.status(503).json({ message: "Admin login is not configured." });
  }
}
