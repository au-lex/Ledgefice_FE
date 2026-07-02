// src/api/lib/axios.ts
import axios from "axios";

export const AUTH_TOKEN_KEY = "ledgefice_token";

const api = axios.create({
  baseURL: "https://lawyerly-tealess-annett.ngrok-free.dev/api/v1",
  // baseURL: "https://your-production-url.com/api/v1",
  headers: {
    // Bypasses ngrok's free-tier browser warning interstitial — otherwise
    // ngrok returns an HTML warning page (no CORS headers) instead of
    // proxying through to the backend, which shows up as a CORS error.
    // Safe to leave in for production too since it's a no-op there.
    "ngrok-skip-browser-warning": "true",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      window.location.href = "/login";
    }

    const message =
      error?.response?.data?.message ??
      error?.response?.data?.error ??
      error.message ??
      "Something went wrong";

    return Promise.reject(new Error(message));
  },
);

export default api;