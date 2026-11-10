import "dotenv/config";

const apiKeyVariable = process.env.GEMINI_API_KEY
  ? "GEMINI_API_KEY"
  : process.env.OPENAI_API_KEY
    ? "OPENAI_API_KEY"
    : null;
const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
const model = process.env.GEMINI_MODEL || process.env.OPENAI_MODEL;
const baseURL = process.env.GEMINI_BASE_URL
  || process.env.OPENAI_BASE_URL
  || "https://generativelanguage.googleapis.com/v1beta/openai/";

const safeEndpoint = (value) => {
  try {
    const parsed = new URL(value);
    return { value: `${parsed.origin}${parsed.pathname}`, valid: ["https:", "http:"].includes(parsed.protocol) };
  } catch {
    return { value: "invalid endpoint URL", valid: false };
  }
};

const endpoint = safeEndpoint(baseURL);
const provider = apiKeyVariable === "GEMINI_API_KEY" || endpoint.value.includes("generativelanguage.googleapis.com")
  ? "Google Gemini"
  : "OpenAI-compatible provider";

const redact = (value) => String(value || "")
  .slice(0, 1000)
  .replace(/AIza[0-9A-Za-z_-]{20,}/g, "[REDACTED_KEY]")
  .replace(/AQ\.?[A-Za-z0-9_-]{20,}/g, "[REDACTED_KEY]")
  .replace(/Bearer\s+\S+/gi, "Bearer [REDACTED]")
  .replace(/(api[_ -]?key|authorization|key)[=: ]+[^\s,;]+/gi, "$1=[REDACTED]");

const safeCauseChain = (error) => {
  const causes = [];
  let cause = error?.cause;
  while (cause && causes.length < 3) {
    causes.push({
      type: cause.name || null,
      code: cause.code || null,
      message: redact(cause.message),
    });
    cause = cause.cause;
  }
  return causes;
};

const report = (data) => console.log(JSON.stringify({
  provider,
  model: model || null,
  endpoint: endpoint.value,
  apiKeyVariable,
  apiKeyPresent: Boolean(apiKey),
  ...data,
}, null, 2));

if (!apiKey || !model || !endpoint.valid) {
  report({
    status: "not_configured",
    requestAttempted: false,
    providerResponseReceived: false,
    error: !apiKey ? "No provider API key is configured." : !model ? "No provider model is configured." : "The provider endpoint is not a valid HTTP(S) URL.",
  });
  process.exitCode = 1;
} else {
  let requestAttempted = false;
  let sdkResponseStatus = null;
  let sdkResponseRequestId = null;
  let sdkProviderError = null;
  try {
    const { default: OpenAI } = await import("openai");
    const timeoutMs = Math.min(60_000, Math.max(1_000, Number(process.env.AI_CHECK_TIMEOUT_MS) || 15_000));
    const diagnosticFetch = async (...args) => {
      const response = await globalThis.fetch(...args);
      sdkResponseStatus = response.status;
      sdkResponseRequestId = response.headers.get("x-request-id") || response.headers.get("x-goog-request-id") || null;
      if (!response.ok) {
        try {
          const parsed = JSON.parse(await response.clone().text());
          const entry = Array.isArray(parsed) ? parsed[0] : parsed;
          const details = entry?.error || entry;
          sdkProviderError = {
            code: details?.code || details?.status || null,
            type: details?.type || null,
            message: redact(details?.message || ""),
          };
        } catch {
          sdkProviderError = null;
        }
      }
      return response;
    };
    const client = new OpenAI({ apiKey, baseURL, timeout: timeoutMs, maxRetries: 0, fetch: diagnosticFetch });
    requestAttempted = true;
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: "Reply with the single word pong." },
        { role: "user", content: "ping" },
      ],
      max_tokens: 8,
    });
    const reply = response.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error("Provider returned an empty completion.");
    report({ status: "ok", requestAttempted: true, providerResponseReceived: true, reply });
  } catch (error) {
    const status = Number(error?.status || error?.statusCode || error?.response?.status || 0) || null;
    const requestId = error?.request_id || error?.requestID || error?.headers?.["x-request-id"] || null;
    report({
      status: "failed",
      requestAttempted,
      providerResponseReceived: Boolean(status || sdkResponseStatus),
      providerStatus: status || sdkResponseStatus,
      providerCode: error?.code || error?.error?.code || sdkProviderError?.code || null,
      providerType: error?.type || error?.error?.type || sdkProviderError?.type || error?.name || null,
      originalProviderMessage: sdkProviderError?.message || redact(error?.error?.message || error?.response?.data?.error?.message || error?.message),
      transportCauses: safeCauseChain(error),
      providerRequestId: requestId || sdkResponseRequestId,
    });
    process.exitCode = 1;
  }
}
