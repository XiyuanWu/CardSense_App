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
    // Web platform - use localhost to match session cookie domain
    // Important: session cookies work better with localhost than 127.0.0.1
    return "http://localhost:8000/api";
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
 * Get CSRF token from browser cookies (for web platform)
 */
function getCSRFTokenFromCookies(): string | null {
  if (typeof document === "undefined") return null;
  
  try {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "csrftoken" && value) {
        return decodeURIComponent(value);
      }
    }
  } catch (error) {
    console.error("[API] Error reading cookies:", error);
  }
  return null;
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
      // Try to get CSRF token from response header first
      const token = response.headers.get("X-CSRFToken");
      if (token) {
        csrfToken = token;
        console.log("[API] CSRF token obtained from X-CSRFToken header");
        return token;
      }
      
      // Try to get from response body (Django now includes it)
      try {
        const result = await response.json();
        if (result.csrf_token) {
          csrfToken = result.csrf_token;
          console.log("[API] CSRF token obtained from response body");
          return result.csrf_token;
        }
      } catch {
        // Ignore JSON parse errors, continue to try other methods
      }
      
      // For web platform, try to read from document.cookie
      if (Platform.OS === "web") {
        const cookieToken = getCSRFTokenFromCookies();
        if (cookieToken) {
          csrfToken = cookieToken;
          console.log("[API] CSRF token obtained from browser cookies");
          return cookieToken;
        }
      }
      
      // Try to extract from Set-Cookie header (for React Native)
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
      
      // Wait a bit for cookie to be set, then try reading from cookies again (web only)
      if (Platform.OS === "web") {
        await new Promise(resolve => setTimeout(resolve, 100));
        const delayedToken = getCSRFTokenFromCookies();
        if (delayedToken) {
          csrfToken = delayedToken;
          console.log("[API] CSRF token obtained from browser cookies (after delay)");
          return delayedToken;
        }
      }
      
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
    console.log("[API] CSRF token before login:", csrfToken ? "present" : "missing");
    
    // Ensure CSRF token is available before making the request
    if (!csrfToken) {
      console.log("[API] CSRF token missing, fetching...");
      await getCSRFToken();
      console.log("[API] CSRF token after fetch:", csrfToken ? "obtained" : "still missing");
    }
    
    const response = await apiRequest("/auth/login/", {
      method: "POST",
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
    });

    console.log("[API] Login response status:", response.status);
    console.log("[API] Login response headers:", Object.fromEntries(response.headers.entries()));
    
    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: `HTTP ${response.status}: ${response.statusText}` };
      }
      console.error("[API] Login error response:", errorData);
      
      // Handle CSRF errors specifically - retry once with fresh token
      if (response.status === 403 && errorData.detail && errorData.detail.includes("CSRF")) {
        console.log("[API] CSRF error detected, fetching new token and retrying...");
        // Clear current token and fetch fresh one
        csrfToken = null;
        await getCSRFToken();
        
        // Retry the login request
        const retryResponse = await apiRequest("/auth/login/", {
          method: "POST",
          body: JSON.stringify({
            email: data.email,
            password: data.password,
          }),
        });
        
        if (retryResponse.ok) {
          const retryResult = await retryResponse.json();
          console.log("[API] Login successful after retry!");
          return retryResult as ApiSuccessResponse<{ user: any }>;
        } else {
          const retryError = await retryResponse.json().catch(() => ({ detail: "CSRF token error" }));
          return {
            success: false,
            error: {
              code: "CSRF_ERROR",
              message: retryError.detail || retryError.message || "CSRF token validation failed",
            },
          };
        }
      }
      
      return {
        success: false,
        error: {
          code: response.status === 401 ? "AUTHENTICATION_FAILED" : response.status === 403 ? "FORBIDDEN" : "API_ERROR",
          message: errorData.detail || errorData.message || `Login failed (${response.status})`,
          details: errorData,
        },
      };
    }
    
    const result = await response.json();
    console.log("[API] Login response data:", result);

    if (result.success) {
      console.log("[API] Login successful!");
      return result as ApiSuccessResponse<{ user: any }>;
    }
    
    // Fallback if response doesn't have success field
    return {
      success: true,
      data: { user: result },
    };
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

/**
 * Check if user is authenticated
 */
