package com.sistemadesaude.backend.atendimento.service;

import com.sistemadesaude.backend.atendimento.dto.AtendimentoDTO;
import com.sistemadesaude.backend.atendimento.entity.Atendimento;
import com.sistemadesaude.backend.atendimento.mapper.AtendimentoMapper;
import com.sistemadesaude.backend.atendimento.repository.AtendimentoRepository;
import com.sistemadesaude.backend.exception.ResourceNotFoundException;
import com.sistemadesaude.backend.upa.entity.AtendimentoUpa;
import com.sistemadesaude.backend.upa.repository.AtendimentoUpaRepository;
import com.sistemadesaude.backend.assistenciasocial.entity.AtendimentoAssistencial;
import com.sistemadesaude.backend.assistenciasocial.repository.AtendimentoAssistencialRepository;
import com.sistemadesaude.backend.procedimentosrapidos.entity.ProcedimentoRapido;
import com.sistemadesaude.backend.procedimentosrapidos.repository.ProcedimentoRapidoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 🏥 IMPLEMENTAÇÃO DO SERVIÇO DE ATENDIMENTO
 *
 * ✅ CORRIGIDO: Compatibilidade com Long ID (Repository e Entity)
 * ✅ CORRIGIDO: Conversão automática String ↔ Long para compatibilidade de API
 * ✅ ATUALIZADO: Implementação completa e consistente
 * ✅ NOVA FUNCIONALIDADE: Métodos estatísticos e logs detalhados
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AtendimentoServiceImpl implements AtendimentoService {

    private final AtendimentoRepository repository;
    private final AtendimentoMapper mapper;
    private final AtendimentoUpaRepository upaAtendimentoRepository;
    private final AtendimentoAssistencialRepository assistencialRepository;
    private final ProcedimentoRapidoRepository procedimentoRapidoRepository;

    // ========================================
    // 💾 OPERAÇÕES BÁSICAS CRUD
    // ========================================

    @Override
    @Transactional
    public AtendimentoDTO criarAtendimento(AtendimentoDTO dto) {
        log.info("💾 Criando novo atendimento para paciente: {}", dto.getPacienteId());

        try {
            validarDadosObrigatorios(dto);

            Atendimento entity = mapper.toEntity(dto);
            if (entity.getDataHora() == null) {
                entity.setDataHora(LocalDateTime.now());
            }

            Atendimento salvo = repository.save(entity);

            log.info("✅ Atendimento criado com sucesso. ID: {}", salvo.getId());
            return mapper.toDTO(salvo);

        } catch (Exception e) {
            log.error("❌ Erro ao criar atendimento: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao criar atendimento: " + e.getMessage(), e);
        }
    }

    @Override
    public AtendimentoDTO buscarPorId(Long id) {
        log.debug("🔍 Buscando atendimento por ID: {}", id);

        return repository.findById(id)
                .filter(Atendimento::isAtivo)
                .map(mapper::toDTO)
                .orElseThrow(() -> {
                    log.warn("⚠️ Atendimento não encontrado com ID: {}", id);
                    return new ResourceNotFoundException("Atendimento não encontrado com id " + id);
                });
    }

    @Override
    public List<AtendimentoDTO> listarTodos() {
        log.debug("📋 Listando todos os atendimentos ativos");

        List<Atendimento> atendimentos = repository.findByAtivoTrueOrderByDataHoraDesc();

        log.debug("📊 Encontrados {} atendimentos ativos", atendimentos.size());
        return mapper.toDTOList(atendimentos);
    }

    @Override
    @Transactional
    public AtendimentoDTO atualizarAtendimento(Long id, AtendimentoDTO dto) {
        log.info("🔄 Atualizando atendimento ID: {}", id);

        try {
            Atendimento existente = repository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Atendimento não encontrado com id " + id));

            validarDadosObrigatorios(dto);

            mapper.updateEntityFromDTO(dto, existente);

            Atendimento atualizado = repository.save(existente);

            log.info("✅ Atendimento atualizado com sucesso. ID: {}", id);
            return mapper.toDTO(atualizado);

        } catch (ResourceNotFoundException e) {
            log.warn("⚠️ Atendimento não encontrado para atualização: {}", id);
            throw e;
        } catch (Exception e) {
            log.error("❌ Erro ao atualizar atendimento {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Erro ao atualizar atendimento: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void excluirAtendimento(Long id) {
        log.info("🗑️ Excluindo atendimento ID: {}", id);

        try {
            Atendimento atendimento = repository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Atendimento não encontrado com id " + id));

            atendimento.inativar();
            repository.save(atendimento);

            log.info("✅ Atendimento excluído (inativado) com sucesso. ID: {}", id);

        } catch (ResourceNotFoundException e) {
            log.warn("⚠️ Tentativa de excluir atendimento inexistente: {}", id);
            throw e;
        } catch (Exception e) {
            log.error("❌ Erro ao excluir atendimento {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Erro ao excluir atendimento: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public AtendimentoDTO reativarAtendimento(Long id) {
        log.info("✅ Reativando atendimento ID: {}", id);

        try {
            Atendimento atendimento = repository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Atendimento não encontrado com id " + id));

            atendimento.ativar();
            Atendimento reativado = repository.save(atendimento);

            log.info("✅ Atendimento reativado com sucesso. ID: {}", id);
            return mapper.toDTO(reativado);

        } catch (Exception e) {
            log.error("❌ Erro ao reativar atendimento {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Erro ao reativar atendimento: " + e.getMessage(), e);
        }
    }

    // ========================================
    // 👤 CONSULTAS POR PACIENTE (CORRIGIDAS PARA LONG)
    // ========================================

    @Override
    public List<AtendimentoDTO> buscarPorPaciente(Long pacienteId) {
        log.debug("👤 Buscando TODOS os atendimentos para paciente: {}", pacienteId);

        if (pacienteId == null) {
            throw new IllegalArgumentException("PacienteId não pode ser nulo");
        }

        List<AtendimentoDTO> todosAtendimentos = new ArrayList<>();

        // 1. Buscar atendimentos ambulatoriais
        List<Atendimento> atendimentosAmbulatoriais = repository.findByPacienteIdAndAtivoTrueOrderByDataHoraDesc(pacienteId);
        List<AtendimentoDTO> dtosAmbulatoriais = mapper.toDTOList(atendimentosAmbulatoriais);
        dtosAmbulatoriais.forEach(dto -> dto.setTipoAtendimento("AMBULATORIAL"));
        todosAtendimentos.addAll(dtosAmbulatoriais);

        // 2. Buscar atendimentos UPA
        List<AtendimentoUpa> atendimentosUpa = upaAtendimentoRepository.findByPacienteId(pacienteId);
        List<AtendimentoDTO> dtosUpa = converterAtendimentosUpaParaDTO(atendimentosUpa);
        todosAtendimentos.addAll(dtosUpa);

        // 3. Buscar atendimentos assistenciais (relacionamento ManyToMany)
        List<AtendimentoAssistencial> atendimentosAssistenciais = assistencialRepository.findByPacienteId(pacienteId);
        List<AtendimentoDTO> dtosAssistenciais = converterAtendimentosAssistenciaisParaDTO(atendimentosAssistenciais);
        todosAtendimentos.addAll(dtosAssistenciais);

        // 4. Buscar procedimentos rápidos
        List<ProcedimentoRapido> procedimentosRapidos = procedimentoRapidoRepository.findByPacienteIdOrderByDataCriacaoDesc(pacienteId);
        List<AtendimentoDTO> dtosProcedimentos = converterProcedimentosRapidosParaDTO(procedimentosRapidos);
        todosAtendimentos.addAll(dtosProcedimentos);

        // Ordenar por data/hora (mais recente primeiro)
        todosAtendimentos.sort((a1, a2) -> {
            LocalDateTime d1 = a1.getDataHora() != null ? a1.getDataHora() : LocalDateTime.MIN;
            LocalDateTime d2 = a2.getDataHora() != null ? a2.getDataHora() : LocalDateTime.MIN;
            return d2.compareTo(d1); // Ordem decrescente
        });

        log.debug("📊 Histórico unificado para paciente {}: {} ambulatorial(is), {} UPA, {} assistencial(is), {} procedimento(s) rápido(s) (total: {})", 
                pacienteId, atendimentosAmbulatoriais.size(), atendimentosUpa.size(), 
                atendimentosAssistenciais.size(), procedimentosRapidos.size(), todosAtendimentos.size());
        
        return todosAtendimentos;
    }

    /**
     * Converte atendimentos UPA para o formato AtendimentoDTO
     */
    private List<AtendimentoDTO> converterAtendimentosUpaParaDTO(List<AtendimentoUpa> atendimentosUpa) {
        return atendimentosUpa.stream()
                .map(this::converterAtendimentoUpaParaDTO)
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }

    /**
     * Converte um atendimento UPA para AtendimentoDTO
     */
    private AtendimentoDTO converterAtendimentoUpaParaDTO(AtendimentoUpa upa) {
        if (upa == null) {
            return null;
        }

        return AtendimentoDTO.builder()
                .id(upa.getId())
                .pacienteId(upa.getPaciente() != null ? upa.getPaciente().getId().toString() : null)
                .cid10(upa.getCid10() != null ? upa.getCid10() : "")
                .diagnostico(upa.getHipoteseDiagnostica())
                .prescricao(upa.getPrescricao())
                .observacoes(upa.getObservacoes())
                .examesFisicos(upa.getExameFisico())
                .sintomas(upa.getAnamnese())
                .dataHora(upa.getCriadoEm() != null ? upa.getCriadoEm() : LocalDateTime.now())
                .tipoAtendimento("UPA") // Marca como atendimento UPA
                .statusAtendimento(upa.getStatusAtendimento() != null ? upa.getStatusAtendimento().name() : null)
                .retorno(upa.getRetorno())
                .ativo(true) // Atendimentos UPA são sempre ativos
                .queixaPrincipal(upa.getTriagem() != null ? upa.getTriagem().getQueixaPrincipal() : null)
                .build();
    }

    /**
     * Converte atendimentos assistenciais para o formato AtendimentoDTO
     */
    private List<AtendimentoDTO> converterAtendimentosAssistenciaisParaDTO(List<AtendimentoAssistencial> atendimentos) {
        return atendimentos.stream()
                .map(this::converterAtendimentoAssistencialParaDTO)
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }

    /**
     * Converte um atendimento assistencial para AtendimentoDTO
     */
    private AtendimentoDTO converterAtendimentoAssistencialParaDTO(AtendimentoAssistencial assistencial) {
        if (assistencial == null) {
            return null;
        }

        // Extrair IDs dos pacientes (relacionamento ManyToMany)
        String pacienteIds = assistencial.getPacientes() != null && !assistencial.getPacientes().isEmpty()
                ? assistencial.getPacientes().stream()
                        .map(p -> p.getId().toString())
                        .collect(Collectors.joining(","))
                : null;

        return AtendimentoDTO.builder()
                .id(assistencial.getId())
                .pacienteId(pacienteIds) // Pode ter múltiplos pacientes
                .observacoes(assistencial.getAnotacoes())
                .dataHora(assistencial.getDataHora() != null ? assistencial.getDataHora() : LocalDateTime.now())
                .tipoAtendimento("ASSISTENCIAL_SOCIAL")
                .statusAtendimento(assistencial.getStatus())
                .ativo(assistencial.getStatus() != null && !assistencial.getStatus().equalsIgnoreCase("CANCELADO"))
                .queixaPrincipal("Atendimento " + (assistencial.getTipoAtendimento() != null ? assistencial.getTipoAtendimento().name() : "Assistencial"))
                .build();
    }

    /**
     * Converte procedimentos rápidos para o formato AtendimentoDTO
     */
    private List<AtendimentoDTO> converterProcedimentosRapidosParaDTO(List<ProcedimentoRapido> procedimentos) {
        return procedimentos.stream()
                .map(this::converterProcedimentoRapidoParaDTO)
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }

    /**
     * Converte um procedimento rápido para AtendimentoDTO
     */
    private AtendimentoDTO converterProcedimentoRapidoParaDTO(ProcedimentoRapido procedimento) {
        if (procedimento == null) {
            return null;
        }

        // Construir descrição das atividades
        String atividadesDesc = procedimento.getAtividades() != null && !procedimento.getAtividades().isEmpty()
                ? procedimento.getAtividades().stream()
                        .map(a -> a.getTipo() + ": " + a.getAtividade())
                        .collect(Collectors.joining("; "))
                : null;

        return AtendimentoDTO.builder()
                .id(procedimento.getId())
                .pacienteId(procedimento.getPaciente() != null ? procedimento.getPaciente().getId().toString() : null)
                .observacoes(procedimento.getObservacoesGerais())
                .prescricao(atividadesDesc)
                .dataHora(procedimento.getDataCriacao() != null ? procedimento.getDataCriacao() : LocalDateTime.now())
                .tipoAtendimento("PROCEDIMENTO_RAPIDO")
                .statusAtendimento(procedimento.getStatus() != null ? procedimento.getStatus().name() : null)
                .ativo(procedimento.getStatus() != null && !procedimento.getStatus().name().equals("CANCELADO"))
                .queixaPrincipal(procedimento.getOrigemEncaminhamento())
                .build();
    }

    @Override
    public AtendimentoDTO buscarUltimoAtendimentoPaciente(Long pacienteId) {
        log.debug("🏥 Buscando último atendimento do paciente: {}", pacienteId);

        Optional<Atendimento> ultimo = repository.findUltimoAtendimentoPaciente(pacienteId);

        return ultimo
                .filter(Atendimento::isAtivo)
                .map(mapper::toDTO)
                .orElse(null);
    }

    @Override
    public long contarAtendimentosPaciente(Long pacienteId) {
        log.debug("📊 Contando atendimentos do paciente: {}", pacienteId);
        return repository.countByPacienteId(pacienteId);
    }

    @Override
    public boolean pacienteTevAtendimentoHoje(Long pacienteId) {
        log.debug("✅ Verificando se paciente {} teve atendimento hoje", pacienteId);

        LocalDateTime inicioHoje = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime fimHoje = inicioHoje.plusDays(1);

        return repository.existsByPacienteIdAndDataHojeAndAtivoTrue(pacienteId, inicioHoje, fimHoje);
    }

    // ========================================
    // 🏥 CONSULTAS CLÍNICAS
    // ========================================

    @Override
    public List<AtendimentoDTO> buscarPorCid10(String cid10) {
        log.debug("🏥 Buscando atendimentos por CID10: {}", cid10);

        List<Atendimento> atendimentos = repository.findByCid10AndAtivoTrueOrderByDataHoraDesc(cid10);

        return mapper.toDTOList(atendimentos);
    }

    @Override
    public List<AtendimentoDTO> buscarPorDiagnostico(String diagnostico) {
        log.debug("🔍 Buscando atendimentos por diagnóstico: {}", diagnostico);

        List<Atendimento> atendimentos = repository.findByDiagnosticoContainingIgnoreCaseAndAtivoTrueOrderByDataHoraDesc(diagnostico);

        return mapper.toDTOList(atendimentos);
    }

    @Override
    public List<AtendimentoDTO> buscarPorTexto(String texto) {
        log.debug("🔍 Buscando atendimentos por texto livre: {}", texto);

        List<Atendimento> atendimentos = repository.findByTextoLivre(texto);

        return mapper.toDTOList(atendimentos);
    }

    @Override
    public List<AtendimentoDTO> buscarAtendimentosComRetorno() {
        log.debug("🔄 Buscando atendimentos que precisam de retorno");

        List<Atendimento> atendimentos = repository.findAtendimentosComRetorno();

        return mapper.toDTOList(atendimentos);
    }

    // ========================================
    // 📅 CONSULTAS POR PERÍODO
    // ========================================

    @Override
    public List<AtendimentoDTO> buscarPorPeriodo(LocalDateTime inicio, LocalDateTime fim) {
        log.debug("📅 Buscando atendimentos por período: {} a {}", inicio, fim);

        List<Atendimento> atendimentos = repository.findByDataHoraBetween(inicio, fim);

        return mapper.toDTOList(atendimentos);
    }

    @Override
    public List<AtendimentoDTO> buscarAtendimentosHoje() {
        log.debug("📅 Buscando atendimentos de hoje");

        LocalDateTime inicioHoje = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime fimHoje = inicioHoje.plusDays(1);

        List<Atendimento> atendimentos = repository.findAtendimentosHoje(inicioHoje, fimHoje);

        log.debug("📊 Encontrados {} atendimentos hoje", atendimentos.size());
        return mapper.toDTOList(atendimentos);
    }

    @Override
    public List<AtendimentoDTO> buscarAtendimentosSemanaAtual() {
        log.debug("📅 Buscando atendimentos da semana atual");

        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime inicioSemana = agora.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                .withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime fimSemana = agora.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY))
                .withHour(23).withMinute(59).withSecond(59).withNano(999999999);

        List<Atendimento> atendimentos = repository.findAtendimentosSemana(inicioSemana, fimSemana);

        log.debug("📊 Encontrados {} atendimentos na semana atual", atendimentos.size());
        return mapper.toDTOList(atendimentos);
    }

    @Override
    public List<AtendimentoDTO> buscarAtendimentosMesAtual() {
        log.debug("📅 Buscando atendimentos do mês atual");

        LocalDateTime inicioMes = LocalDateTime.now().with(TemporalAdjusters.firstDayOfMonth())
                .withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime fimMes = LocalDateTime.now().with(TemporalAdjusters.lastDayOfMonth())
                .withHour(23).withMinute(59).withSecond(59).withNano(999999999);

        List<Atendimento> atendimentos = repository.findAtendimentosMes(inicioMes, fimMes);

        log.debug("📊 Encontrados {} atendimentos no mês atual", atendimentos.size());
        return mapper.toDTOList(atendimentos);
    }

    // ========================================
    // 👨‍⚕️ CONSULTAS POR PROFISSIONAL (CORRIGIDAS PARA LONG)
    // ========================================

    @Override
    public List<AtendimentoDTO> buscarPorProfissional(Long profissionalId) {
        log.debug("👨‍⚕️ Buscando atendimentos do profissional: {}", profissionalId);

        List<Atendimento> atendimentos = repository.findByProfissionalIdAndAtivoTrueOrderByDataHoraDesc(profissionalId);

        return mapper.toDTOList(atendimentos);
    }

    @Override
    public long contarAtendimentosProfissional(Long profissionalId, LocalDateTime inicio, LocalDateTime fim) {
        log.debug("📊 Contando atendimentos do profissional {} no período {} a {}", profissionalId, inicio, fim);

        // Buscar atendimentos do profissional no período e contar
        List<Atendimento> atendimentos = repository.findByDataHoraBetween(inicio, fim)
                .stream()
                .filter(a -> profissionalId.equals(a.getProfissionalId()) && a.isAtivo())
                .collect(Collectors.toList());

        return atendimentos.size();
    }

    // ========================================
    // 📊 ESTATÍSTICAS E RELATÓRIOS
    // ========================================

    @Override
    public Map<String, Object> obterEstatisticasBasicas() {
        log.debug("📊 Obtendo estatísticas básicas de atendimentos");

        Map<String, Object> stats = new HashMap<>();

        try {
            // Contadores básicos
            long totalAtendimentos = repository.count();

            // Atendimentos hoje
            LocalDateTime inicioHoje = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
            LocalDateTime fimHoje = inicioHoje.plusDays(1);
            long atendimentosHoje = repository.findAtendimentosHoje(inicioHoje, fimHoje).size();

            // Atendimentos semana
            LocalDateTime agora = LocalDateTime.now();
            LocalDateTime inicioSemana = agora.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                    .withHour(0).withMinute(0).withSecond(0).withNano(0);
            LocalDateTime fimSemana = agora.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY))
                    .withHour(23).withMinute(59).withSecond(59).withNano(999999999);
            long atendimentosSemana = repository.findAtendimentosSemana(inicioSemana, fimSemana).size();

            // Atendimentos mês
            LocalDateTime inicioMes = LocalDateTime.now().with(TemporalAdjusters.firstDayOfMonth())
                    .withHour(0).withMinute(0).withSecond(0).withNano(0);
            LocalDateTime fimMes = LocalDateTime.now().with(TemporalAdjusters.lastDayOfMonth())
                    .withHour(23).withMinute(59).withSecond(59).withNano(999999999);
            long atendimentesMes = repository.countByDataHoraBetween(inicioMes, fimMes);

            stats.put("totalAtendimentos", totalAtendimentos);
            stats.put("atendimentosHoje", atendimentosHoje);
            stats.put("atendimentosSemana", atendimentosSemana);
            stats.put("atendimentosMes", atendimentesMes);
            stats.put("dataAtualizacao", LocalDateTime.now());

            log.debug("✅ Estatísticas básicas calculadas: {} total, {} hoje", totalAtendimentos, atendimentosHoje);

        } catch (Exception e) {
            log.error("❌ Erro ao calcular estatísticas básicas: {}", e.getMessage(), e);
            stats.put("erro", "Erro ao calcular estatísticas: " + e.getMessage());
        }

        return stats;
    }

    @Override
    public Map<String, Object> obterEstatisticasPeriodo(LocalDateTime inicio, LocalDateTime fim) {
        log.debug("📊 Obtendo estatísticas do período: {} a {}", inicio, fim);

        Map<String, Object> stats = new HashMap<>();

        try {
            long totalPeriodo = repository.countByDataHoraBetween(inicio, fim);
            List<Object[]> cidsCount = repository.findCidsComuns();

            stats.put("totalPeriodo", totalPeriodo);
            stats.put("inicio", inicio);
            stats.put("fim", fim);
            stats.put("cidsFrequentes", cidsCount);
            stats.put("dataCalculo", LocalDateTime.now());

        } catch (Exception e) {
            log.error("❌ Erro ao calcular estatísticas do período: {}", e.getMessage(), e);
            stats.put("erro", "Erro ao calcular estatísticas: " + e.getMessage());
        }

        return stats;
    }

    @Override
    public Map<String, Long> obterContagemPorCid10(LocalDateTime inicio, LocalDateTime fim) {
        log.debug("📊 Obtendo contagem por CID10 no período: {} a {}", inicio, fim);

        try {
            // Buscar atendimentos no período e agrupar por CID10
            List<Atendimento> atendimentos = repository.findByDataHoraBetween(inicio, fim);

            return atendimentos.stream()
                    .filter(a -> a.getCid10() != null && a.isAtivo())
                    .collect(Collectors.groupingBy(
                            Atendimento::getCid10,
                            Collectors.counting()
                    ));

        } catch (Exception e) {
            log.error("❌ Erro ao obter contagem por CID10: {}", e.getMessage(), e);
            return new HashMap<>();
        }
    }

    @Override
    public List<AtendimentoDTO> obterAtendimentosRecentes(int limite) {
        log.debug("📊 Obtendo {} atendimentos mais recentes", limite);

        List<Atendimento> recentes = repository.findByAtivoTrueOrderByDataHoraDesc()
                .stream()
                .limit(limite)
                .collect(Collectors.toList());

        return mapper.toDTOList(recentes);
    }

    // ========================================
    // 🔍 CONSULTAS ESPECIALIZADAS
    // ========================================

    @Override
    public List<AtendimentoDTO> buscarPorMultiplosCids(List<String> cids) {
        log.debug("🔍 Buscando atendimentos por múltiplos CIDs: {}", cids);

        List<Atendimento> atendimentos = repository.findByCid10In(cids);

        return mapper.toDTOList(atendimentos);
    }

    @Override
    public List<AtendimentoDTO> buscarPorStatus(String status) {
        log.debug("🔍 Buscando atendimentos por status: {}", status);

        List<Atendimento> atendimentos = repository.findByStatusAtendimentoAndAtivoTrueOrderByDataHoraDesc(status);

        return mapper.toDTOList(atendimentos);
    }

    @Override
    public boolean existeAtendimento(Long id) {
        log.debug("✅ Verificando se existe atendimento com ID: {}", id);
        return repository.existsById(id);
    }

    // ========================================
    // 🛠️ MÉTODOS AUXILIARES PRIVADOS
    // ========================================

    /**
     * Valida os dados obrigatórios do DTO
     */
    private void validarDadosObrigatorios(AtendimentoDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Dados do atendimento não podem ser nulos");
        }

        if (dto.getPacienteId() == null || dto.getPacienteId().trim().isEmpty()) {
            throw new IllegalArgumentException("PacienteId é obrigatório");
        }

        // Valida se pacienteId é um número válido (para conversão String -> Long)
        try {
            Long.parseLong(dto.getPacienteId().trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("PacienteId deve ser um número válido: " + dto.getPacienteId());
        }

        if (dto.getCid10() == null || dto.getCid10().trim().isEmpty()) {
            throw new IllegalArgumentException("CID10 é obrigatório");
        }

        log.debug("✅ Validação de dados obrigatórios passou");
    }

    /**
     * Utilitário para converter String para Long (usado internamente)
     */
    private Long converterStringParaLong(String valor) {
        if (valor == null || valor.trim().isEmpty()) {
            return null;
        }
        try {
            return Long.parseLong(valor.trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Valor inválido para conversão para Long: " + valor);
        }
    }

    /**
     * Utilitário para converter Long para String (usado internamente) 
     */
    private String converterLongParaString(Long valor) {
        return valor != null ? valor.toString() : null;
    }
}