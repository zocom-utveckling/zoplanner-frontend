import { createBrowserRouter } from "react-router-dom";
import { Register } from "@zoplanner/register-page";
import {LoginPage} from "@zoplanner/login-page"



const router = createBrowserRouter([
  { path: "/register", element: <Register/>},
  {path:"/" ,element:<LoginPage/>},

  { path: "*", element: <h1>This is not the page you are looking for.</h1> },
]);

export { router };
