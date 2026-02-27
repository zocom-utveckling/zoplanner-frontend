import { createApiClient } from "./lib/client";
import { createUserService } from "./lib/user.service";
import { createCalendarService } from "./lib/calendar.service";

const api = createApiClient({
    baseUrl: "http://localhost:5027/api",
    getToken: ( ) => localStorage.getItem("token"),
});

export const userService
= createUserService(api);
 export const calendarService = createCalendarService(api);