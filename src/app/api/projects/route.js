import { NextResponse } from "next/server";
import { createProject } from "../../../services/projectService.js";
import { getOrCreateSessionId, attachSessionCookie } from "../../../lib/security/session.js";
import { connectToDatabase } from "../../../lib/db/mongodb.js";
import Project from "../../../models/Project.js";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const sessionId = await getOrCreateSessionId();
    const db = await connectToDatabase();
    let projects = [];

    if (db) {
      projects = await Project.find({ ownerSessionId: sessionId })
        .sort({ updatedAt: -1 })
        .lean();
      if (projects.length === 0 && process.env.NODE_ENV !== "production") {
        projects = await Project.find({}).sort({ updatedAt: -1 }).lean();
      }
    } else {
      const fallbackFile = path.join(process.cwd(), ".data", "projects.json");
      if (fs.existsSync(fallbackFile)) {
        const data = JSON.parse(fs.readFileSync(fallbackFile, "utf-8"));
        projects = data.filter((p) => p.ownerSessionId === sessionId);
        if (projects.length === 0 && process.env.NODE_ENV !== "production") {
          projects = data;
        }
      }
    }

    const sanitized = projects.map((p) => ({
      id: p._id || p.id,
      title: p.title,
      status: p.status,
      visibility: p.visibility,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      shareExpiresAt: p.shareExpiresAt,
      metadata: p.pageConfig?.metadata,
    }));

    const response = NextResponse.json({ success: true, projects: sanitized });
    return attachSessionCookie(response, sessionId);
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const sessionId = await getOrCreateSessionId();
    const body = await request.json();
    const { title, pageConfig, prompt, creativeDirection, themePreference, motionStyle } = body;

    if (!pageConfig) {
      return NextResponse.json({ error: "pageConfig is required." }, { status: 400 });
    }

    const { project, editToken } = await createProject({
      title,
      ownerSessionId: sessionId,
      pageConfig,
      prompt,
      creativeDirection,
      themePreference,
      motionStyle,
    });

    const response = NextResponse.json(
      { success: true, project, editToken },
      { status: 201 }
    );
    return attachSessionCookie(response, sessionId);
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
