import path from "path"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "/",
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    host: "0.0.0.0", // Aceita requisições de qualquer host
    port: 5173,
    strictPort: true,
    cors: true,
    allowedHosts: ['.trycloudflare.com'], // Permite hosts do Cloudflare Tunnel
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 5173,
      clientPort: 5173,
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
      "Cache-Control": "no-cache, no-store, must-revalidate", // Força o navegador a não cachear
    },
    proxy: {
      "/api": {
        target: process.env.BACKEND_URL || "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  preview: {
    host: "0.0.0.0", // Aceita requisições de qualquer host
    port: 4173,
    strictPort: true,
    cors: true,
    proxy: {
      "/api": {
        target: process.env.BACKEND_URL || "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
})