export async function checkAuth(): Promise<ApiResponse<{ user: any }>> {
  try {
    console.log("[API] Checking authentication...");
    
    const response = await apiRequest("/auth/me/", {
      method: "GET",
    });

    console.log("[API] Auth check response status:", response.status);
    
    const result = await response.json();
    console.log("[API] Auth check response data:", result);

    if (response.ok) {
      return {
        success: true,
        data: { user: result },
      };
    } else {
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        },
      };
    }
  } catch (error: any) {
    console.error("Auth check error:", error);
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Failed to check authentication",
      },
    };
  }
}

/**
 * Card-related API functions
 */

export interface CardData {
  id: number;
  issuer: string;
  name: string;
  annual_fee: string;
  ftf: boolean;
  reward_rules?: any[];
  benefits?: any[];
}

/**
 * Get all available cards
 */
export async function getAvailableCards(): Promise<ApiResponse<CardData[]>> {
  try {
    console.log("[API] Fetching available cards...");
    console.log("[API] Full URL will be:", `${API_BASE_URL}/cards/cards/`);
    
    const response = await apiRequest("/cards/cards/", {
      method: "GET",
    });

    console.log("[API] Cards response status:", response.status);
    console.log("[API] Cards response headers:", Object.fromEntries(response.headers.entries()));
    
    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
      }
      console.error("[API] Cards error response:", errorData);
      return {
        success: false,
        error: {
          code: response.status === 401 ? "UNAUTHORIZED" : "API_ERROR",
          message: errorData.message || errorData.detail || `Failed to fetch cards (${response.status})`,
          details: errorData,
        },
      };
    }
    
    const result = await response.json();
    console.log("[API] Cards response data:", result);

    // The backend returns { success: true, data: [...] }
    if (result.success && result.data) {
      return {
        success: true,
        data: result.data,
      };
    }
    // Fallback if structure is different
    if (Array.isArray(result)) {
      return {
        success: true,
        data: result,
      };
    }
    if (result.data && Array.isArray(result.data)) {
      return {
        success: true,
        data: result.data,
      };
    }
    
    // If we get here, the response structure is unexpected
    console.warn("[API] Unexpected response structure:", result);
    return {
      success: false,
      error: {
        code: "INVALID_RESPONSE",
        message: "Unexpected response format from server",
      },
    };
  } catch (error: any) {
    console.error("Get cards error:", error);
    console.error("Error details:", {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
    });
    const errorMessage = error?.message || "Unknown error";
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: `Failed to fetch cards: ${errorMessage}`,
      },
    };
  }
}

/**
 * Get user's cards
 */
export interface UserCardData {
  id: number;
  card: number;
  card_id: number;
  card_name: string;
  is_active: boolean;
  notes?: string;
  // Card details (if expanded)
  card_details?: CardData;
}

export async function getUserCards(): Promise<ApiResponse<UserCardData[]>> {
  try {
    console.log("[API] Fetching user cards...");
    
    const response = await apiRequest("/cards/user-cards/", {
      method: "GET",
    });

    console.log("[API] User cards response status:", response.status);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
      }
      console.error("[API] User cards error response:", errorData);
      return {
        success: false,
        error: {
          code: response.status === 401 ? "UNAUTHORIZED" : "API_ERROR",
          message: errorData.message || errorData.detail || `Failed to fetch user cards (${response.status})`,
          details: errorData,
        },
      };
    }
    
    const result = await response.json();
    console.log("[API] User cards response data:", result);

    if (result.success && result.data) {
      return {
        success: true,
        data: result.data,
      };
    }
    
    if (Array.isArray(result)) {
      return {
        success: true,
        data: result,
      };
    }
    
    if (result.data && Array.isArray(result.data)) {
      return {
        success: true,
        data: result.data,
      };
    }
    
    console.warn("[API] Unexpected user cards response structure:", result);
    return {
      success: false,
      error: {
        code: "INVALID_RESPONSE",
        message: "Unexpected response format from server",
      },
    };
  } catch (error: any) {
    console.error("Get user cards error:", error);
    const errorMessage = error?.message || "Unknown error";
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: `Failed to fetch user cards: ${errorMessage}`,
      },
    };
  }
}

/**
 * Delete a user card
 */
