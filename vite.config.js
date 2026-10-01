import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Chrome keeps a live reference to every object handed to console.log, so a
  // debug log that prints a fetched list keeps that whole list out of the
  // garbage collector's reach. Enough menu switches and the tab bloats until it
  // stalls. Drop the calls from production builds; console.error/warn stay.
  esbuild: {
    pure: ["console.log", "console.info", "console.debug"],
  },
});
