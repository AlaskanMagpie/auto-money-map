import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import PasswordGate from "./gate/PasswordGate";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PasswordGate>{(role) => <App isAdmin={role === "admin"} />}</PasswordGate>
  </StrictMode>,
);
