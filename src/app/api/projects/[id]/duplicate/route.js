import { NextResponse } from "next/server";
import { getProjectById, createProject } from "../../../../../services/projectService.js";
import { getOrCreateSessionId, attachSessionCookie } from "../../../../../lib/security/session.js";

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const sessionId = await getOrCreateSessionId();
    const editToken = request.headers.get("x-edit-token");

    const original = await getProjectById(id, {
      ownerSessionId: sessionId,
      editToken,
    });

    if (!original) {
      return NextResponse.json({ error: "Source project not found" }, { status: 404 });
    }

    if (!original.canEdit) {
      return NextResponse.json({ error: "Unauthorized to duplicate project" }, { status: 403 });
    }

    const { project: clonedProject, editToken: newEditToken } = await createProject({
      title: `${original.title} (Copy)`,
      ownerSessionId: sessionId,
      pageConfig: original.pageConfig,
      prompt: original.prompt,
      creativeDirection: original.creativeDirection,
      themePreference: original.themePreference,
      motionStyle: original.motionStyle,
    });

    const response = NextResponse.json(
      {
        success: true,
        project: {
          id: (clonedProject._id ? clonedProject._id.toString() : clonedProject.id) || "",
          _id: (clonedProject._id ? clonedProject._id.toString() : clonedProject.id) || "",
          title: clonedProject.title,
          pageConfig: clonedProject.pageConfig,
          status: clonedProject.status,
          visibility: clonedProject.visibility,
          createdAt: clonedProject.createdAt,
          updatedAt: clonedProject.updatedAt,
        },
        editToken: newEditToken,
      },
      { status: 201 }
    );

    return attachSessionCookie(response, sessionId);
  } catch (error) {
    console.error("POST /api/projects/[id]/duplicate error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
