import { NextResponse } from "next/server";
import { generateLandingPageWithGemini } from "../../../lib/ai/gemini.js";
import { generateMockLandingPage } from "../../../lib/ai/mockGenerator.js";
import { createProject } from "../../../services/projectService.js";
import { getOrCreateSessionId, attachSessionCookie } from "../../../lib/security/session.js";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// In-memory rate limiting map: sessionId -> [timestamps]
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 10;

function isRateLimited(sessionId) {
  const now = Date.now();
  const timestamps = rateLimitMap.get(sessionId) || [];
  const validTimestamps = timestamps.filter((t) => t > now - RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    return true;
  }

  validTimestamps.push(now);
  rateLimitMap.set(sessionId, validTimestamps);
  return false;
}

export async function POST(request) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const startTime = Date.now();

  try {
    const sessionId = await getOrCreateSessionId();

    const body = await request.json().catch(() => ({}));
    const {
      prompt,
      direction = "auto",
      themePreference = "auto",
      motionStyle = "auto",
      referenceImages = [],
      referenceUrls = [],
      mode = "gemini", // "gemini" | "test_fixture"
    } = body;

    console.log(
      `[FORMA_DIAGNOSTICS] [${requestId}] [REQUEST_RECEIVED] Prompt length: ${prompt?.length || 0}, Direction: ${direction}, Theme: ${themePreference}, Motion: ${motionStyle}, Refs: ${referenceImages?.length || 0}, Mode: ${mode}`
    );

    // 1. Rate limiting
    if (isRateLimited(sessionId)) {
      console.warn(`[FORMA_DIAGNOSTICS] [${requestId}] [RATE_LIMITED] Session: ${sessionId}`);
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please wait a minute before generating another landing page.",
          requestId,
        },
        { status: 429 }
      );
    }

    // 2. Validate user prompt
    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
      console.warn(`[FORMA_DIAGNOSTICS] [${requestId}] [INVALID_PROMPT] Prompt too short or missing`);
      return NextResponse.json(
        {
          error: "A descriptive prompt of at least 3 characters is required to generate a landing page.",
          requestId,
        },
        { status: 400 }
      );
    }

    // 3. Verify server-side Gemini configuration
    const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);

    // Automated test fixtures (strictly isolated from normal user generation)
    if (mode === "test_fixture" && process.env.NODE_ENV !== "production") {
      console.log(`[FORMA_DIAGNOSTICS] [${requestId}] [TEST_FIXTURE_MODE] Using test fixture generator`);
      const pageConfig = generateMockLandingPage({
        prompt: prompt.trim(),
        direction,
        themePreference,
        motionStyle,
      });

      const { project, editToken } = await createProject({
        title: pageConfig.metadata.title,
        ownerSessionId: sessionId,
        pageConfig,
        prompt: prompt.trim(),
        creativeDirection: direction,
        themePreference,
        motionStyle,
      });

      const response = NextResponse.json(
        {
          success: true,
          project,
          editToken,
          provider: "test_fixture",
          requestId,
          notice: "Generated using automated test fixture.",
        },
        { status: 201 }
      );
      return attachSessionCookie(response, sessionId);
    }

    if (!hasGeminiKey) {
      console.error(
        `[FORMA_DIAGNOSTICS] [${requestId}] [MISSING_API_KEY] GEMINI_API_KEY is not configured in environment`
      );
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY in your .env or .env.local file to enable AI landing page generation.",
          code: "MISSING_GEMINI_API_KEY",
          requestId,
          retryable: false,
        },
        { status: 503 }
      );
    }

    // 4. Real Gemini AI Generation
    let pageConfig = null;
    try {
      console.log(`[FORMA_DIAGNOSTICS] [${requestId}] [GENERATION_START] Initiating Gemini pipeline...`);
      pageConfig = await generateLandingPageWithGemini({
        prompt: prompt.trim(),
        direction,
        themePreference,
        motionStyle,
        referenceImages,
        referenceUrls,
        requestId,
      });
    } catch (geminiError) {
      const durationMs = Date.now() - startTime;
      const errMsg = geminiError.message || "";
      console.error(
        `[FORMA_DIAGNOSTICS] [${requestId}] [GENERATION_FAILED] Duration: ${durationMs}ms, Error: ${errMsg}`
      );

      let statusCode = 502;
      let userError = "AI landing page generation failed. Please try again.";

      if (errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("ResourceExhausted")) {
        statusCode = 429;
        userError =
          "Gemini API rate limit or daily quota exceeded. Please wait a moment and retry, or configure an active API key.";
      } else if (
        errMsg.includes("503") ||
        errMsg.includes("high demand") ||
        errMsg.includes("unavailable")
      ) {
        statusCode = 503;
        userError =
          "The AI model is currently experiencing high demand. Please try again in a few moments.";
      } else if (
        errMsg.includes("schema") ||
        errMsg.includes("contract") ||
        errMsg.includes("malformed JSON")
      ) {
        statusCode = 422;
        userError =
          "The AI model produced an output that did not conform to the landing page contract. Please retry your generation.";
      } else if (errMsg.includes("GEMINI_API_KEY")) {
        statusCode = 503;
        userError = errMsg;
      }

      // NO silent dummy/mock fallback: return genuine error to client
      return NextResponse.json(
        {
          error: userError,
          details: errMsg,
          requestId,
          retryable: true,
        },
        { status: statusCode }
      );
    }

    // 5. Persist as a new project
    let project = null;
    let editToken = null;
    try {
      console.log(`[FORMA_DIAGNOSTICS] [${requestId}] [PROJECT_PERSISTENCE_STARTED]`);
      const created = await createProject({
        title: pageConfig.metadata.title,
        ownerSessionId: sessionId,
        pageConfig,
        prompt: prompt.trim(),
        creativeDirection: pageConfig.metadata.creativeDirection || "editorial",
        themePreference: pageConfig.theme?.name || themePreference,
        motionStyle: pageConfig.motion?.preset || "cinematic",
      });
      project = created.project;
      editToken = created.editToken;
      console.log(
        `[FORMA_DIAGNOSTICS] [${requestId}] [PROJECT_PERSISTENCE_SUCCEEDED] Project ID: ${
          project._id || project.id
        }`
      );
    } catch (persistErr) {
      console.error(
        `[FORMA_DIAGNOSTICS] [${requestId}] [PROJECT_PERSISTENCE_FAILED] Error: ${persistErr.message}`
      );
      return NextResponse.json(
        {
          error: `Failed to save generated project: ${persistErr.message}. The project could not be saved to the database.`,
          requestId,
          retryable: true,
        },
        { status: 500 }
      );
    }

    // 6. Return successful AI generation
    const totalDurationMs = Date.now() - startTime;
    console.log(
      `[FORMA_DIAGNOSTICS] [${requestId}] [PAGE_CONFIG_RETURNED] Title: "${pageConfig.metadata.title}", Sections: ${
        pageConfig.sections.length
      }, Total Duration: ${totalDurationMs}ms`
    );

    const response = NextResponse.json(
      {
        success: true,
        project,
        editToken,
        provider: "gemini",
        requestId,
        diagnostics: {
          durationMs: totalDurationMs,
          sectionsCount: pageConfig.sections.length,
          sectionTypes: pageConfig.sections.map((s) => s.type),
        },
      },
      { status: 201 }
    );

    return attachSessionCookie(response, sessionId);
  } catch (error) {
    console.error(`[FORMA_DIAGNOSTICS] [${requestId}] [UNEXPECTED_ERROR]`, error);
    return NextResponse.json(
      {
        error: error.message || "An unexpected error occurred during generation.",
        requestId,
        retryable: true,
      },
      { status: 500 }
    );
  }
}
