import { NextResponse } from "next/server";
import { createShareToken, getProjectById } from "../../../services/projectService.js";
import { getOrCreateSessionId } from "../../../lib/security/session.js";
import { createShareLead } from "../../../services/shareLeadService.js";

export async function POST(request) {
  try {
    const sessionId = await getOrCreateSessionId();
    const body = await request.json();
    const { projectId, editToken, userData } = body;

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const passedEditToken = editToken || request.headers.get("x-edit-token");

    const result = await createShareToken(projectId, {
      ownerSessionId: sessionId,
      editToken: passedEditToken,
    });

    // If user details were submitted via the share popup form, record them
    if (userData && (userData.name || userData.email)) {
      let projectTitle = "Landing Page Project";
      try {
        const proj = await getProjectById(projectId);
        if (proj?.title) projectTitle = proj.title;
        else if (proj?.pageConfig?.metadata?.title) projectTitle = proj.pageConfig.metadata.title;
      } catch (e) {
        // ignore
      }

      const forwarded = request.headers.get("x-forwarded-for");
      const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
      const userAgent = request.headers.get("user-agent") || "";

      await createShareLead({
        projectId,
        projectTitle,
        name: userData.name || "Anonymous",
        email: userData.email || "no-email@forma.local",
        phone: userData.phone || "",
        purpose: userData.purpose || "",
        shareUrl: result.shareUrl,
        shareToken: result.shareToken,
        ip,
        userAgent,
      });
    }

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