export async function deleteUserCard(userCardId: number): Promise<ApiResponse<any>> {
  try {
    console.log("[API] Deleting user card:", userCardId);
    
    const response = await apiRequest(`/cards/user-cards/${userCardId}/`, {
      method: "DELETE",
    });

    console.log("[API] Delete card response status:", response.status);
    
    if (response.ok) {
      let result;
      try {
        const text = await response.text();
        if (text) {
          result = JSON.parse(text);
        }
      } catch {
        console.log("[API] No JSON body in delete response, treating as success");
        result = null;
      }

      if (result && result.success) {
        return result as ApiSuccessResponse<any>;
      }
      return {
        success: true,
        data: result || { message: "Card deleted successfully" },
      };
    } else {
      let errorData;
      try {
        const text = await response.text();
        errorData = text ? JSON.parse(text) : null;
      } catch {
        errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      return {
        success: false,
        error: {
          code: "API_ERROR",
          message: errorData?.message || errorData?.detail || `Failed to delete card (${response.status})`,
        },
      };
    }
  } catch (error: any) {
    console.error("Delete user card error:", error);
    const errorMessage = error?.message || "Unknown error";
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: `Failed to delete card: ${errorMessage}`,
      },
    };
  }
}

/**
 * Add a card to user's wallet
 */
export async function addUserCard(cardId: number): Promise<ApiResponse<any>> {
  try {
    console.log("[API] Adding card to wallet:", cardId);
    console.log("[API] CSRF token before request:", csrfToken ? "present" : "missing");
    
    // Ensure CSRF token is available before making the request
    if (!csrfToken) {
      console.log("[API] CSRF token missing, fetching...");
      await getCSRFToken();
      console.log("[API] CSRF token after fetch:", csrfToken ? "obtained" : "still missing");
    }
    
    const response = await apiRequest("/cards/user-cards/", {
      method: "POST",
      body: JSON.stringify({
        card: cardId,
        is_active: true,
      }),
    });

    console.log("[API] Add card response status:", response.status);
    console.log("[API] Add card response headers:", Object.fromEntries(response.headers.entries()));
    
    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: `HTTP ${response.status}: ${response.statusText}` };
      }
      console.error("[API] Add card error response:", errorData);
      
      // Handle CSRF errors specifically
      if (response.status === 403 && errorData.detail && errorData.detail.includes("CSRF")) {
        // Try to get CSRF token again and retry once
        console.log("[API] CSRF error detected, fetching new token and retrying...");
        await getCSRFToken();
        
        // Retry the request
        const retryResponse = await apiRequest("/cards/user-cards/", {
          method: "POST",
          body: JSON.stringify({
            card: cardId,
            is_active: true,
          }),
        });
        
        if (retryResponse.ok) {
          const retryResult = await retryResponse.json();
          if (retryResult.success) {
            return retryResult as ApiSuccessResponse<any>;
          }
          return {
            success: true,
            data: retryResult,
          };
        } else {
          const retryError = await retryResponse.json().catch(() => ({ detail: "CSRF token error" }));
          return {
            success: false,
            error: {
              code: "CSRF_ERROR",
              message: retryError.detail || retryError.message || "CSRF token validation failed",
            },
          };
        }
      }
      
      // Extract error message from different possible formats
      let errorMessage = errorData.detail || errorData.message;
      
      // Handle Django REST Framework validation errors
      if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors) && errorData.non_field_errors.length > 0) {
        errorMessage = errorData.non_field_errors[0];
      } else if (errorData.card && Array.isArray(errorData.card) && errorData.card.length > 0) {
        errorMessage = errorData.card[0];
      } else if (typeof errorData === 'object') {
        // Try to extract first error from any field
        const firstErrorKey = Object.keys(errorData).find(key => Array.isArray(errorData[key]) && errorData[key].length > 0);
        if (firstErrorKey) {
          errorMessage = Array.isArray(errorData[firstErrorKey]) ? errorData[firstErrorKey][0] : errorData[firstErrorKey];
        }
      }
      
      if (!errorMessage) {
        errorMessage = `Failed to add card (${response.status})`;
      }
      
      return {
        success: false,
        error: {
          code: response.status === 401 ? "UNAUTHORIZED" : response.status === 403 ? "FORBIDDEN" : response.status === 400 ? "VALIDATION_ERROR" : "API_ERROR",
          message: errorMessage,
          details: errorData,
        },
      };
    }
    
    const result = await response.json();
    console.log("[API] Add card response data:", result);

    if (result.success) {
      return result as ApiSuccessResponse<any>;
    }
    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error("Add card error:", error);
    console.error("Add card error details:", {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
    });
    const errorMessage = error?.message || "Unknown error";
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: `Failed to add card: ${errorMessage}`,
      },
    };
  }
}

/**
 * Transaction-related API functions
 */

