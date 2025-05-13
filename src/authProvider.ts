// src/authProvider.ts

import { AuthProvider } from "@refinedev/core";

export const authProvider: AuthProvider = {
  login: async ({ token }) => {
    localStorage.setItem("token", token);
    return { success: true };
  },

  logout: async () => {
    localStorage.removeItem("token");
    return { success: true };
  },

  check: async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        return { authenticated: true };
      } else {
        return { authenticated: false, redirectTo: "/login" };
      }
    } catch (error) {
      return { authenticated: false, redirectTo: "/login" };
    }
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
