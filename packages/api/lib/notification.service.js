export function createNotificationService(api) {
    return {

         send: async (payload) => {
            if(!payload) {
                throw new Error ("Notification payload is required");
            }
            return api.post (`/Notification/send`, payload);
        },

         receive: async () => {
           
            return api.get (`/Notification/receive`);
        },


    }
}