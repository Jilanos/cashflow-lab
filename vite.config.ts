import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// sql.js ships as CommonJS, so it MUST be pre-bundled by esbuild (do not
// exclude it) or the browser receives raw CJS and the app fails to load. The
// wasm binary is provided separately via a `?url` import + locateFile in
// src/storage/localSqlite.ts, so no runtime auto-locate is needed.
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["sql.js"],
  },
});
