// src/config.ts
const isProduction = import.meta.env.PROD;

export const API_BASE_URL = isProduction
  ? "https://qikspare-api.onrender.com"
  : "http://localhost:8000";
