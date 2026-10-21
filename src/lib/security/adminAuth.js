import crypto from "crypto";

const ADMIN_COOKIE_NAME = "forma_admin_session";
const SECRET = process.env.SESSION_SECRET || "forma_super_admin_secret_key_2026";

export function getAdminCredentials() {
  return {
    email: (process.env.ADMIN_EMAIL || "kk761734@gmail.com").trim().toLowerCase(),
    password: (process.env.ADMIN_PASSWORD || "12345678").trim(),
  };
}

export function createAdminToken(email) {
  const timestamp = Date.now();
  const payload = `${email}:${timestamp}`;
  const signature = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${Buffer.from(payload).toString("base64url")}.${signature}`;
}

export function verifyAdminToken(token) {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [encodedPayload, signature] = parts;
  try {
    const payload = Buffer.from(encodedPayload, "base64url").toString("utf-8");
    const expectedSignature = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");

    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      const [email, timestamp] = payload.split(":");
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      if (Date.now() - parseInt(timestamp, 10) < maxAge) {
        const { email: adminEmail } = getAdminCredentials();
        return email.toLowerCase() === adminEmail;
      }
    }
  } catch (err) {
    return false;
  }
  return false;
}

export function isAdminAuthenticated(request) {
  // Check Authorization header or custom header
  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7).trim();
      if (verifyAdminToken(token)) return true;
    }
    const tokenHeader = request.headers.get("x-admin-token");
    if (tokenHeader && verifyAdminToken(tokenHeader)) return true;

    // Check request cookies if available on request object
    if (request.cookies) {
      const cookie = request.cookies.get(ADMIN_COOKIE_NAME);
      if (cookie?.value && verifyAdminToken(cookie.value)) {
        return true;
      }
    }
  }

  return false;
}

export { ADMIN_COOKIE_NAME };
