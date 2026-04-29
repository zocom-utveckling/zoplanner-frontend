export function createConsultantService(api) {
    return {

        getAll: async () => {
            return api.get (`/Consultant`);
        },
       
        getMe: async () => {
         return api.get(`/Consultant/me`);
            },

        create: async (payload) => {
            if(!payload){
                throw new Error ("Consultant payload is required");
            }
            return api.post (`/Consultant`, payload);
        },

         getById: async (id) => {
            if(!id) {
                throw new Error ("Consultant id is required");
            }
            return api.get (`/Consultant/${id}`);
         },

         update: async (id, payload) => {
            if(!id) {
                throw new Error ("Consultant id is required");
            }
            if(!payload) {
                throw new Error ("Consultant payload is required");
            }
            return api.put (`/Consultant/${id}`, payload);
         },

         remove: async (id) => {
            if (!id) {
                throw new Error ("Consultant id is required");
            }
            return api.delete (`/Consultant/${id}`);
         }



    };
}