import fs from "fs";
import path from "path";
import { connectToDatabase } from "../lib/db/mongodb.js";
import ShareLead from "../models/ShareLead.js";

const FALLBACK_LEADS_FILE = path.join(process.cwd(), ".data", "share-leads.json");

function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) return;
  fs.mkdirSync(dirname, { recursive: true });
}

function readFallbackLeads() {
  try {
    if (fs.existsSync(FALLBACK_LEADS_FILE)) {
      const data = fs.readFileSync(FALLBACK_LEADS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading fallback leads:", err.message);
  }
  return [];
}

function writeFallbackLeads(leads) {
  try {
    ensureDirectoryExistence(FALLBACK_LEADS_FILE);
    fs.writeFileSync(FALLBACK_LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing fallback leads:", err.message);
  }
}

/**
 * Record a lead from a user generating a share link.
 */
export async function createShareLead({
  projectId,
  projectTitle = "Landing Page Project",
  name,
  email,
  phone = "",
  purpose = "",
  shareUrl = "",
  shareToken = "",
  ip = "",
  userAgent = "",
}) {
  if (!name || !email) {
    throw new Error("Name and email are required to generate a share link");
  }

  const payload = {
    projectId,
    projectTitle: projectTitle || "Landing Page Project",
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: (phone || "").trim(),
    purpose: (purpose || "").trim(),
    shareUrl,
    shareToken,
    ip,
    userAgent,
    status: "new",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const db = await connectToDatabase();
  if (db) {
    try {
      const lead = await ShareLead.create(payload);
      return lead.toObject();
    } catch (err) {
      console.error("MongoDB ShareLead error, falling back to local file:", err.message);
    }
  }

  // Fallback to local JSON storage
  const leads = readFallbackLeads();
  const id = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const leadWithId = { id, _id: id, ...payload };
  leads.unshift(leadWithId);
  writeFallbackLeads(leads);
  return leadWithId;
}

/**
 * Fetch all share leads for Super Admin.
 */
export async function getAllShareLeads({ search = "", limit = 100, page = 1 } = {}) {
  const db = await connectToDatabase();
  if (db) {
    try {
      const query = {};
      if (search) {
        const regex = new RegExp(search, "i");
        query.$or = [
          { name: regex },
          { email: regex },
          { phone: regex },
          { projectTitle: regex },
          { purpose: regex },
        ];
      }

      const total = await ShareLead.countDocuments(query);
      const leads = await ShareLead.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      return {
        leads: leads.map((l) => ({
          ...l,
          id: l._id.toString(),
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch (err) {
      console.error("MongoDB query leads error:", err.message);
    }
  }

  // Fallback
  let leads = readFallbackLeads();
  if (search) {
    const s = search.toLowerCase();
    leads = leads.filter(
      (l) =>
        (l.name && l.name.toLowerCase().includes(s)) ||
        (l.email && l.email.toLowerCase().includes(s)) ||
        (l.phone && l.phone.toLowerCase().includes(s)) ||
        (l.projectTitle && l.projectTitle.toLowerCase().includes(s)) ||
        (l.purpose && l.purpose.toLowerCase().includes(s))
    );
  }

  const total = leads.length;
  const paginated = leads.slice((page - 1) * limit, page * limit);
  return {
    leads: paginated,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/**
 * Get count and analytics of share leads.
 */
export async function getShareLeadsStats() {
  const db = await connectToDatabase();
  if (db) {
    try {
      const total = await ShareLead.countDocuments();
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const todayCount = await ShareLead.countDocuments({
        createdAt: { $gte: startOfToday },
      });
      return { totalLeads: total, leadsToday: todayCount };
    } catch (e) {
      // ignore
    }
  }

  const leads = readFallbackLeads();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayCount = leads.filter(
    (l) => new Date(l.createdAt) >= startOfToday
  ).length;

  return { totalLeads: leads.length, leadsToday: todayCount };
}

/**
 * Delete a share lead by ID.
 */
export async function deleteShareLead(id) {
  const db = await connectToDatabase();
  if (db) {
    try {
      await ShareLead.findByIdAndDelete(id);
      return true;
    } catch (err) {
      console.error("Error deleting lead from MongoDB:", err.message);
    }
  }

  const leads = readFallbackLeads();
  const filtered = leads.filter((l) => l.id !== id && l._id !== id);
  writeFallbackLeads(filtered);
  return true;
}
