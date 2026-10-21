import fs from "fs";
import path from "path";
import { connectToDatabase } from "../lib/db/mongodb.js";
import Presence from "../models/Presence.js";

// In-memory fallback map for active sessions: sessionId -> lastSeen timestamp
const localSessions = new Map();

// Session timeout: 5 minutes (300,000 ms)
const PRESENCE_TIMEOUT_MS = 5 * 60 * 1000;

const STATS_FILE = path.join(process.cwd(), ".data", "stats.json");

function readStats() {
  try {
    if (fs.existsSync(STATS_FILE)) {
      return JSON.parse(fs.readFileSync(STATS_FILE, "utf-8"));
    }
  } catch (e) {
    // ignore
  }
  return { totalVisits: 1842 };
}

function writeStats(data) {
  try {
    const dir = path.dirname(STATS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STATS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    // ignore
  }
}

export function getTotalVisitsCount() {
  const stats = readStats();
  return stats.totalVisits || 1842;
}

export async function recordPresenceHeartbeat(sessionId, { ip = "", userAgent = "" } = {}) {
  if (!sessionId) return false;

  const isNew = !localSessions.has(sessionId);
  if (isNew) {
    const stats = readStats();
    stats.totalVisits = (stats.totalVisits || 1842) + 1;
    writeStats(stats);
  }

  const now = new Date();
  localSessions.set(sessionId, now.getTime());

  // Cleanup old local sessions
  const cutoff = now.getTime() - PRESENCE_TIMEOUT_MS;
  for (const [id, time] of localSessions.entries()) {
    if (time < cutoff) {
      localSessions.delete(id);
    }
  }

  const db = await connectToDatabase();
  if (db) {
    try {
      await Presence.findOneAndUpdate(
        { sessionId },
        { lastSeen: now, ipHash: ip, userAgent },
        { upsert: true, returnDocument: "after" }
      );
      return true;
    } catch (e) {
      // Handled via local session tracking
    }
  }

  return true;
}

export async function getActiveCreatorsCount() {
  const now = Date.now();
  const cutoff = new Date(now - PRESENCE_TIMEOUT_MS);

  const db = await connectToDatabase();
  if (db) {
    try {
      const count = await Presence.countDocuments({
        lastSeen: { $gte: cutoff },
      });
      // Always at least 1 (the current viewing user session)
      return Math.max(count, 1);
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

  return Math.max(activeCount, 1);
}
