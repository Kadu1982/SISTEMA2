package com.sistemadesaude.backend.recepcao.service;

import com.sistemadesaude.backend.recepcao.dto.AgendamentoExameDTO;
import com.sistemadesaude.backend.recepcao.dto.NovoAgendamentoExameRequest;
import com.sistemadesaude.backend.recepcao.entity.AgendamentoExame;
import com.sistemadesaude.backend.recepcao.entity.AgendamentoExame.StatusAgendamentoExame;
import com.sistemadesaude.backend.recepcao.entity.HorarioExame;
import com.sistemadesaude.backend.recepcao.repository.AgendamentoExameRepository;
import com.sistemadesaude.backend.paciente.repository.PacienteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementação do serviço de agendamento de exames
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AgendamentoExameServiceImpl implements AgendamentoExameService {
    
    private final AgendamentoExameRepository agendamentoExameRepository;
    private final PacienteRepository pacienteRepository;
    private final HorarioExameService horarioExameService;

    @Override
    @Transactional
    public AgendamentoExameDTO criarAgendamento(NovoAgendamentoExameRequest request) {
        log.info("📅 Criando novo agendamento de exame para paciente ID: {}", request.getPacienteId());
        
        // Validar paciente
        var paciente = pacienteRepository.findById(request.getPacienteId())
                .orElseThrow(() -> new IllegalArgumentException("Paciente não encontrado: " + request.getPacienteId()));
        
        // Validar horário se fornecido
        HorarioExame horarioExame = null;
        if (request.getHorarioExameId() != null) {
            var horarioDTO = horarioExameService.buscarPorId(request.getHorarioExameId());
            if (!verificarDisponibilidade(request.getHorarioExameId(), request.getDataHoraExame())) {
                throw new IllegalStateException("Horário não disponível para agendamento");
            }
        }
        
        // Criar agendamento
        var agendamento = AgendamentoExame.builder()
                .paciente(paciente)
                .dataAgendamento(LocalDateTime.now())
                .dataHoraExame(request.getDataHoraExame())
                .profissionalId(request.getProfissionalId())
                .salaId(request.getSalaId())
                .unidadeId(request.getUnidadeId())
                .tipoAgendamento(request.getTipoAgendamento())
                .origemSolicitacao(request.getOrigemSolicitacao())
                .solicitanteId(request.getSolicitanteId())
                .solicitanteNome(request.getSolicitanteNome())
                .autorizacaoConvenio(request.getAutorizacaoConvenio())
                .guiaConvenio(request.getGuiaConvenio())
                .observacoes(request.getObservacoes())
                .preparacaoPaciente(request.getPreparacaoPaciente())
                .contatoPaciente(request.getContatoPaciente())
                .emailPaciente(request.getEmailPaciente())
                .encaixe(request.getEncaixe())
                .prioridade(request.getPrioridade())
                .status(StatusAgendamentoExame.AGENDADO)
                .usuarioCriacao("sistema") // TODO: pegar do contexto de segurança
                .build();
        
        // Gerar protocolo
        agendamento.setProtocolo(agendamento.gerarProtocolo());
        
        // Adicionar exames
        if (request.getExames() != null && !request.getExames().isEmpty()) {
            var examesAgendados = request.getExames().stream()
                    .map(exameReq -> AgendamentoExame.ExameAgendado.builder()
                            .exameCodigo(exameReq.getExameCodigo())
                            .exameNome(exameReq.getExameNome())
                            .categoria(exameReq.getCategoria())
                            .duracaoEstimada(exameReq.getDuracaoEstimada())
                            .requerPreparo(exameReq.getRequerPreparo())
                            .descricaoPreparo(exameReq.getDescricaoPreparo())
                            .observacoesEspecificas(exameReq.getObservacoesEspecificas())
                            .materialColeta(exameReq.getMaterialColeta())
                            .quantidadeMaterial(exameReq.getQuantidadeMaterial())
                            .build())
                    .collect(Collectors.toList());
            agendamento.setExamesAgendados(examesAgendados);
        }
        
        // Salvar
        agendamento = agendamentoExameRepository.save(agendamento);
        
        log.info("✅ Agendamento criado com sucesso. Protocolo: {}", agendamento.getProtocolo());
        
        // TODO: Enviar notificações (email, SMS)
        
        return AgendamentoExameDTO.fromEntity(agendamento);
    }

    @Override
    public AgendamentoExameDTO buscarPorId(Long id) {
        log.debug("🔍 Buscando agendamento ID: {}", id);
        var agendamento = agendamentoExameRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Agendamento não encontrado: " + id));
        return AgendamentoExameDTO.fromEntity(agendamento);
    }

    @Override
    public AgendamentoExameDTO buscarPorProtocolo(String protocolo) {
        log.debug("🔍 Buscando agendamento por protocolo: {}", protocolo);
        var agendamento = agendamentoExameRepository.findByProtocolo(protocolo)
                .orElseThrow(() -> new IllegalArgumentException("Agendamento não encontrado com protocolo: " + protocolo));
        return AgendamentoExameDTO.fromEntity(agendamento);
    }

    @Override
    public List<AgendamentoExameDTO> listarPorPaciente(Long pacienteId) {
        log.debug("📋 Listando agendamentos do paciente ID: {}", pacienteId);
        return agendamentoExameRepository.findByPacienteIdOrderByDataHoraExameDesc(pacienteId)
                .stream()
                .map(AgendamentoExameDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<AgendamentoExameDTO> listarPorData(LocalDate data) {
        log.debug("📅 Listando agendamentos da data: {}", data);
        LocalDateTime inicio = data.atStartOfDay();
        return agendamentoExameRepository.findByData(inicio)
                .stream()
                .map(AgendamentoExameDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<AgendamentoExameDTO> listarPorPeriodo(LocalDateTime dataInicio, LocalDateTime dataFim) {
        log.debug("📅 Listando agendamentos do período: {} a {}", dataInicio, dataFim);
        return agendamentoExameRepository.findByDataHoraExameBetweenOrderByDataHoraExame(dataInicio, dataFim)
                .stream()
                .map(AgendamentoExameDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<AgendamentoExameDTO> listarPorStatus(StatusAgendamentoExame status) {
        log.debug("📊 Listando agendamentos com status: {}", status);
        return agendamentoExameRepository.findByStatusOrderByDataHoraExame(status)
                .stream()
                .map(AgendamentoExameDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<AgendamentoExameDTO> listarPorUnidade(Long unidadeId) {
        log.debug("🏥 Listando agendamentos da unidade ID: {}", unidadeId);
        return agendamentoExameRepository.findByUnidadeIdOrderByDataHoraExameDesc(unidadeId)
                .stream()
                .map(AgendamentoExameDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AgendamentoExameDTO confirmarAgendamento(Long id, String usuario) {
        log.info("✅ Confirmando agendamento ID: {}", id);
        
        var agendamento = agendamentoExameRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Agendamento não encontrado: " + id));
        
        if (!agendamento.podeSerConfirmado()) {
            throw new IllegalStateException("Agendamento não pode ser confirmado no status atual: " + agendamento.getStatus());
        }
        
        agendamento.setConfirmado(true);
        agendamento.setDataConfirmacao(LocalDateTime.now());
        agendamento.setUsuarioConfirmacao(usuario);
        agendamento.setStatus(StatusAgendamentoExame.CONFIRMADO);
        agendamento.setUsuarioAtualizacao(usuario);
        
        agendamento = agendamentoExameRepository.save(agendamento);
        
        log.info("✅ Agendamento confirmado com sucesso");
        
        // TODO: Enviar notificação de confirmação
        
        return AgendamentoExameDTO.fromEntity(agendamento);
    }

    @Override
    @Transactional
    public AgendamentoExameDTO cancelarAgendamento(Long id, String motivo, String usuario) {
        log.info("❌ Cancelando agendamento ID: {}", id);
        
        var agendamento = agendamentoExameRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Agendamento não encontrado: " + id));
        
        if (!agendamento.podeSerCancelado()) {
            throw new IllegalStateException("Agendamento não pode ser cancelado no status atual: " + agendamento.getStatus());
        }
        
        agendamento.setStatus(StatusAgendamentoExame.CANCELADO);
        agendamento.setMotivoCancelamento(motivo);
        agendamento.setDataCancelamento(LocalDateTime.now());
        agendamento.setUsuarioCancelamento(usuario);
        agendamento.setUsuarioAtualizacao(usuario);
        
        agendamento = agendamentoExameRepository.save(agendamento);
        
        log.info("❌ Agendamento cancelado com sucesso");
        
        // TODO: Enviar notificação de cancelamento
        
        return AgendamentoExameDTO.fromEntity(agendamento);
    }

    @Override
    @Transactional
    public AgendamentoExameDTO marcarRealizado(Long id, String usuario) {
        log.info("✅ Marcando agendamento como realizado ID: {}", id);
        
        var agendamento = agendamentoExameRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Agendamento não encontrado: " + id));
        
        if (!agendamento.podeSerRealizado()) {
            throw new IllegalStateException("Agendamento não pode ser marcado como realizado no status atual: " + agendamento.getStatus());
        }
        
        agendamento.setStatus(StatusAgendamentoExame.REALIZADO);
        agendamento.setDataRealizacao(LocalDateTime.now());
        agendamento.setUsuarioRealizacao(usuario);
        agendamento.setUsuarioAtualizacao(usuario);
        
        agendamento = agendamentoExameRepository.save(agendamento);
        
        log.info("✅ Agendamento marcado como realizado");
        
        return AgendamentoExameDTO.fromEntity(agendamento);
    }

    @Override
    @Transactional
    public AgendamentoExameDTO marcarNaoCompareceu(Long id, String usuario) {
        log.info("⚠️ Marcando agendamento como não compareceu ID: {}", id);
        
        var agendamento = agendamentoExameRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Agendamento não encontrado: " + id));
        
        agendamento.setStatus(StatusAgendamentoExame.NAO_COMPARECEU);
        agendamento.setUsuarioAtualizacao(usuario);
        
        agendamento = agendamentoExameRepository.save(agendamento);
        
        log.info("⚠️ Agendamento marcado como não compareceu");
        
        return AgendamentoExameDTO.fromEntity(agendamento);
    }

    @Override
    @Transactional
    public AgendamentoExameDTO reagendar(Long id, LocalDateTime novaDataHora, String motivo, String usuario) {
        log.info("🔄 Reagendando agendamento ID: {} para {}", id, novaDataHora);
        
        // Cancela o agendamento atual
        var agendamentoCancelado = cancelarAgendamento(id, "Reagendamento: " + motivo, usuario);
        
        // Busca dados do agendamento original
        var agendamentoOriginal = agendamentoExameRepository.findById(id).get();
        
        // Cria novo agendamento com a nova data
        var novoRequest = NovoAgendamentoExameRequest.builder()
                .pacienteId(agendamentoOriginal.getPaciente().getId())
                .dataHoraExame(novaDataHora)
                .horarioExameId(agendamentoOriginal.getHorarioExame() != null ? agendamentoOriginal.getHorarioExame().getId() : null)
                .profissionalId(agendamentoOriginal.getProfissionalId())
                .salaId(agendamentoOriginal.getSalaId())
                .unidadeId(agendamentoOriginal.getUnidadeId())
                .tipoAgendamento(agendamentoOriginal.getTipoAgendamento())
                .origemSolicitacao(agendamentoOriginal.getOrigemSolicitacao())
                .solicitanteId(agendamentoOriginal.getSolicitanteId())
                .solicitanteNome(agendamentoOriginal.getSolicitanteNome())
                .autorizacaoConvenio(agendamentoOriginal.getAutorizacaoConvenio())
                .guiaConvenio(agendamentoOriginal.getGuiaConvenio())
                .observacoes("REAGENDAMENTO do protocolo " + agendamentoOriginal.getProtocolo() + ". " + agendamentoOriginal.getObservacoes())
                .preparacaoPaciente(agendamentoOriginal.getPreparacaoPaciente())
                .contatoPaciente(agendamentoOriginal.getContatoPaciente())
                .emailPaciente(agendamentoOriginal.getEmailPaciente())
                .encaixe(agendamentoOriginal.getEncaixe())
                .prioridade(agendamentoOriginal.getPrioridade())
                .exames(agendamentoOriginal.getExamesAgendados().stream()
                        .map(e -> NovoAgendamentoExameRequest.ExameRequest.builder()
                                .exameCodigo(e.getExameCodigo())
                                .exameNome(e.getExameNome())
                                .categoria(e.getCategoria())
                                .duracaoEstimada(e.getDuracaoEstimada())
                                .requerPreparo(e.getRequerPreparo())
                                .descricaoPreparo(e.getDescricaoPreparo())
                                .observacoesEspecificas(e.getObservacoesEspecificas())
                                .materialColeta(e.getMaterialColeta())
                                .quantidadeMaterial(e.getQuantidadeMaterial())
                                .build())
                        .collect(Collectors.toList()))
                .build();
        
        var novoAgendamento = criarAgendamento(novoRequest);
        
        // Atualiza o status do agendamento original
        agendamentoOriginal.setStatus(StatusAgendamentoExame.REAGENDADO);
        agendamentoExameRepository.save(agendamentoOriginal);
        
        log.info("🔄 Reagendamento concluído. Novo protocolo: {}", novoAgendamento.getProtocolo());
        
        return novoAgendamento;
    }

    @Override
    @Transactional
    public AgendamentoExameDTO atualizarStatus(Long id, StatusAgendamentoExame novoStatus, String usuario) {
        log.info("🔄 Atualizando status do agendamento ID: {} para {}", id, novoStatus);
        
        var agendamento = agendamentoExameRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Agendamento não encontrado: " + id));
        
        agendamento.setStatus(novoStatus);
        agendamento.setUsuarioAtualizacao(usuario);
        
        if (novoStatus == StatusAgendamentoExame.AGUARDANDO_ATENDIMENTO ||
            novoStatus == StatusAgendamentoExame.EM_ATENDIMENTO) {
            // Confirmar automaticamente se não estiver confirmado
            if (!agendamento.getConfirmado()) {
                agendamento.setConfirmado(true);
                agendamento.setDataConfirmacao(LocalDateTime.now());
                agendamento.setUsuarioConfirmacao(usuario);
            }
        }
        
        agendamento = agendamentoExameRepository.save(agendamento);
        
        log.info("🔄 Status atualizado com sucesso");
        
        return AgendamentoExameDTO.fromEntity(agendamento);
    }

    @Override
    public List<AgendamentoExameDTO> listarPendentesConfirmacao() {
        log.debug("📋 Listando agendamentos pendentes de confirmação");
        return agendamentoExameRepository.findPendentesConfirmacao(LocalDateTime.now())
                .stream()
                .map(AgendamentoExameDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<AgendamentoExameDTO> listarAtrasados() {
        log.debug("⏰ Listando agendamentos atrasados");
        return agendamentoExameRepository.findAtrasados(LocalDateTime.now())
                .stream()
                .map(AgendamentoExameDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public boolean verificarDisponibilidade(Long horarioExameId, LocalDateTime dataHora) {
        log.debug("🔍 Verificando disponibilidade para horário ID: {} em {}", horarioExameId, dataHora);

        var horarioExame = horarioExameService.buscarPorId(horarioExameId);
        
        // Verificar se o horário está ativo
        if (!horarioExame.getAtivo()) {
            return false;
        }
        
        // Verificar quantidade de agendamentos no horário
        Long agendamentosExistentes = agendamentoExameRepository.countAgendamentosPorHorario(horarioExameId, dataHora);
        
        return agendamentosExistentes < horarioExame.getVagasPorHorario();
    }

    @Override
    public byte[] gerarComprovantePdf(Long id) {
        log.info("📄 Gerando comprovante PDF para agendamento ID: {}", id);
        
        var agendamento = buscarPorId(id);
        
        // TODO: Implementar geração de PDF
        // Por enquanto, retorna um PDF vazio
        return new byte[0];
    }

    @Override
    public List<AgendamentoExameDTO> buscarAgendaDiaProfissional(Long profissionalId, LocalDate data) {
        log.debug("📅 Buscando agenda do dia {} para profissional ID: {}", data, profissionalId);
        return agendamentoExameRepository.findAgendaDiaProfissional(profissionalId, data.atStartOfDay())
                .stream()
                .map(AgendamentoExameDTO::fromEntity)
                .collect(Collectors.toList());
    }
}