// src/services/authService.ts
// Serviço de autenticação compatível com o Login.tsx:
// - aceita login({ login, senha }) ou login(loginStr, senha)
// - retorna { token, operador } (operador = alias para user/usuario/etc.)
// - usa header "X-Skip-Auth: true" para o interceptor não injetar Authorization
// - tenta 3 formatos de payload: {login,senha} → {username,password} → x-www-form-urlencoded

import apiService from "./apiService";

/** Tipagem do parâmetro aceito pelo login */
type LoginObject = { login: string; senha: string };

/** Resposta crua potencial (cada backend usa um nome) */
type RawLoginResponse = any;

/** Extrai token de formatos comuns */
function extractToken(data: RawLoginResponse): string | undefined {
    return (
        data?.token ||
        data?.access_token ||
        data?.data?.token ||
        data?.data?.access_token
    );
}

/** Extrai operador (alias para usuário) de formatos comuns */
function extractOperador(data: RawLoginResponse): any {
    return (
        data?.operador ||
        data?.user ||
        data?.usuario ||
        data?.data?.operador ||
        data?.data?.user ||
        data?.data?.usuario ||
        null
    );
}

/** Persiste token/operador nos storages e no axios default (quando houver) */
function persistAuth(token?: string, operador?: any) {
    if (token) {
        try {
            localStorage.setItem("token", token);
            localStorage.setItem("access_token", token);
            // injeta em chamadas futuras (sem esbarrar em tipagem do Axios)
            (apiService.defaults.headers as any).Authorization = `Bearer ${token}`;
        } catch {}
    }
    if (operador) {
        try {
            localStorage.setItem("user", JSON.stringify(operador));         // compat geral
            localStorage.setItem("operadorData", JSON.stringify(operador));  // usado no Login.tsx
        } catch {}
    }
}

/** Tentativa 1: JSON { login, senha } */
async function tryLoginJsonLoginSenha(loginStr: string, senha: string) {
    const resp = await apiService.post(
        "/auth/login",
        { login: loginStr, senha },
        { headers: { "Content-Type": "application/json", "X-Skip-Auth": "true" } }
    );
    return resp.data;
}

/** Tentativa 2: JSON { username, password } */
async function tryLoginJsonUsernamePassword(loginStr: string, senha: string) {
    const resp = await apiService.post(
        "/auth/login",
        { username: loginStr, password: senha },
        { headers: { "Content-Type": "application/json", "X-Skip-Auth": "true" } }
    );
    return resp.data;
}

/** Tentativa 3: x-www-form-urlencoded */
async function tryLoginFormUrlEncoded(loginStr: string, senha: string) {
    const params = new URLSearchParams();
    params.set("login", loginStr);
    params.set("senha", senha);
    const resp = await apiService.post("/auth/login", params, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-Skip-Auth": "true",
        },
    });
    return resp.data;
}

/**
 * login — aceita:
 *  - login({ login, senha })
 *  - login(loginStr, senha)
 * Retorna sempre: { token, operador, raw }
 */
export async function login(arg1: LoginObject | string, arg2?: string) {
    const isObjectParam = typeof arg1 === "object" && arg1 !== null;
    const loginStr = isObjectParam ? (arg1 as LoginObject).login : (arg1 as string);
    const senha = isObjectParam ? (arg1 as LoginObject).senha : (arg2 as string);

    if (!loginStr || !senha) {
        throw new Error("Informe login e senha.");
    }

    // 1) JSON { login, senha }
    try {
        const data = await tryLoginJsonLoginSenha(loginStr, senha);
        const token = extractToken(data);
        const operador = extractOperador(data);
        persistAuth(token, operador);
        return { token, operador, raw: data };
    } catch (e1: any) {
        // 2) JSON { username, password }
        try {
            const data = await tryLoginJsonUsernamePassword(loginStr, senha);
            const token = extractToken(data);
            const operador = extractOperador(data);
            persistAuth(token, operador);
            return { token, operador, raw: data };
        } catch (e2: any) {
            // 3) x-www-form-urlencoded
            try {
                const data = await tryLoginFormUrlEncoded(loginStr, senha);
                const token = extractToken(data);
                const operador = extractOperador(data);
                persistAuth(token, operador);
                return { token, operador, raw: data };
            } catch (e3: any) {
                // Mensagem mais útil possível
                const msg =
                    (e3 as any)?.normalizedMessage ||
                    (e2 as any)?.normalizedMessage ||
                    (e1 as any)?.normalizedMessage ||
                    (e3 as any)?.message ||
                    (e2 as any)?.message ||
                    (e1 as any)?.message ||
                    "Falha no login";
                throw new Error(msg);
            }
        }
    }
}

export function logout() {
    try {
        localStorage.removeItem("token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        localStorage.removeItem("operadorData");
        if (apiService.defaults.headers) {
            delete (apiService.defaults.headers as any).Authorization;
        }
    } catch {}
}

export function getStoredUser(): any | null {
    try {
        const raw = localStorage.getItem("operadorData") || localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

// Mantém o default export para compatibilidade
const authService = { login, logout, getStoredUser };
export default authService;