export function createSessionService (api) {
    return {

        getAll: async () => {
            return api.get (`/Session`);
        },

         getById: async (id) => {
            if(!id) {
                throw new Error ("Session id is required");
            }
            return api.get (`/Session/${id}`);
        },

         create: async (assignmentId, payload) => {
            if(!assignmentId) {
                throw new Error ("Assignment id is required");
            }
             if(!payload) {
                throw new Error ("Session payload is required");
            }
            return api.post (`/Session/${assignmentId}`, payload);
        },

        update: async (id, payload) => {
            if(!id) {
                throw new Error ("Session id is required");
            }
             if(!payload) {
                throw new Error ("Session payload is required");
            }
            return api.put (`/Session/${id}`, payload);
        },

         remove: async (id) => {
            if(!id) {
                throw new Error ("Session id is required");
            }
            return api.delete (`/Session/${id}`);
        },


    };
}