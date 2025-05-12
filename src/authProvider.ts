export const authProvider = {
  login: async ({ token }: { token: string }) => {
    localStorage.setItem("token", token);
    return { success: true };
  },
  logout: async () => {
    localStorage.removeItem("token");
    return { success: true };
  },
  checkAuth: async () => {
    const token = localStorage.getItem("token");
    return token ? { authenticated: true } : { authenticated: false };
  },
  getPermissions: async () => null,
  getIdentity: async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    // Optional: decode token or fetch user details here
    return {
      id: "user", // Replace with real ID if available
      name: "User", // Replace with name if available
    };
  },
  check: async () => {
    const token = localStorage.getItem("token");
    return token ? { authenticated: true } : { authenticated: false };
  },
  onError: async (error: any) => {
    console.error("Auth error:", error);
    return { logout: false };
  },
};
