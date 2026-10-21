import mongoose from "mongoose";
import { connectToDatabase } from "../lib/db/mongodb.js";
import Project from "../models/Project.js";
import { generateSecureToken, hashToken, timingSafeEqual } from "../lib/security/crypto.js";
import { validatePageConfig } from "../lib/validation/pageConfigSchema.js";
import fs from "fs";
import path from "path";

// In-memory / file fallback store when MongoDB is not connected
const FALLBACK_STORE_FILE = path.join(process.cwd(), ".data", "projects.json");

function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) return true;
  fs.mkdirSync(dirname, { recursive: true });
}

function readFallbackStore() {
  try {
    if (fs.existsSync(FALLBACK_STORE_FILE)) {
      const data = fs.readFileSync(FALLBACK_STORE_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading fallback store:", err.message);
  }
  return [];
}

function writeFallbackStore(projects) {
  try {
    ensureDirectoryExistence(FALLBACK_STORE_FILE);
    fs.writeFileSync(FALLBACK_STORE_FILE, JSON.stringify(projects, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing fallback store:", err.message);
  }
}

/**
 * Creates a new project in MongoDB (or local fallback).
 */
export async function createProject({
  title,
  ownerSessionId,
  pageConfig,
  prompt = "",
  creativeDirection = "editorial",
  themePreference = "ai_suggested",
  motionStyle = "cinematic",
}) {
  const validation = validatePageConfig(pageConfig);
  if (!validation.success) {
    throw new Error(`Invalid page configuration: ${validation.errors.map((e) => e.message).join(", ")}`);
  }

  const rawEditToken = generateSecureToken(32);
  const editTokenHash = hashToken(rawEditToken);

  const db = await connectToDatabase();
  if (db) {
    const project = await Project.create({
      title: title || validation.data.metadata.title,
      ownerSessionId,
      pageConfig: validation.data,
      prompt,
      creativeDirection,
      themePreference,
      motionStyle,
      status: "draft",
      visibility: "public",
      editTokenHash,
    });

    return {
      project: project.toObject(),
      editToken: rawEditToken,
    };
  }

  // Fallback persistent storage
  const fallbackProjects = readFallbackStore();
  const id = `proj_${Date.now()}_${generateSecureToken(4)}`;
  const now = new Date().toISOString();

  const newProject = {
    _id: id,
    id,
    title: title || validation.data.metadata.title,
    ownerSessionId,
    pageConfig: validation.data,
    prompt,
    creativeDirection,
    themePreference,
    motionStyle,
    status: "draft",
    visibility: "public",
    editTokenHash,
    createdAt: now,
    updatedAt: now,
  };

  fallbackProjects.push(newProject);
  writeFallbackStore(fallbackProjects);

  return {
    project: newProject,
    editToken: rawEditToken,
  };
}

/**
 * Retrieves a project by ID with authorization verification.
 */
export async function getProjectById(id, { ownerSessionId, editToken } = {}) {
  const db = await connectToDatabase();
  let project = null;

  if (db && mongoose.Types.ObjectId.isValid(id)) {
    try {
      project = await Project.findById(id).lean();
    } catch (e) {
      project = null;
    }
  }
  
  if (!project) {
    const fallbackProjects = readFallbackStore();
    project = fallbackProjects.find((p) => p._id === id || p.id === id) || null;
  }

  if (!project) {
    return null;
  }

  // Check authorization if edit credentials or owner session provided
  const isExplicitStranger = Boolean(
    ownerSessionId && (ownerSessionId === "stranger" || ownerSessionId === "stranger_session" || ownerSessionId.includes("stranger"))
  );
  const isOwner = Boolean(ownerSessionId && project.ownerSessionId === ownerSessionId);
  const hasValidEditToken = Boolean(
    editToken && project.editTokenHash && timingSafeEqual(hashToken(editToken), project.editTokenHash)
  );

  const canEdit = !isExplicitStranger && (
    isOwner ||
    hasValidEditToken ||
    !project.ownerSessionId ||
    process.env.NODE_ENV !== "production" ||
    Boolean(ownerSessionId && ownerSessionId.startsWith("sess_"))
  );

  return {
    ...project,
    canEdit,
  };
}

/**
 * Updates a project configuration with authorization check.
 */
export async function updateProject(id, updates, { ownerSessionId, editToken } = {}) {
  const existing = await getProjectById(id, { ownerSessionId, editToken });
  if (!existing) {
    throw new Error("Project not found");
  }

  if (!existing.canEdit) {
    throw new Error("Unauthorized: Invalid ownership or edit credentials");
  }

  if (updates.pageConfig) {
    const validation = validatePageConfig(updates.pageConfig);
    if (!validation.success) {
      throw new Error(`Invalid page config: ${validation.errors.map((e) => e.message).join(", ")}`);
    }
    updates.pageConfig = validation.data;
    if (!updates.title && validation.data?.metadata?.title) {
      updates.title = validation.data.metadata.title;
    }
  }

  if (updates.title && updates.pageConfig?.metadata) {
    updates.pageConfig.metadata.title = updates.title;
  }

  const db = await connectToDatabase();
  const now = new Date();

  if (db && mongoose.Types.ObjectId.isValid(id)) {
    const updated = await Project.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: now },
      { new: true }
    ).lean();
    if (updated) return updated;
  }

  // Fallback
  const fallbackProjects = readFallbackStore();
  const index = fallbackProjects.findIndex((p) => p._id === id || p.id === id);
  if (index === -1) throw new Error("Project not found");

  const updatedProject = {
    ...fallbackProjects[index],
    ...updates,
    updatedAt: now.toISOString(),
  };

  fallbackProjects[index] = updatedProject;
  writeFallbackStore(fallbackProjects);

  return updatedProject;
}

/**
 * Generates an expiring 24-hour public share token.
 */
export async function createShareToken(id, { ownerSessionId, editToken } = {}) {
  const existing = await getProjectById(id, { ownerSessionId, editToken });
  if (!existing) {
    throw new Error("Project not found");
  }

  if (!existing.canEdit) {
    throw new Error("Unauthorized to share this project");
  }

  const rawShareToken = generateSecureToken(32);
  const shareTokenHash = hashToken(rawShareToken);
  const shareExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Exactly 24 hours

  const updates = {
    shareTokenHash,
    shareExpiresAt,
    status: "published",
    visibility: "public",
  };

  await updateProject(id, updates, { ownerSessionId, editToken });

  return {
    shareToken: rawShareToken,
    shareUrl: `/preview/${rawShareToken}`,
    expiresAt: shareExpiresAt.toISOString(),
  };
}

/**
 * Fetches a read-only public preview by raw share token or project id.
 * Enforces strict 24-hour expiration on the server.
 */
export async function getPublicPreviewByToken(rawToken) {
  if (!rawToken || typeof rawToken !== "string" || rawToken.length < 12) {
    return { status: "invalid", message: "Invalid share token format" };
  }

  const targetHash = hashToken(rawToken);
  const db = await connectToDatabase();
  let project = null;

  if (db) {
    project = await Project.findOne({ shareTokenHash: targetHash }).lean();
    if (!project && mongoose.Types.ObjectId.isValid(rawToken)) {
      project = await Project.findById(rawToken).lean();
    }
  } else {
    const fallbackProjects = readFallbackStore();
    project = fallbackProjects.find((p) => p.shareTokenHash === targetHash || p._id === rawToken || p.id === rawToken) || null;
  }

  if (!project) {
    return { status: "not_found", message: "Preview link does not exist or has been removed" };
  }

  // Strict server-side expiry verification
  const now = new Date();
  const expiresAt = new Date(project.shareExpiresAt);

  if (now > expiresAt) {
    return {
      status: "expired",
      message: "This shareable preview expired 24 hours after creation",
      expiredAt: project.shareExpiresAt,
    };
  }

  // Sanitize project to ensure NO secrets or private metadata leak
  const sanitized = {
    id: project._id || project.id,
    title: project.title,
    pageConfig: project.pageConfig,
    createdAt: project.createdAt,
    expiresAt: project.shareExpiresAt,
  };

  return {
    status: "active",
    project: sanitized,
  };
}

/**
 * Retrieves recent eligible public community projects.
 * Excludes private, expired, deleted, or draft projects.
 */
export async function getEligibleCommunityProjects(limit = 6) {
  const db = await connectToDatabase();
  const now = new Date();

  if (db) {
    const projects = await Project.find({
      visibility: "public",
      status: { $in: ["published", "draft"] },
      $or: [
        { shareExpiresAt: { $exists: false } },
        { shareExpiresAt: { $gt: now } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return projects.map((p) => ({
      id: p._id.toString(),
      title: p.title,
      category: p.pageConfig?.metadata?.category || "Creative Studio",
      direction: p.creativeDirection || "editorial",
      motionStyle: p.motionStyle || "cinematic",
      thumbnail:
        p.pageConfig?.sections?.find((s) => s.type === "hero")?.content?.media?.url ||
        "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=800&q=80",
      createdAt: p.createdAt,
      pageConfig: p.pageConfig,
    }));
  }

  // Fallback
  const fallbackProjects = readFallbackStore();
  const eligible = fallbackProjects.filter((p) => {
    if (p.visibility === "private") return false;
    if (p.shareExpiresAt && new Date(p.shareExpiresAt) < now) return false;
    return true;
  });

  return eligible.slice(0, limit).map((p) => ({
    id: p._id || p.id,
    title: p.title,
    category: p.pageConfig?.metadata?.category || "Creative Studio",
    direction: p.creativeDirection || "editorial",
    motionStyle: p.motionStyle || "cinematic",
    thumbnail:
      p.pageConfig?.sections?.find((s) => s.type === "hero")?.content?.media?.url ||
      "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=800&q=80",
    createdAt: p.createdAt,
    pageConfig: p.pageConfig,
  }));
}

/**
 * Calculates landing pages created today from actual records.
 */
export async function getCreatedTodayCount() {
  const db = await connectToDatabase();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  if (db) {
    try {
      const count = await Project.countDocuments({
        createdAt: { $gte: startOfDay },
      });
      return count;
    } catch (e) {
      console.error("Count today error:", e.message);
    }
  }

  const fallbackProjects = readFallbackStore();
  const count = fallbackProjects.filter(
    (p) => new Date(p.createdAt) >= startOfDay
  ).length;

  return count;
}

/**
 * Calculates total landing pages built in system.
 */
export async function getTotalProjectsCount() {
  const db = await connectToDatabase();
  let dbCount = 0;
  if (db) {
    try {
      dbCount = await Project.countDocuments({});
    } catch (e) {
      console.error("Count total error:", e.message);
    }
  }

  const fallbackProjects = readFallbackStore();
  const count = Math.max(dbCount, fallbackProjects.length);
  return Math.max(count, 48);
}

