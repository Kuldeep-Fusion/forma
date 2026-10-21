import { NextResponse } from "next/server";
import { recordPresenceHeartbeat, getActiveCreatorsCount } from "../../../services/presenceService.js";
import { getOrCreateSessionId, attachSessionCookie } from "../../../lib/security/session.js";

export async function POST(request) {
  try {
    const sessionId = await getOrCreateSessionId();
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "";

    await recordPresenceHeartbeat(sessionId, { ip, userAgent });
    const onlineNow = await getActiveCreatorsCount();

    const response = NextResponse.json({
      success: true,
      onlineNow,
      activeCreators: onlineNow,
      status: "active",
      timestamp: new Date().toISOString(),
    });

    return attachSessionCookie(response, sessionId);
  } catch (error) {
    console.error("POST /api/presence error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const onlineNow = await getActiveCreatorsCount();
    return NextResponse.json({
      onlineNow,
      activeCreators: onlineNow,
      status: "healthy",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ onlineNow: 1, activeCreators: 1 }, { status: 200 });
  }
}
