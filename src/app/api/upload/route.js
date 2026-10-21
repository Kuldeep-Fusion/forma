import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { generateSecureToken } from "../../../lib/security/crypto.js";
import { getOrCreateSessionId, attachSessionCookie } from "../../../lib/security/session.js";
import { connectToDatabase } from "../../../lib/db/mongodb.js";
import Asset from "../../../models/Asset.js";
import fs from "fs";
import path from "path";

// Configure Cloudinary if credentials are present
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request) {
  try {
    const sessionId = await getOrCreateSessionId();
    const formData = await request.formData();
    const file = formData.get("file");
    const projectId = formData.get("projectId") || "";

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided for upload." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${file.type}. Allowed: JPEG, PNG, WEBP, GIF, SVG, MP4.`,
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds the maximum allowed size of 5 MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let mediaUrl = "";
    let publicId = "";
    let provider = "local_persistent";
    let filename = file.name || "media-asset";

    // 1. Try Cloudinary if configured
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "forma_studio",
              resource_type: file.type.startsWith("video") ? "video" : "image",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(buffer);
        });

        mediaUrl = uploadResult.secure_url;
        publicId = uploadResult.public_id;
        provider = "cloudinary";
      } catch (cloudErr) {
        console.warn("Cloudinary upload failed, falling back to local storage:", cloudErr.message);
      }
    }

    // 2. Persistent local storage fallback
    if (!mediaUrl) {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const extension = file.name ? path.extname(file.name).toLowerCase() : ".jpg";
      const safeExtension = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".mp4"].includes(extension)
        ? extension
        : ".png";

      const uniqueFilename = `media_${Date.now()}_${generateSecureToken(8)}${safeExtension}`;
      const destinationPath = path.join(uploadsDir, uniqueFilename);

      fs.writeFileSync(destinationPath, buffer);
      mediaUrl = `/uploads/${uniqueFilename}`;
      filename = uniqueFilename;
      provider = "local_persistent";
    }

    // 3. Persist asset record for media library
    try {
      const db = await connectToDatabase();
      if (db) {
        await Asset.create({
          ownerSessionId: sessionId,
          projectId: projectId || undefined,
          url: mediaUrl,
          publicId,
          filename,
          mimeType: file.type,
          size: file.size,
          provider,
        });
      } else {
        const fallbackFile = path.join(process.cwd(), ".data", "assets.json");
        const dir = path.dirname(fallbackFile);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        let assets = [];
        if (fs.existsSync(fallbackFile)) {
          assets = JSON.parse(fs.readFileSync(fallbackFile, "utf-8") || "[]");
        }
        assets.push({
          id: `ast_${Date.now()}_${generateSecureToken(4)}`,
          ownerSessionId: sessionId,
          projectId: projectId || undefined,
          url: mediaUrl,
          publicId,
          filename,
          mimeType: file.type,
          size: file.size,
          provider,
          createdAt: new Date().toISOString(),
        });
        fs.writeFileSync(fallbackFile, JSON.stringify(assets, null, 2), "utf-8");
      }
    } catch (assetErr) {
      console.warn("Could not save asset record:", assetErr.message);
    }

    const response = NextResponse.json({
      success: true,
      url: mediaUrl,
      publicId,
      filename,
      provider,
      mimeType: file.type,
      size: file.size,
    });

    return attachSessionCookie(response, sessionId);
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process media upload." },
      { status: 500 }
    );
  }
}
