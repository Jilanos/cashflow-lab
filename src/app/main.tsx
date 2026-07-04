import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { LocalSqliteStorage } from "../storage/localSqlite";
import "./styles.css";

const storage = new LocalSqliteStorage();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App storage={storage} />
  </StrictMode>,
);
