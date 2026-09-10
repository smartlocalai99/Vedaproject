
import crypto from "crypto";

export const ADMIN_COOKIE = "veda_admin_session";

// Admin session secret.
// Keep this server-side. Do not use NEXT_PUBLIC_ for this value.
const ADMIN_SESSION_SECRET = "veda-admin-session-secret-2026";

function secret() {
  return ADMIN_SESSION_SECRET;
}

function sign(value) {
  return crypto
    .createHmac("sha256", secret())
    .update(value)
    .digest("base64url");
}

export function createAdminToken() {
  const payload = Buffer.from(
    JSON.stringify({
      id: "admin",
      role: "admin",
      full_name: "Shiva",
      mobile: "9959015364",
      exp: Date.now() + 8 * 60 * 60 * 1000,
    })
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export function readAdminToken(req) {
  const raw = String(req.headers.cookie || "")
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${ADMIN_COOKIE}=`))
    ?.slice(ADMIN_COOKIE.length + 1);

  if (!raw) return null;

  const [payload, signature] = raw.split(".");

  if (!payload || !signature) return null;

  const expected = sign(payload);

  if (
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    )
  ) {
    return null;
  }

  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    return session.exp > Date.now() && session.role === "admin"
      ? session
      : null;
  } catch {
    return null;
  }
}

export function adminCookie(token, maxAge = 8 * 60 * 60) {
  return `${ADMIN_COOKIE}=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`;
}

