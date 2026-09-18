import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Global layers load before any component styles: tokens, then base elements,
// then shared keyframes and utility classes.
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/keyframes.css";
import "./styles/shared.css";
import App from "./app";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
