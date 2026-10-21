import { NextResponse } from "next/server";
import { createShareToken } from "../../../services/projectService.js";
import { getOrCreateSessionId } from "../../../lib/security/session.js";

export async function POST(request) {
  try {
    const sessionId = await getOrCreateSessionId();
    const body = await request.json();
    const { projectId, editToken } = body;

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const passedEditToken = editToken || request.headers.get("x-edit-token");

    const result = await createShareToken(projectId, {
      ownerSessionId: sessionId,
      editToken: passedEditToken,
    });

    return NextResponse.json({
      success: true,
      shareUrl: result.shareUrl,
      shareToken: result.shareToken,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    console.error("POST /api/share error:", error);
    const status = error.message.includes("Unauthorized") ? 403 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }
}
