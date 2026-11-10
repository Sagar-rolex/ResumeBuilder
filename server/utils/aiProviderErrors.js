const getProviderStatus = (error) => Number(error?.status || error?.statusCode || 0);

const getProviderCode = (error) =>
  String(error?.code || error?.error?.code || error?.response?.data?.error?.status || "")
    .toLowerCase();

const getProviderMessage = (error) =>
  String(error?.error?.message || error?.response?.data?.error?.message || error?.response?.data?.message || error?.message || "");

const getSafeCauseChain = (error) => {
  const causes = [];
  let cause = error?.cause;
  while (cause && causes.length < 3) {
    causes.push({
      name: cause.name || undefined,
      code: cause.code || undefined,
      message: String(cause.message || "")
        .slice(0, 500)
        .replace(/AIza[0-9A-Za-z_-]{20,}/g, "[REDACTED_KEY]")
        .replace(/AQ\.?[A-Za-z0-9_-]{20,}/g, "[REDACTED_KEY]")
        .replace(/Bearer\s+\S+/gi, "Bearer [REDACTED]")
        .replace(/key[=: ]+[^\s,;]+/gi, "key=[REDACTED]"),
    });
    cause = cause.cause;
  }
  return causes;
};

export const getAiProviderFailure = (error) => {
  const status = getProviderStatus(error);
  const code = getProviderCode(error);
  const details = `${code} ${getProviderMessage(error)}`.toLowerCase();

  if (code === "ai_legacy_key") {
    return {
      status: 503,
      code: "AI_LEGACY_KEY",
      message: "The configured Gemini key is a retired Standard key. Create an authorization key in Google AI Studio and set it as GEMINI_API_KEY on the backend.",
    };
  }
  if (code === "ai_invalid_endpoint") {
    return {
      status: 503,
      code: "AI_INVALID_ENDPOINT",
      message: "The configured Gemini API endpoint is invalid. Check GEMINI_BASE_URL on the backend.",
    };
  }

  if (!(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY) || !(process.env.GEMINI_MODEL || process.env.OPENAI_MODEL)) {
    return {
      status: 503,
      code: "AI_NOT_CONFIGURED",
      message: "AI service is not configured. Set GEMINI_API_KEY and GEMINI_MODEL on the backend.",
    };
  }

  if (/authentication|unauthenticated|api[_ ]key.{0,20}(invalid|not valid|expired|missing)|invalid.{0,20}api[_ ]key/.test(details) || status === 401) {
    return {
      status: 502,
      code: "AI_PROVIDER_AUTH_FAILED",
      message: "The AI provider rejected the configured API key. Check the backend key and its service access.",
    };
  }

  if (/permission_denied|permission denied|access denied|service.?blocked|forbidden/.test(details) || status === 403) {
    return {
      status: 502,
      code: "AI_PROVIDER_ACCESS_DENIED",
      message: "The AI provider denied access. Check the backend key, project permissions, and model access.",
    };
  }

  if (/model_not_found|model not found|unknown model/.test(details) || status === 404) {
    return {
      status: 502,
      code: "AI_MODEL_UNAVAILABLE",
      message: "The configured AI model is unavailable to this provider project.",
    };
  }

  if (/billing|payment_required|quota|resource_exhausted|rate.?limit/.test(details) || status === 429 || status === 402) {
    return {
      status: 429,
      code: "AI_PROVIDER_LIMIT",
      message: "The AI provider has reached a usage or billing limit. Check the provider project quota and billing.",
    };
  }

  if (status === 400 || /invalid_argument|bad request/.test(details)) {
    return {
      status: 502,
      code: "AI_PROVIDER_REQUEST_REJECTED",
      message: "The AI provider rejected the request. Check the configured model and request compatibility.",
    };
  }

  if (/econn|enotfound|etimedout|connection error|fetch failed/.test(details) || status >= 500 || !status) {
    return {
      status: 503,
      code: "AI_PROVIDER_UNAVAILABLE",
      message: "The AI provider is temporarily unavailable. Please try again shortly.",
    };
  }

  return {
    status: 502,
    code: "AI_PROVIDER_ERROR",
    message: "The AI provider could not complete this request. Check its configuration and access.",
  };
};

export const sendAiProviderFailure = (res, error, operation) => {
  const failure = getAiProviderFailure(error);
  const configuredEndpoint = process.env.GEMINI_BASE_URL || process.env.OPENAI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai/";
  let endpoint = "invalid endpoint URL";
  try {
    const parsed = new URL(configuredEndpoint);
    endpoint = `${parsed.origin}${parsed.pathname}`;
  } catch {
    // Log only a sanitized parse result; never echo arbitrary configuration text.
  }
  const rawMessage = getProviderMessage(error).slice(0, 500);
  const safeMessage = rawMessage
    .replace(/AIza[0-9A-Za-z_-]{20,}/g, "[REDACTED_KEY]")
    .replace(/AQ\.?[A-Za-z0-9_-]{20,}/g, "[REDACTED_KEY]")
    .replace(/Bearer\s+\S+/gi, "Bearer [REDACTED]")
    .replace(/key[=: ]+[^\s,;]+/gi, "key=[REDACTED]");
  console.error(`AI provider request failed (${operation})`, {
    provider: "Google Gemini",
    name: error?.name || "Error",
    providerStatus: getProviderStatus(error) || undefined,
    providerCode: getProviderCode(error) || undefined,
    providerType: error?.type || error?.error?.type || undefined,
    providerMessage: safeMessage || undefined,
    transportCauses: getSafeCauseChain(error),
    endpoint,
    model: process.env.GEMINI_MODEL || process.env.OPENAI_MODEL || undefined,
    apiKeyPresent: Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY),
    requestAttempted: !String(error?.code || "").startsWith("AI_"),
    providerResponseReceived: Boolean(getProviderStatus(error)),
    requestId: error?.request_id || error?.requestID || undefined,
  });
  return res.status(failure.status).json({ code: failure.code, message: failure.message });
};
