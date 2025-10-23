
package com.sistemadesaude.backend.samu.mapper;

import com.sistemadesaude.backend.samu.dto.*;
import com.sistemadesaude.backend.samu.entity.*;
import com.sistemadesaude.backend.samu.enums.RiscoPresumido;
import com.sistemadesaude.backend.operador.entity.Operador;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.Duration;
import java.util.List;

@Mapper(componentModel = "spring")
@Component
public interface OcorrenciaMapper {

    // ========================================
    // 📋 MAPEAMENTO PARA DTO DETALHADO
    // ========================================

    @Mapping(target = "centralRegulacao.nome", source = "centralRegulacao.nome")
    @Mapping(target = "centralRegulacao.id", source = "centralRegulacao.id")
    @Mapping(target = "operador.nome", source = "operador.nome")
    @Mapping(target = "operador.id", source = "operador.id")
    @Mapping(target = "medicoRegulador.nome", source = "medicoRegulador.nome")
    @Mapping(target = "medicoRegulador.id", source = "medicoRegulador.id")
    @Mapping(target = "tempoDecorrido", source = ".", qualifiedByName = "calcularTempoDecorrido")
    @Mapping(target = "statusFormatado", source = "status", qualifiedByName = "formatarStatus")
    @Mapping(target = "prioridadeFormatada", source = "prioridade", qualifiedByName = "formatarPrioridade")
    OcorrenciaDetalhadaDTO toDetalhadaDTO(Ocorrencia ocorrencia);

    // ========================================
    // 📝 MAPEAMENTO PARA DTO RESUMIDO - CORRIGIDO
    // ========================================

    @Mapping(target = "centralRegulacaoNome", source = "centralRegulacao.nome")
    @Mapping(target = "operadorNome", source = "operador.nome")
    @Mapping(target = "medicoReguladorNome", source = "medicoRegulador.nome")
    @Mapping(target = "quantidadePacientes", expression = "java(ocorrencia.getPacientes() != null ? ocorrencia.getPacientes().size() : 0)")
    @Mapping(target = "quantidadeViaturas", expression = "java(ocorrencia.getViaturas() != null ? ocorrencia.getViaturas().size() : 0)")
    @Mapping(target = "viaturasPrincipais", source = "viaturas", qualifiedByName = "obterViaturasPrincipais")
    @Mapping(target = "enderecoResumido", source = "enderecoCompleto", qualifiedByName = "resumirEndereco")
    @Mapping(target = "tempoDecorrido", source = ".", qualifiedByName = "calcularTempoDecorrido")
    @Mapping(target = "statusFormatado", source = "status", qualifiedByName = "formatarStatus")
    @Mapping(target = "prioridadeFormatada", source = "prioridade", qualifiedByName = "formatarPrioridade")
    @Mapping(target = "tipoFormatado", source = "tipoOcorrencia", qualifiedByName = "formatarTipo")
    @Mapping(target = "corPrioridade", source = "prioridade", qualifiedByName = "obterCorPrioridade")
    @Mapping(target = "iconeStatus", source = "status", qualifiedByName = "obterIconeStatus")
    @Mapping(target = "requerAtencao", source = ".", qualifiedByName = "verificarSeRequerAtencao")
    @Mapping(target = "emAtraso", source = ".", qualifiedByName = "verificarSeEmAtraso")
    ResumoOcorrenciaDTO toResumoDTO(Ocorrencia ocorrencia);

    // ========================================
    // 🚑 MAPEAMENTO PARA REGULAÇÃO - NOVO
    // ========================================

    @Mapping(target = "medicoReguladorNome", source = "medicoRegulador.nome")
    @Mapping(target = "centralRegulacaoNome", source = "centralRegulacao.nome")
    @Mapping(target = "pacientes", source = "pacientes", qualifiedByName = "mapearPacientesParaRegulacao")
    @Mapping(target = "tempoAguardandoMinutos", source = ".", qualifiedByName = "calcularTempoAguardando")
    @Mapping(target = "riscoMaximo", source = "pacientes", qualifiedByName = "obterRiscoMaximo")
    @Mapping(target = "quantidadePacientes", expression = "java(ocorrencia.getPacientes() != null ? ocorrencia.getPacientes().size() : 0)")
    @Mapping(target = "possuiMedico", source = ".", qualifiedByName = "verificarProfissionalMedico")
    @Mapping(target = "possuiEnfermeiro", source = ".", qualifiedByName = "verificarProfissionalEnfermeiro")
    OcorrenciaRegulacaoDTO toRegulacaoDTO(Ocorrencia ocorrencia);

    // ========================================
    // 👤 MAPEAMENTO DE PACIENTES
    // ========================================

