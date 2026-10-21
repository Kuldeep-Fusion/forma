import { cookies } from "next/headers";
import { generateSecureToken, hashToken } from "./crypto.js";

const SESSION_COOKIE_NAME = "forma_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Gets or creates the pseudonymous session ID from cookies.
 * Safe for use in Next.js Server Components and Route Handlers.
 */
export async function getOrCreateSessionId() {
  const cookieStore = cookies();
  const existingCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (existingCookie && existingCookie.value && existingCookie.value.length >= 16) {
    return existingCookie.value;
  }

  // Generate new anonymous pseudonymous session identifier
  const newSessionId = `sess_${generateSecureToken(16)}`;

  try {
    cookieStore.set(SESSION_COOKIE_NAME, newSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
  } catch (err) {
    // In Server Components, cookie setting might be read-only; route handlers will persist it
  }

  return newSessionId;
}

/**
 * Attaches the session cookie to an outgoing NextResponse.
 */
export function attachSessionCookie(response, sessionId) {
  if (!response || !sessionId) return response;
  response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return response;
}
