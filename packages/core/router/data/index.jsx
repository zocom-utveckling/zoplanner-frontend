import { createBrowserRouter } from "react-router-dom";
import { Register } from "@zoplanner/register-page";
import { LoginPage } from "@zoplanner/login-page";
import { HomePage } from "@zoplanner/home-page";
import { AdminPage } from "@zoplanner/admin-page";
import { Dashboard } from "@zoplanner/dashboard";
import { CoursesPage } from "@zoplanner/courses-page";
import { Profile_Page } from "../../../pages/profile-page/ui";
import { MessagesPage } from "@zoplanner/messages-page";

const router = createBrowserRouter([
  { path: "/register", element: <Register /> },
  { path: "/", element: <LoginPage /> },
  { path: "/login-page", element: <LoginPage /> },
  { path: "home-page", element: <HomePage /> },
  {path: "dashboard/:id",element:<HomePage/>},
  { path: "/home-page/:id", element: <HomePage /> },
  { path: "/admin-page/:id", element: <AdminPage /> },
  {path:"/assignment-page/:id",element:<CoursesPage/>},
  {path:"/profile/:id",element:<Profile_Page/>},
 
  {path:"/messages/:id",element:<MessagesPage/>},

  { path: "*", element: <h1>This is not the page you are looking for.</h1> },
]);

export { router };
