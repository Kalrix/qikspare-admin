// src/authProvider.ts
import { AuthProvider } from "@refinedev/core";

export const authProvider: AuthProvider = {
  login: async ({ token }) => {
    if (token) {
      localStorage.setItem("token", token);
      return { success: true, redirectTo: "/dashboard" };
    }
    return { success: false };
  },

  logout: async () => {
    localStorage.removeItem("token");
    return { success: true, redirectTo: "/login" };
  },

  check: async () => {
    const token = localStorage.getItem("token");
    if (token) {
      return { authenticated: true };
    }
    return { authenticated: false, redirectTo: "/login" };
  },

  getPermissions: async () => null,

  getIdentity: async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return {
      name: "Admin",
      avatar: "",
    };
  },

  onError: async (error) => {
    console.error("Auth Error:", error);
    return {};
  },
};
