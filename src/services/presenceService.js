import fs from "fs";
import path from "path";
import { connectToDatabase } from "../lib/db/mongodb.js";
import Presence from "../models/Presence.js";
import SiteStats from "../models/SiteStats.js";

// In-memory fallback map for active sessions: sessionId -> lastSeen timestamp
const localSessions = new Map();

// Session timeout for real-time live presence: 60 seconds (client pings every 25s)
const PRESENCE_TIMEOUT_MS = 60 * 1000;

const STATS_FILE = path.join(process.cwd(), ".data", "stats.json");

/**
 * Detect automated bot crawlers and headless browsers.
 * Bots should NOT inflate live user counts or human visit counts.
 */
export function isBot(userAgent) {
  if (!userAgent || typeof userAgent !== "string") return false;
  const ua = userAgent.toLowerCase();
  return (
    ua.includes("bot") ||
    ua.includes("crawler") ||
    ua.includes("spider") ||
    ua.includes("headlesschrome") ||
    ua.includes("lighthouse") ||
    ua.includes("google-inspectiontool") ||
    ua.includes("mediapartners-google") ||
    ua.includes("feedfetcher-google") ||
    ua.includes("facebookexternalhit") ||
    ua.includes("whatsapp") ||
    ua.includes("twitterbot") ||
    ua.includes("telegrambot") ||
    ua.includes("discordbot") ||
    ua.includes("slurp") ||
    ua.includes("duckduckbot") ||
    ua.includes("baiduspider") ||
    ua.includes("yandexbot") ||
    ua.includes("exabot") ||
    ua.includes("sogou") ||
    ua.includes("ia_archiver")
  );
}

function readLocalStats() {
  try {
    if (fs.existsSync(STATS_FILE)) {
      return JSON.parse(fs.readFileSync(STATS_FILE, "utf-8"));
    }
  } catch (e) {
    // ignore
  }
  return { totalVisits: 1960 };
}

function writeLocalStats(data) {
  try {
    const dir = path.dirname(STATS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STATS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    // ignore on read-only serverless filesystems (e.g. Vercel)
  }
}

/**
 * Gets total verified visits count from MongoDB SiteStats (with local fallback).
 */
export async function getTotalVisitsCount() {
  const db = await connectToDatabase();
  if (db) {
    try {
      const stats = await SiteStats.findOne({ key: "global" }).lean();
      if (stats && typeof stats.totalVisits === "number") {
        return stats.totalVisits;
      }
    } catch (e) {
      console.error("Error reading SiteStats from MongoDB:", e.message);
    }
  }

  const stats = readLocalStats();
  return stats.totalVisits || 1960;
}

/**
 * Records a visitor heartbeat.
 * If this is a new session, increments MongoDB SiteStats.totalVisits atomically.
 * Updates Presence.lastSeen for live presence tracking.
 */
export async function recordPresenceHeartbeat(sessionId, { ip = "", userAgent = "" } = {}) {
  if (!sessionId) return false;

  // Filter out automated bots
  if (isBot(userAgent)) {
    return false;
  }

  const now = new Date();
  const db = await connectToDatabase();

  if (db) {
    try {
      // 1. Check if this session is already recorded in MongoDB
      const existing = await Presence.findOne({ sessionId }).lean();

      if (!existing) {
        // New visitor session! Atomically increment totalVisits in MongoDB
        await SiteStats.findOneAndUpdate(
          { key: "global" },
          { $inc: { totalVisits: 1 } },
          { upsert: true, returnDocument: "after" }
        );
      }

      // 2. Update or create presence heartbeat
      await Presence.findOneAndUpdate(
        { sessionId },
        { lastSeen: now, ipHash: ip, userAgent },
        { upsert: true, returnDocument: "after" }
      );

      return true;
    } catch (e) {
      console.error("MongoDB presence heartbeat error:", e.message);
    }
  }

  // Local fallback (offline dev without MongoDB)
  const isNew = !localSessions.has(sessionId);
  if (isNew) {
    const stats = readLocalStats();
    stats.totalVisits = (stats.totalVisits || 1960) + 1;
    writeLocalStats(stats);
  }

  localSessions.set(sessionId, now.getTime());

  // Cleanup old local sessions
  const cutoff = now.getTime() - PRESENCE_TIMEOUT_MS;
  for (const [id, time] of localSessions.entries()) {
    if (time < cutoff) {
      localSessions.delete(id);
    }
  }

  return true;
}

/**
 * Returns accurate count of active human creators online in the last 60 seconds.
 */
export async function getActiveCreatorsCount() {
  const now = Date.now();
  const cutoff = new Date(now - PRESENCE_TIMEOUT_MS);

  const db = await connectToDatabase();
  if (db) {
    try {
      const count = await Presence.countDocuments({
        lastSeen: { $gte: cutoff },
        userAgent: { $not: /bot|crawler|spider|headlesschrome|inspection/i },
      });
      return count;
    } catch (e) {
      console.error("Presence count query error:", e.message);
    }
  }

  // Count from local map
  let activeCount = 0;
  for (const [_, time] of localSessions.entries()) {
    if (time >= now - PRESENCE_TIMEOUT_MS) {
      activeCount++;
    }
  }

  return activeCount;
}
