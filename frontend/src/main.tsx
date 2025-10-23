import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import { Toaster } from "@/components/ui/toaster"

// Importações de estilo
import './index.css'
import './App.css'

// 1. ✅ Crie uma instância do QueryClient
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Configurações globais para as queries, se desejar.
            // Por exemplo, definir um staleTime padrão para evitar refetchs imediatos.
            staleTime: 1000 * 60 * 5, // 5 minutos
        },
    },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        {/* 2. ✅ Envolva sua aplicação com o QueryClientProvider */}
        <QueryClientProvider client={queryClient}>
            <App />
            <Toaster />
        </QueryClientProvider>
    </React.StrictMode>,
)