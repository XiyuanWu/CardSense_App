/**
 * API utility for making requests to the Django backend
 */

import { Platform } from "react-native";

/**
 * Get the API base URL based on the platform
 * - Android Emulator: 10.0.2.2 maps to host machine's localhost
 * - iOS Simulator: localhost works
 * - Web: localhost works
 * - Physical Device: Use your machine's IP address (e.g., 192.168.x.x)
 * 
 * To find your IP address:
 * - Windows: ipconfig (look for IPv4 Address)
 * - Mac/Linux: ifconfig or ip addr
 * 
 * For physical devices, uncomment and set DEVICE_IP below:
 */
function getApiBaseUrl(): string {
  // For physical devices, uncomment and set your machine's IP address:
  // const DEVICE_IP = "192.168.1.100"; // Replace with your actual IP
  // if (DEVICE_IP) {
  //   return `http://${DEVICE_IP}:8000/api`;
  // }
  
  if (Platform.OS === "android") {
    // Android emulator uses 10.0.2.2 to access host machine's localhost
    return "http://10.0.2.2:8000/api";
  } else if (Platform.OS === "ios") {
    // iOS simulator can use localhost
    return "http://localhost:8000/api";
  } else {
    // Web platform - use 127.0.0.1 for better compatibility
    // Try localhost first, fallback to 127.0.0.1 if needed
    return "http://127.0.0.1:8000/api";
  }
}

const API_BASE_URL = getApiBaseUrl();

// Log the API URL for debugging (remove in production)
console.log(`[API] Using base URL: ${API_BASE_URL} (Platform: ${Platform.OS})`);

/**
 * Test API connectivity (useful for debugging)
 * Call this function to verify Django is accessible
 */
