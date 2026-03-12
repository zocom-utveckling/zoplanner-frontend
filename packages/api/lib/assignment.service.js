export function createAssignmentService(api) {
  return {
    getAll: async () => {
      return api.get(`/Assignments`);
    },

    getById: async (id) => {
      if (!id) {
        throw new Error("Assignment id is required");
      }
      return api.get(`/Assignments/${id}`);
    },

    create: async (payload) => {
      if (!payload) {
        throw new Error("Assignment payload is required");
      }
      return api.post(`/Assignments`, payload);
    },

    update: async (id, payload) => {
      if (!id) {
        throw new Error("Assignment id is required");
      }
      if (!payload) {
        throw new Error("Assignment payload is required");
      }
      return api.put(`/Assignments/${id}`, payload);
    },

    getSessions: async (id) => {
      if (!id) {
        throw new Error("Assignment id is required");
      }
      return api.get(`/Assignments/${id}/sessions`);
    },

    getByConsultantId: async (consultantId) => {
      if (!consultantId) {
        throw new Error("Consultant id is required");
      }
      return api.get(`/Assignments/consultant/${consultantId}`);
    },

    remove: async (id) => {
      if (!id) {
        throw new Error("Assignment id is required");
      }
      return api.delete(`/Assignments/${id}`);
    },
  };
}
