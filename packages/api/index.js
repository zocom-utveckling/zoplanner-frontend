import { createApiClient } from "./lib/client";
import { createUserService } from "./lib/user.service";
import { createAssignmentService } from "./lib/assignment.service";
import { createAuthService } from "./lib/auth.service";
import { createClassService } from "./lib/class.service";
import { createConsultantService } from "./lib/consultant.service";
import { createCourseService } from "./lib/course.service";
import { createCustomerService } from "./lib/customer.service";
import { createManagerService } from "./lib/manager.service";
import { createNotificationService } from "./lib/notification.service";
import { createSessionService } from "./lib/session.service";

const api = createApiClient({
    baseUrl: "http://localhost:5027/api",
    getToken: ( ) => localStorage.getItem("token"),
});

export const userService
= createUserService(api);

 export const assignmentService
  = createAssignmentService(api);
 
 export const authService
= createAuthService(api);

 export const classService
  = createClassService(api);

 export const consultantService
= createConsultantService(api);

 export const courseService 
 = createCourseService(api);

 export const managerService
= createManagerService(api);

 export const customerService 
 = createCustomerService(api);
 
 export const notificationService 
 = createNotificationService(api);

 export const sessionService 
 = createSessionService(api);