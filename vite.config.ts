import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "robots.txt", "coparenting_icon.png"],
      manifest: {
        name: "Co-Parenting Tracker | eL Vision",
        short_name: "CoParent",
        description: "Sync budget & Calendar for Co-parenting",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "/coparenting_icon.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/coparenting_icon.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/coparenting_icon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));