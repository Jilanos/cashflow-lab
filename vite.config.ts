import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// sql.js ships a wasm asset; keep it excluded from dep pre-bundling so the
// worker/wasm loader resolves it at runtime.
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["sql.js"],
  },
});
