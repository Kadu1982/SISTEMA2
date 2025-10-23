/**
 * src/services/apiService.ts
 * -----------------------------------------------------------------------------
 * Instância Axios (Axios v1) com interceptors robustos:
 * - baseURL: .env (VITE_API_BASE_URL) ou fallback '/api'
 * - withCredentials + CSRF (XSRF-TOKEN -> X-XSRF-TOKEN)
 * - Injeta automaticamente:
 *     - Authorization: Bearer <token>
 *     - X-Tenant-ID
 *     - X-Unidade-Id
 * - Lê token/tenant/unidade de várias chaves (string pura ou dentro de JSON)
 * - Logs de diagnóstico em 401/403 (sem expor segredos)
 * - **NOVO**: respeita header 'X-Skip-Auth: true' para pular Authorization em rotas públicas
 */

import axios, {
    AxiosError,
    AxiosHeaders,
    InternalAxiosRequestConfig,
} from "axios";

// ---------------------------------------------------------
// Constantes de headers e chaves usais de armazenamento
// ---------------------------------------------------------
const TENANT_HEADER = "X-Tenant-ID";
const UNIDADE_HEADER = "X-Unidade-Id";

// Chaves comuns onde seu app pode ter salvo valores
const TOKEN_KEYS = ["token", "authToken", "jwt", "access_token"];
const TENANT_KEYS = ["tenant", "tenantId", "TENANT_ID", TENANT_HEADER];
const UNIDADE_KEYS = ["unidade", "unidadeId", "UNIDADE_ID", UNIDADE_HEADER];

// Sessões JSON comuns
const SESSION_KEYS = ["session", "user", "operator", "operador"];

// ---------------------------------------------------------
// Utilidades seguras para leitura de storage
// ---------------------------------------------------------
function safeGet(storage: Storage, key: string): string | undefined {
    try {
        const v = storage.getItem(key);
        return v ?? undefined;
    } catch {
        return undefined;
    }
}

function parseJSON<T = any>(raw?: string): T | undefined {
    if (!raw) return undefined;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return undefined;
    }
}

/**
 * Procura um valor (string) em:
 *  - chaves simples (string pura)
 *  - dentro de JSON das SESSION_KEYS (ex.: { token, tenantId, unidadeId })
 */
function readStringDeep(
    keys: string[],
    jsonFieldNames: string[],
): string | undefined {
    // 1) busca direta em localStorage / sessionStorage
    for (const store of [localStorage, sessionStorage]) {
        for (const k of keys) {
            const raw = safeGet(store, k);
            if (raw && typeof raw === "string" && raw.trim()) {
                return raw;
            }
        }
    }
    // 2) busca dentro de JSONs conhecidos (session, user, operador…)
    for (const store of [localStorage, sessionStorage]) {
        for (const sk of SESSION_KEYS) {
            const raw = safeGet(store, sk);
            const obj = parseJSON<Record<string, any>>(raw);
            if (obj && typeof obj === "object") {
                for (const f of jsonFieldNames) {
                    const v = obj[f];
                    if (typeof v === "string" && v.trim()) return v;
                    // às vezes vem como number (ex.: ids)
                    if (typeof v === "number") return String(v);
                }
            }
        }
    }
    return undefined;
}

function toBearer(raw?: string): string | undefined {
    if (!raw) return undefined;
    const t = raw.trim();
    if (!t) return undefined;
    return /^Bearer\s+/i.test(t) ? t : `Bearer ${t}`;
}

function looksLikeJwt(s: string) {
    return /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(s.trim());
}

function pickToken(): string | undefined {
    // tenta em TOKEN_KEYS diretamente
    let t = readStringDeep(TOKEN_KEYS, ["token", "authToken", "jwt", "access_token"]);
    // tenta dentro do JSON de 'session' (ou similares)
    if (!t) {
        for (const store of [localStorage, sessionStorage]) {
            for (const sk of SESSION_KEYS) {
                const raw = safeGet(store, sk);
                const obj = parseJSON<Record<string, any>>(raw);
                if (obj && typeof obj === "object") {
                    // nomes comuns:
                    const cand =
                        obj.token ||
                        obj.authToken ||
                        obj.jwt ||
                        obj.access_token ||
                        (obj.auth && obj.auth.token) ||
                        (obj.tokens && (obj.tokens.access || obj.tokens.token));
                    if (typeof cand === "string" && cand.trim()) {
                        t = cand;
                        break;
                    }
                }
            }
            if (t) break;
        }
    }
    if (t && looksLikeJwt(t)) return t;
    // Algumas apps salvam "Bearer <jwt>"
    const maybe = toBearer(t);
    return maybe?.replace(/^Bearer\s+/i, "");
}

function pickTenantId(): string | undefined {
    return readStringDeep(TENANT_KEYS, ["tenant", "tenantId", "TENANT_ID"]);
}

function pickUnidadeId(): string | undefined {
    return readStringDeep(UNIDADE_KEYS, ["unidade", "unidadeId", "UNIDADE_ID"]);
}

// ---------------------------------------------------------
// Instância Axios
// ---------------------------------------------------------
const baseURL =
    (import.meta as any)?.env?.VITE_API_BASE_URL?.toString() || "/api";

export const apiService = axios.create({
    baseURL,
    withCredentials: true, // para CSRF/sessão quando a API for same-origin
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
    timeout: 20000,
});

// ---------------------------------------------------------
// REQUEST INTERCEPTOR
// - injeta Authorization, Tenant e Unidade, a menos que X-Skip-Auth:true
// ---------------------------------------------------------
apiService.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // Permite pular Authorization explicitamente
    const headers = (config.headers ||= {} as AxiosHeaders) as any;
    const skipAuth =
        headers["X-Skip-Auth"] === true || headers["X-Skip-Auth"] === "true";

    // Authorization
    if (!skipAuth) {
        const token = pickToken();
        if (token) {
            headers["Authorization"] = toBearer(token);
        }
    }

    // Tenant e Unidade
    const tenantId = pickTenantId();
    if (tenantId && !headers[TENANT_HEADER]) {
        headers[TENANT_HEADER] = tenantId;
    }

    const unidadeId = pickUnidadeId();
    if (unidadeId && !headers[UNIDADE_HEADER]) {
        headers[UNIDADE_HEADER] = unidadeId;
    }

    return config;
});

// ---------------------------------------------------------
// RESPONSE INTERCEPTOR
// - logs amigáveis para 401/403, sem expor segredos
// ---------------------------------------------------------
apiService.interceptors.response.use(
    (resp) => resp,
    (err: AxiosError) => {
        const status = err.response?.status;
        if (status === 401 || status === 403) {
            try {
                const h = new AxiosHeaders(err.config?.headers || {});
                // Log de diagnóstico sem expor token
                const hasAuth = h.has("Authorization");
                const hasTenant = h.has(TENANT_HEADER);
                const hasUnidade = h.has(UNIDADE_HEADER);

                // Evita logar tokens
                if (hasAuth) h.delete("Authorization");

                console.warn(
                    `[API ${status}]`,
                    JSON.stringify(
                        {
                            url: err.config?.url,
                            method: err.config?.method,
                            baseURL: err.config?.baseURL,
                            hasAuth,
                            hasTenant,
                            hasUnidade,
                        },
                        null,
                        2
                    )
                );
            } catch {
                // ignora falhas de log
            }
        }
        return Promise.reject(err);
    }
);

export default apiService;
