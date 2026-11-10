import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Normalize request URLs so callers can use either "/users/..." or "/api/users/..."
// If a caller already included a leading "/api" prefix, strip it so the baseURL isn't duplicated.
api.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith("/api/")) {
    config.url = config.url.replace(/^\/api/, "");
  }

  // Prefer the token supplied by the current Redux auth state. Falling back to
  // localStorage keeps existing callers working, but must not overwrite a
  // newer in-memory token with a stale value from another session/tab.
  const suppliedAuthorization = config.headers?.get?.("Authorization")
    ?? config.headers?.Authorization
    ?? config.headers?.authorization;
  const tokenSource = suppliedAuthorization || localStorage.getItem("token");
  const token = typeof tokenSource === "string"
    ? tokenSource.trim().replace(/^Bearer\s+/i, "")
    : "";
  if (token && token !== "undefined" && token !== "null") {
    if (config.headers?.set) config.headers.set("Authorization", `Bearer ${token}`);
    else config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const isLoginRequest = /\/(?:admin|users)\/login(?:[/?]|$)/i.test(url);
    if (status === 401 && !isLoginRequest) {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
    return Promise.reject(error);
  },
);

export default api;
