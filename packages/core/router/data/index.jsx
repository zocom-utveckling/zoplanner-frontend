import { createBrowserRouter } from "react-router-dom";
import { Register } from "@zoplanner/register-page";
import { LoginPage } from "@zoplanner/login-page";
import { HomePage } from "@zoplanner/home-page";

const router = createBrowserRouter([
  { path: "/register", element: <Register /> },
  { path: "/", element: <LoginPage /> },
  { path: "/login-page", element: <LoginPage /> },
  { path: "home-page", element: <HomePage /> },
  { path: "/home-page/:id", element: <HomePage /> },

  { path: "*", element: <h1>This is not the page you are looking for.</h1> },
]);

export { router };
