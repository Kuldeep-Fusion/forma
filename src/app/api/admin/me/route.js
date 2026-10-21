import { NextResponse } from "next/server";
import { isAdminAuthenticated, getAdminCredentials } from "../../../../lib/security/adminAuth.js";

export async function GET(request) {
  const isAuth = isAdminAuthenticated(request);
  if (!isAuth) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const { email } = getAdminCredentials();
  return NextResponse.json({
    authenticated: true,
    email,
  });
}
