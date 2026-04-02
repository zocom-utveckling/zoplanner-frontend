export function createActivityService(api) {
  return {
    getAll: async () => {
      return api.get(`/Activities`);
    },

    getById: async (id) => {
      if (!id) {
        throw new Error("Activity id is required");
      }
      return api.get(`/Activities/${id}`);
    },

    create: async (payload) => {
      if (!payload) {
        throw new Error("Activity payload is required");
      }
      return api.post(`/Activities`, payload);
    },

    update: async (id, payload) => {
      if (!id) {
        throw new Error("Activity id is required");
      }
      if (!payload) {
        throw new Error("Activity payload is required");
      }
      return api.patch(`/Activities/${id}`, payload);
    },

    remove: async (id) => {
      if (!id) {
        throw new Error("Activity id is required");
      }
      return api.delete(`/Activities/${id}`);
    },
  };
}