    @Mapping(target = "unidadeDestinoId", source = "unidadeDestino.id")
    @Mapping(target = "unidadeDestinoNome", source = "unidadeDestino.nome")
    @Mapping(target = "foiRegulado", source = ".", qualifiedByName = "verificarSeRegulado")
    PacienteRegulacaoDTO toPacienteRegulacaoDTO(PacienteOcorrencia paciente);

    PacienteOcorrenciaDTO toPacienteDTO(PacienteOcorrencia paciente);

    // ========================================
    // 🚐 MAPEAMENTO DE VIATURAS - CORRIGIDO
    // ========================================

    @Mapping(target = "condutor", source = "condutor", qualifiedByName = "operadorParaNome")
    @Mapping(target = "medicoResponsavel", source = "medicoResponsavel", qualifiedByName = "operadorParaNome")
    @Mapping(target = "enfermeiroResponsavel", source = "enfermeiroResponsavel", qualifiedByName = "operadorParaNome")
    @Mapping(target = "equipamentosDisponiveis", source = "equipamentosDisponiveis", qualifiedByName = "stringParaLista")
    ViaturaOcorrenciaDTO toViaturaDTO(ViaturaOcorrencia viatura);

    // ========================================
    // 📊 MAPEAMENTO DE EVENTOS - CORRIGIDO
    // ========================================

    @Mapping(target = "operadorId", source = "operador.id")
    @Mapping(target = "operadorNome", source = "operador.nome")
    @Mapping(target = "operadorFuncao", source = "operador.cargo")
    @Mapping(target = "tipoEvento", source = "tipoEvento.descricao")
    @Mapping(target = "categoria", source = "tipoEvento", qualifiedByName = "obterCategoriaEvento")
    EventoOcorrenciaDTO toEventoDTO(EventoOcorrencia evento);

    // ========================================
    // 🔧 MÉTODOS AUXILIARES BÁSICOS
    // ========================================

    @Named("operadorParaNome")
    default String operadorParaNome(Operador operador) {
        return operador != null ? operador.getNome() : null;
    }

    @Named("stringParaLista")
    default List<String> stringParaLista(String equipamentos) {
        if (equipamentos == null || equipamentos.trim().isEmpty()) {
            return List.of();
        }
        return List.of(equipamentos.split(","));
    }

    /**
     * 🎯 MÉTODO PARA OBTER CATEGORIA DO EVENTO - CORRIGIDO
     *
     * ✅ Agora cobre todos os valores do enum TipoEvento
     */
    @Named("obterCategoriaEvento")
    default String obterCategoriaEvento(com.sistemadesaude.backend.samu.enums.TipoEvento tipoEvento) {
        if (tipoEvento == null) return "GERAL";

        return switch (tipoEvento) {
            case ABERTURA_OCORRENCIA -> "SISTEMA";
            case ENCAMINHAMENTO_REGULACAO -> "REGULACAO";
            case ADICAO_PACIENTE -> "CLINICA";
            case ATUALIZACAO_LOCALIZACAO -> "OPERACIONAL";
            case ATRIBUICAO_VIATURA -> "OPERACIONAL";
            case CANCELAMENTO -> "SISTEMA";
            case ENCERRAMENTO -> "SISTEMA";
            // ✅ NOVOS CASOS ADICIONADOS
            case INICIO_REGULACAO -> "REGULACAO";
            case REGULACAO_PACIENTE -> "REGULACAO";
            case FINALIZACAO_REGULACAO -> "REGULACAO";
        };
    }

    // ========================================
    // ⏱️ CÁLCULOS DE TEMPO
    // ========================================

    @Named("calcularTempoDecorrido")
    default String calcularTempoDecorrido(Ocorrencia ocorrencia) {
        if (ocorrencia.getDataAbertura() == null) {
            return "Não informado";
        }

        LocalDateTime fim = ocorrencia.getDataEncerramento() != null
                ? ocorrencia.getDataEncerramento()
                : LocalDateTime.now();

        Duration duracao = Duration.between(ocorrencia.getDataAbertura(), fim);

        long horas = duracao.toHours();
        long minutos = duracao.toMinutesPart();

        if (horas > 0) {
            return String.format("%dh %02dm", horas, minutos);
        } else {
            return String.format("%dm", minutos);
        }
    }

    @Named("calcularTempoAguardando")
    default Long calcularTempoAguardando(Ocorrencia ocorrencia) {
        if (ocorrencia.getDataAbertura() == null) {
            return null;
        }

        return Duration.between(ocorrencia.getDataAbertura(), LocalDateTime.now()).toMinutes();
    }

