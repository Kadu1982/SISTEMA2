package com.sistemadesaude.backend.hospitalar.service;

import com.sistemadesaude.backend.hospitalar.dto.ClassificacaoRiscoDTO;
import com.sistemadesaude.backend.hospitalar.dto.CriarClassificacaoRiscoRequest;
import com.sistemadesaude.backend.hospitalar.entity.ClassificacaoRisco;
import com.sistemadesaude.backend.hospitalar.repository.ClassificacaoRiscoRepository;
import com.sistemadesaude.backend.paciente.repository.PacienteRepository;
import com.sistemadesaude.backend.operador.repository.OperadorRepository;
import com.sistemadesaude.backend.response.ApiResponse;
import com.sistemadesaude.backend.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClassificacaoRiscoService {

    private final ClassificacaoRiscoRepository classificacaoRepository;
    private final PacienteRepository pacienteRepository;
    private final OperadorRepository operadorRepository;

    @Transactional
    public ApiResponse<ClassificacaoRiscoDTO> criarClassificacao(CriarClassificacaoRiscoRequest request) {
        try {
            log.info("Criando classificação de risco para paciente: {}", request.getPacienteId());

            pacienteRepository.findById(request.getPacienteId())
                    .orElseThrow(() -> new BusinessException("Paciente não encontrado"));

            // Nota: Campo operadorId não existe no DTO request

            ClassificacaoRisco classificacao = new ClassificacaoRisco();
            classificacao.setPaciente(pacienteRepository.findById(request.getPacienteId()).get());
            classificacao.setAtendimentoId(request.getAtendimentoId());
            classificacao.setProtocoloUtilizado(ClassificacaoRisco.ProtocoloClassificacao.valueOf(request.getProtocoloUtilizado()));
            classificacao.setQueixaPrincipal(request.getQueixaPrincipal());
            classificacao.setObservacoesAbordagem(request.getObservacoesAbordagem());
            classificacao.setMedicamentosUso(request.getMedicamentosUso());
            classificacao.setReacoesAlergicas(request.getReacoesAlergicas() != null ? request.getReacoesAlergicas() : request.getAlergias());
            classificacao.setSinaisVitais(request.getSinaisVitais());
            classificacao.setSintomaPrincipal(request.getSintomaPrincipal());
            classificacao.setAvaliacaoGlasgow(request.getAvaliacaoGlasgow());
            classificacao.setEscalaDor(request.getEscalaDor());
            // classificacao.setOperador(operadorRepository.findById(request.getOperadorId()).get()); // Campo não existe
            classificacao.setDataClassificacao(LocalDateTime.now());

            // Calcular cor da prioridade e tempo máximo de espera
            calcularPrioridadeERisco(classificacao, request);

            classificacao = classificacaoRepository.save(classificacao);

            log.info("Classificação de risco criada com sucesso - Cor: {}", classificacao.getCorPrioridade());
            return ApiResponse.success(convertToDTO(classificacao));

        } catch (BusinessException e) {
            log.error("Erro de negócio ao criar classificação: {}", e.getMessage());
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("Erro inesperado ao criar classificação", e);
            return ApiResponse.error("Erro interno do servidor");
        }
    }

    @Transactional
    public ApiResponse<ClassificacaoRiscoDTO> reavaliarPaciente(Long classificacaoAnteriorId, CriarClassificacaoRiscoRequest request) {
        try {
            log.info("Reavaliando classificação de risco: {}", classificacaoAnteriorId);

            ClassificacaoRisco classificacaoAnterior = classificacaoRepository.findById(classificacaoAnteriorId)
                    .orElseThrow(() -> new BusinessException("Classificação anterior não encontrada"));

            // Criar nova classificação como reavaliação
            ClassificacaoRisco novaClassificacao = new ClassificacaoRisco();
            novaClassificacao.setPaciente(classificacaoAnterior.getPaciente());
            novaClassificacao.setAtendimentoId(classificacaoAnterior.getAtendimentoId());
            novaClassificacao.setProtocoloUtilizado(ClassificacaoRisco.ProtocoloClassificacao.valueOf(request.getProtocoloUtilizado()));
            novaClassificacao.setQueixaPrincipal(request.getQueixaPrincipal());
            novaClassificacao.setObservacoesAbordagem(request.getObservacoesAbordagem());
            novaClassificacao.setMedicamentosUso(request.getMedicamentosUso());
            novaClassificacao.setReacoesAlergicas(request.getReacoesAlergicas() != null ? request.getReacoesAlergicas() : request.getAlergias());
            novaClassificacao.setSinaisVitais(request.getSinaisVitais());
            novaClassificacao.setSintomaPrincipal(request.getSintomaPrincipal());
            novaClassificacao.setAvaliacaoGlasgow(request.getAvaliacaoGlasgow());
            novaClassificacao.setEscalaDor(request.getEscalaDor());
            // novaClassificacao.setOperador(operadorRepository.findById(request.getOperadorId()).get()); // Campo não existe
            novaClassificacao.setDataClassificacao(LocalDateTime.now());
            novaClassificacao.setReavaliacao(true);
            novaClassificacao.setClassificacaoAnteriorId(classificacaoAnteriorId);

            calcularPrioridadeERisco(novaClassificacao, request);

            novaClassificacao = classificacaoRepository.save(novaClassificacao);

            log.info("Reavaliação criada com sucesso - Nova cor: {}", novaClassificacao.getCorPrioridade());
            return ApiResponse.success(convertToDTO(novaClassificacao));

        } catch (BusinessException e) {
            log.error("Erro de negócio ao reavaliar paciente: {}", e.getMessage());
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("Erro inesperado ao reavaliar paciente", e);
            return ApiResponse.error("Erro interno do servidor");
        }
    }

    public ApiResponse<List<ClassificacaoRiscoDTO>> listarClassificacoesPorPaciente(Long pacienteId) {
        try {
            List<ClassificacaoRisco> classificacoes = classificacaoRepository
                    .findByPaciente_IdOrderByDataClassificacaoDesc(pacienteId);

            List<ClassificacaoRiscoDTO> dtos = classificacoes.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ApiResponse.success(dtos);

        } catch (Exception e) {
            log.error("Erro ao listar classificações por paciente", e);
            return ApiResponse.error("Erro interno do servidor");
        }
    }

    public ApiResponse<List<ClassificacaoRiscoDTO>> listarClassificacoesPorCor(ClassificacaoRisco.CorPrioridade cor) {
        try {
            List<ClassificacaoRisco> classificacoes = classificacaoRepository
                    .findByCorPrioridadeAndPeriodo(cor.name(),
                            LocalDateTime.now().minusHours(24), LocalDateTime.now());

            List<ClassificacaoRiscoDTO> dtos = classificacoes.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ApiResponse.success(dtos);

        } catch (Exception e) {
            log.error("Erro ao listar classificações por cor", e);
            return ApiResponse.error("Erro interno do servidor");
        }
    }

    public ApiResponse<Map<String, Object>> obterEstatisticasClassificacao(LocalDateTime dataInicio, LocalDateTime dataFim) {
        try {
            List<Object[]> estatisticasCor = classificacaoRepository
                    .getEstatisticasPorCor(dataInicio, dataFim);

            long totalClassificacoes = 0;
            long vermelhas = 0, laranjas = 0, amarelas = 0, verdes = 0, azuis = 0;

            for (Object[] stat : estatisticasCor) {
                String cor = (String) stat[0];
                Long count = (Long) stat[1];
                totalClassificacoes += count;

                switch (cor.toUpperCase()) {
                    case "VERMELHO": vermelhas = count; break;
                    case "LARANJA": laranjas = count; break;
                    case "AMARELO": amarelas = count; break;
                    case "VERDE": verdes = count; break;
                    case "AZUL": azuis = count; break;
                }
            }

            // Buscar pacientes com risco de sepse
            List<ClassificacaoRisco> riscoSepseList = classificacaoRepository
                    .findPacientesComRiscoSepse(dataInicio);
            long riscoSepse = riscoSepseList.stream()
                    .filter(c -> c.getDataClassificacao().isBefore(dataFim))
                    .count();

            Map<String, Object> estatisticas = Map.of(
                "totalClassificacoes", totalClassificacoes,
                "porCor", Map.of(
                    "vermelho", vermelhas,
                    "laranja", laranjas,
                    "amarelo", amarelas,
                    "verde", verdes,
                    "azul", azuis
                ),
                "riscoSepse", riscoSepse,
                "periodo", Map.of(
                    "inicio", dataInicio,
                    "fim", dataFim
                )
            );

            return ApiResponse.success(estatisticas);

        } catch (Exception e) {
            log.error("Erro ao obter estatísticas de classificação", e);
            return ApiResponse.error("Erro interno do servidor");
        }
    }

    private void calcularPrioridadeERisco(ClassificacaoRisco classificacao, CriarClassificacaoRiscoRequest request) {
        // Lógica simplificada de classificação - em produção seria mais complexa
        ClassificacaoRisco.CorPrioridade cor = ClassificacaoRisco.CorPrioridade.VERDE;
        Integer tempoMaxEspera = 120; // padrão em minutos

        // Avaliação por Glasgow
        if (classificacao.getAvaliacaoGlasgow() != null && classificacao.getAvaliacaoGlasgow() <= 8) {
            cor = ClassificacaoRisco.CorPrioridade.VERMELHO;
            tempoMaxEspera = 0;
        } else if (classificacao.getAvaliacaoGlasgow() != null && classificacao.getAvaliacaoGlasgow() <= 12) {
            cor = ClassificacaoRisco.CorPrioridade.LARANJA;
            tempoMaxEspera = 10;
        }

        // Avaliação por dor
        if (classificacao.getEscalaDor() != null && classificacao.getEscalaDor() >= 8) {
            if (cor.ordinal() < ClassificacaoRisco.CorPrioridade.LARANJA.ordinal()) {
                cor = ClassificacaoRisco.CorPrioridade.LARANJA;
                tempoMaxEspera = 10;
            }
        } else if (classificacao.getEscalaDor() != null && classificacao.getEscalaDor() >= 6) {
            if (cor.ordinal() < ClassificacaoRisco.CorPrioridade.AMARELO.ordinal()) {
                cor = ClassificacaoRisco.CorPrioridade.AMARELO;
                tempoMaxEspera = 60;
            }
        }

        // Detecção de risco de sepse (palavras-chave nos sintomas)
        if (classificacao.getSintomaPrincipal() != null) {
            String sintomas = classificacao.getSintomaPrincipal().toLowerCase();
            if (sintomas.contains("febre") && sintomas.contains("confusão") ||
                sintomas.contains("hipotensão") || sintomas.contains("taquicardia")) {
                classificacao.setRiscoSepse(true);
                cor = ClassificacaoRisco.CorPrioridade.VERMELHO;
                tempoMaxEspera = 0;
            }
        }

        // Avaliação por protocolo específico
        if (request.getProtocoloUtilizado() != null && request.getProtocoloUtilizado().equals("MANCHESTER")) {
            // Aplicar regras Manchester
            tempoMaxEspera = ajustarTempoManchuster(cor, tempoMaxEspera);
        }

        classificacao.setCorPrioridade(cor);
        classificacao.setTempoMaxEspera(tempoMaxEspera);

        // Definir especialidade sugerida baseada nos sintomas
        if (request.getEspecialidadeSugerida() == null) {
            classificacao.setEspecialidadeSugerida(definirEspecialidade(classificacao));
        } else {
            classificacao.setEspecialidadeSugerida(request.getEspecialidadeSugerida());
        }
    }

    private Integer ajustarTempoManchuster(ClassificacaoRisco.CorPrioridade cor, Integer tempoAtual) {
        switch (cor) {
            case VERMELHO: return 0;
            case LARANJA: return 10;
            case AMARELO: return 60;
            case VERDE: return 120;
            case AZUL: return 240;
            default: return tempoAtual;
        }
    }

    private String definirEspecialidade(ClassificacaoRisco classificacao) {
        if (classificacao.getSintomaPrincipal() == null) {
            return "Clínica Médica";
        }

        String sintomas = classificacao.getSintomaPrincipal().toLowerCase();

        if (sintomas.contains("dor no peito") || sintomas.contains("infarto")) {
            return "Cardiologia";
        } else if (sintomas.contains("fratura") || sintomas.contains("trauma")) {
            return "Ortopedia";
        } else if (sintomas.contains("cefaleia") || sintomas.contains("avc")) {
            return "Neurologia";
        } else if (sintomas.contains("criança") || sintomas.contains("pediatria")) {
            return "Pediatria";
        } else {
            return "Clínica Médica";
        }
    }

    private ClassificacaoRiscoDTO convertToDTO(ClassificacaoRisco classificacao) {
        ClassificacaoRiscoDTO dto = new ClassificacaoRiscoDTO();
        dto.setId(classificacao.getId());
        dto.setPacienteId(classificacao.getPaciente() != null ? classificacao.getPaciente().getId() : null);
        dto.setNomePaciente(classificacao.getPaciente() != null ? classificacao.getPaciente().getNomeCompleto() : null);
        dto.setCpfPaciente(classificacao.getPaciente() != null ? classificacao.getPaciente().getCpf() : null);
        dto.setAtendimentoId(classificacao.getAtendimentoId());
        dto.setProtocoloUtilizado(classificacao.getProtocoloUtilizado() != null ? classificacao.getProtocoloUtilizado().name() : null);
        dto.setProtocoloDescricao(classificacao.getProtocoloUtilizado() != null ? getProtocoloDescricao(classificacao.getProtocoloUtilizado()) : null);
        dto.setQueixaPrincipal(classificacao.getQueixaPrincipal());
        dto.setObservacoesAbordagem(classificacao.getObservacoesAbordagem());
        dto.setMedicamentosUso(classificacao.getMedicamentosUso());
        dto.setReacoesAlergicas(classificacao.getReacoesAlergicas());
        dto.setSinaisVitais(classificacao.getSinaisVitais());
        dto.setSintomaPrincipal(classificacao.getSintomaPrincipal());
        dto.setAvaliacaoGlasgow(classificacao.getAvaliacaoGlasgow());
        dto.setEscalaDor(classificacao.getEscalaDor());
        dto.setCorPrioridade(classificacao.getCorPrioridade() != null ? classificacao.getCorPrioridade().name() : null);
        dto.setCorPrioridadeDescricao(classificacao.getCorPrioridade() != null ? getCorPrioridadeDescricao(classificacao.getCorPrioridade()) : null);
        dto.setTempoMaxEspera(classificacao.getTempoMaxEspera());
        dto.setTempoEsperaFormatado(classificacao.getTempoMaxEspera() != null ? formatarTempo(classificacao.getTempoMaxEspera()) : null);
        dto.setEspecialidadeSugerida(classificacao.getEspecialidadeSugerida());
        dto.setRiscoSepse(classificacao.getRiscoSepse());
        dto.setDataClassificacao(classificacao.getDataClassificacao());
        dto.setOperadorId(classificacao.getOperador() != null ? classificacao.getOperador().getId() : null);
        dto.setNomeOperador(classificacao.getOperador() != null ? classificacao.getOperador().getNome() : null);
        dto.setReavaliacao(classificacao.getReavaliacao());
        dto.setClassificacaoAnteriorId(classificacao.getClassificacaoAnteriorId());
        dto.setEncaminhamentoSocial(classificacao.getEncaminhamentoSocial());
        dto.setObservacoesGerais(classificacao.getObservacoesGerais());
        return dto;
    }

    private String getProtocoloDescricao(ClassificacaoRisco.ProtocoloClassificacao protocolo) {
        switch (protocolo) {
            case MANCHESTER: return "Protocolo de Manchester";
            case HUMANIZA_SUS: return "Humaniza SUS";
            case INSTITUCIONAL: return "Protocolo Institucional";
            default: return protocolo.name();
        }
    }

    private String getCorPrioridadeDescricao(ClassificacaoRisco.CorPrioridade cor) {
        switch (cor) {
            case VERMELHO: return "Emergência";
            case LARANJA: return "Muito Urgente";
            case AMARELO: return "Urgente";
            case VERDE: return "Pouco Urgente";
            case AZUL: return "Não Urgente";
            default: return cor.name();
        }
    }

    private String formatarTempo(Integer minutos) {
        if (minutos == null) return null;
        if (minutos == 0) return "Imediato";
        if (minutos < 60) return minutos + " minutos";
        int horas = minutos / 60;
        int minutosRestantes = minutos % 60;
        if (minutosRestantes == 0) return horas + (horas == 1 ? " hora" : " horas");
        return horas + (horas == 1 ? " hora e " : " horas e ") + minutosRestantes + " minutos";
    }
}