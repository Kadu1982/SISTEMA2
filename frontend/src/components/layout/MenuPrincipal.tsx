import { useOperador } from "@/contexts/OperadorContext";
import { Link } from "react-router-dom";

export const MenuPrincipal = () => {
    const { operador } = useOperador();

    if (!operador) return null;

    const { unidadeAtual, perfis, permissoes } = operador;

    const ehUBS = unidadeAtual?.toUpperCase().includes("UBS");
    const ehPSF = unidadeAtual?.toUpperCase().includes("PSF");
    const ehSecretaria = unidadeAtual === "Secretaria de Saúde";

    return (
        <div className="space-y-2 p-4">
            <h2 className="text-lg font-semibold">Menu Principal</h2>

            {/* Recepção - AGORA INCLUI CADASTRO */}
            {perfis?.includes("recepcao") && (ehUBS || ehPSF) && (
                <Link to="/recepcao" className="block text-blue-700 hover:underline">
                    Recepção e Cadastro
                </Link>
            )}

            {/* Atendimento Médico */}
            {perfis?.includes("medico") && ehUBS && (
                <Link
                    to="/atendimento/medico"
                    className="block text-blue-700 hover:underline"
                >
                    Atendimento Médico
                </Link>
            )}

            {/* Enfermagem */}
            {(perfis?.includes("enfermeiro") ||
                    perfis?.includes("tecnico_enfermagem")) &&
                ehPSF && (
                    <Link
                        to="/enfermagem"
                        className="block text-blue-700 hover:underline"
                    >
                        Triagem / Enfermagem
                    </Link>
                )}

            {/* Agendamentos */}
            <Link to="/agendamento" className="block text-blue-700 hover:underline">
                Agendamentos
            </Link>

            {/* Farmácia */}
            {(perfis?.includes("farmaceutico") ||
                    perfis?.includes("tecnico_farmacia")) &&
                ehUBS && (
                    <Link to="/farmacia" className="block text-blue-700 hover:underline">
                        Dispensação de Medicamentos
                    </Link>
                )}

            {/* ✅ ASSISTÊNCIA SOCIAL - AGORA VISÍVEL PARA MAIS PERFIS */}
            {(perfis?.includes("assistente_social") ||
                perfis?.includes("administrador_sistema") ||
                perfis?.includes("recepcao") ||
                perfis?.includes("enfermeiro") ||
                perfis?.includes("medico")) && (
                <Link to="/assistencia-social" className="block text-blue-700 hover:underline">
                    Assistência Social
                </Link>
            )}


            {/* Gestão Administrativa */}
            {ehSecretaria && (
                <>
                    {permissoes?.includes("dashboard") && (
                        <Link
                            to="/gestao/dashboard"
                            className="block text-blue-700 hover:underline"
                        >
                            Painel de Indicadores
                        </Link>
                    )}

                    {permissoes?.includes("cadastro_usuarios") && (
                        <Link
                            to="/gestao/usuarios"
                            className="block text-blue-700 hover:underline"
                        >
                            Gestão de Operadores
                        </Link>
                    )}

                    {permissoes?.includes("relatorios") && (
                        <Link
                            to="/gestao/relatorios"
                            className="block text-blue-700 hover:underline"
                        >
                            Relatórios e Exportações
                        </Link>
                    )}
                </>
            )}


            {/* Administrador do Sistema */}
            {perfis?.includes("administrador_sistema") && (
                <Link
                    to="/sistema/configuracoes"
                    className="block text-red-700 hover:underline"
                >
                    Configurações do Sistema
                </Link>
            )}
        </div>
    );
};