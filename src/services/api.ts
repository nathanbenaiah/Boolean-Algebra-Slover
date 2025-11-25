/**
 * API Service Layer for Boolean Algebra Solver Backend
 * Provides functions to communicate with the backend API
 * Falls back to client-side processing if backend is unavailable
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ApiError {
  error: string;
  message: string;
  details?: string;
}

interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

/**
 * Check if backend is available
 */
async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Generic API request handler with error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'Request failed',
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      return { error: errorData };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: {
        error: 'Network error',
        message: error instanceof Error ? error.message : 'Failed to connect to backend',
      },
    };
  }
}

/**
 * Process expression with all available tools
 */
export async function processExpression(
  expression: string,
  options: Record<string, unknown> = {}
): Promise<ApiResponse<any>> {
  return apiRequest('/api/process-expression', {
    method: 'POST',
    body: JSON.stringify({ expression, options }),
  });
}

/**
 * Simplify Boolean expression
 */
export async function simplifyExpression(
  expression: string,
  method: string = 'auto'
): Promise<ApiResponse<{
  original: string;
  simplified: string;
  steps: Array<{
    expression: string;
    rule: string;
    description: string;
  }>;
  rules: string[];
  method: string;
}>> {
  return apiRequest('/api/simplify', {
    method: 'POST',
    body: JSON.stringify({ expression, method }),
  });
}

/**
 * Generate truth table
 */
export async function generateTruthTable(
  expression: string
): Promise<ApiResponse<{
  expression: string;
  variables: string[];
  table: Array<{
    inputs: Record<string, boolean>;
    output: boolean;
    minterm?: number;
    maxterm?: number;
  }>;
  minterms: number[];
  maxterms: number[];
}>> {
  return apiRequest('/api/truth-table', {
    method: 'POST',
    body: JSON.stringify({ expression }),
  });
}

/**
 * Generate Karnaugh map
 */
export async function generateKarnaughMap(
  expression: string
): Promise<ApiResponse<{
  expression: string;
  karnaughMap: any;
  simplifiedSOP: string;
  simplifiedPOS: string;
}>> {
  return apiRequest('/api/karnaugh-map', {
    method: 'POST',
    body: JSON.stringify({ expression }),
  });
}

/**
 * Generate logic circuit
 */
export async function generateLogicCircuit(
  expression: string
): Promise<ApiResponse<{
  expression: string;
  circuit: {
    gates: any[];
    connections: any[];
    optimization: any;
  };
}>> {
  return apiRequest('/api/logic-circuit', {
    method: 'POST',
    body: JSON.stringify({ expression }),
  });
}

/**
 * Check backend health
 */
export { checkBackendHealth };

/**
 * Get API base URL
 */
export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

