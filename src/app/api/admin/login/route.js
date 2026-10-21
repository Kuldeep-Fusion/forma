import { NextResponse } from "next/server";
import { getAdminCredentials, createAdminToken, ADMIN_COOKIE_NAME } from "../../../../lib/security/adminAuth.js";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const credentials = getAdminCredentials();

    const emailMatch = email.trim().toLowerCase() === credentials.email;
    const passwordMatch = password.trim() === credentials.password;

    if (!emailMatch || !passwordMatch) {
      return NextResponse.json(
        { error: "Invalid admin email or password" },
        { status: 401 }
      );
    }

    const token = createAdminToken(credentials.email);

    const response = NextResponse.json({
      success: true,
      message: "Admin authenticated successfully",
      email: credentials.email,
      token,
    });

    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during admin authentication" },
      { status: 500 }
    );
  }
}
