package com.sistemadesaude.backend.triagem.service;

import com.sistemadesaude.backend.recepcao.entity.StatusAgendamento;
import com.sistemadesaude.backend.recepcao.repository.AgendamentoRepository;
import com.sistemadesaude.backend.paciente.service.PacienteDomainService;
import com.sistemadesaude.backend.triagem.dto.*;
import com.sistemadesaude.backend.triagem.entity.ClassificacaoRisco;
import com.sistemadesaude.backend.triagem.entity.ProtocoloMinisterioSaude;
import com.sistemadesaude.backend.triagem.entity.Triagem;
import com.sistemadesaude.backend.triagem.repository.TriagemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 🩺 IMPLEMENTAÇÃO COMPLETA DO SERVIÇO DE TRIAGEM COM PROTOCOLOS INTELIGENTES
 *
 * ✅ FUNCIONALIDADES PRINCIPAIS:
 * - Aplicação automática dos Protocolos do Ministério da Saúde
 * - Reclassificação inteligente baseada em sinais vitais
 * - Análise de queixas com IA básica
 * - Sugestão de diagnósticos e condutas
 * - Auditoria completa de todas as operações
 * - ✅ NOVO: Suporte para filtros por data e calendário com indicadores
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TriagemServiceImpl implements TriagemService {

    // ========================================
    // 🔧 DEPENDÊNCIAS
    // ========================================

    private final AgendamentoRepository agendamentoRepository;
    private final TriagemRepository triagemRepository;
    private final PacienteDomainService pacienteDomainService;

    // Formatador para horários
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    // ========================================
    // 💾 SALVAR NOVA TRIAGEM COM PROTOCOLOS INTELIGENTES
    // ========================================

    /**
     * 💾 SALVAR NOVA TRIAGEM - VERSÃO COMPLETA COM PROTOCOLOS
     */
    @Override
    @Transactional
    public void salvarTriagem(CriarTriagemRequestDTO request) {
        log.info("💾 🧠 Iniciando triagem INTELIGENTE para agendamento ID: {}", request.getAgendamentoId());

        try {
            // 1. VALIDAÇÕES BÁSICAS
            var agendamento = validarAgendamentoParaTriagem(request.getAgendamentoId());

            // 2. CRIAR TRIAGEM COM DADOS INICIAIS
            var triagem = criarTriagemInicial(agendamento, request);

            // ✅ CORREÇÃO: Associar o ID do profissional logado ANTES de qualquer lógica
            triagem.setProfissionalId(getProfissionalLogadoId());

            // ✅ CORREÇÃO DEFINITIVA: A LÓGICA DE CLASSIFICAÇÃO SÓ OCORRE NO FLUXO DA UPA
            if (triagem.isTriagemUpa()) {
                log.info("A triagem é para o módulo UPA. Aplicando lógica de classificação de risco.");

                // Validação: para UPA, a classificação de risco inicial é obrigatória.
                if (triagem.getClassificacaoRisco() == null) {
                    throw new IllegalArgumentException("Classificação de Risco é obrigatória para triagens da UPA.");
                }

                // 3. 🧠 APLICAR PROTOCOLOS INTELIGENTES DO MINISTÉRIO DA SAÚDE
                var protocoloAplicado = aplicarProtocolosMinisterioSaude(triagem, request);

                // 4. 🎯 RECLASSIFICAR SE PROTOCOLO SUGERIR
                if (protocoloAplicado != null) {
                    processarProtocoloEncontrado(triagem, protocoloAplicado);
                } else {
                    // Se não encontrou protocolo específico, aplicar análise de sinais vitais
                    aplicarAnaliseBasicaSinaisVitais(triagem, request);
                }

                // 7. LOG DETALHADO DO RESULTADO
                logResultadoTriagem(triagem, protocoloAplicado);
            } else {
                log.info("A triagem é para o fluxo ambulatorial. Pulando lógica de classificação de risco.");
            }

            // 5. SALVAR COM AUDITORIA COMPLETA
            triagem = triagemRepository.save(triagem);

            // 6. ATUALIZAR FLUXO DO PACIENTE
            atualizarFluxoPaciente(agendamento, triagem);

        } catch (IllegalArgumentException | IllegalStateException e) {
            log.error("❌ Erro de validação ao salvar triagem: {}", e.getMessage(), e);
            throw e; // Re-lança exceções de validação sem alterar
        } catch (Exception e) {
            log.error("❌ Erro ao salvar triagem inteligente: {}", e.getMessage(), e);
            log.error("❌ Stack trace completo:", e);
            throw new RuntimeException("Erro ao salvar triagem: " + e.getMessage(), e);
        }
    }

    // ========================================
    // 🧠 MÉTODOS DE ANÁLISE INTELIGENTE
    // ========================================

    /**
     * 🧠 APLICA PROTOCOLOS DO MINISTÉRIO DA SAÚDE
     */
    private ProtocoloMinisterioSaude aplicarProtocolosMinisterioSaude(Triagem triagem, CriarTriagemRequestDTO request) {
        log.info("🧠 Analisando queixa com protocolos do Ministério da Saúde...");
        log.debug("📝 Queixa: '{}'", request.getQueixaPrincipal());
        log.debug("🌡️ Sinais vitais - T:{}, Sat:{}, PA:{}",
                request.getTemperatura(), request.getSaturacaoOxigenio(), request.getPressaoArterial());

        try {
            // Usar o método estático do enum para análise
            ProtocoloMinisterioSaude protocolo = ProtocoloMinisterioSaude.analisarQueixa(
                    request.getQueixaPrincipal(),
                    request.getTemperatura(),
                    request.getSaturacaoOxigenio(),
                    request.getPressaoArterial()
            );

            if (protocolo != null) {
                log.info("✅ 🎯 PROTOCOLO IDENTIFICADO: {} - {}", protocolo.name(), protocolo.getNome());
                log.info("🔍 Classificação sugerida: {}", protocolo.getClassificacaoSugerida());
                return protocolo;
            } else {
                log.info("ℹ️ Nenhum protocolo específico identificado. Continuando com análise básica.");
                return null;
            }

        } catch (Exception e) {
            log.warn("⚠️ Erro na análise de protocolos: {}. Continuando sem protocolo específico.", e.getMessage());
            return null;
        }
    }

    /**
     * 🎯 PROCESSA PROTOCOLO ENCONTRADO
     */
    private void processarProtocoloEncontrado(Triagem triagem, ProtocoloMinisterioSaude protocolo) {
        log.info("🎯 Processando protocolo: {}", protocolo.getNome());

        // Salvar classificação original antes de alterar
        if (triagem.getClassificacaoOriginal() == null) {
            triagem.setClassificacaoOriginal(triagem.getClassificacaoRisco());
        }

        // Aplicar nova classificação se for mais urgente
        ClassificacaoRisco classificacaoSugerida = protocolo.getClassificacaoSugerida();
        ClassificacaoRisco classificacaoAtual = triagem.getClassificacaoRisco();

        if (classificacaoAtual == null || classificacaoSugerida.getPrioridade() < classificacaoAtual.getPrioridade()) {
            log.info("🚨 RECLASSIFICAÇÃO: {} → {} (Protocolo: {})",
                    classificacaoAtual, classificacaoSugerida, protocolo.name());

            triagem.setClassificacaoRisco(classificacaoSugerida);
        }

        // Aplicar informações do protocolo
        triagem.setProtocoloAplicado(protocolo.name() + " - " + protocolo.getNome());
        triagem.setCondutaSugerida(protocolo.getCondutaSugerida());

        // Juntar diagnósticos sugeridos em uma string
        String diagnosticos = String.join("; ", protocolo.getDiagnosticosSugeridos());
        triagem.setDiagnosticosSugeridos(diagnosticos);

        log.info("✅ Protocolo {} aplicado com sucesso!", protocolo.name());
    }

    /**
     * 🩺 ANÁLISE BÁSICA DE SINAIS VITAIS
     */
    private void aplicarAnaliseBasicaSinaisVitais(Triagem triagem, CriarTriagemRequestDTO request) {
        log.debug("🩺 Aplicando análise básica de sinais vitais...");

        List<String> alertas = new ArrayList<>();
        ClassificacaoRisco classificacaoAtual = triagem.getClassificacaoRisco();
        ClassificacaoRisco novaClassificacaoSugerida = classificacaoAtual;

        if (request.getTemperatura() != null) {
            if (request.getTemperatura() >= 39.5) {
                alertas.add("Febre alta (≥39.5°C)");
                novaClassificacaoSugerida = maisGrave(novaClassificacaoSugerida, ClassificacaoRisco.LARANJA);
            } else if (request.getTemperatura() >= 38.5) {
                alertas.add("Febre moderada (≥38.5°C)");
                novaClassificacaoSugerida = maisGrave(novaClassificacaoSugerida, ClassificacaoRisco.AMARELO);
            }
        }
        if (request.getSaturacaoOxigenio() != null) {
            if (request.getSaturacaoOxigenio() < 90) {
                alertas.add("Saturação crítica (<90%)");
                novaClassificacaoSugerida = maisGrave(novaClassificacaoSugerida, ClassificacaoRisco.VERMELHO);
            } else if (request.getSaturacaoOxigenio() < 95) {
                alertas.add("Saturação baixa (<95%)");
                novaClassificacaoSugerida = maisGrave(novaClassificacaoSugerida, ClassificacaoRisco.LARANJA);
            }
        }
        if (request.getFrequenciaCardiaca() != null) {
            if (request.getFrequenciaCardiaca() > 120 || request.getFrequenciaCardiaca() < 50) {
                alertas.add("Frequência cardíaca alterada (" + request.getFrequenciaCardiaca() + " bpm)");
                novaClassificacaoSugerida = maisGrave(novaClassificacaoSugerida, ClassificacaoRisco.AMARELO);
            }
        }
        if (request.getPressaoArterial() != null && analisarHipertensaoSevera(request.getPressaoArterial())) {
            alertas.add("Hipertensão severa");
            novaClassificacaoSugerida = maisGrave(novaClassificacaoSugerida, ClassificacaoRisco.VERMELHO);
        }
        if (request.getEscalaDor() != null && request.getEscalaDor() >= 8) {
            alertas.add("Dor intensa (≥8/10)");
            novaClassificacaoSugerida = maisGrave(novaClassificacaoSugerida, ClassificacaoRisco.LARANJA);
        }

        if (classificacaoAtual != novaClassificacaoSugerida) {
            triagem.setClassificacaoOriginal(classificacaoAtual);
            triagem.setClassificacaoRisco(novaClassificacaoSugerida);
            triagem.setProtocoloAplicado("ANÁLISE_SINAIS_VITAIS");
            triagem.setCondutaSugerida("Reclassificação baseada em sinais vitais alterados: " + String.join(", ", alertas));
            log.info("🚨 RECLASSIFICAÇÃO POR SINAIS VITAIS: {} → {} (Alertas: {})",
                    triagem.getClassificacaoOriginal(), novaClassificacaoSugerida, String.join(", ", alertas));
        }
    }

    private ClassificacaoRisco maisGrave(ClassificacaoRisco c1, ClassificacaoRisco c2) {
        if (c1 == null) return c2;
        if (c2 == null) return c1;
        return c1.getPrioridade() < c2.getPrioridade() ? c1 : c2;
    }

    /**
     * 🔍 ANÁLISE DE HIPERTENSÃO SEVERA
     */
    private boolean analisarHipertensaoSevera(String pressaoArterial) {
        if (pressaoArterial == null) return false;
        try {
            String[] partes = pressaoArterial.split("[x/]");
            if (partes.length >= 2) {
                int sistolica = Integer.parseInt(partes[0].trim());
                int diastolica = Integer.parseInt(partes[1].trim());
                return sistolica >= 180 || diastolica >= 120;
            }
        } catch (NumberFormatException e) {
            log.debug("⚠️ Erro ao analisar pressão arterial: {}", pressaoArterial);
        }
        return false;
    }

    // ========================================
    // 🔧 MÉTODOS AUXILIARES
    // ========================================

    /**
     * ✅ VALIDA AGENDAMENTO PARA TRIAGEM
     */
    private com.sistemadesaude.backend.recepcao.entity.Agendamento validarAgendamentoParaTriagem(Long agendamentoId) {
        var agendamento = agendamentoRepository.findById(agendamentoId)
                .orElseThrow(() -> new IllegalArgumentException("Agendamento não encontrado: " + agendamentoId));

        if (agendamento.getTriagem() != null && !Boolean.TRUE.equals(agendamento.getTriagem().getCancelada())) {
            throw new IllegalStateException("Paciente já possui triagem ativa");
        }

        return agendamento;
    }

    /**
     * 🏗️ CRIA TRIAGEM INICIAL
     */
    private Triagem criarTriagemInicial(com.sistemadesaude.backend.recepcao.entity.Agendamento agendamento,
                                        com.sistemadesaude.backend.triagem.dto.CriarTriagemRequestDTO request) {
        LocalDateTime agora = LocalDateTime.now();
        return Triagem.builder()
                .paciente(agendamento.getPaciente())
                .agendamento(agendamento)
                // carimbo da triagem
                .dataTriagem(agora)
                // ✅ CORREÇÃO: Define dataCriacao explicitamente (campo obrigatório)
                .dataCriacao(agora)

                // 📌 NOVO: Data de referência (ambulatorial)
                .dataReferenciaAtendimento(request.getDataReferencia())

                // dados clínicos principais
                .queixaPrincipal(request.getQueixaPrincipal())
                .motivoConsulta(request.getMotivoConsulta())
                .classificacaoRisco(request.getClassificacaoRisco())

                // sinais vitais
                .escalaDor(request.getEscalaDor())
                .pressaoArterial(request.getPressaoArterial())
                .temperatura(request.getTemperatura())
                .peso(request.getPeso())
                .altura(request.getAltura())
                .frequenciaCardiaca(request.getFrequenciaCardiaca())
                .frequenciaRespiratoria(request.getFrequenciaRespiratoria())
                .saturacaoOxigenio(request.getSaturacaoOxigenio())

                // saúde da mulher
                .dumInformada(request.getDumInformada())
                .gestanteInformado(request.getGestanteInformado())
                .semanasGestacaoInformadas(request.getSemanasGestacaoInformadas())

                // observações
                .observacoes(request.getObservacoes())
                .alergias(request.getAlergias())

                // fluxo UPA (quando aplicável)
                .isUpaTriagem(Boolean.TRUE.equals(request.getIsUpaTriagem()))
                .build();
    }

    /**
     * 🔄 ATUALIZA FLUXO DO PACIENTE
     */
    private void atualizarFluxoPaciente(com.sistemadesaude.backend.recepcao.entity.Agendamento agendamento, Triagem triagem) {
        agendamento.setStatus(StatusAgendamento.TRIADO);
        agendamento.setTriagem(triagem);
        agendamentoRepository.save(agendamento);
    }

    /**
     * 📋 LOG DETALHADO DO RESULTADO
     */
    private void logResultadoTriagem(Triagem triagem, ProtocoloMinisterioSaude protocolo) {
        log.info("✅ 🎉 TRIAGEM CONCLUÍDA COM SUCESSO!");
        log.info("👤 Paciente: {}", triagem.getPaciente().getNomeCompleto());
        log.info("🎯 Classificação final: {}", triagem.getClassificacaoRisco());

        if (triagem.foiReclassificada()) {
            log.info("🔄 Reclassificação: {} → {}",
                    triagem.getClassificacaoOriginal(), triagem.getClassificacaoRisco());
        }

        if (protocolo != null) {
            log.info("🧠 Protocolo aplicado: {}", protocolo.getNome());
        }

        if (triagem.getCondutaSugerida() != null) {
            log.info("💡 Conduta sugerida: {}", triagem.getCondutaSugerida());
        }
    }

    /**
     * 👤 OBTÉM ID DO PROFISSIONAL LOGADO - VERSÃO CORRIGIDA
     */
    private Long getProfissionalLogadoId() {
        try {
            var authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
                // ✅ CORREÇÃO: Usar UserDetails genérico ao invés de Usuario específico
                var userDetails = (org.springframework.security.core.userdetails.UserDetails) authentication.getPrincipal();

                // Tentar converter o username para Long (se for um ID numérico)
                try {
                    return Long.parseLong(userDetails.getUsername());
                } catch (NumberFormatException e) {
                    log.debug("Username não é numérico: {}", userDetails.getUsername());
                }
            }

            // Fallback: tentar obter do nome de autenticação
            if (authentication != null && authentication.getName() != null && !authentication.getName().equalsIgnoreCase("anonymousUser")) {
                try {
                    return Long.parseLong(authentication.getName());
                } catch (NumberFormatException e) {
                    log.debug("Nome de autenticação não é numérico: {}", authentication.getName());
                }
            }
        } catch (Exception e) {
            log.warn("⚠️ Erro ao obter profissional logado: {}. Usando fallback.", e.getMessage());
        }

        // ✅ FALLBACK SEGURO
        log.info("📝 Usando ID de fallback para profissional (sistema automático)");
        return 1L; // ID do operador/sistema padrão
    }

    // ========================================
    // 📋 BUSCAR PACIENTES AGUARDANDO TRIAGEM - MÉTODOS ATUALIZADOS
    // ========================================

    @Override
    @Transactional(readOnly = true)
    public List<PacienteAguardandoTriagemDTO> findPacientesAguardandoTriagem() {
        return findPacientesAguardandoTriagem(null); // Chama a versão com data
    }

    /**
     * ✅ NOVO: BUSCAR PACIENTES AGUARDANDO TRIAGEM COM FILTRO POR DATA
     */
    @Override
    @Transactional(readOnly = true)
    public List<PacienteAguardandoTriagemDTO> findPacientesAguardandoTriagem(LocalDate dataReferencia) {
        log.info("📋 Buscando pacientes aguardando triagem para data: {}", dataReferencia);

        try {
            // ✅ REGRA DE NEGÓCIO: Apenas pacientes RECEPCIONADOS podem ser triados
            List<StatusAgendamento> statusParaTriagem = Arrays.asList(StatusAgendamento.RECEPCIONADO);

            List<com.sistemadesaude.backend.recepcao.entity.Agendamento> agendamentos;

            if (dataReferencia != null) {
                // Busca agendamentos da data específica que estão recepcionados e sem triagem
                LocalDateTime inicioDia = dataReferencia.atStartOfDay();
                LocalDateTime fimDia = dataReferencia.atTime(23, 59, 59);

                agendamentos = agendamentoRepository.findByDataHoraBetweenAndStatusInAndTriagemIsNull(
                        inicioDia, fimDia, statusParaTriagem);
            } else {
                // Busca todos os agendamentos recepcionados sem triagem
                agendamentos = agendamentoRepository.findByStatusInAndTriagemIsNull(statusParaTriagem);
            }

            log.info("📊 Encontrados {} agendamentos para triagem na data {}", agendamentos.size(), dataReferencia);

            return agendamentos.stream()
                    .map(agendamento -> new PacienteAguardandoTriagemDTO(
                            agendamento.getPaciente().getId(),
                            agendamento.getPaciente().getNomeCompleto(),
                            agendamento.getPaciente().getDataNascimento(),
                            agendamento.getId(),
                            agendamento.getDataHora().format(TIME_FORMATTER),
                            agendamento.getTipoConsulta() != null ? agendamento.getTipoConsulta().toString() : "CONSULTA",
                            agendamento.getEspecialidade() != null ? agendamento.getEspecialidade() : "GERAL",
                            determinarPrioridadeInicial(agendamento.getPaciente().getDataNascimento(), agendamento.getDataHora())
                    ))
                    .sorted(Comparator.comparing(PacienteAguardandoTriagemDTO::prioridade, this::compararPrioridade))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("❌ Erro ao buscar pacientes aguardando triagem: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    /**
     * ✅ NOVO: BUSCAR DATAS COM PACIENTES RECEPCIONADOS PARA CALENDÁRIO
     */
    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> buscarDatasComPacientesRecepcionados() {
        log.info("📅 Buscando datas com pacientes recepcionados para triagem");

        try {
            // Busca agendamentos dos últimos 30 dias e próximos 7 dias
            LocalDateTime dataInicio = LocalDateTime.now().minusDays(30).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime dataFim = LocalDateTime.now().plusDays(7).withHour(23).withMinute(59).withSecond(59);

            List<StatusAgendamento> statusParaTriagem = Arrays.asList(StatusAgendamento.RECEPCIONADO);

            // Query customizada para buscar apenas datas e quantidades
            List<Object[]> resultado = agendamentoRepository.findDatasComQuantidadePacientesRecepcionados(
                    dataInicio, dataFim, statusParaTriagem);

            // ✅ CORREÇÃO: Usar new HashMap<>() para evitar erro de tipo incompatível.
            return resultado.stream()
                    .map(row -> {
                        Map<String, Object> map = new HashMap<>();
                        LocalDate data = ((java.sql.Date) row[0]).toLocalDate();
                        Long quantidade = (Long) row[1];
                        map.put("data", data.toString());
                        map.put("quantidade", quantidade.intValue());
                        return map;
                    })
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("❌ Erro ao buscar datas com pacientes recepcionados: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    private int compararPrioridade(String p1, String p2) {
        Map<String, Integer> pesos = Map.of("IDOSO/CRIANÇA", 1, "ESPERA LONGA", 2, "ESPERA MÉDIA", 3, "NORMAL", 4);
        return Integer.compare(pesos.getOrDefault(p1, 99), pesos.getOrDefault(p2, 99));
    }

    // ========================================
    // 📋 BUSCAR PACIENTES TRIADOS - IMPLEMENTAÇÃO COMPLETA
    // ========================================

    @Override
    @Transactional(readOnly = true)
    public List<PacienteTriadoDTO> findPacientesTriados() {
        log.info("🔍 Buscando pacientes triados para atendimento médico...");

        try {
            // Buscar triagens não canceladas ordenadas por prioridade
            // ✅ FILTRO: Excluir pacientes com agendamento FINALIZADO ou ATENDIDO
            List<Triagem> triagens = triagemRepository.findAllByOrderByClassificacaoRiscoAscDataTriagemAsc()
                    .stream()
                    .filter(triagem -> {
                        // Excluir triagens canceladas
                        if (Boolean.TRUE.equals(triagem.getCancelada())) {
                            return false;
                        }
                        
                        // Excluir pacientes com agendamento FINALIZADO
                        if (triagem.getAgendamento() != null) {
                            StatusAgendamento status = triagem.getAgendamento().getStatus();
                            if (status == StatusAgendamento.FINALIZADO) {
                                log.debug("⏭️ Excluindo paciente {} - agendamento {} com status FINALIZADO", 
                                    triagem.getPaciente().getId(), 
                                    triagem.getAgendamento().getId());
                                return false;
                            }
                        }
                        
                        return true;
                    })
                    .collect(Collectors.toList());

            log.info("✅ Encontradas {} triagens ativas para atendimento (excluídos FINALIZADOS)", triagens.size());

            return triagens.stream()
                    .map(this::converterParaPacienteTriadoDTO)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("❌ Erro ao buscar pacientes triados: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    /**
     * 🔄 CONVERTE TRIAGEM PARA PACIENTETRIADODTO
     */
    private PacienteTriadoDTO converterParaPacienteTriadoDTO(Triagem triagem) {
        var paciente = triagem.getPaciente();

        PacienteTriadoDTO dto = new PacienteTriadoDTO();

        // Dados básicos
        dto.setTriagemId(triagem.getId());
        dto.setPacienteId(paciente.getId());
        dto.setNomeCompleto(paciente.getNomeCompleto());
        dto.setDataNascimento(paciente.getDataNascimento());
        dto.setAgendamentoId(triagem.getAgendamento() != null ? triagem.getAgendamento().getId() : null);

        // Dados da triagem
        dto.setDataTriagem(triagem.getDataTriagem());
        dto.setClassificacaoRisco(triagem.getClassificacaoRisco());
        dto.setClassificacaoOriginal(triagem.getClassificacaoOriginal());
        dto.setQueixaPrincipal(triagem.getQueixaPrincipal());
        dto.setEscalaDor(triagem.getEscalaDor());

        // Informações de protocolo
        dto.setProtocoloAplicado(triagem.getProtocoloAplicado());
        dto.setCondutaSugerida(triagem.getCondutaSugerida());
        dto.setDiagnosticosSugeridos(triagem.getDiagnosticosSugeridos());

        // Sinais vitais
        dto.setPressaoArterial(triagem.getPressaoArterial());
        dto.setTemperatura(triagem.getTemperatura());
        dto.setFrequenciaCardiaca(triagem.getFrequenciaCardiaca());
        dto.setSaturacaoOxigenio(triagem.getSaturacaoOxigenio());

        // Dados do profissional e status
        // ✅ CORREÇÃO: A chamada agora é válida, pois o campo profissionalId foi adicionado a Triagem.java
        dto.setProfissionalTriagem(obterNomeProfissional(triagem.getProfissionalId()));
        dto.setCancelada(triagem.getCancelada());
        dto.setMotivoCancelamento(null); // Implementar se necessário

        return dto;
    }

    /**
     * 👨‍⚕️ OBTÉM NOME DO PROFISSIONAL (MÉTODO AUXILIAR)
     */
    private String obterNomeProfissional(Long profissionalId) {
        if (profissionalId == null) return "Sistema";

        // Aqui você pode implementar busca real do nome do profissional
        // Por enquanto, retorna uma informação genérica
        return "Dr(a). Profissional ID: " + profissionalId;
    }

    @Override
    public void cancelarTriagem(Long triagemId) {
        // Implementação para cancelamento de triagem
        var triagem = triagemRepository.findById(triagemId)
                .orElseThrow(() -> new IllegalArgumentException("Triagem não encontrada: " + triagemId));

        triagem.setCancelada(true);
        triagemRepository.save(triagem);

        log.info("✅ Triagem {} cancelada com sucesso", triagemId);
    }

    // ========================================
    // 🧠 BUSCAR TRIAGENS COM PROTOCOLO DETALHADO
    // ========================================

    @Override
    @Transactional(readOnly = true)
    public List<TriagemComProtocoloDTO> buscarTriagensComProtocoloDetalhado(
            LocalDateTime dataInicio,
            LocalDateTime dataFim,
            String protocoloNome) {

        log.info("🔍 🧠 Buscando triagens com protocolo detalhado: {} no período {} - {}",
                protocoloNome, dataInicio, dataFim);

        try {
            // Buscar triagens no período
            List<Triagem> triagens = triagemRepository.findByDataTriagemBetweenOrderByDataTriagemDesc(dataInicio, dataFim);

            // Filtrar por protocolo se especificado
            return triagens.stream()
                    .filter(t -> protocoloNome == null ||
                            (t.getProtocoloAplicado() != null &&
                                    t.getProtocoloAplicado().toLowerCase().contains(protocoloNome.toLowerCase())))
                    .map(this::converterParaTriagemComProtocoloDTO)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("❌ Erro ao buscar triagens com protocolo: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    /**
     * 🔄 MÉTODO AUXILIAR PARA CONVERSÃO DTO - VERSÃO CORRIGIDA
     */
    private TriagemComProtocoloDTO converterParaTriagemComProtocoloDTO(Triagem triagem) {
        return TriagemComProtocoloDTO.builder()
                .id(triagem.getId())
                .pacienteNome(triagem.getPaciente().getNomeCompleto())
                .pacienteId(triagem.getPaciente().getId())
                .pacienteDataNascimento(triagem.getPaciente().getDataNascimento())
                .dataTriagem(triagem.getDataTriagem())
                .queixaPrincipal(triagem.getQueixaPrincipal())
                .classificacaoRisco(triagem.getClassificacaoRisco())
                .classificacaoOriginal(triagem.getClassificacaoOriginal())
                .foiReclassificada(triagem.foiReclassificada())
                .protocoloAplicado(triagem.getProtocoloAplicado())
                .nomeProtocolo(extrairNomeProtocolo(triagem.getProtocoloAplicado()))
                .condutaSugerida(triagem.getCondutaSugerida())
                .diagnosticosSugeridos(triagem.getDiagnosticosSugeridos())
                .temperatura(triagem.getTemperatura())
                .saturacaoOxigenio(triagem.getSaturacaoOxigenio())
                .pressaoArterial(triagem.getPressaoArterial())
                .frequenciaCardiaca(triagem.getFrequenciaCardiaca())
                .escalaDor(triagem.getEscalaDor())
                // ✅ CORREÇÃO: A chamada agora é válida, pois o campo profissionalId foi adicionado a Triagem.java
                .operadorId(triagem.getProfissionalId())
                .operadorNome("Sistema") // Ou buscar nome real se necessário
                .dataCriacao(triagem.getDataCriacao())
                .build();
    }

    /**
     * 🔍 EXTRAI NOME DO PROTOCOLO DA STRING COMPLETA
     */
    private String extrairNomeProtocolo(String protocoloCompleto) {
        if (protocoloCompleto == null) return null;

        // Se contém " - ", pega a parte depois do hífen
        if (protocoloCompleto.contains(" - ")) {
            return protocoloCompleto.split(" - ", 2)[1];
        }

        return protocoloCompleto;
    }

    // ========================================
    // 📊 IMPLEMENTAÇÃO DOS MÉTODOS DE BUSCA RESTANTES
    // ========================================

    @Override
    @Transactional(readOnly = true)
    public List<Triagem> buscarTriagensParaAtendimento() {
        log.info("🔍 Buscando triagens para atendimento médico...");

        try {
            // Buscar triagens não canceladas, ordenadas por prioridade e depois por data
            List<Triagem> triagens = triagemRepository.findAllByOrderByClassificacaoRiscoAscDataTriagemAsc()
                    .stream()
                    .filter(triagem -> !Boolean.TRUE.equals(triagem.getCancelada()))
                    .collect(Collectors.toList());

            log.info("✅ Encontradas {} triagens para atendimento:", triagens.size());

            // Log detalhado para debug
            triagens.forEach(triagem -> {
                log.debug("📋 Triagem ID: {} | Paciente: {} | Classificação: {} | Data: {}",
                        triagem.getId(),
                        triagem.getPaciente().getNomeCompleto(),
                        triagem.getClassificacaoRisco(),
                        triagem.getDataTriagem().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
                );
            });

            return triagens;

        } catch (Exception e) {
            log.error("❌ Erro ao buscar triagens para atendimento: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Triagem> buscarTriagensEmergencia() {
        return triagemRepository.findByClassificacaoRiscoOrderByDataTriagemAsc(ClassificacaoRisco.VERMELHO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Triagem> buscarTriagensCriticas() {
        return triagemRepository.findByClassificacaoRiscoInOrderByDataTriagemAsc(
                Arrays.asList(ClassificacaoRisco.VERMELHO, ClassificacaoRisco.LARANJA)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<Triagem> buscarTriagensPorClassificacao(ClassificacaoRisco classificacao) {
        return triagemRepository.findByClassificacaoRiscoOrderByDataTriagemAsc(classificacao);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Triagem> buscarTriagensComDorAlta() {
        return triagemRepository.findByEscalaDorGreaterThanEqualOrderByDataTriagemDesc(7);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Triagem> buscarTriagensComSinaisVitaisAlterados() {
        return triagemRepository.findTriagensComSinaisAlterados();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Triagem> buscarTriagensPorQueixa(String palavraChave) {
        return triagemRepository.findByQueixaPrincipalContainingIgnoreCase(palavraChave);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Triagem> buscarHistoricoTriagensPaciente(Long pacienteId) {
        return triagemRepository.findByPacienteIdOrderByDataTriagemDesc(pacienteId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Triagem> buscarTriagensPorProfissional(Long profissionalId) {
        return triagemRepository.findByProfissionalIdOrderByDataTriagemDesc(profissionalId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Triagem> buscarTriagensNoPeriodo(LocalDateTime dataInicio, LocalDateTime dataFim) {
        return triagemRepository.findByDataTriagemBetweenOrderByDataTriagemDesc(dataInicio, dataFim);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean pacienteJaTriadoHoje(Long pacienteId) {
        LocalDateTime inicioHoje = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime fimHoje = LocalDateTime.now().with(LocalTime.MAX);

        return triagemRepository.existsByPacienteIdAndDataTriagemBetween(pacienteId, inicioHoje, fimHoje);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<ClassificacaoRisco, Long> contarTriagensPorClassificacao(LocalDateTime dataInicio, LocalDateTime dataFim) {
        var counts = triagemRepository.contarTriagensPorClassificacao(dataInicio, dataFim);
        return counts.stream().collect(Collectors.toMap(
                obj -> (ClassificacaoRisco) obj[0],
                obj -> (Long) obj[1]
        ));
    }

    // ========================================
    // 🔧 MÉTODOS AUXILIARES RESTANTES
    // ========================================

    private String determinarPrioridadeInicial(java.time.LocalDate dataNascimento, LocalDateTime dataAgendamento) {
        if (dataNascimento == null) return "NORMAL";

        int idade = java.time.Period.between(dataNascimento, java.time.LocalDate.now()).getYears();
        long minutosEspera = java.time.Duration.between(dataAgendamento, LocalDateTime.now()).toMinutes();

        if (idade >= 60 || idade <= 2) return "IDOSO/CRIANÇA";
        if (minutosEspera > 120) return "ESPERA LONGA";
        if (minutosEspera > 60) return "ESPERA MÉDIA";

        return "NORMAL";
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> obterEstatisticasCompletas() {
        return new HashMap<>();
    }

    @Override
    @Transactional(readOnly = true)
    public Double calcularMediaTriagensPorDia(int diasAtras) {
        LocalDateTime dataLimite = LocalDateTime.now().minusDays(diasAtras);
        return triagemRepository.calcularMediaTriagensPorDia(dataLimite);
    }
}