export interface TransactionData {
  id: number;
  merchant: string;
  amount: string;
  category: string;
  card_actually_used?: number | null;
  card_actually_used_details?: {
    id: number;
    name: string;
    issuer: string;
  } | null;
  recommended_card?: number | null;
  recommended_card_details?: {
    id: number;
    name: string;
    issuer: string;
  } | null;
  notes?: string | null;
  actual_reward: string;
  optimal_reward: string;
  missed_reward: string;
  used_optimal_card: boolean;
  created_at: string;
  updated_at: string;
}

export interface CardRecommendationData {
  category: string;
  amount: number;
  recommendation: {
    best_card: {
      card_id: number;
      card_name: string;
    } | null;
    multiplier: number;
    rationale: string;
    top3: {
      card_id: number;
      card_name: string;
      multiplier: number;
    }[];
  };
}

/**
 * Create a new transaction
 */
export async function createTransaction(data: {
  merchant: string;
  amount: number;
  category: string;
  card_actually_used?: number | null;
  notes?: string | null;
}): Promise<ApiResponse<TransactionData>> {
  try {
    console.log("[API] Creating transaction...");
    
    const response = await apiRequest("/transactions/transactions/", {
      method: "POST",
      body: JSON.stringify({
        merchant: data.merchant,
        amount: data.amount,
        category: data.category,
        card_actually_used: data.card_actually_used || null,
        notes: data.notes || null,
      }),
    });

    console.log("[API] Create transaction response status:", response.status);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
      }
      console.error("[API] Create transaction error response:", errorData);
      return {
        success: false,
        error: {
          code: response.status === 401 ? "UNAUTHORIZED" : response.status === 400 ? "VALIDATION_ERROR" : "API_ERROR",
          message: errorData.message || errorData.detail || `Failed to create transaction (${response.status})`,
          details: errorData,
        },
      };
    }

    const result = await response.json();
    console.log("[API] Create transaction response data:", result);

    if (result.success && result.data) {
      return {
        success: true,
        data: result.data,
        message: result.message,
      };
    }

    if (result.data) {
      return {
        success: true,
        data: result.data,
      };
    }

    console.warn("[API] Unexpected create transaction response structure:", result);
    return {
      success: false,
      error: {
        code: "INVALID_RESPONSE",
        message: "Unexpected response format from server",
      },
    };
  } catch (error: any) {
    console.error("Create transaction error:", error);
    const errorMessage = error?.message || "Unknown error";
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: `Failed to create transaction: ${errorMessage}`,
      },
    };
  }
}

/**
 * Get a single transaction by ID
 */
export async function getTransaction(transactionId: number | string): Promise<ApiResponse<TransactionData>> {
  try {
    console.log("[API] Fetching transaction:", transactionId);
    
    const response = await apiRequest(`/transactions/transactions/${transactionId}/`, {
      method: "GET",
    });

    console.log("[API] Get transaction response status:", response.status);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
      }
      console.error("[API] Get transaction error response:", errorData);
      return {
        success: false,
        error: {
          code: response.status === 401 ? "UNAUTHORIZED" : response.status === 404 ? "NOT_FOUND" : "API_ERROR",
          message: errorData.message || errorData.detail || `Failed to fetch transaction (${response.status})`,
          details: errorData,
        },
      };
    }

    const result = await response.json();
    console.log("[API] Get transaction response data:", result);

    if (result.success && result.data) {
      return {
        success: true,
        data: result.data,
      };
    }

    // Handle case where backend returns transaction directly
    if (result.id) {
      return {
        success: true,
        data: result,
      };
    }

    console.warn("[API] Unexpected get transaction response structure:", result);
    return {
      success: false,
      error: {
        code: "INVALID_RESPONSE",
        message: "Unexpected response format from server",
      },
    };
  } catch (error: any) {
    console.error("Get transaction error:", error);
    const errorMessage = error?.message || "Unknown error";
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: `Failed to fetch transaction: ${errorMessage}`,
      },
    };
  }
}

/**
 * Get all transactions for the current user
 */
