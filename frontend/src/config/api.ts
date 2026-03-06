// API Configuration

// Get environment variables
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const OPENAI_ENDPOINT =
  import.meta.env.VITE_OPENAI_ENDPOINT || "/analyze-transactions-openai";
const OLLAMA_ENDPOINT =
  import.meta.env.VITE_OLLAMA_ENDPOINT || "/analyze-transactions";

// API Provider type
export type ApiProvider = "openai" | "ollama";

// Current provider - change this to switch between OpenAI and Ollama
export const CURRENT_PROVIDER: ApiProvider = "openai";

// API Configuration
export const API_CONFIG = {
  baseURL: API_URL,
  endpoints: {
    openai: OPENAI_ENDPOINT,
    ollama: OLLAMA_ENDPOINT,
  },
  timeout: 300000, // 5 minutes for AI processing (OpenAI can be slow)
};

// Get the current endpoint based on provider
export const getAnalyzeEndpoint = (provider?: ApiProvider): string => {
  const activeProvider = provider || CURRENT_PROVIDER;
  return `${API_CONFIG.baseURL}${API_CONFIG.endpoints[activeProvider]}`;
};

// API Error types
export interface ApiError {
  message: string;
  error?: string;
  details?: string;
  source?: string;
}

// Check if error is an ApiError
export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as ApiError).message === "string"
  );
};

// Format error message for display
export const formatErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.details || error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
};
