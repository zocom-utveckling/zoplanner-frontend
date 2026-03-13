export function createAssignmentService(api) {
  return {
    getAll: async () => {
      return api.get(`/Assignment`);
    },

    getById: async (id) => {
      if (!id) {
        throw new Error("Assignment id is required");
      }
      return api.get(`/Assignment/${id}`);
    },

    create: async (payload) => {
      if (!payload) {
        throw new Error("Assignment payload is required");
      }
      return api.post(`/Assignment`, payload);
    },

    update: async (id, payload) => {
      if (!id) {
        throw new Error("Assignment id is required");
      }
      if (!payload) {
        throw new Error("Assignment payload is required");
      }
      return api.put(`/Assignment/${id}`, payload);
    },

    getSessions: async (id) => {
      if (!id) {
        throw new Error("Assignment id is required");
      }
      return api.get(`/Assignment/${id}/sessions`);
    },

    getByConsultantId: async (consultantId) => {
      if (!consultantId) {
        throw new Error("Consultant id is required");
      }
      return api.get(`/Assignment/consultant/${consultantId}`);
    },

    remove: async (id) => {
      if (!id) {
        throw new Error("Assignment id is required");
      }
      return api.delete(`/Assignment/${id}`);
    },
  };
}
