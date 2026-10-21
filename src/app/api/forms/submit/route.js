import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db/mongodb.js";
import Submission from "../../../../models/Submission.js";
import { hashToken } from "../../../../lib/security/crypto.js";

// Rate limiting map: ipHash -> array of timestamps
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_SUBMISSIONS_PER_WINDOW = 10;

// In-memory fallback if database is disconnected
const inMemorySubmissions = [];

function isRateLimited(ipHash) {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ipHash) || [];
  const validTimestamps = timestamps.filter((t) => t > now - RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_SUBMISSIONS_PER_WINDOW) {
    return true;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ipHash, validTimestamps);
  return false;
}

export async function POST(request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const ipHash = hashToken(ip);

    if (isRateLimited(ipHash)) {
      return NextResponse.json(
        { error: "Too many submission attempts. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { projectId, formId = "form-1", _hp_anti_spam } = body;
    let payloadData = body.data || body.formData || body.submission || body.fields;

    if (!payloadData || typeof payloadData !== "object" || Object.keys(payloadData).length === 0) {
      // Check if submission fields were provided at top level
      const { projectId: _p, formId: _f, _hp_anti_spam: _h, ...rest } = body;
      if (Object.keys(rest).length > 0) {
        payloadData = rest;
      }
    }

    // Spam honeypot trap: bots fill invisible fields
    if (_hp_anti_spam) {
      console.warn("Spam honeypot triggered by IP:", ip);
      return NextResponse.json(
        { error: "Submission could not be validated." },
        { status: 400 }
      );
    }

    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json(
        { error: "Missing required projectId identifier." },
        { status: 400 }
      );
    }

    if (!payloadData || typeof payloadData !== "object" || Object.keys(payloadData).length === 0) {
      return NextResponse.json(
        { error: "Form submission contains no data." },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get("user-agent") || "";
    let submissionRecordId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    try {
      await connectDB();
      const submission = await Submission.create({
        projectId,
        formId,
        data: payloadData,
        ipHash,
        userAgent,
        status: "received",
      });
      submissionRecordId = submission._id.toString();
    } catch (dbErr) {
      console.warn("MongoDB write fallback to memory for submission:", dbErr.message);
      inMemorySubmissions.push({
        id: submissionRecordId,
        projectId,
        formId,
        data: payloadData,
        ipHash,
        userAgent,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Thank you. Your request has been received.",
        submissionId: submissionRecordId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Form submission error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred while processing your submission." },
      { status: 500 }
    );
  }
}
