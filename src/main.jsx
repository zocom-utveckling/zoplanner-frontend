import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import App from "./App.jsx";

const savedTheme = localStorage.getItem("theme");
const initialTheme =
  savedTheme ||
  (window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
    ? "dark"
    : "light");

document.documentElement.setAttribute("data-theme", initialTheme);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
