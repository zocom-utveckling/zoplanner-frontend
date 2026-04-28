export function createAuthService(api) {
  return {
    login: async (payload) => {
      if (!payload) {
        throw new Error("Login payload is required");
      }

      return api.post(`/Auth/login`, payload);
    },

    loginWithUsername: async ({ username, password }) => {
      if (!username || !password) {
        throw new Error("Username and password are required");
      }

      const user = await api.get(
        `/User/username/${encodeURIComponent(username)}`,
      );

      if (!user?.email) {
        throw new Error("Incorrect username or password");
      }

      return api.post(`/Auth/login`, {
        username,
        email: user.email,
        password,
      });
    },

    register: async (payload) => {
      if (!payload) {
        throw new Error("Register payload is required");
      }

      return api.post(`/Auth/register`, payload);
    },
  };
}