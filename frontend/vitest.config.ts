// 1. Importa a função defineConfig específica do Vitest
import { defineConfig } from "vitest/config";

// 2. Importa o plugin React para funcionar com componentes React nos testes
import react from "@vitejs/plugin-react-swc";

// 3. Importa path para resolver caminhos de arquivos
import path from "path";

// 4. Exporta a configuração do Vitest
export default defineConfig({
    // 5. Configura os plugins necessários (React)
    plugins: [react()],

    // 6. Configura alias de importação (mesmo do vite.config.ts)
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"), // Permite usar @/components/...
        },
    },

    // 7. Configurações específicas de teste
    test: {
        globals: true,           // Permite usar describe, it, expect globalmente
        environment: "jsdom",    // Simula um browser para testar componentes React
        setupFiles: ["./src/setupTests.ts"], // Arquivo que roda antes de cada teste
    },
});