export async function getTransactions(): Promise<ApiResponse<TransactionData[]>> {
  try {
    console.log("[API] Fetching transactions...");
    
    const response = await apiRequest("/transactions/transactions/", {
      method: "GET",
    });

    console.log("[API] Get transactions response status:", response.status);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
      }
      console.error("[API] Get transactions error response:", errorData);
      return {
        success: false,
        error: {
          code: response.status === 401 ? "UNAUTHORIZED" : "API_ERROR",
          message: errorData.message || errorData.detail || `Failed to fetch transactions (${response.status})`,
          details: errorData,
        },
      };
    }

    const result = await response.json();
    console.log("[API] Get transactions response data:", result);

    if (result.success && result.data) {
      return {
        success: true,
        data: result.data,
      };
    }

    if (Array.isArray(result)) {
      return {
        success: true,
        data: result,
      };
    }

    if (result.data && Array.isArray(result.data)) {
      return {
        success: true,
        data: result.data,
      };
    }

    console.warn("[API] Unexpected get transactions response structure:", result);
    return {
      success: false,
      error: {
        code: "INVALID_RESPONSE",
        message: "Unexpected response format from server",
      },
    };
  } catch (error: any) {
    console.error("Get transactions error:", error);
    const errorMessage = error?.message || "Unknown error";
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: `Failed to fetch transactions: ${errorMessage}`,
      },
    };
  }
}

/**
 * Delete a transaction by ID
 */
export async function deleteTransaction(transactionId: number | string): Promise<ApiResponse<any>> {
  try {
    console.log("[API] Deleting transaction:", transactionId);
    
    const response = await apiRequest(`/transactions/transactions/${transactionId}/`, {
      method: "DELETE",
    });

    console.log("[API] Delete transaction response status:", response.status);
    console.log("[API] Delete transaction response headers:", Object.fromEntries(response.headers.entries()));

    // Read response body once
    let responseText = "";
    let result: any = null;
    
    try {
      responseText = await response.text();
      console.log("[API] Delete transaction response text:", responseText);
      if (responseText && responseText.trim()) {
        result = JSON.parse(responseText);
        console.log("[API] Delete transaction response data:", result);
      }
    } catch (error) {
      console.log("[API] Delete transaction - could not parse response:", error);
    }

    if (!response.ok) {
      const errorData = result || { message: `HTTP ${response.status}: ${response.statusText}` };
      console.error("[API] Delete transaction error response:", errorData);
      return {
        success: false,
        error: {
          code: response.status === 401 ? "UNAUTHORIZED" : response.status === 404 ? "NOT_FOUND" : "API_ERROR",
          message: errorData.message || errorData.detail || `Failed to delete transaction (${response.status})`,
          details: errorData,
        },
      };
    }

    // DELETE requests might have a JSON body with success message

    // Backend returns { success: True, message: "..." } on success
    if (result) {
      if (result.success === true || result.success === "True") {
        console.log("[API] Delete transaction - success from response body");
        return {
          success: true,
          data: result.data || null,
          message: result.message || "Transaction deleted successfully",
        };
      }
    }

    // If response is 200/204, consider it successful even without body
    // Django REST Framework returns 200 with JSON body: { success: True, message: "..." }
    // But if we got here, the response was 200 but we couldn't parse it or it doesn't have success field
    console.log("[API] Delete transaction - response OK (200), treating as success");
    console.log("[API] Delete transaction - result:", result);
    return {
      success: true,
      data: null,
      message: "Transaction deleted successfully",
    };
  } catch (error: any) {
    console.error("Delete transaction error:", error);
    const errorMessage = error?.message || "Unknown error";
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: `Failed to delete transaction: ${errorMessage}`,
      },
    };
  }
}

/**
 * Get card recommendation for a category
 */
export async function getCardRecommendation(data: {
  category: string;
  amount?: number;
}): Promise<ApiResponse<CardRecommendationData>> {
  try {
    console.log("[API] Getting card recommendation for category:", data.category);
    
    const response = await apiRequest("/transactions/recommend-card/", {
      method: "POST",
      body: JSON.stringify({
        category: data.category,
        amount: data.amount || 0,
      }),
    });

    console.log("[API] Card recommendation response status:", response.status);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
      }
      console.error("[API] Card recommendation error response:", errorData);
      return {
        success: false,
        error: {
          code: response.status === 401 ? "UNAUTHORIZED" : "API_ERROR",
          message: errorData.error || errorData.message || errorData.detail || `Failed to get card recommendation (${response.status})`,
          details: errorData,
        },
      };
    }

    const result = await response.json();
    console.log("[API] Card recommendation response data:", result);

    if (result.success && result.data) {
      return {
        success: true,
        data: result.data,
      };
    }

    console.warn("[API] Unexpected card recommendation response structure:", result);
    return {
      success: false,
      error: {
        code: "INVALID_RESPONSE",
        message: "Unexpected response format from server",
      },
    };
  } catch (error: any) {
    console.error("Get card recommendation error:", error);
    const errorMessage = error?.message || "Unknown error";
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: `Failed to get card recommendation: ${errorMessage}`,
      },
    };
  }
}

