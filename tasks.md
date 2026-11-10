# Authentication audit tasks

- [x] Trace backend user registration/login, JWT middleware, MongoDB config, admin routes, and frontend auth state/guards.
- [x] Ensure DB connection completes before the HTTP server starts; fail startup on DB errors or missing JWT secret.
- [x] Force public registrations to the user role and remove login-time admin auto-creation.
- [x] Add dedicated admin login and an explicit non-overwriting admin seed command.
- [x] Persist admin login token and guard user/admin client routes by role.
- [x] Add active-account rejection to sign-in and protected backend routes.
- [x] Attempt Atlas startup verification; SRV DNS lookup timed out for the configured cluster hostname.
- [x] Repair unauthenticated Build Resume and Hero CTA routing to the signup/login page while preserving the requested destination.
- [x] Replace the empty footer CTA href with working signup navigation.
- [x] Continue post-auth navigation to the originally requested app/editor URL.
- [x] Save guest/template resume content as an authenticated resume instead of sending an unparsed multipart request.
- [x] Add dashboard greeting/profile email, resume loading/error states, template/date metadata, edit/preview actions, and requested empty-state CTA.
- [x] Add authenticated private preview route with print/save-as-PDF action.
- [ ] Verify actual user/admin credentials and MongoDB resume create/update/list persistence (blocked by Atlas DNS connectivity and unavailable test credentials).
- [ ] Restore Atlas SRV DNS/network reachability, then rerun startup and login/security checks.
- [x] Run client production build: passed (Vite output; existing large-chunk warning).
- [x] Run client lint: failed with 17 pre-existing unused-variable/React-refresh errors outside the auth changes after removing the unused auth modal import.
- [x] Run Node syntax checks for the changed backend entry/controller/middleware/routes/seed files: passed.
- [x] Browser check: Build Resume and Create Your Resume Now both open the signup form and preserve `/app?state=register` as the return destination.
- [ ] Run registration/login/editor/dashboard browser workflow (blocked by Atlas connectivity and unavailable test credentials).

## PDF import and blank editor repair

- [x] Trace upload flow: browser `react-pdftotext` extraction → JSON `POST /api/ai/upload-resume` → AI parse → MongoDB create.
- [x] Validate PDF extension, MIME, size and PDF signature; report corrupt/scanned/no-text PDFs; add duplicate-submit lock and visible processing stages.
- [x] Split safe parser, invalid-JSON/no-content, and MongoDB save errors; do not create a resume on parse failure.
- [x] Use a shared sanitized resume data shape and add certifications, languages and achievements arrays to the existing schema/editor/preview.
- [x] Fix blank editor crash caused by section components receiving `resumeData`/`setResumeData` instead of their `data`/`onChange` props.
- [x] Replace example-person content with empty defaults; add ID validation, loading, retry, error and Back to Dashboard states.
- [x] Verify resume data helper smoke checks and backend syntax; client production build passed.
- [x] Targeted lint for changed client files passed; full-project lint still fails on 15 unrelated existing errors.
- [ ] Verify real PDF parsing, AI provider output, MongoDB persistence, edit/refresh/delete and owner isolation (blocked by Atlas SRV DNS timeout and unavailable test accounts/PDF).
- [ ] Resolve remaining client lint failures (15 existing errors in unrelated components/templates).

## Resume Assistant and AI Enhance 403 investigation

- [x] Read the available project notes (`tasks.md`, `memory.md`); `prd.md`, `architecture.md`, `design.md`, and `rules.md` are not present in this checkout.
- [x] Trace chat and enhance calls through Axios, `/api/ai` routes, JWT middleware, shared Gemini/OpenAI-compatible client config, and AI controller handlers.
- [x] Identify the screenshot's 403 as a provider-side failure: `/chat` had no auth middleware and passed the provider's 403 through; CORS errors return the distinct `Origin not allowed` message. Summary/job enhancement concealed provider failures as a generic 500.
- [x] Inspect only AI configuration metadata: endpoint and model match Gemini's documented OpenAI-compatible pattern; the configured key has the legacy Google Standard-key format. Google documentation says Standard keys are rejected starting September 2026. No credential value was printed or copied.
- [x] Protect the chat route with the existing user JWT middleware and send bounded prior user/assistant turns for follow-up context.
- [x] Normalize provider auth/access/model/quota/request/network errors to safe client messages and log only provider status/code/request ID metadata.
- [x] Keep generated summary, experience, and project text as editable suggestions until the user accepts; update prompts to preserve facts and never invent metrics.
- [x] Add `GEMINI_API_KEY` as the preferred backend setting while retaining `OPENAI_API_KEY` as a compatibility fallback.
- [x] Targeted lint, production build, server syntax, and synthetic AI error mapping/empty-input checks pass.
- [ ] Replace the legacy provider key with an active Gemini API key and verify provider status, real chat turns, summary/experience enhancement, and authenticated access. Provider network requests from this environment fail at connection setup, so live Gemini project permissions and model access remain unverified.

