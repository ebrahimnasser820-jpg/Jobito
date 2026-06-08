export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const getCommonHeaders = (additionalHeaders: Record<string, string> = {}) => {
  const token = localStorage.getItem("token");
  const lang = localStorage.getItem("jobito_language") || "en";
  
  return {
    "x-lang": lang,
    "ngrok-skip-browser-warning": "69420",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...additionalHeaders,
  };
};
