import { NextResponse } from "next/server";
import { getOrCreateSessionId, attachSessionCookie } from "../../../lib/security/session.js";
import { connectToDatabase } from "../../../lib/db/mongodb.js";
import Asset from "../../../models/Asset.js";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const sessionId = await getOrCreateSessionId();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const db = await connectToDatabase();
    let assets = [];

    if (db) {
      const query = { ownerSessionId: sessionId };
      if (projectId) {
        query.$or = [{ projectId }, { projectId: { $exists: false } }, { projectId: null }];
      }
      assets = await Asset.find(query).sort({ createdAt: -1 }).limit(50).lean();
    } else {
      const fallbackFile = path.join(process.cwd(), ".data", "assets.json");
      if (fs.existsSync(fallbackFile)) {
        const data = JSON.parse(fs.readFileSync(fallbackFile, "utf-8") || "[]");
        assets = data.filter((a) => a.ownerSessionId === sessionId);
      }
    }

    const sanitized = assets.map((a) => ({
      id: a._id ? a._id.toString() : a.id,
      url: a.url,
      publicId: a.publicId,
      filename: a.filename,
      mimeType: a.mimeType,
      size: a.size,
      provider: a.provider,
      createdAt: a.createdAt,
    }));

    const response = NextResponse.json({
      success: true,
      assets: sanitized,
      total: sanitized.length,
    });

    return attachSessionCookie(response, sessionId);
  } catch (error) {
    console.error("GET /api/assets error:", error);
    return NextResponse.json({ success: true, assets: [], total: 0 }, { status: 200 });
  }
}

export async function DELETE(request) {
  try {
    const sessionId = await getOrCreateSessionId();
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get("id");

    if (!assetId) {
      return NextResponse.json({ error: "Asset ID is required." }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (db) {
      await Asset.deleteOne({ _id: assetId, ownerSessionId: sessionId });
    } else {
      const fallbackFile = path.join(process.cwd(), ".data", "assets.json");
      if (fs.existsSync(fallbackFile)) {
        let data = JSON.parse(fs.readFileSync(fallbackFile, "utf-8") || "[]");
        data = data.filter((a) => a.id !== assetId && a._id !== assetId);
        fs.writeFileSync(fallbackFile, JSON.stringify(data, null, 2), "utf-8");
      }
    }

    const response = NextResponse.json({ success: true, message: "Asset deleted" });
    return attachSessionCookie(response, sessionId);
  } catch (error) {
    console.error("DELETE /api/assets error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