## Responsive layout audit (2026-11-10)

- [x] Add a compact mobile navigation menu to the landing page with Escape dismissal and scroll lock; keep primary desktop navigation intact.
- [x] Make the resume editor single-panel on narrow/tablet widths with Edit/Preview tabs; restore the two-pane editor at 1280px and wider. Preserve Save/export and expose ATS, Matcher, and Interview Prep in a small-screen More menu.
- [x] Constrain the resume assistant to the viewport on phones and dialogs/popovers to the available viewport height and width.
- [x] Improve responsive authentication cards, dashboard actions/dialogs, admin navigation and tables, resume preview, template/color pickers, and editor form controls; add touch-sized controls and visible keyboard focus.
- [x] Production client build and ESLint on the modified JS/JSX files (results recorded below).
- [ ] Manually verify at 320, 375, 768, 1024, 1280, 1440, and 1920px, including protected editor and admin pages. Computer-use browser inspection stopped because the desktop tool could not determine Chrome's current URL; no visual viewport matrix is claimed.
- [x] Production build completed successfully (Vite; existing >500KB JavaScript chunk warning) and targeted ESLint passed for all modified JS/JSX files.

## AI provider access follow-up (2026-11-10)

- [x] Re-audit Gemini/OpenAI-compatible integration: backend uses `openai` SDK 6.1.0, one shared client, Google Gemini compatibility endpoint, and protected `/chat` + enhance routes. Frontend attaches the JWT via the shared Axios interceptor.
- [x] Inspect `.env` without displaying credential values: only `OPENAI_API_KEY` was present, its value has the legacy Google `AIza` Standard-key format, and the configured model was `gemini-1.5-flash` (shutdown). The endpoint path is correct.
- [x] Google official docs confirm Standard keys are rejected after September 2026 and identify current stable Gemini model IDs. Updated the local model setting to `gemini-3.8-flash`; added safe `server/.env.example` using `GEMINI_API_KEY`, `GEMINI_MODEL`, and `GEMINI_BASE_URL`.
- [x] Keep the OpenAI-compatible SDK and a single shared backend client; initialize it lazily, centralize model/endpoint selection, add bounded retries/timeout, validate missing/legacy key and bad endpoint, and normalize provider errors.
- [x] Make `/api/ai/status` an admin-authenticated real ping. Response includes only safe config metadata; no key or auth header. Failure logs now capture sanitized provider message/type/status/code, model, endpoint, and provider request ID.
- [x] Route interview-prep provider errors through the same safe error mapper. Chat and summary/experience/project enhance continue to use the same client and authenticated routes.
- [x] Static syntax checks and synthetic configuration/error-mapping checks passed. Calling with the configured legacy key fails fast with `AI_LEGACY_KEY`. Admin guard without a token returns HTTP 401.
- [ ] Replace local/deployment `OPENAI_API_KEY` with a new Gemini authorization key stored as `GEMINI_API_KEY`; confirm project/API restrictions and billing/quotas in Google AI Studio/Cloud. This requires account access and cannot be done from this workspace.
- [ ] Verify real provider ping, chat (basic/follow-up), summary and experience enhancement, and logged-in user flow. A direct SDK probe in this environment failed before an HTTP response with `Connection error`; local loopback HTTP tests are blocked (`connect EACCES`). Therefore there is no observed raw provider HTTP status/code/message from this run and no real generated response to claim.

## Admin panel completion pass (2026-11-10)

