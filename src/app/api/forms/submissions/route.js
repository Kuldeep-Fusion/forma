import { NextResponse } from "next/server";
import { getOrCreateSessionId, attachSessionCookie } from "../../../../lib/security/session.js";
import { connectToDatabase } from "../../../../lib/db/mongodb.js";
import { getProjectById } from "../../../../services/projectService.js";
import Submission from "../../../../models/Submission.js";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const sessionId = await getOrCreateSessionId();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const editToken = request.headers.get("x-edit-token");

    if (!projectId) {
      return NextResponse.json({ error: "Missing required projectId parameter" }, { status: 400 });
    }

    // Verify ownership or edit credentials
    const project = await getProjectById(projectId, {
      ownerSessionId: sessionId,
      editToken,
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!project.canEdit) {
      return NextResponse.json({ error: "Unauthorized to view project submissions" }, { status: 403 });
    }

    let submissions = [];
    const db = await connectToDatabase();
    if (db) {
      submissions = await Submission.find({ projectId })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();
    }

    const sanitized = submissions.map((s) => ({
      id: s._id ? s._id.toString() : s.id,
      formId: s.formId,
      data: s.data,
      status: s.status,
      createdAt: s.createdAt,
    }));

    const response = NextResponse.json({
      success: true,
      submissions: sanitized,
      total: sanitized.length,
      projectTitle: project.title,
    });

    return attachSessionCookie(response, sessionId);
  } catch (error) {
    console.error("GET /api/forms/submissions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const sessionId = await getOrCreateSessionId();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const projectId = searchParams.get("projectId");
    const editToken = request.headers.get("x-edit-token");

    if (!id || !projectId) {
      return NextResponse.json({ error: "Missing required id or projectId" }, { status: 400 });
    }

    const project = await getProjectById(projectId, {
      ownerSessionId: sessionId,
      editToken,
    });

    if (!project || !project.canEdit) {
      return NextResponse.json({ error: "Unauthorized to delete submission" }, { status: 403 });
    }

    const db = await connectToDatabase();
    if (db) {
      await Submission.deleteOne({ _id: id, projectId });
    }

    const response = NextResponse.json({ success: true, message: "Submission removed" });
    return attachSessionCookie(response, sessionId);
  } catch (error) {
    console.error("DELETE /api/forms/submissions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
