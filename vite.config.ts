import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Log Analysis tool",
        short_name: "Log tool",
        description: "Log Analysis tool",
        theme_color: "#202020",
        background_color: "#202020",
        start_url: "/",
        display: "standalone",
        lang: "en",
        scope: "/",
        icons: [
          {
            src: "/log.png",
            sizes: "512x512",
          },
        ],
        file_handlers: [
          {
            action: "/",
            accept: {
              "text/*": [".txt"],
            },
          },
        ],
      },
    }),
  ],
});
