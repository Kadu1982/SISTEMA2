import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/Layout";
import { useOperador } from "@/contexts/OperadorContext";

// ANOTAÇÃO: Usando lazy loading para otimizar o carregamento inicial.
// As páginas só serão carregadas quando forem acessadas pela primeira vez.
import { lazy } from 'react';

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Login = lazy(() => import("@/pages/Login"));
const Recepcao = lazy(() => import("@/pages/recepcao/Recepcao"));
const Pacientes = lazy(() => import("@/pages/Pacientes"));
const NovoPacientePage = lazy(() => import("@/pages/pacientes/NovoPacientePage"));
const EditarPacientePage = lazy(() => import("@/pages/pacientes/EditarPacientePage"));
const Agendamento = lazy(() => import("@/pages/Agendamento"));
const Triagem = lazy(() => import("@/pages/triagem/Triagem"));
const AtendimentoMedico = lazy(() => import("@/pages/AtendimentoMedico"));
const AtendimentoOdontologico = lazy(() => import("@/pages/AtendimentoOdontologico"));
const Farmacia = lazy(() => import("@/pages/Farmacia"));
const Estoque = lazy(() => import("@/pages/estoque/Estoque.tsx"));
const Vacinas = lazy(() => import("@/pages/Vacinas"));
const AssistenciaSocial = lazy(() => import("@/pages/AssistenciaSocial"));
const Faturamento = lazy(() => import("@/pages/Faturamento"));
const Ouvidoria = lazy(() => import("@/pages/Ouvidoria"));
const Transporte = lazy(() => import("@/pages/Transporte"));
const VigilanciaSanitaria = lazy(() => import("@/pages/VigilanciaSanitaria"));
const VigilanciaAmbiental = lazy(() => import("@/pages/VigilanciaAmbiental"));
const Epidemiologia = lazy(() => import("@/pages/Epidemiologia"));
const SystemConfig = lazy(() => import("@/pages/SystemConfig"));
// Configurações - páginas específicas
const ConfigUnidades = lazy(() => import("@/pages/configuracoes/UnidadesConfig"));
const ConfigOperadores = lazy(() => import("@/pages/configuracoes/OperadoresConfig"));
const ConfigPerfis = lazy(() => import("@/pages/configuracoes/PerfisConfig"));
const ConfigRestricoes = lazy(() => import("@/pages/configuracoes/RestricoesConfig"));
const ConfigAcessosIP = lazy(() => import("@/pages/configuracoes/AcessosIPConfig"));
const ConfigAuditoria = lazy(() => import("@/pages/configuracoes/AuditoriaConfig"));
const ConfigIntegracoes = lazy(() => import("@/pages/configuracoes/IntegracoesConfig"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// ✅ SAMU ADICIONADO
const SAMU = lazy(() => import("@/pages/samu/Samu"));

// ✅ UPA ADICIONADO
const UPA = lazy(() => import("@/pages/upa/Upa"));

// ✅ LABORATÓRIO ADICIONADO
const Laboratorio = lazy(() => import("@/pages/laboratorio/Laboratorio"));
const ListaExames = lazy(() => import("@/pages/laboratorio/exames/ListaExames"));
const FormExame = lazy(() => import("@/pages/laboratorio/exames/FormExame"));
const ListaGrupos = lazy(() => import("@/pages/laboratorio/grupos/ListaGrupos"));
const ListaMateriais = lazy(() => import("@/pages/laboratorio/materiais/ListaMateriais"));

// ✅ MÓDULO HOSPITALAR ADICIONADO
const HospitalarFilas = lazy(() => import("@/pages/hospitalar/FilasPage"));
const HospitalarPainel = lazy(() => import("@/pages/hospitalar/PainelPage"));
const HospitalarTriagem = lazy(() => import("@/pages/hospitalar/TriagemPage"));
const HospitalarLeitos = lazy(() => import("@/pages/hospitalar/LeitosPage"));
const HospitalarCentralLeitos = lazy(() => import("@/pages/hospitalar/CentralLeitosPage"));
const HospitalarAcesso = lazy(() => import("@/pages/hospitalar/AcessoPage"));
const HospitalarConfiguracoes = lazy(() => import("@/pages/hospitalar/ConfiguracoesPage"));
const HospitalarAmbulatorio = lazy(() => import("@/pages/hospitalar/AmbulatorioPage"));
const HospitalarInternacoes = lazy(() => import("@/pages/hospitalar/InternacoesPage"));
const HospitalarPreInternacoes = lazy(() => import("@/pages/hospitalar/PreInternacoesPage"));

// ✅ MÓDULO IMUNIZAÇÃO ADICIONADO
const Imunizacao = lazy(() => import("@/pages/imunizacao/Imunizacao"));

// ✅ SAÚDE DA FAMÍLIA - ACS
const AreasACS = lazy(() => import("@/features/saude-familia-acs/AreasPage"));
const MetasACS = lazy(() => import("@/features/saude-familia-acs/MetasPage"));
const PainelACS = lazy(() => import("@/features/saude-familia-acs/PainelAcsPage"));

// ✅ PROCEDIMENTOS RÁPIDOS ADICIONADO
const ProcedimentosRapidos = lazy(() => import("@/pages/ProcedimentosRapidos"));

// Componente de Rota Protegida
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const { operador } = useOperador();
    return operador ? children : <Navigate to="/login" />;
};

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <Layout />
                    </PrivateRoute>
                }
            >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="recepcao" element={<Recepcao />} />
                <Route path="recepcao/:tab" element={<Recepcao />} />
                <Route path="pacientes" element={<Pacientes />} />
                <Route path="pacientes/novo" element={<NovoPacientePage />} />
                <Route path="pacientes/:id/editar" element={<EditarPacientePage />} />
                <Route path="agendamentos" element={<Agendamento />} />
                <Route path="triagem" element={<Triagem />} />
                <Route path="atendimento-medico" element={<AtendimentoMedico />} />
                <Route path="atendimento-odontologico" element={<AtendimentoOdontologico />} />
                <Route path="samu" element={<SAMU />} />
                <Route path="upa" element={<UPA />} />
                <Route path="procedimentos-rapidos" element={<ProcedimentosRapidos />} />

                {/* Rotas do Módulo Hospitalar */}
                <Route path="hospitalar/filas" element={<HospitalarFilas />} />
                <Route path="hospitalar/painel" element={<HospitalarPainel />} />
                <Route path="hospitalar/triagem" element={<HospitalarTriagem />} />
                <Route path="hospitalar/leitos" element={<HospitalarLeitos />} />
                <Route path="hospitalar/central-leitos" element={<HospitalarCentralLeitos />} />
                <Route path="hospitalar/acesso" element={<HospitalarAcesso />} />
                <Route path="hospitalar/configuracoes" element={<HospitalarConfiguracoes />} />
                <Route path="hospitalar/ambulatorio" element={<HospitalarAmbulatorio />} />
                <Route path="hospitalar/internacoes" element={<HospitalarInternacoes />} />
                <Route path="hospitalar/pre-internacoes" element={<HospitalarPreInternacoes />} />

                <Route path="farmacia" element={<Farmacia />} />
                <Route path="estoque" element={<Estoque />} />

                {/* Rotas do Módulo Laboratório */}
                <Route path="laboratorio/*" element={<Laboratorio />} />

                {/* Rotas do Módulo Imunização */}
                <Route path="imunizacao/*" element={<Imunizacao />} />

                <Route path="vacinas" element={<Vacinas />} />
                <Route path="assistencia-social" element={<AssistenciaSocial />} />
                <Route path="faturamento" element={<Faturamento />} />
                <Route path="ouvidoria" element={<Ouvidoria />} />
                <Route path="transporte" element={<Transporte />} />
                <Route path="vigilancia-sanitaria" element={<VigilanciaSanitaria />} />
                <Route path="vigilancia-ambiental" element={<VigilanciaAmbiental />} />
                <Route path="epidemiologia" element={<Epidemiologia />} />
                <Route path="configuracoes" element={<SystemConfig />} />
                <Route path="configuracoes/unidades" element={<ConfigUnidades />} />
                <Route path="configuracoes/operadores" element={<ConfigOperadores />} />
                <Route path="configuracoes/perfis" element={<ConfigPerfis />} />
                <Route path="configuracoes/restricoes" element={<ConfigRestricoes />} />
                <Route path="configuracoes/acessos-ip" element={<ConfigAcessosIP />} />
                <Route path="configuracoes/auditoria" element={<ConfigAuditoria />} />
                <Route path="configuracoes/integracoes" element={<ConfigIntegracoes />} />
                <Route path="saude-familia/areas" element={<AreasACS />} />
                <Route path="saude-familia/metas" element={<MetasACS />} />
                <Route path="saude-familia/painel" element={<PainelACS />} />
            </Route>
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};