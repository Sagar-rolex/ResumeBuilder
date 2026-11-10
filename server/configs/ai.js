import OpenAI from "openai";

const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
const baseURL =
  process.env.GEMINI_BASE_URL ||
  process.env.OPENAI_BASE_URL ||
  "https://generativelanguage.googleapis.com/v1beta/openai/";

export const aiModel = process.env.GEMINI_MODEL || process.env.OPENAI_MODEL;
export const aiProvider = "Google Gemini";
const endpointInfo = (() => {
  try {
    const parsed = new URL(baseURL);
    return { safeEndpoint: `${parsed.origin}${parsed.pathname}`, valid: ["https:", "http:"].includes(parsed.protocol), host: parsed.hostname };
  } catch {
    return { safeEndpoint: "invalid endpoint URL", valid: false, host: "" };
  }
})();
const isLegacyStandardGeminiKey = Boolean(apiKey && endpointInfo.host === "generativelanguage.googleapis.com" && apiKey.startsWith("AIza"));

export const aiConfigStatus = () => ({
  configured: Boolean(apiKey && aiModel && endpointInfo.valid && !isLegacyStandardGeminiKey),
  apiKeyPresent: Boolean(apiKey),
  model: aiModel || null,
  endpoint: endpointInfo.safeEndpoint,
  apiKeyVariable: process.env.GEMINI_API_KEY ? "GEMINI_API_KEY" : process.env.OPENAI_API_KEY ? "OPENAI_API_KEY" : null,
  configurationCode: isLegacyStandardGeminiKey ? "AI_LEGACY_KEY" : !endpointInfo.valid ? "AI_INVALID_ENDPOINT" : !apiKey || !aiModel ? "AI_NOT_CONFIGURED" : null,
});

let client;
const getAiClient = () => {
  const status = aiConfigStatus();
  if (!status.configured) {
    const error = new Error(
      status.configurationCode === "AI_LEGACY_KEY"
        ? "Gemini Standard API keys are no longer accepted. Create an authorization key in Google AI Studio and set GEMINI_API_KEY on the backend."
        : status.configurationCode === "AI_INVALID_ENDPOINT"
          ? "The configured Gemini API endpoint must be a valid HTTP(S) URL."
          : "Set GEMINI_API_KEY and GEMINI_MODEL in the backend environment.",
    );
    error.code = status.configurationCode;
    error.status = 503;
    throw error;
  }
  if (!client) {
    // Gemini's daily quota and rate-limit responses cannot be remedied by a
    // blind retry. Keep a single user request from generating duplicate calls.
    client = new OpenAI({ apiKey, baseURL, timeout: 30_000, maxRetries: 0 });
  }
  return client;
};

// Keep one shared OpenAI-compatible Gemini client for every AI feature, initialized lazily
// so a missing key produces a useful API configuration response instead of a startup crash.
const ai = {
  chat: {
    completions: {
      create: (...args) => getAiClient().chat.completions.create(...args),
    },
  },
};

export default ai;
