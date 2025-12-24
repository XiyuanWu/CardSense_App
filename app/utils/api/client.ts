/**
 * Shared API client (base URL + CSRF + request wrapper)
 */

import { Platform } from "react-native";

function getApiBaseUrl(): string {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000/api";
  } else if (Platform.OS === "ios") {
    return "http://localhost:8000/api";
  } else {
    // Web: match frontend hostname (localhost vs 127.0.0.1) so cookies/CSRF work.
    if (typeof window !== "undefined" && window.location?.hostname) {
      const protocol = window.location.protocol || "http:";
      const host = window.location.hostname;
      return `${protocol}//${host}:8000/api`;
    }
    return "http://localhost:8000/api";
  }
}

export const API_BASE_URL = getApiBaseUrl();

// Debug log (keep)
console.log(`[API] Using base URL: ${API_BASE_URL} (Platform: ${Platform.OS})`);

// Cache CSRF token (best-effort)
let csrfToken: string | null = null;

function extractCSRFTokenFromCookie(
  setCookieHeader: string | null,
): string | null {
  if (!setCookieHeader) return null;
  const match = setCookieHeader.match(/csrftoken=([^;]+)/);
  return match ? match[1] : null;
}

function getCSRFTokenFromCookies(): string | null {
  if (typeof document === "undefined") return null;
  try {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "csrftoken" && value) return decodeURIComponent(value);
    }
  } catch (e) {
    console.error("[API] Error reading cookies:", e);
  }
  return null;
}

async function getCSRFToken(): Promise<string | null> {
  const csrfUrl = `${API_BASE_URL}/auth/csrf/`;
  try {
    const response = await fetch(csrfUrl, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) return null;

    const headerToken = response.headers.get("X-CSRFToken");
    if (headerToken) {
      csrfToken = headerToken;
      return headerToken;
    }

    // body token (if present)
    try {
      const json = await response.json();
      if (json?.csrf_token) {
        csrfToken = json.csrf_token;
        return json.csrf_token;
      }
    } catch {
      // ignore
    }

    if (Platform.OS === "web") {
      const cookieToken = getCSRFTokenFromCookies();
      if (cookieToken) {
        csrfToken = cookieToken;
        return cookieToken;
      }
    }

    const setCookie = response.headers.get("Set-Cookie");
    const cookieToken = extractCSRFTokenFromCookie(setCookie);
    if (cookieToken) {
      csrfToken = cookieToken;
      return cookieToken;
    }

    return csrfToken;
  } catch (e) {
    console.error("[API] Error fetching CSRF token:", e);
    return null;
  }
}

function isUnsafeMethod(method?: string) {
  const m = (method || "GET").toUpperCase();
  return !["GET", "HEAD", "OPTIONS", "TRACE"].includes(m);
}

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;

  // On web, always try to read token from cookies first
  if (Platform.OS === "web") {
    const cookieToken = getCSRFTokenFromCookies();
    if (cookieToken) csrfToken = cookieToken;
  }

  if (isUnsafeMethod(options.method) && !csrfToken) {
    await getCSRFToken();
    if (Platform.OS === "web") {
      const cookieToken = getCSRFTokenFromCookies();
      if (cookieToken) csrfToken = cookieToken;
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (csrfToken) headers["X-CSRFToken"] = csrfToken;

  const doFetch = async () =>
    fetch(url, { ...options, headers, credentials: "include" });

  let response = await doFetch();

  // Retry once on 403 for unsafe methods (common CSRF race / host mismatch)
  if (isUnsafeMethod(options.method) && response.status === 403) {
    csrfToken = null;
    await getCSRFToken();
    if (Platform.OS === "web") {
      const cookieToken = getCSRFTokenFromCookies();
      if (cookieToken) csrfToken = cookieToken;
    }
    if (csrfToken) headers["X-CSRFToken"] = csrfToken;
    response = await doFetch();
  }

  // Update cached token from response (best-effort)
  const newToken = response.headers.get("X-CSRFToken");
  if (newToken) csrfToken = newToken;
  else {
    const setCookie = response.headers.get("Set-Cookie");
    const cookieToken = extractCSRFTokenFromCookie(setCookie);
    if (cookieToken) csrfToken = cookieToken;
  }

  return response;
}

export async function testApiConnection(): Promise<boolean> {
  const healthUrl = `${API_BASE_URL}/accounts/health/`;
  try {
    const res = await fetch(healthUrl, {
      method: "GET",
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
}
