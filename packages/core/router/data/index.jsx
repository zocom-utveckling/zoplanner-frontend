import { createBrowserRouter } from "react-router-dom";

import { LoginPage } from "@zoplanner/login-page";

const router = createBrowserRouter([
  { path: "/", element: <LoginPage /> },
  { path: "*", element: <h1>This is not the page you are looking for.</h1> },
]);

export { router };
