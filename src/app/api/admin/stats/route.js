import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "../../../../lib/security/adminAuth.js";
import { getActiveCreatorsCount, getTotalVisitsCount } from "../../../../services/presenceService.js";
import { getTotalProjectsCount, getCreatedTodayCount } from "../../../../services/projectService.js";
import { getShareLeadsStats } from "../../../../services/shareLeadService.js";
import { connectToDatabase } from "../../../../lib/db/mongodb.js";
import Presence from "../../../../models/Presence.js";

export const dynamic = "force-dynamic";

export async function GET(request) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [onlineNow, totalBuilds, totalVisits, createdToday, shareLeadsStats] =
      await Promise.all([
        getActiveCreatorsCount(),
        getTotalProjectsCount(),
        getTotalVisitsCount(),
        getCreatedTodayCount(),
        getShareLeadsStats(),
      ]);

    // Fetch recent active presence records (last 10 minutes)
    let activeSessions = [];
    const db = await connectToDatabase();
    if (db) {
      try {
        const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
        const presences = await Presence.find({ lastSeen: { $gte: tenMinsAgo } })
          .sort({ lastSeen: -1 })
          .limit(20)
          .lean();

        activeSessions = presences.map((p) => ({
          sessionId: p.sessionId,
          lastSeen: p.lastSeen,
          ip: p.ipHash || "127.0.0.1",
          userAgent: p.userAgent || "Browser",
        }));
      } catch (err) {
        console.error("Error fetching presence sessions for admin:", err.message);
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        onlineNow,
        totalBuilds,
        totalVisits,
        createdToday,
        totalLeads: shareLeadsStats.totalLeads,
        leadsToday: shareLeadsStats.leadsToday,
      },
      activeSessions,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("GET /api/admin/stats error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
