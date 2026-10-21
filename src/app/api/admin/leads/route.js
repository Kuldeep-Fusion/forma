import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "../../../../lib/security/adminAuth.js";
import { getAllShareLeads, deleteShareLead } from "../../../../services/shareLeadService.js";

export const dynamic = "force-dynamic";

export async function GET(request) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const result = await getAllShareLeads({ search, page, limit });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error("GET /api/admin/leads error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
    }

    await deleteShareLead(id);

    return NextResponse.json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (err) {
    console.error("DELETE /api/admin/leads error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
