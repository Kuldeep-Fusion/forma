import { NextResponse } from "next/server";
import { getPublicPreviewByToken } from "../../../../services/projectService.js";

export async function GET(request, { params }) {
  try {
    const { token } = params;

    const result = await getPublicPreviewByToken(token);

    if (result.status === "expired") {
      return NextResponse.json(
        {
          error: "Preview expired",
          message: "This shareable preview expired 24 hours after creation.",
          expiredAt: result.expiredAt,
          status: "expired",
        },
        { status: 410 }
      );
    }

    if (result.status === "not_found" || result.status === "invalid") {
      return NextResponse.json(
        {
          error: "Not found",
          message: "This preview link is invalid or no longer exists.",
          status: "not_found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      project: result.project,
      status: "active",
    });
  } catch (error) {
    console.error("GET /api/preview/[token] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
