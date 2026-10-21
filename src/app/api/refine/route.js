import { NextResponse } from "next/server";
import { getOrCreateSessionId, attachSessionCookie } from "../../../lib/security/session.js";
import { getProjectById, updateProject } from "../../../services/projectService.js";
import { refineLandingPageWithGemini } from "../../../lib/ai/gemini.js";

export const maxDuration = 60;

export async function POST(request) {
  try {
    const sessionId = await getOrCreateSessionId();
    const editToken = request.headers.get("x-edit-token");
    const body = await request.json();
    const { projectId, pageConfig, prompt, sectionId } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Refinement prompt is required." }, { status: 400 });
    }

    if (!pageConfig || !pageConfig.sections) {
      return NextResponse.json({ error: "Valid pageConfig is required for refinement." }, { status: 400 });
    }

    let existingProject = null;
    if (projectId) {
      existingProject = await getProjectById(projectId, {
        ownerSessionId: sessionId,
        editToken,
      });

      if (!existingProject || !existingProject.canEdit) {
        return NextResponse.json(
          { error: "Unauthorized: Invalid edit credentials for this project." },
          { status: 403 }
        );
      }
    }

    const updatedConfig = await refineLandingPageWithGemini({
      pageConfig,
      refinementPrompt: prompt.trim(),
      sectionId: sectionId || null,
      requestId: `ref_${Date.now()}`,
    });

    if (projectId && existingProject) {
      await updateProject(
        projectId,
        { pageConfig: updatedConfig },
        { ownerSessionId: sessionId, editToken }
      );
    }

    const response = NextResponse.json({
      success: true,
      pageConfig: updatedConfig,
      message: "Landing page successfully refined with AI.",
    });

    return attachSessionCookie(response, sessionId);
  } catch (error) {
    console.error("POST /api/refine error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
