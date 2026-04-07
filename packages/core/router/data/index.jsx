import { createBrowserRouter } from "react-router-dom";
import { Register, ConsultantOnboarding } from "@zoplanner/register-page";
import { LoginPage } from "@zoplanner/login-page";
import { HomePage } from "@zoplanner/home-page";
import { AdminPage } from "@zoplanner/admin-page";

const router = createBrowserRouter([
  { path: "/register", element: <Register /> },
  { path: "/consultant-onboarding", element: <ConsultantOnboarding /> },
  { path: "/", element: <LoginPage /> },
  { path: "/login-page", element: <LoginPage /> },
  { path: "home-page", element: <HomePage /> },
  { path: "/home-page/:id", element: <HomePage /> },
  { path: "/admin-page/:id", element: <AdminPage /> },

  { path: "*", element: <h1>This is not the page you are looking for.</h1> },
]);

export { router };
