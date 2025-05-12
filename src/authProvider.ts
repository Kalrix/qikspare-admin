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
  checkAuth: async () => {
    return localStorage.getItem("token")
      ? { authenticated: true }
      : { authenticated: false, redirectTo: "/login" };
  },
  getPermissions: async () => {
    return null;
  },
  getIdentity: async () => {
    return {
      name: "Admin",
      avatar: "",
    };
  },
  // ✅ Add these two missing methods to fix the build error:
  check: async () => {
    return localStorage.getItem("token")
      ? { authenticated: true }
      : { authenticated: false };
  },
  onError: async (error) => {
    console.error("Auth Error:", error);
    return {};
  },
};
