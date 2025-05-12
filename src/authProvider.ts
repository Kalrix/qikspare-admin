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
  getIdentity: async () => null,
};
