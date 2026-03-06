export function createCustomerService (api) {
    return {

        getAll: async () => {
            return api.get (`/Customer`);
        },

          getById: async (id) => {
            if(!id) {
                throw new Error ("Customer id is required");
            }
            return api.get (`/Customer/${id}`);
        },

        create: async (payload) => {
            if(!payload) {
                throw new Error ("Customer payload is required");
            }
            return api.post (`/Customer`, payload);
        },

         update: async (id, payload) => {
            if(!id) {
                throw new Error ("Customer id is required");
            }
            if(!payload) {
                throw new Error ("Customer payload is required");
            }
            return api.patch (`/Customer/${id}`, payload);
        },

        createImage: async (id, image) => {
            if(!id) {
                throw new Error ("Customer id is required");
            }
             if(!image) {
                throw new Error ("Image is required");
            }
            return api.post (`/Customer/${id}/image`, image);
        },

        removeImage: async (id) => {
            if(!id) {
                throw new Error ("Customer id is required");
            }
            return api.delete (`/Customer/${id}/image`);
        },

          remove: async (id) => {
            if(!id) {
                throw new Error ("Customer id is required");
            }
            return api.delete (`/Customer/${id}`);
        },

    };
}