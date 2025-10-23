// src/components/auth/ProtectedRoute.tsx
// -----------------------------------------------------------------------------
// Rota protegida com suporte a bypass de Operador Master (operador.isMaster).
// Compatível com operador.perfis sendo:
//  - array de strings (["ADMIN_SISTEMA", "MEDICO"])
//  - array de objetos ({ codigo: string, nome?: string }[])
//
// NÃO depende de '@/types/perfil' para compilar.
// NÃO altera identidade visual.
// -----------------------------------------------------------------------------

import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useOperador } from "@/contexts/OperadorContext";

/**
 * Códigos de perfis aceitos na rota. Ex.: ["ADMIN_SISTEMA", "MEDICO"]
 * Se não informar 'perfisPermitidos', a rota exige apenas estar logado.
 */
type PerfilCodigo = string;

interface ProtectedRouteProps {
    perfisPermitidos?: PerfilCodigo[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ perfisPermitidos }) => {
    const { operador, token } = useOperador();
    const location = useLocation();

    // 1) Autenticação básica: precisa de operador e token
    if (!operador || !token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2) Operador Master tem acesso irrestrito (bypass total)
    if (operador.isMaster) {
        return <Outlet />;
    }

    // 3) Caso existam perfis exigidos, verifica permissão
    if (perfisPermitidos && perfisPermitidos.length > 0) {
        // Normaliza códigos de perfis do operador para uma lista de strings
        const codigosDoOperador: string[] = Array.isArray(operador.perfis)
            ? operador.perfis.map((p: any) =>
                typeof p === "string" ? p : (p?.codigo ?? p)
            )
            : [];

        const autorizado = perfisPermitidos.some((requerido) =>
            codigosDoOperador.includes(requerido)
        );

        if (!autorizado) {
            return <Navigate to="/nao-autorizado" replace />;
        }
    }

    // 4) Acesso concedido
    return <Outlet />;
};

export default ProtectedRoute;
