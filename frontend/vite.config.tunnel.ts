import path from "path"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"

// Plugin customizado para desabilitar a verificação de host
const disableHostCheck = () => ({
  name: 'disable-host-check',
  configureServer(server) {
    // Desabilita completamente a verificação de host
    server.middlewares.use((req, res, next) => {
      // Remove headers que podem causar problemas
      delete req.headers['host']
      // Aceita qualquer host
      next()
    })
    
    // Desabilita a verificação de host do Vite
    server.config.server.host = '0.0.0.0'
  }
})

// Configuração específica para uso com Cloudflare Tunnel
// Desabilita HMR/WebSocket que causam problemas com túneis
export default defineConfig({
  plugins: [react(), disableHostCheck()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "/",
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: false,
    cors: true,
    // Permite qualquer host (necessário para Cloudflare Tunnel)
    allowedHosts: true,
    // Desabilita HMR para evitar problemas com túnel
    hmr: false,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
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
})