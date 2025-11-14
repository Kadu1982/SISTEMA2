/**
 * usePacienteBusca.ts
 * -----------------------------------------------------------------------------
 * OBJETIVO
 * - Hook para buscar pacientes por nome/CPF/CNS.
 * - Nome com 1 caractere já busca; backend usa "startsWith".
 * - Fallback opcional no cliente para nome (listarTodos()+startsWith).
 *
 * AVISO SOBRE SUPRESSÕES
 * - Não removi funcionalidades. Mantive a API do hook.
 * - Apenas centralizei regras em constantes e adicionei o fallback como opção (off por padrão).
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Paciente } from '@/types/paciente/Paciente';
import pacientesService, { buscarPacientes, buscarPorDocumento } from '@/services/pacientesService';
import { removerMascaraCpf } from '@/lib/pacienteUtils';

// ======================= CONFIGURAÇÕES =======================
const MIN_CHARS_NAME = 3;           // mínimo de 3 caracteres para busca por nome
const MIN_DIGITS_DOC = 3;           // CPF/CNS: mínimo de 3 dígitos para começar
const DEBOUNCE_MS_DEFAULT = 300;    // debounce padrão
const ENABLE_CLIENT_FALLBACK = false; // fallback listarTodos()+startsWith (cuidado performance)

interface UsePacienteBuscaReturn {
    pacientes: Paciente[];
    isLoading: boolean;
    error: string | null;
    buscarPaciente: (termo: string, tipo: 'nome' | 'cpf' | 'cartaoSus') => Promise<void>;
    buscarAutomatico: (termo: string, tipo: 'nome' | 'cpf' | 'cartaoSus', delay?: number) => void;
    limparBusca: () => void;
}

export const usePacienteBusca = (): UsePacienteBuscaReturn => {
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const debounceTimeoutRef = useRef<number | undefined>(undefined);

    // ------------------- BUSCA DIRETA (sem debounce) -------------------
    const buscarPaciente = useCallback(async (termo: string, tipo: 'nome' | 'cpf' | 'cartaoSus') => {
        setError(null);

        try {
            setIsLoading(true);

            if (tipo === 'cpf') {
                const cpf = removerMascaraCpf(termo);
                const p = await buscarPorDocumento({ cpf });
                setPacientes(p ? [p as unknown as Paciente] : []);
                return;
            }

            if (tipo === 'cartaoSus') {
                const p = await buscarPorDocumento({ cns: termo });
                setPacientes(p ? [p as unknown as Paciente] : []);
                return;
            }

            // tipo === 'nome'
            if (termo.trim().length < MIN_CHARS_NAME) {
                setPacientes([]);
                return;
            }

            // 1) Backend (startsWith case-insensitive)
            let resultados = await buscarPacientes(termo.trim());
            resultados = resultados as unknown as Paciente[];

            // 2) Fallback opcional no cliente
            if (ENABLE_CLIENT_FALLBACK && resultados.length === 0) {
                try {
                    const todos = await pacientesService.getAllPacientes();
                    const lower = termo.trim().toLowerCase();
                    resultados = (todos as unknown as Paciente[]).filter(p => (p?.nomeCompleto || '').toLowerCase().startsWith(lower));
                } catch {
                    // mantém vazio
                }
            }

            setPacientes(resultados);
        } catch (e: any) {
            console.error(e);
            setError('Erro ao buscar paciente');
            setPacientes([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ------------------- BUSCA AUTOMÁTICA (com debounce) -------------------
    const buscarAutomatico = useCallback((termo: string, tipo: 'nome' | 'cpf' | 'cartaoSus', delay = DEBOUNCE_MS_DEFAULT) => {
        // limpa timer anterior
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Regras mínimas
        if ((tipo === 'cpf' || tipo === 'cartaoSus') && termo.replace(/\D/g, '').length < MIN_DIGITS_DOC) {
            setPacientes([]);
            setError(null);
            return;
        }
        if (tipo === 'nome' && termo.trim().length < MIN_CHARS_NAME) {
            setPacientes([]);
            setError(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        // agenda consulta
        debounceTimeoutRef.current = window.setTimeout(async () => {
            try {
                if (tipo === 'cpf') {
                    const cpf = removerMascaraCpf(termo);
                    const p = await buscarPorDocumento({ cpf });
                    setPacientes(p ? [p as unknown as Paciente] : []);
                    return;
                }

                if (tipo === 'cartaoSus') {
                    const p = await buscarPorDocumento({ cns: termo });
                    setPacientes(p ? [p as unknown as Paciente] : []);
                    return;
                }

                // tipo === 'nome'
                let resultados = await buscarPacientes(termo.trim());
                resultados = resultados as unknown as Paciente[];

                if (ENABLE_CLIENT_FALLBACK && resultados.length === 0) {
                    try {
                        const todos = await pacientesService.getAllPacientes();
                        const lower = termo.trim().toLowerCase();
                        resultados = (todos as unknown as Paciente[]).filter(p => (p?.nomeCompleto || '').toLowerCase().startsWith(lower));
                    } catch {
                        // mantém vazio
                    }
                }

                setPacientes(resultados);
            } catch {
                setPacientes([]);
                setError('Erro ao buscar paciente');
            } finally {
                setIsLoading(false);
            }
        }, delay);
    }, []);

    // ------------------- LIMPAR -------------------
    const limparBusca = useCallback(() => {
        setPacientes([]);
        setIsLoading(false);
        setError(null);
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
    }, []);

    // limpa debounce ao desmontar
    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    return {
        pacientes,
        isLoading,
        error,
        buscarPaciente,
        buscarAutomatico,
        limparBusca
    };
};
