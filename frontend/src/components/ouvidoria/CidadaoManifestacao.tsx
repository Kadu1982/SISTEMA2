import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare,
  FileText,
  Upload,
  Shield,
  Clock,
  CheckCircle,
  User,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Download,
} from "lucide-react";
import PatientSearch from "@/components/shared/PatientSearch";
import { baseCadastro } from "@/services/baseCadastro";

export const CidadaoManifestacao = () => {
  const { toast } = useToast();
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [dadosManifestacao, setDadosManifestacao] = useState({
    tipo: "",
    categoria: "",
    descricao: "",
    unidadeRelacionada: "",
    pacienteSelecionado: null as any,
    aceitaTermos: false,
    anexos: [] as File[],
  });

  const tiposManifestacao = [
    {
      id: "reclamacao",
      nome: "Reclamação",
      cor: "bg-red-500 hover:bg-red-600",
      icon: "⚠️",
      descricao: "Insatisfação com serviços ou atendimentover",
    },
    {
      id: "sugestao",
      nome: "Sugestão",
      cor: "bg-blue-500 hover:bg-blue-600",
      icon: "💡",
      descricao: "Proposta de melhoria dos serviços",
    },
    {
      id: "elogio",
      nome: "Elogio",
      cor: "bg-green-500 hover:bg-green-600",
      icon: "👏",
      descricao: "Reconhecimento por bom atendimentover",
    },
    {
      id: "denuncia",
      nome: "Denúncia",
      cor: "bg-orange-500 hover:bg-orange-600",
      icon: "🔍",
      descricao: "Irregularidades ou problemas graves",
    },
    {
      id: "informacao",
      nome: "Informação",
      cor: "bg-purple-500 hover:bg-purple-600",
      icon: "❓",
      descricao: "Solicitação de esclarecimentos",
    },
  ];

  const categorias = [
    "Atendimento Médico",
    "Atendimento de Enfermagem",
    "Atendimento Farmacêutico",
    "Infraestrutura da Unidade",
    "Agendamento/Marcação de Consultas",
    "Exames e Procedimentos",
    "Medicamentos",
    "Acessibilidade",
    "Tempo de Espera",
    "Outros",
  ];

  const handleSelectPatient = (patient: {
    name: string;
    cartaoSus: string;
  }) => {
    setDadosManifestacao((prev) => ({
      ...prev,
      pacienteSelecionado: patient,
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file) => {
      const isValidType = [
        "image/jpeg",
        "image/png",
        "application/pdf",
        "text/plain",
      ].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    setDadosManifestacao((prev) => ({
      ...prev,
      anexos: [...prev.anexos, ...validFiles],
    }));

    if (validFiles.length !== files.length) {
      toast({
        title: "Alguns arquivos foram rejeitados",
        description:
          "Apenas imagens (JPG, PNG), PDF e texto são aceitos. Tamanho máximo: 5MB",
        variant: "destructive",
      });
    }
  };

  const proximaEtapa = () => {
    if (etapaAtual === 1 && !dadosManifestacao.tipo) {
      toast({
        title: "Selecione o tipo da manifestação",
        variant: "destructive",
      });
      return;
    }

    if (
      etapaAtual === 2 &&
      (!dadosManifestacao.categoria || !dadosManifestacao.descricao.trim())
    ) {
      toast({
        title: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (etapaAtual < 4) {
      setEtapaAtual(etapaAtual + 1);
    }
  };

  const submeterManifestacao = () => {
    if (!dadosManifestacao.aceitaTermos) {
      toast({
        title: "Aceite os termos para continuar",
        variant: "destructive",
      });
      return;
    }

    const protocolo = `OUV${Date.now().toString().slice(-8)}`;

    toast({
      title: "Manifestação registrada com sucesso! ✅",
      description: `Protocolo: ${protocolo}. Você receberá atualizações por e-mail.`,
    });

    console.log("Dados da manifestação:", {
      protocolo,
      ...dadosManifestacao,
      dataRegistro: new Date(),
      status: "RECEBIDA",
    });

    setEtapaAtual(1);
    setDadosManifestacao({
      tipo: "",
      categoria: "",
      descricao: "",
      unidadeRelacionada: "",
      pacienteSelecionado: null,
      aceitaTermos: false,
      anexos: [],
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header com Progresso */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              Nova Manifestação
            </h1>
            <p className="text-blue-100 mt-1">
              Seu canal direto com a gestão de saúde
            </p>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white">
            Etapa {etapaAtual} de 4
          </Badge>
        </div>

        {/* Barra de Progresso */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((etapa) => (
            <div key={etapa} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  etapa < etapaAtual
                    ? "bg-green-500 text-white"
                    : etapa === etapaAtual
                      ? "bg-white text-blue-600"
                      : "bg-white/30 text-white/70"
                }`}
              >
                {etapa < etapaAtual ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  etapa
                )}
              </div>
              {etapa < 4 && (
                <div
                  className={`w-12 h-1 mx-2 rounded transition-all ${
                    etapa < etapaAtual ? "bg-green-500" : "bg-white/30"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Etapa 1: Tipo da Manifestação */}
      {etapaAtual === 1 && (
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
            <CardTitle className="text-xl">
              Qual é o tipo da sua manifestação?
            </CardTitle>
            <CardDescription className="text-gray-600">
              Selecione o tipo que melhor descreve sua manifestação para
              direcionamento adequado
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {tiposManifestacao.map((tipo) => (
                <button
                  key={tipo.id}
                  onClick={() =>
                    setDadosManifestacao((prev) => ({ ...prev, tipo: tipo.id }))
                  }
                  className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                    dadosManifestacao.tipo === tipo.id
                      ? "border-blue-500 bg-blue-50 shadow-lg"
                      : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                  }`}
                >
                  <div className="text-3xl mb-3">{tipo.icon}</div>
                  <div className="font-semibold text-lg mb-2">{tipo.nome}</div>
                  <div className="text-sm text-gray-600">{tipo.descricao}</div>
                  {dadosManifestacao.tipo === tipo.id && (
                    <div className="mt-3">
                      <Badge className="bg-blue-500 text-white">
                        Selecionado
                      </Badge>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <Button
                onClick={proximaEtapa}
                disabled={!dadosManifestacao.tipo}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700"
              >
                Próximo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Etapa 2: Detalhes */}
      {etapaAtual === 2 && (
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
            <CardTitle className="text-xl">Detalhes da Manifestação</CardTitle>
            <CardDescription className="text-gray-600">
              Forneça informações detalhadas sobre sua manifestação
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700">
                Categoria da Manifestação *
              </label>
              <select
                value={dadosManifestacao.categoria}
                onChange={(e) =>
                  setDadosManifestacao((prev) => ({
                    ...prev,
                    categoria: e.target.value,
                  }))
                }
                className="w-full p-4 border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700">
                Descrição da Manifestação *
              </label>
              <Textarea
                value={dadosManifestacao.descricao}
                onChange={(e) =>
                  setDadosManifestacao((prev) => ({
                    ...prev,
                    descricao: e.target.value,
                  }))
                }
                placeholder="Descreva detalhadamente sua manifestação. Seja específico sobre datas, locais, pessoas envolvidas e situações..."
                className="w-full min-h-[150px] p-4 border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                required
              />
              <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Mínimo 10 caracteres, máximo 2000 caracteres (
                {dadosManifestacao.descricao.length}/2000)
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700">
                Unidade de Saúde Relacionada (Opcional)
              </label>
              <select
                value={dadosManifestacao.unidadeRelacionada}
                onChange={(e) =>
                  setDadosManifestacao((prev) => ({
                    ...prev,
                    unidadeRelacionada: e.target.value,
                  }))
                }
                className="w-full p-4 border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              >
                <option value="">Selecione uma unidade (opcional)</option>
                {baseCadastro.buscarTodasUnidades().map((unidade) => (
                  <option key={unidade.id} value={unidade.id}>
                    {unidade.nome} - {unidade.endereco.logradouro},{" "}
                    {unidade.endereco.bairro}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => setEtapaAtual(1)}
                className="px-6 py-3"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
              <Button
                onClick={proximaEtapa}
                disabled={
                  !dadosManifestacao.categoria ||
                  !dadosManifestacao.descricao.trim()
                }
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700"
              >
                Próximo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Etapa 3: Identificação */}
      {etapaAtual === 3 && (
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-2">
              <User className="h-5 w-5" />
              Identificação (Opcional)
            </CardTitle>
            <CardDescription className="text-gray-600">
              A identificação facilita o acompanhamento e a resposta da sua
              manifestação
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <Shield className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Proteção de Dados Garantida
                  </h4>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    Seus dados pessoais são protegidos conforme a LGPD. Você
                    pode manifestar-se anonimamente ou fornecer seus dados para
                    facilitar o contato e acompanhamento. A identificação é
                    opcional.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700">
                Buscar Paciente Cadastrado
              </label>
              <PatientSearch
                onSelectPatient={handleSelectPatient}
                placeholder="Digite o nome do paciente para buscar..."
                className="w-full"
              />
              {dadosManifestacao.pacienteSelecionado && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-900">
                      Paciente Selecionado
                    </span>
                  </div>
                  <div className="text-green-800">
                    <div>
                      <strong>Nome:</strong>{" "}
                      {dadosManifestacao.pacienteSelecionado.name}
                    </div>
                    <div>
                      <strong>Cartão SUS:</strong>{" "}
                      {dadosManifestacao.pacienteSelecionado.cartaoSus}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => setEtapaAtual(2)}
                className="px-6 py-3"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
              <Button
                onClick={proximaEtapa}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700"
              >
                Próximo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Etapa 4: Confirmação */}
      {etapaAtual === 4 && (
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Anexos e Confirmação
            </CardTitle>
            <CardDescription className="text-gray-600">
              Adicione documentos se necessário e confirme sua manifestação
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700">
                Anexar Documentos (Opcional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">
                  Clique para selecionar arquivos ou arraste aqui
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Formatos aceitos: JPG, PNG, PDF, TXT (máx. 5MB cada)
                </p>
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Button variant="outline" className="px-6 py-3" asChild>
                    <span>Selecionar Arquivos</span>
                  </Button>
                </label>
              </div>

              {dadosManifestacao.anexos.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">
                    Arquivos Anexados:
                  </h4>
                  <div className="space-y-2">
                    {dadosManifestacao.anexos.map((arquivo, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">
                            {arquivo.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({(arquivo.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDadosManifestacao((prev) => ({
                              ...prev,
                              anexos: prev.anexos.filter((_, i) => i !== index),
                            }));
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Remover
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resumo da Manifestação
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex">
                  <span className="font-medium text-gray-600 w-24">Tipo:</span>
                  <span className="text-gray-800">
                    {
                      tiposManifestacao.find(
                        (t) => t.id === dadosManifestacao.tipo,
                      )?.nome
                    }
                  </span>
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-600 w-24">
                    Categoria:
                  </span>
                  <span className="text-gray-800">
                    {dadosManifestacao.categoria}
                  </span>
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-600 w-24">
                    Descrição:
                  </span>
                  <span className="text-gray-800">
                    {dadosManifestacao.descricao.substring(0, 100)}...
                  </span>
                </div>
                {dadosManifestacao.pacienteSelecionado && (
                  <div className="flex">
                    <span className="font-medium text-gray-600 w-24">
                      Paciente:
                    </span>
                    <span className="text-gray-800">
                      {dadosManifestacao.pacienteSelecionado.name}
                    </span>
                  </div>
                )}
                {dadosManifestacao.anexos.length > 0 && (
                  <div className="flex">
                    <span className="font-medium text-gray-600 w-24">
                      Anexos:
                    </span>
                    <span className="text-gray-800">
                      {dadosManifestacao.anexos.length} arquivo(s)
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dadosManifestacao.aceitaTermos}
                  onChange={(e) =>
                    setDadosManifestacao((prev) => ({
                      ...prev,
                      aceitaTermos: e.target.checked,
                    }))
                  }
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm leading-relaxed text-gray-700">
                  Declaro que as informações prestadas são verdadeiras e
                  autorizo o tratamento dos meus dados pessoais conforme a Lei
                  Geral de Proteção de Dados (LGPD) para fins de processamento
                  desta manifestação.
                  <strong className="block mt-2">
                    ✓ Aceito os termos e condições para envio da manifestação
                  </strong>
                </span>
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => setEtapaAtual(3)}
                className="px-6 py-3"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
              <Button
                onClick={submeterManifestacao}
                disabled={!dadosManifestacao.aceitaTermos}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                Enviar Manifestação
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
