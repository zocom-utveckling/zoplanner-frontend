export function createAuthService(api) {
    return {

        login: async (payload) => {
            if (!payload) {
                throw new Error("Login payload is required");
            }
            return api.post(`/Auth/login`, payload);
        },

        register: async (payload) => {
            if(!payload) {
                throw new Error ("Register payload is required")
            }
            return api.post (`/Auth/register`, payload);
        }
    };


    }
