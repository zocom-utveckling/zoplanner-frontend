export function createUserService(api) {
    return {
        getById: async (id) => {
            if (!id){
                throw new Error("User id is requiered");
            }
            return api.get(`/User/${id}`);
        }
    };
}