import { NextResponse } from "next/server";
import { getProjectById, updateProject } from "../../../../services/projectService.js";
import { getOrCreateSessionId, attachSessionCookie } from "../../../../lib/security/session.js";
import { connectToDatabase } from "../../../../lib/db/mongodb.js";
import Project from "../../../../models/Project.js";
import fs from "fs";
import path from "path";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const sessionId = await getOrCreateSessionId();
    const editToken = request.headers.get("x-edit-token");

    const project = await getProjectById(id, {
      ownerSessionId: sessionId,
      editToken,
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const response = NextResponse.json({
      success: true,
      project: {
        id: (project._id ? project._id.toString() : project.id) || "",
        _id: (project._id ? project._id.toString() : project.id) || "",
        title: project.title,
        pageConfig: project.pageConfig,
        status: project.status,
        visibility: project.visibility,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        shareExpiresAt: project.shareExpiresAt,
        canEdit: project.canEdit,
      },
    });

    return attachSessionCookie(response, sessionId);
  } catch (error) {
    console.error("GET /api/projects/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const sessionId = await getOrCreateSessionId();
    const editToken = request.headers.get("x-edit-token");
    const body = await request.json();

    const updated = await updateProject(id, body, {
      ownerSessionId: sessionId,
      editToken,
    });

    const response = NextResponse.json({
      success: true,
      project: {
        id: (updated._id ? updated._id.toString() : updated.id) || "",
        _id: (updated._id ? updated._id.toString() : updated.id) || "",
        title: updated.title,
        pageConfig: updated.pageConfig,
        status: updated.status,
        visibility: updated.visibility,
        updatedAt: updated.updatedAt,
        shareExpiresAt: updated.shareExpiresAt,
      },
    });

    return attachSessionCookie(response, sessionId);
  } catch (error) {
    console.error("PUT /api/projects/[id] error:", error);
    const status = error.message.includes("Unauthorized") ? 403 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const sessionId = await getOrCreateSessionId();
    const editToken = request.headers.get("x-edit-token");

    const project = await getProjectById(id, { ownerSessionId: sessionId, editToken });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!project.canEdit) {
      return NextResponse.json({ error: "Unauthorized to delete project" }, { status: 403 });
    }

    const db = await connectToDatabase();
    if (db) {
      await Project.findByIdAndDelete(id);
    } else {
      const fallbackFile = path.join(process.cwd(), ".data", "projects.json");
      if (fs.existsSync(fallbackFile)) {
        const data = JSON.parse(fs.readFileSync(fallbackFile, "utf-8"));
        const filtered = data.filter((p) => p._id !== id && p.id !== id);
        fs.writeFileSync(fallbackFile, JSON.stringify(filtered, null, 2), "utf-8");
      }
    }

    return NextResponse.json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/projects/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
