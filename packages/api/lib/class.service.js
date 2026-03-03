export function createClassService (api) {
    return {

        getAll: async () => {
            return api.get (`/Class`);
        },

        create: async (payload) => {
            if(!payload) {
                throw new Error ("Class payload is required");
            }
            return api.post (`/Class`, payload);
        },

        getById: async (id) => {
            if(!id) {
                throw new Error ("Class id is required");
            }
            return api.get (`/Class/${id}`);
        },

        update: async (id, payload) => {
            if(!id) {
                throw new Error ("Class id is required");
            }
            if(!payload) {
                throw new Error ("Class payload is required");
            }
            return api.patch (`/Class/${id}`, payload);
        },

        remove: async (id) => {
            if(!id) {
                throw new Error ("Class id is required");
            }
            return api.delete (`/Class/${id}`);
        },

        getByCustomerId: async (customerId) => {
            if(!customerId) {
                throw new Error ("Customer id is required");
            }
            return api.get (`/Class/customer/${customerId}`);
        }
    };
} 