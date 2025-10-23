import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Contexto existente do seu app (mantido)
import { OperadorProvider } from '@/contexts/OperadorContext';

// Toast global (mantido)
import { Toaster } from '@/components/ui/toaster';

// Suas rotas atuais agrupadas (mantido)
import { AppRoutes } from '@/routes/routes';

// Tela já existente no seu projeto (mantida)
import CadastroProfissional from '@/components/profissionais/CadastroProfissional';

// ✅ NOVO: tela de aceite de termo (que criamos)
import TermoUso from '@/pages/operadores/TermoUso';

/**
 * App principal
 * - Mantém OperadorProvider e Toaster
 * - Mantém a rota direta /profissionais/novo que você já tinha aqui
 * - ✅ Adiciona /termo-uso FORA do PrivateRoute (fica acessível logo após o login,
 *   mesmo antes do contexto reidratar), sem alterar sua identidade visual.
 * - As demais rotas continuam centralizadas em <AppRoutes />
 */
const App: React.FC = () => {
    return (
        <Router>
            <OperadorProvider>
                <React.Suspense fallback={<div>Carregando...</div>}>
                    <Routes>
                        {/* ✅ Rota pública para aceite de termo (sem exigir PrivateRoute) */}
                        <Route path="/termo-uso" element={<TermoUso />} />

                        {/* ✅ Rota já existente no seu App.tsx (mantida) */}
                        <Route path="/profissionais/novo" element={<CadastroProfissional />} />

                        {/* 🔁 Todas as demais rotas ficam no agrupador existente */}
                        <Route path="/*" element={<AppRoutes />} />
                    </Routes>
                </React.Suspense>

                {/* Toaster global (mantido) */}
                <Toaster />
            </OperadorProvider>
        </Router>
    );
};

export default App;

