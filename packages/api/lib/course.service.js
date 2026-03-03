export function createCourseService (api) {
    return {

        getAll: async () => {
            return api.get (`/Course`);
        },

        create: async (payload) => {
            if(!payload) {
                throw new Error ("Course payload is required");
            }
            return api.post (`/Course`, payload);
        },

        getById: async (id) => {
            if(!id) {
                throw new Error ("Course id is required");
            }
            return api.get (`/Course/${id}`);
        },

        // Det finns PUT i backend också.
        //  Patch räcker för vår updates.
        
        update: async (id, payload) => {
            if(!id) {
                throw new Error ("Course id is required");
            }
             if(!payload) {
                throw new Error ("Course payload is required");
            }
            return api.patch (`/Course/${id}`, payload);
        },

        remove: async (id) => {
            if(!id) {
                throw new Error ("Course id is required");
            }
            return api.delete (`/Course/${id}`);
        },


        getByClassId: async (classId) => {
            if(!classId) {
                throw new Error ("Class id is required");
            }
            return api.get (`/Course/class/${classId}`);
        }

    }

}