    // ========================================
    // 🎨 FORMATAÇÃO DE STATUS E PRIORIDADE
    // ========================================

    @Named("formatarStatus")
    default String formatarStatus(com.sistemadesaude.backend.samu.enums.StatusOcorrencia status) {
        if (status == null) return "Não informado";

        return switch (status) {
            case ABERTA -> "🟢 Aberta";
            case AGUARDANDO_REGULACAO -> "🟡 Aguardando Regulação";
            case EM_REGULACAO -> "🔄 Em Regulação";
            case REGULADA -> "🔵 Regulada";
            case DESPACHADA -> "🟠 Despachada";
            case EM_ATENDIMENTO -> "🚑 Em Atendimento";
            case TRANSPORTANDO -> "🏥 Transportando";
            case FINALIZADA -> "✅ Finalizada";
            case CANCELADA -> "❌ Cancelada";
        };
    }

    @Named("formatarPrioridade")
    default String formatarPrioridade(com.sistemadesaude.backend.samu.enums.PrioridadeOcorrencia prioridade) {
        if (prioridade == null) return "Não definida";

        return switch (prioridade) {
            case EMERGENCIA -> "🔴 Emergência";
            case URGENCIA -> "🟠 Urgência";
            case PRIORIDADE_ALTA -> "🟡 Prioridade Alta";
            case PRIORIDADE_MEDIA -> "🟢 Prioridade Média";
            case PRIORIDADE_BAIXA -> "🔵 Prioridade Baixa";
        };
    }

    @Named("formatarTipo")
    default String formatarTipo(com.sistemadesaude.backend.samu.enums.TipoOcorrencia tipo) {
        if (tipo == null) return "Não informado";

        return switch (tipo) {
            case PRE_HOSPITALAR -> "🚑 Pré-hospitalar";
            case INTER_HOSPITALAR -> "🏥 Inter-hospitalar";
            case APOIO_TERRESTRE -> "🚐 Apoio Terrestre";
            case APOIO_AEREO -> "🚁 Apoio Aéreo";
        };
    }

    // ========================================
    // 🎯 CORES E ÍCONES PARA INTERFACE
    // ========================================

    @Named("obterCorPrioridade")
    default String obterCorPrioridade(com.sistemadesaude.backend.samu.enums.PrioridadeOcorrencia prioridade) {
        if (prioridade == null) return "#6B7280";

        return switch (prioridade) {
            case EMERGENCIA -> "#EF4444";
            case URGENCIA -> "#F97316";
            case PRIORIDADE_ALTA -> "#EAB308";
            case PRIORIDADE_MEDIA -> "#22C55E";
            case PRIORIDADE_BAIXA -> "#3B82F6";
        };
    }

    @Named("obterIconeStatus")
    default String obterIconeStatus(com.sistemadesaude.backend.samu.enums.StatusOcorrencia status) {
        if (status == null) return "❓";

        return switch (status) {
            case ABERTA -> "🟢";
            case AGUARDANDO_REGULACAO -> "🟡";
            case EM_REGULACAO -> "🔄";
            case REGULADA -> "🔵";
            case DESPACHADA -> "🟠";
            case EM_ATENDIMENTO -> "🚑";
            case TRANSPORTANDO -> "🏥";
            case FINALIZADA -> "✅";
            case CANCELADA -> "❌";
        };
    }

    // ========================================
    // 📝 FORMATAÇÃO DE TEXTO
    // ========================================

    @Named("resumirEndereco")
    default String resumirEndereco(String enderecoCompleto) {
        if (enderecoCompleto == null || enderecoCompleto.trim().isEmpty()) {
            return "Endereço não informado";
        }

        if (enderecoCompleto.length() <= 50) {
            return enderecoCompleto;
        }

        return enderecoCompleto.substring(0, 47) + "...";
    }

    @Named("obterViaturasPrincipais")
    default String obterViaturasPrincipais(List<ViaturaOcorrencia> viaturas) {
        if (viaturas == null || viaturas.isEmpty()) {
            return "Nenhuma viatura";
        }

        return viaturas.stream()
                .limit(3)
                .map(ViaturaOcorrencia::getCodigo)
                .reduce((a, b) -> a + ", " + b)
                .orElse("Sem código");
    }

    // ========================================
    // 🚨 VALIDAÇÕES E VERIFICAÇÕES
    // ========================================

