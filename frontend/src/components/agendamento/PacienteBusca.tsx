/**
 * PacienteBusca.tsx
 * -----------------------------------------------------------------------------
 * OBJETIVO
 * - Campo de busca de paciente por nome (ou CPF), iniciando com 1 caractere.
 * - Regra de negócio: "startsWith" para nome (a cada nova letra digitada refina).
 * - Debounce + cancelamento de requisição anterior (AbortController) p/ evitar "lista fixa".
 *
 * COMO LIGAR O FALLBACK ANTIGO (cuidado com performance):
 * - Mude ENABLE_CLIENT_FALLBACK para true (lista-tudo + filtro no cliente).
 */

import React, { useEffect, useRef, useState } from 'react';
import { Search, X, User, Phone, Calendar, CreditCard, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Paciente } from '@/types/paciente/Paciente';

import pacientesService, {
    buscarPacientes as apiBuscarPacientes,
    buscarPorDocumento as apiBuscarPorDocumento,
    getAllPacientes as apiGetAllPacientes,
} from '@/services/pacientesService';

// ======================= CONFIG =======================
const MIN_CHARS_NAME = 1;     // começa com 1 letra
const DEBOUNCE_MS = 300;      // debounce
const ENABLE_CLIENT_FALLBACK = false; // opcional

// ======================= PROPS =======================
interface PacienteBuscaProps {
    onSelecionarPaciente?: (paciente: Paciente | null) => void;
    onPacienteSelecionado?: (paciente: Paciente | null) => void;
    isLoading?: boolean;
    placeholder?: string;
    pacienteSelecionado?: Paciente | null;
    disabled?: boolean;
    className?: string;
    required?: boolean;
}

// ======================= UTILS =======================
const formatarCpf = (cpf?: string) => {
    if (!cpf) return '';
    const v = cpf.replace(/\D/g, '').slice(0, 11);
    return v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, (_, a, b, c, d) => `${a}.${b}.${c}${d ? '-' + d : ''}`);
};

const calcularIdade = (dataIso?: string) => {
    if (!dataIso) return '';
    const d = new Date(dataIso);
    const diff = Date.now() - d.getTime();
    const age = new Date(diff).getUTCFullYear() - 1970;
    return age;
};

