import { NextResponse } from "next/server";
import { getEligibleCommunityProjects } from "../../../services/projectService.js";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await getEligibleCommunityProjects(8);
    return NextResponse.json({
      success: true,
      projects,
      creations: projects,
      total: projects.length,
    });
  } catch (error) {
    console.error("GET /api/community error:", error);
    return NextResponse.json({ success: true, projects: [], creations: [], total: 0 }, { status: 200 });
  }
}
