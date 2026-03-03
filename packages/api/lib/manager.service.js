export function createManagerService (api) {
    return {

        getAll: async () => {
        
            return api.get (`/Manager`);
        },

        getById: async (id) => {
            if(!id) {
                throw new Error ("Manager id is required");
            }
            return api.get (`/Manager/${id}`);
        },

        create: async (userId) => {
            if(!userId) {
                throw new Error ("Manager userId is required");
            }
            return api.post (`/Manager/${userId}`);
        },

        remove: async (id) => {
            if(!id) {
                throw new Error ("Manager id is required");
            }
            return api.delete (`/Manager/${id}`);
        },

        
    };
}