// src/contexts/OperadorContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '@/services/apiService';

export interface Operador {
    id: number | string;
    nome: string;
    login: string;
    perfis?: string[]; // ✅ Array de strings, não objetos
    isMaster?: boolean;
    [k: string]: any;
}

interface OperadorContextType {
    operador: Operador | null;
    token: string | null;
    login: (token: string, operador: Operador) => void;
    logout: () => void;
}

const OperadorContext = createContext<OperadorContextType | undefined>(undefined);

export const OperadorProvider = ({ children }: { children: ReactNode }) => {
    const navigate = useNavigate();
    const [operador, setOperador] = useState<Operador | null>(null);
    const [token, setToken] = useState<string | null>(null);

    // 🔁 Carrega do localStorage quando o app inicia
    useEffect(() => {
        const storedToken =
            localStorage.getItem('authToken') ||
            localStorage.getItem('token'); // compat

        const rawOperador = localStorage.getItem('operadorData');
        const storedOperador = rawOperador ? safeParse(rawOperador) : null;

        if (storedToken) {
            setToken(storedToken);
            apiService.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        if (storedOperador) {
            // 🔐 Garante que isMaster seja definido corretamente ao carregar do localStorage
            const isMasterAdmin = storedOperador.login === 'admin.master' ||
                storedOperador.perfis?.includes('ADMINISTRADOR_SISTEMA') ||
                storedOperador.perfis?.includes('ADMIN');

            const operadorComMaster = {
                ...storedOperador,
                isMaster: isMasterAdmin
            };

            setOperador(operadorComMaster);
        }
    }, []);

    const login = (newToken: string, operadorData: Operador) => {
        // 🔐 Determina se é Master Administrator baseado no perfil ou login
        const isMasterAdmin = operadorData.login === 'admin.master' ||
            operadorData.perfis?.includes('ADMINISTRADOR_SISTEMA') ||
            operadorData.perfis?.includes('ADMIN');

        // Adiciona propriedade isMaster ao operador
        const operadorComMaster = {
            ...operadorData,
            isMaster: isMasterAdmin
        };

        // Persistência padronizada
        setToken(newToken);
        setOperador(operadorComMaster);

        // ✅ Sempre gravamos 'authToken'; mantemos 'token' por compat
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('token', newToken); // compat
        localStorage.setItem('operadorData', JSON.stringify(operadorComMaster));

        apiService.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    };

    const logout = () => {
        setToken(null);
        setOperador(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('token'); // limpar compat
        localStorage.removeItem('operadorData');
        delete apiService.defaults.headers.common['Authorization'];
        navigate('/login');
    };

    return (
        <OperadorContext.Provider value={{ operador, token, login, logout }}>
            {children}
        </OperadorContext.Provider>
    );
};

export const useOperador = () => {
    const ctx = useContext(OperadorContext);
    if (!ctx) throw new Error('useOperador deve ser usado dentro de um OperadorProvider');
    return ctx;
};

// util
function safeParse(json: string) {
    try { return JSON.parse(json); } catch { return null; }
}
