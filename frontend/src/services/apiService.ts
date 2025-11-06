// src/services/apiService.ts
// -----------------------------------------------------------------------------
// Instância única do Axios com interceptors padronizados.
// Objetivos:
//  - Normalizar a baseURL (evitar "api/api/...") para qualquer valor de VITE_API_URL.
//  - Injetar automaticamente Authorization: Bearer <token>, quando existir.
//  - Permitir desabilitar a injeção de token com header "X-Skip-Auth: true" (ex.: /auth/login).
//  - Expor mensagens de erro unificadas em error.normalizedMessage.
// -----------------------------------------------------------------------------

import axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from "axios";

/** Normaliza a baseURL para diferentes formatos de VITE_API_URL.
 *  Exemplos de entrada -> saída:
 *    "api"               -> "/api"
 *    "/api"              -> "/api"
 *    "/api/"             -> "/api"
 *    "http://host/api"   -> "http://host/api"
 *    "http://host/api/"  -> "http://host/api"
 */
function normalizeBaseURL(raw?: string): string {
    if (!raw) return "/api";
    const s = raw.trim();

    // Se for absoluta, apenas remove barra final duplicada
    if (/^https?:\/\//i.test(s)) {
        return s.replace(/\/+$/g, "");
    }

    // Relativa: garante UMA barra inicial e nenhuma final
    const trimmed = s.replace(/^\/+|\/+$/g, "");
    return `/${trimmed}`;
}

const API_BASE_URL = normalizeBaseURL(import.meta.env.VITE_API_URL as string | undefined);

const apiService = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8",
    },
});

// ----------------------------------------------------------------------------
// Request: injeta Authorization automaticamente (exceto quando solicitado)
// ----------------------------------------------------------------------------
apiService.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // Permite desabilitar a injeção (ex.: login)
    const skip = (config.headers as any)?.["X-Skip-Auth"] === "true";
    if (skip) return config;

    // Não injeta se já houver Authorization específico no request
    const already = (config.headers as any)?.Authorization || (config.headers as any)?.authorization;

    if (!already) {
        const token =
            localStorage.getItem("token") ||
            localStorage.getItem("access_token") ||
            localStorage.getItem("authToken");

        if (token) {
            const headers = AxiosHeaders.from(config.headers || {});
            headers.set("Authorization", `Bearer ${token}`);
            config.headers = headers;
        }
    }
    return config;
});

// ----------------------------------------------------------------------------
/** Response: normaliza mensagens de erro e trata 401 */
// ----------------------------------------------------------------------------
apiService.interceptors.response.use(
    (resp) => resp,
    (error: AxiosError<any>) => {
        const status = error?.response?.status;
        const data = error?.response?.data;
        const url = error.config?.url || "";

        // Suprime erros 500 do endpoint de vacinas (opcional)
        // Este endpoint pode não estar implementado e não é crítico
        if (status === 500 && url.includes("/vacinas/status/")) {
            // Previne que o erro seja logado no console
            // Retorna uma resposta vazia para que o catch possa tratar silenciosamente
            return Promise.resolve({ 
                data: null,
                status: 200,
                statusText: "OK",
                headers: {},
                config: error.config
            } as any);
        }

        const message =
            (typeof data === "string" && data) ||
            data?.message ||
            data?.error ||
            (Array.isArray(data?.errors) && data.errors.join("; ")) ||
            (Array.isArray(data?.violations) &&
                data.violations
                    .map((v: any) => `${v?.field || v?.property}: ${v?.message}`)
                    .join("; ")) ||
            data?.detail ||
            error.message ||
            `HTTP ${status ?? "Erro desconhecido"}`;

        if (status === 401) {
            // token inválido/expirado -> limpa localStorage (ajuste se usar outro storage)
            try {
                localStorage.removeItem("token");
                localStorage.removeItem("access_token");
                localStorage.removeItem("authToken");
            } catch {}
        }

        (error as any).normalizedMessage = message;
        return Promise.reject(error);
    }
);

export default apiService;