export async function testApiConnection(): Promise<boolean> {
  const healthUrl = `${API_BASE_URL}/accounts/health/`;
  console.log(`[API] Testing connection to: ${healthUrl}`);
  
  try {
    const response = await fetch(healthUrl, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    console.log(`[API] Health check status: ${response.status} ${response.statusText}`);
    console.log(`[API] Health check headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const result = await response.json();
      console.log("[API] Health check response:", result);
      return true;
    } else {
      console.error(`[API] Health check failed with status: ${response.status}`);
      return false;
    }
  } catch (error: any) {
    console.error("[API] Health check failed:", error);
    console.error("[API] Error details:", {
      message: error?.message,
      name: error?.name,
      url: healthUrl,
    });
    return false;
  }
}

// Auto-test connection on module load (for debugging)
if (typeof window !== 'undefined') {
  // Only run in browser environment
  setTimeout(() => {
    console.log("[API] Auto-testing API connection...");
    testApiConnection().then((connected) => {
      if (connected) {
        console.log("[API] ✓ API connection test passed!");
      } else {
        console.error("[API] ✗ API connection test failed! Check that Django is running.");
      }
    });
  }, 1000);
}

// Cache CSRF token
let csrfToken: string | null = null;

/**
 * Extract CSRF token from Set-Cookie header
 */
function extractCSRFTokenFromCookie(setCookieHeader: string | null): string | null {
  if (!setCookieHeader) return null;
  
  const match = setCookieHeader.match(/csrftoken=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * Get CSRF token from the backend
 */
async function getCSRFToken(): Promise<string | null> {
  const csrfUrl = `${API_BASE_URL}/auth/csrf/`;
  console.log(`[API] Fetching CSRF token from: ${csrfUrl}`);
  
  try {
    const response = await fetch(csrfUrl, {
      method: "GET",
      credentials: "include",
    });

    console.log(`[API] CSRF endpoint response: ${response.status} ${response.statusText}`);
    console.log(`[API] CSRF response headers:`, Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      // Try to get CSRF token from response header
      const token = response.headers.get("X-CSRFToken");
      if (token) {
        csrfToken = token;
        console.log("[API] CSRF token obtained from X-CSRFToken header");
        return token;
      }
      
      // Try to extract from Set-Cookie header
      const setCookie = response.headers.get("Set-Cookie");
      console.log(`[API] Set-Cookie header: ${setCookie}`);
      const cookieToken = extractCSRFTokenFromCookie(setCookie);
      if (cookieToken) {
        csrfToken = cookieToken;
        console.log("[API] CSRF token extracted from Set-Cookie");
        return cookieToken;
      }
      
      // For React Native, cookies are handled automatically by fetch
      // The token might be in the cookie already, but we can't read it directly
      // Django will accept the request if the cookie is present
      console.log("[API] CSRF token not found in headers, but cookie may be set");
      return csrfToken;
    }
    console.warn(`[API] CSRF endpoint returned status ${response.status}`);
    return null;
  } catch (error: any) {
    console.error("[API] Error fetching CSRF token:", error);
    console.error("[API] CSRF fetch error details:", {
      message: error?.message,
      name: error?.name,
      url: csrfUrl,
    });
    return null;
  }
}

/**
 * Make an API request with proper headers and CSRF handling
 */
async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`[API] Making request to: ${url}`);
  
  // Ensure CSRF token is available
  if (!csrfToken) {
    console.log("[API] Fetching CSRF token...");
    await getCSRFToken();
    console.log(`[API] CSRF token: ${csrfToken ? "obtained" : "not obtained"}`);
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Add CSRF token if available
  if (csrfToken) {
    headers["X-CSRFToken"] = csrfToken;
  }

  console.log(`[API] Request options:`, {
    method: options.method || "GET",
    url,
    hasCSRFToken: !!csrfToken,
    credentials: "include",
  });

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include", // Important for session cookies
    });

    console.log(`[API] Response status: ${response.status} ${response.statusText}`);
    console.log(`[API] Response headers:`, Object.fromEntries(response.headers.entries()));

    // Update CSRF token from response if present
    const newToken = response.headers.get("X-CSRFToken");
    if (newToken) {
      csrfToken = newToken;
      console.log("[API] Updated CSRF token from response");
    } else {
      // Try to extract from Set-Cookie header
      const setCookie = response.headers.get("Set-Cookie");
      const cookieToken = extractCSRFTokenFromCookie(setCookie);
      if (cookieToken) {
        csrfToken = cookieToken;
        console.log("[API] Extracted CSRF token from Set-Cookie");
      }
    }

    return response;
  } catch (error) {
    console.error(`[API] Fetch error for ${url}:`, error);
    throw error;
  }
}

/**
 * API response types
 */
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Register a new user
 */
export async function registerUser(data: {
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
}): Promise<ApiResponse<{ user: any }>> {
  try {
    const response = await apiRequest("/auth/register/", {
      method: "POST",
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        first_name: data.first_name,
        last_name: data.last_name,
      }),
    });

    const result = await response.json();
    console.log("[API] Registration response result:", result);
    console.log("[API] Response OK:", response.ok);
    console.log("[API] Response status:", response.status);

    if (response.ok) {
      console.log("[API] Registration successful, returning success response");
      return result as ApiSuccessResponse<{ user: any }>;
    } else {
      console.log("[API] Registration failed, returning error response");
      return result as ApiErrorResponse;
    }
  } catch (error: any) {
    console.error("Registration error:", error);
    console.error("Error details:", {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      apiUrl: API_BASE_URL,
      endpoint: "/auth/register/",
      fullUrl: `${API_BASE_URL}/auth/register/`,
    });
    const errorMessage = error?.message || "Unknown error";
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: `Failed to connect to server: ${errorMessage}. Please check that Django is running on ${API_BASE_URL.replace('/api', '')}`,
      },
    };
  }
}

/**
 * Login a user
 */
export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<ApiResponse<{ user: any }>> {
  try {
    console.log("[API] Attempting login for email:", data.email);
    
    const response = await apiRequest("/auth/login/", {
      method: "POST",
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
    });

    console.log("[API] Login response status:", response.status);
    
    const result = await response.json();
    console.log("[API] Login response data:", result);

    if (response.ok) {
      console.log("[API] Login successful!");
      return result as ApiSuccessResponse<{ user: any }>;
    } else {
      console.error("[API] Login failed:", result);
      return result as ApiErrorResponse;
    }
  } catch (error: any) {
    console.error("Login error:", error);
    console.error("Login error details:", {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      apiUrl: API_BASE_URL,
      endpoint: "/auth/login/",
      fullUrl: `${API_BASE_URL}/auth/login/`,
    });
    const errorMessage = error?.message || "Unknown error";
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: `Failed to connect to server: ${errorMessage}. Please check that Django is running on ${API_BASE_URL.replace('/api', '')}`,
      },
    };
  }
}