    @Named("verificarSeRequerAtencao")
    default Boolean verificarSeRequerAtencao(Ocorrencia ocorrencia) {
        if (ocorrencia == null) return false;

        boolean prioridadeAlta = ocorrencia.getPrioridade() != null &&
                (ocorrencia.getPrioridade().name().equals("EMERGENCIA") ||
                        ocorrencia.getPrioridade().name().equals("URGENCIA"));

        boolean tempoExcessivo = ocorrencia.getDataAbertura() != null &&
                Duration.between(ocorrencia.getDataAbertura(), LocalDateTime.now()).toMinutes() > 30;

        boolean aguardandoRegulacao = ocorrencia.getStatus() != null &&
                ocorrencia.getStatus().name().equals("AGUARDANDO_REGULACAO");

        return prioridadeAlta || (tempoExcessivo && aguardandoRegulacao);
    }

    @Named("verificarSeEmAtraso")
    default Boolean verificarSeEmAtraso(Ocorrencia ocorrencia) {
        if (ocorrencia == null || ocorrencia.getDataAbertura() == null) {
            return false;
        }

        int tempoMaximo = switch (ocorrencia.getPrioridade()) {
            case EMERGENCIA -> 15;
            case URGENCIA -> 30;
            case PRIORIDADE_ALTA -> 60;
            case PRIORIDADE_MEDIA -> 120;
            case PRIORIDADE_BAIXA -> 240;
            default -> 60;
        };

        long minutosDecorridos = Duration.between(
                ocorrencia.getDataAbertura(),
                LocalDateTime.now()
        ).toMinutes();

        return minutosDecorridos > tempoMaximo;
    }

    @Named("verificarSeRegulado")
    default Boolean verificarSeRegulado(PacienteOcorrencia paciente) {
        return paciente != null && paciente.foiRegulado();
    }

    // ========================================
    // 🏥 VERIFICAÇÕES DE PROFISSIONAIS
    // ========================================

    @Named("verificarProfissionalMedico")
    default Boolean verificarProfissionalMedico(Ocorrencia ocorrencia) {
        if (ocorrencia == null || ocorrencia.getViaturas() == null) {
            return false;
        }

        return ocorrencia.getViaturas().stream()
                .anyMatch(v -> v.getMedicoResponsavel() != null);
    }

    @Named("verificarProfissionalEnfermeiro")
    default Boolean verificarProfissionalEnfermeiro(Ocorrencia ocorrencia) {
        if (ocorrencia == null || ocorrencia.getViaturas() == null) {
            return false;
        }

        return ocorrencia.getViaturas().stream()
                .anyMatch(v -> v.getEnfermeiroResponsavel() != null);
    }

    // ========================================
    // 🎯 PROCESSAMENTO DE RISCO E PACIENTES
    // ========================================

    @Named("obterRiscoMaximo")
    default RiscoPresumido obterRiscoMaximo(List<PacienteOcorrencia> pacientes) {
        if (pacientes == null || pacientes.isEmpty()) {
            return null;
        }

        return pacientes.stream()
                .map(PacienteOcorrencia::getRiscoPresumido)
                .filter(risco -> risco != null)
                .min((r1, r2) -> Integer.compare(r1.getPrioridade(), r2.getPrioridade()))
                .orElse(null);
    }

    @Named("mapearPacientesParaRegulacao")
    default List<PacienteRegulacaoDTO> mapearPacientesParaRegulacao(List<PacienteOcorrencia> pacientes) {
        if (pacientes == null) {
            return List.of();
        }

        return pacientes.stream()
                .map(this::toPacienteRegulacaoDTO)
                .toList();
    }

    // ========================================
    // 🔄 CONVERSÕES ESPECIAIS
    // ========================================

    default String formatarSinaisVitais(PacienteOcorrencia paciente) {
        if (paciente == null) return "Não informado";

        StringBuilder sb = new StringBuilder();

        if (paciente.getPressaoArterial() != null) {
            sb.append("PA: ").append(paciente.getPressaoArterial()).append(" ");
        }
        if (paciente.getFrequenciaCardiaca() != null) {
            sb.append("FC: ").append(paciente.getFrequenciaCardiaca()).append("bpm ");
        }
        if (paciente.getSaturacaoOxigenio() != null) {
            sb.append("SpO2: ").append(paciente.getSaturacaoOxigenio()).append("% ");
        }
        if (paciente.getTemperatura() != null) {
            sb.append("Temp: ").append(paciente.getTemperatura()).append("°C ");
        }

        return sb.toString().trim().isEmpty() ? "Não informado" : sb.toString();
    }

    default String formatarIdade(PacienteOcorrencia paciente) {
        if (paciente == null) return "Não informada";
        return paciente.getIdadeFormatada();
    }

    default String obterStatusPaciente(PacienteOcorrencia paciente) {
        if (paciente == null) return "Não informado";

        if (paciente.getRiscoPresumido() != null) {
            return paciente.getRiscoPresumido().getDescricao();
        }

        return "Aguardando avaliação";
    }
}