// ======================= COMPONENTE =======================
const PacienteBusca: React.FC<PacienteBuscaProps> = ({
                                                         onSelecionarPaciente,
                                                         onPacienteSelecionado,
                                                         isLoading = false,
                                                         placeholder = 'Digite o nome ou CPF do paciente...',
                                                         pacienteSelecionado,
                                                         disabled = false,
                                                         className,
                                                         required = false,
                                                     }) => {
    const [termoBusca, setTermoBusca] = useState('');
    const [resultados, setResultados] = useState<Paciente[]>([]);
    const [buscando, setBuscando] = useState(false);
    const [mostrarResultados, setMostrarResultados] = useState(false);
    const [erro, setErro] = useState<string>('');
    const [totalResultados, setTotalResultados] = useState<number>(0);

    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<number | undefined>(undefined);

    // Controle de concorrência de requisições
    const abortRef = useRef<AbortController | null>(null);
    const requestIdRef = useRef(0);

    // ------------------- BUSCA PRINCIPAL -------------------
    const executarBuscaPacientes = async (termo: string) => {
        const query = termo.trim();

        // 1) Regras mínimas
        if (query.length < MIN_CHARS_NAME) {
            setResultados([]);
            setMostrarResultados(false);
            setTotalResultados(0);
            return;
        }

        // 2) Cancela requisição anterior (evita lista “fixa” chegando atrasada)
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        // id para manter a última resposta
        const myReqId = ++requestIdRef.current;

        setBuscando(true);
        setErro('');

        try {
            const apenasNumeros = query.replace(/\D/g, '');
            let pacientes: Paciente[] = [];

            // CPF primeiro (3~11 dígitos)
            if (apenasNumeros.length >= 3 && apenasNumeros.length <= 11) {
                try {
                    const porDoc = await apiBuscarPorDocumento({ cpf: apenasNumeros }, { signal: controller.signal });
                    if (porDoc) {
                        pacientes = [porDoc as unknown as Paciente];
                    }
                } catch {
                    // ignora erro 404/outros e segue para nome
                }
            }

            // Nome (startsWith) via backend
            if (pacientes.length === 0) {
                const lista = await apiBuscarPacientes(query, { signal: controller.signal });
                pacientes = (lista as unknown as Paciente[]) || [];
            }

            // (Opcional) Fallback antigo: lista-tudo e filtra no cliente
            if (ENABLE_CLIENT_FALLBACK && pacientes.length === 0) {
                try {
                    const todos = await apiGetAllPacientes();
                    const q = query.toLowerCase();
                    pacientes = (todos as unknown as Paciente[]).filter(
                        (p) => (p?.nomeCompleto || '').toLowerCase().startsWith(q)
                    );
                } catch { /* ignora */ }
            }

            // 3) GARANTIA de regra startsWith no cliente (além do backend)
            //    Assim, se o backend retornar algo mais amplo, o front ainda respeita a regra.
            if (pacientes.length > 0) {
                const q = query.toLowerCase();
                pacientes = pacientes.filter((p) => (p?.nomeCompleto || '').toLowerCase().startsWith(q));
            }

            // Checa se esta resposta ainda é a mais recente
            if (myReqId !== requestIdRef.current) return;

            setTotalResultados(pacientes.length);
            setResultados(pacientes.slice(0, 10));
            setMostrarResultados(true);
        } catch (error: any) {
            if (error?.name === 'CanceledError' || error?.name === 'AbortError') {
                // Requisição cancelada porque o usuário digitou outra letra — ignorar
                return;
            }
            console.error('Erro ao buscar pacientes:', error);
            // Se esta resposta ainda é a mais recente
            if (myReqId === requestIdRef.current) {
                setErro('Erro ao buscar pacientes. Tente novamente.');
                setResultados([]);
                setTotalResultados(0);
                setMostrarResultados(false);
            }
        } finally {
            // Se esta resposta ainda é a mais recente
            if (myReqId === requestIdRef.current) {
                setBuscando(false);
            }
        }
    };

    // ------------------- DEBOUNCE -------------------
    useEffect(() => {
        if (disabled) return;

        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (pacienteSelecionado) return;

        debounceRef.current = window.setTimeout(() => {
            if (termoBusca) executarBuscaPacientes(termoBusca);
        }, DEBOUNCE_MS);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [termoBusca, pacienteSelecionado, disabled]);

    // ------------------- SELECIONAR / LIMPAR -------------------
    const selecionarPaciente = (paciente: Paciente) => {
        if (disabled) return;
        onSelecionarPaciente?.(paciente);
        onPacienteSelecionado?.(paciente);
        setTermoBusca(paciente.nomeCompleto || '');
        setMostrarResultados(false);
    };

    const limparBusca = () => {
        if (disabled) return;
        onSelecionarPaciente?.(null);
        onPacienteSelecionado?.(null);
        setTermoBusca('');
        setMostrarResultados(false);
        setResultados([]);
        setErro('');
        setTotalResultados(0);
        // Cancela qualquer requisição pendente
        if (abortRef.current) abortRef.current.abort();
    };

    // ------------------- FECHA DROPDOWN AO CLICAR FORA -------------------
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setMostrarResultados(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ======================= RENDER =======================
    return (
        <div ref={containerRef} className={cn('relative w-full', className)}>
            {/* Campo de busca */}
            <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        ref={inputRef}
                        type="text"
                        value={termoBusca}
                        onChange={(e) => {
                            if (disabled) return;
                            setTermoBusca(e.target.value);
                            setErro('');
                        }}
                        onFocus={() => !disabled && termoBusca.trim().length >= MIN_CHARS_NAME && setMostrarResultados(true)}
                        placeholder={placeholder}
                        disabled={disabled}
                        required={required}
                        className="pl-9"
                    />
                </div>

                {!disabled && (
                    <Button type="button" variant="outline" onClick={limparBusca}>
                        <X className="h-4 w-4 mr-1" />
                        Limpar
                    </Button>
                )}
            </div>

            {/* Estado: carregando */}
            {buscando && (
                <Card className="absolute top-full mt-1 w-full z-50 shadow-lg border p-4 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Buscando pacientes...</span>
                </Card>
            )}

            {/* Dropdown de resultados */}
            {mostrarResultados && resultados.length > 0 && !disabled && (
                <Card className="absolute top-full mt-1 w-full z-50 shadow-lg border max-h-80 overflow-y-auto">
                    <div className="p-2">
                        {/* Informativo didático */}
                        <div className="px-2 pb-2 text-xs text-gray-500">
                            {totalResultados > resultados.length
                                ? `Mostrando ${resultados.length} de ${totalResultados} resultados`
                                : `Resultados: ${totalResultados}`}
                        </div>

                        {resultados.map((paciente) => (
                            <div
                                key={paciente.id}
                                onClick={() => selecionarPaciente(paciente)}
                                className="flex items-center space-x-3 hover:bg-gray-50 cursor-pointer rounded-md transition-colors p-2"
                            >
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{paciente.nomeCompleto}</p>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                        {paciente.cpf && (
                                            <span className="flex items-center">
                        <CreditCard className="h-3 w-3 mr-1" />
                                                {formatarCpf(paciente.cpf)}
                      </span>
                                        )}
                                        {paciente.dataNascimento && (
                                            <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                                                {calcularIdade(paciente.dataNascimento)} anos
                      </span>
                                        )}
                                        {((paciente as any).telefoneCelular || (paciente as any).telefone || (paciente as any).celular) && (
                                            <span className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                                                {(paciente as any).telefoneCelular || (paciente as any).telefone || (paciente as any).celular}
                      </span>
                                        )}
                                    </div>
                                </div>
                                {(paciente as any).acamado && <Badge variant="secondary">Acamado</Badge>}
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Nenhum resultado */}
            {mostrarResultados &&
                resultados.length === 0 &&
                termoBusca.trim().length >= MIN_CHARS_NAME &&
                !buscando &&
                !erro &&
                !disabled && (
                    <Card className="absolute top-full mt-1 w-full z-50 shadow-lg border">
                        <div className="p-4 text-center text-gray-500">
                            <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>Nenhum paciente encontrado</p>
                            <p className="text-sm">Tente buscar por nome (mín. {MIN_CHARS_NAME} caractere) ou CPF</p>
                        </div>
                    </Card>
                )}

            {/* Erro */}
            {erro && !buscando && (
                <Card className="absolute top-full mt-1 w-full z-50 shadow-lg border p-4 text-red-700">{erro}</Card>
            )}
        </div>
    );
};

export default PacienteBusca;
