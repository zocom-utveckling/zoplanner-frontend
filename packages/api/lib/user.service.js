export function createUserService(api) {
  return {
    getAll: async () => {
      return api.get(`/User`);
    },

    getById: async (id) => {
      if (!id) {
        throw new Error("User id is required");
      }
      return api.get(`/User/${id}`);
    },

    getByUsername: async (username) => {
      if (!username) {
        throw new Error("Username is required");
      }
      return api.get(`/User/username/${encodeURIComponent(username)}`);
    },

    create: async (payload) => {
      if (!payload) {
        throw new Error("User payload is required");
      }
      return api.post(`/User`, payload);
    },

    update: async (id, payload) => {
      if (!id) {
        throw new Error("User id is required");
      }
      if (!payload) {
        throw new Error("Payload is required.");
      }

      return api.put(`/User/${id}`, payload);
    },

    uploadProfilePicture: async (id, file) => {
      if (!id) {
        throw new Error("User id is required");
      }
      if (!file) {
        throw new Error("File is required");
      }

      const formData = new FormData();
      formData.append("file", file);

      return api.postForm(`/User/${id}/profile-picture`, formData);
    },

    remove: async (id) => {
      if (!id) {
        throw new Error("User id is required");
      }
      return api.delete(`/User/${id}`);
    },
  };
}
