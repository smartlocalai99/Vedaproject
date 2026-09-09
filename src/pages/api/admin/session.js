import { readAdminToken } from "@/lib/adminAuth";

export default function handler(req, res) {
  const session = readAdminToken(req);
  if (!session) return res.status(401).json({ message: "Unauthorized." });
  return res.status(200).json({ user: { id: session.id, role: session.role, full_name: session.full_name, mobile: session.mobile } });
}
