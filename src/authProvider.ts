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
    const token = localStorage.getItem("token");
    return token
      ? { authenticated: true }
      : { authenticated: false, redirectTo: "/login" };
  },

  getPermissions: async () => null,

  getIdentity: async () => ({
    name: "Admin",
    avatar: "",
  }),

  onError: async (error) => {
    console.error("Auth Error:", error);
    return {};
  },
};