- [x] Trace project docs, app routes, admin auth, APIs, schemas, templates, and analytics. Only `tasks.md` and `memory.md` are present; `prd.md`, `architecture.md`, `design.md`, and `rules.md` are not in this checkout.
- [x] Fix the screenshot's `/admin-login` URL with a redirect alias to the existing `/admin/login` page; retain `/admin/dashboard` as the authenticated destination.
- [x] Extend the existing admin shell navigation and add Overview, Users, Templates, Analytics, Activity Logs, and Settings pages; retain mobile drawer navigation.
- [x] Harden user management APIs: escaped search, bounded pagination, registration date/status filters, profile-only updates, account suspension/reactivation, self-action guards, last-active-admin safeguards, audited deletion, and resume cascade removal.
- [x] Add deletion cleanup for tracked ImageKit profile images. Older records without an ImageKit file ID or provider deletion failures return a cleanup warning.
- [x] Add a safe managed-template model and admin CRUD/publish workflow. New templates are data-only variants of the existing 26 supported renderers (base renderer, color, font, category, preview URL); no script or HTML configuration is accepted. Published templates appear in the builder selector; existing custom selections still resolve after unpublishing; custom templates in use cannot be deleted.
- [x] Add real MongoDB analytics overview and date-filtered daily/monthly series for registrations, public traffic, resume creation, and authenticated active users. Unique visitors are approximate, first-party cookie identifiers hashed before storage; admin/internal pages, IPs, and user agents are not stored for new events; analytics events expire after 365 days.
- [x] Add paginated admin audit history for successful admin sign-in and account/template changes; no passwords, tokens, or user emails are recorded.
- [x] Add admin sign-in rate limit and an admin-only real AI connectivity diagnostic in Settings. Existing seed script remains the secure admin provisioning mechanism (`ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD` supplied privately; password minimum 12 chars).
- [x] Verify: client production build passed (existing >500KB JS chunk warning); targeted ESLint passed; backend Node syntax checks passed; direct admin guard assertions returned 401 for missing token, 403 for ordinary user, and allowed an active admin; all 26 built-in template IDs remain supported.
- [ ] Verify live admin sign-in, database-backed user/template/audit mutations, and analytics aggregations. Backend startup could not connect because MongoDB Atlas SRV resolution timed out (`querySrv ETIMEOUT`); no test admin credentials were available. No browser interaction test was run.
- [ ] If admins need fundamentally new layout structures beyond the existing 26 renderers, add a new renderer in code; current managed templates create supported working variants without a code change per catalog entry.

## Admin API auth follow-up (2026-11-10)

- [x] Fix shared Axios auth precedence: use an explicit current auth-state token before the localStorage fallback, normalize to `Bearer <token>`, and clear auth state on protected API 401s (excluding login requests).
- [x] Keep backend JWT verification and admin role/status checks; parse Bearer tokens case-insensitively, return an explicit expired-session response, and classify MongoDB identity lookup failures as 503 rather than falsely reporting an invalid JWT.
- [x] Prevent user management and dashboard pages from showing zero/empty results when requests fail; show unavailable/error states. Clear stale analytics on failed refresh.
- [x] Verify targeted ESLint, production build, middleware syntax, and authorization scenarios using signed admin, regular, missing, malformed, expired, suspended, and simulated database-failure requests.
- [ ] Live MongoDB user count, admin sign-in/dashboard browser flow, token persistence across an actual refresh, and endpoint queries remain unverified until the configured Atlas cluster is reachable and test credentials are available.

## AI provider final diagnostic (2026-11-10)

- [x] Audited the shared provider config, AI routes/controllers, authentication guards, environment variable names, model, endpoint, and installed SDK without printing secret values.
- [x] Added `npm run ai:check`, a backend-only OpenAI-SDK ping using the configured Gemini key/model, with credential-redacted provider status/code/type/message/request ID and response-received diagnostics.
- [x] Enhanced provider failure logging with provider/model/endpoint, key presence, request-attempt/response-received flags, request ID, and sanitized underlying transport causes; added redaction for current AQ-format Gemini keys.
- [x] Direct SDK request attempted (no mock); it timed out without an HTTP response. A direct authenticated HTTPS request to the same documented endpoint returned HTTP 429 / `RESOURCE_EXHAUSTED`: free-tier daily request metric `generate_content_free_tier_requests`, limit 20, model `gemini-3.8-flash` exceeded; provider asked to retry after 17h17m45s. This confirms provider quota exhaustion is an actual blocking condition.
- [x] Google endpoint DNS and HTTPS resolve when checked with network access; sandboxed DNS returns `ENOTFOUND`, so the constrained shell itself cannot be used to validate external connectivity. The authenticated HTTP response proves that the API key was accepted far enough to receive project quota details; dashboard billing state remains inaccessible.
- [x] Set the shared SDK to zero automatic retries so one 429/timeout does not create duplicate provider calls; quota failures are mapped to `AI_PROVIDER_LIMIT` when an HTTP status is available. The protected AI routes remain unchanged.
- [ ] Increase/enable the Gemini project quota by setting up billing or a paid tier in Google AI Studio/Google Cloud, or wait for the free-tier daily limit to reset; then rerun the SDK diagnostic and authenticated user routes.
