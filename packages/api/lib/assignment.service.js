export function createAssignmentService(api) {
  return {
    getAll: async () => {
      return api.get(`/assignments`);
    },

    getById: async (id) => {
      if (!id) {
        throw new Error("Assignment id is required");
      }
      return api.get(`/assignments/${id}`);
    },

    create: async (payload) => {
      if (!payload) {
        throw new Error("Assignment payload is required");
      }
      return api.post(`/assignments`, payload);
    },

    update: async (id, payload) => {
      if (!id) {
        throw new Error("Assignment id is required");
      }
      if (!payload) {
        throw new Error("Assignment payload is required");
      }
      return api.put(`/assignments/${id}`, payload);
    },

    getSessions: async (id) => {
      if (!id) {
        throw new Error("Assignment id is required");
      }
      return api.get(`/assignments/${id}/sessions`);
    },

    getByConsultantId: async (consultantId) => {
      if (!consultantId) {
        throw new Error("Consultant id is required");
      }
      return api.get(`/assignments/consultant/${consultantId}`);
    },

    remove: async (id) => {
      if (!id) {
        throw new Error("Assignment id is required");
      }
      return api.delete(`/assignments/${id}`);
    },
  };
}
