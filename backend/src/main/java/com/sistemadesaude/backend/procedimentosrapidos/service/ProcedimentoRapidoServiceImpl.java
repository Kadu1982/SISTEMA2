package com.sistemadesaude.backend.procedimentosrapidos.service;

import com.sistemadesaude.backend.exception.BusinessException;
import com.sistemadesaude.backend.exception.ResourceNotFoundException;
import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.operador.repository.OperadorRepository;
import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.paciente.repository.PacienteRepository;
import com.sistemadesaude.backend.procedimentosrapidos.dto.*;
import com.sistemadesaude.backend.procedimentosrapidos.entity.AtividadeEnfermagem;
import com.sistemadesaude.backend.procedimentosrapidos.entity.Desfecho;
import com.sistemadesaude.backend.procedimentosrapidos.entity.ProcedimentoRapido;
import com.sistemadesaude.backend.procedimentosrapidos.enums.SituacaoAtividade;
import com.sistemadesaude.backend.procedimentosrapidos.enums.StatusProcedimento;
import com.sistemadesaude.backend.procedimentosrapidos.mapper.AtividadeEnfermagemMapper;
import com.sistemadesaude.backend.procedimentosrapidos.mapper.DesfechoMapper;
import com.sistemadesaude.backend.procedimentosrapidos.mapper.ProcedimentoRapidoMapper;
import com.sistemadesaude.backend.procedimentosrapidos.repository.AtividadeEnfermagemRepository;
import com.sistemadesaude.backend.procedimentosrapidos.repository.ProcedimentoRapidoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProcedimentoRapidoServiceImpl implements ProcedimentoRapidoService {

    private final ProcedimentoRapidoRepository procedimentoRepository;
    private final AtividadeEnfermagemRepository atividadeRepository;
    private final PacienteRepository pacienteRepository;
    private final OperadorRepository operadorRepository;
    private final ProcedimentoRapidoMapper procedimentoMapper;
    private final AtividadeEnfermagemMapper atividadeMapper;
    private final DesfechoMapper desfechoMapper;

    @Override
    @Transactional
    public ProcedimentoRapidoDTO criar(CriarProcedimentoRapidoRequest request, String operadorLogin) {
        log.info("Criando procedimento rápido para paciente ID: {}", request.getPacienteId());

        // Busca paciente
        Paciente paciente = pacienteRepository.findById(request.getPacienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado"));

        // Cria procedimento
        ProcedimentoRapido procedimento = ProcedimentoRapido.builder()
                .paciente(paciente)
                .status(StatusProcedimento.AGUARDANDO)
                .origemEncaminhamento(request.getOrigemEncaminhamento())
                .atendimentoMedicoOrigemId(request.getAtendimentoMedicoOrigemId())
                .medicoSolicitante(request.getMedicoSolicitante())
                .especialidadeOrigem(request.getEspecialidadeOrigem())
                .alergias(request.getAlergias())
                .observacoesGerais(request.getObservacoesGerais())
                .criadoPor(operadorLogin)
                .atividades(new ArrayList<>())
                .build();

        // Adiciona atividades
        if (request.getAtividades() != null && !request.getAtividades().isEmpty()) {
            for (AtividadeEnfermagemDTO atividadeDTO : request.getAtividades()) {
                AtividadeEnfermagem atividade = atividadeMapper.toEntity(atividadeDTO);
                atividade.setSituacao(SituacaoAtividade.PENDENTE);
                procedimento.adicionarAtividade(atividade);
            }
        }

        ProcedimentoRapido salvo = procedimentoRepository.save(procedimento);
        log.info("Procedimento rápido criado com sucesso. ID: {}", salvo.getId());

        return procedimentoMapper.toDTO(salvo);
    }

    @Override
    @Transactional(readOnly = true)
    public ProcedimentoRapidoDTO buscarPorId(Long id) {
        log.debug("Buscando procedimento rápido por ID: {}", id);

        ProcedimentoRapido procedimento = procedimentoRepository.findByIdWithAssociations(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procedimento rápido não encontrado"));

        return procedimentoMapper.toDTO(procedimento);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProcedimentoRapidoListDTO> listarTodos() {
        log.debug("Listando todos os procedimentos rápidos");

        try {
            List<ProcedimentoRapido> procedimentos = procedimentoRepository.findAllWithAssociations();
            log.debug("Encontrados {} procedimentos", procedimentos.size());
            return procedimentos.stream()
                    .map(procedimentoMapper::toListDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Erro ao listar procedimentos: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProcedimentoRapidoListDTO> listarComFiltros(
            LocalDateTime dataInicio,
            LocalDateTime dataFim,
            StatusProcedimento status
    ) {
        log.debug("Listando procedimentos com filtros - Data: {} a {}, Status: {}", dataInicio, dataFim, status);

        List<ProcedimentoRapido> procedimentos;

        if (dataInicio != null && dataFim != null && status != null) {
            procedimentos = procedimentoRepository.findByStatusAndPeriodo(status, dataInicio, dataFim);
        } else if (dataInicio != null && dataFim != null) {
            procedimentos = procedimentoRepository.findByPeriodo(dataInicio, dataFim);
        } else if (status != null) {
            procedimentos = procedimentoRepository.findByStatusOrderByDataCriacaoDesc(status);
        } else {
            procedimentos = procedimentoRepository.findAll();
        }

        return procedimentos.stream()
                .map(procedimentoMapper::toListDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProcedimentoRapidoListDTO> listarComFiltrosAvancados(
            LocalDateTime dataInicio,
            LocalDateTime dataFim,
            List<StatusProcedimento> statuses,
            String especialidade,
            String termoPesquisa
    ) {
        log.debug("Listando procedimentos com filtros avançados - Data: {} a {}, Statuses: {}, Especialidade: {}, Termo: {}", 
                dataInicio, dataFim, statuses, especialidade, termoPesquisa);

        List<ProcedimentoRapido> procedimentos = procedimentoRepository.findAll();

        // Aplica filtro de período
        if (dataInicio != null || dataFim != null) {
            LocalDateTime inicio = dataInicio != null ? dataInicio : LocalDateTime.of(2000, 1, 1, 0, 0);
            LocalDateTime fim = dataFim != null ? dataFim : LocalDateTime.now().plusYears(10);
            procedimentos = procedimentos.stream()
                    .filter(p -> {
                        LocalDateTime data = p.getDataCriacao() != null ? p.getDataCriacao() : LocalDateTime.now();
                        return !data.isBefore(inicio) && !data.isAfter(fim);
                    })
                    .collect(Collectors.toList());
        }

        // Aplica filtro de status (múltiplos)
        if (statuses != null && !statuses.isEmpty()) {
            procedimentos = procedimentos.stream()
                    .filter(p -> statuses.contains(p.getStatus()))
                    .collect(Collectors.toList());
        }

        // Aplica filtro de especialidade
        if (especialidade != null && !especialidade.trim().isEmpty()) {
            String especialidadeUpper = especialidade.trim().toUpperCase();
            procedimentos = procedimentos.stream()
                    .filter(p -> p.getEspecialidadeOrigem() != null && 
                            p.getEspecialidadeOrigem().toUpperCase().contains(especialidadeUpper))
                    .collect(Collectors.toList());
        }

        // Aplica filtro de termo de pesquisa
        if (termoPesquisa != null && !termoPesquisa.trim().isEmpty()) {
            String termoUpper = termoPesquisa.trim().toUpperCase();
            procedimentos = procedimentos.stream()
                    .filter(p -> {
                        boolean match = false;
                        if (p.getPaciente() != null) {
                            if (p.getPaciente().getNomeCompleto() != null && 
                                p.getPaciente().getNomeCompleto().toUpperCase().contains(termoUpper)) {
                                match = true;
                            }
                            if (p.getPaciente().getCpf() != null && 
                                p.getPaciente().getCpf().toUpperCase().contains(termoUpper)) {
                                match = true;
                            }
                        }
                        if (p.getMedicoSolicitante() != null && 
                            p.getMedicoSolicitante().toUpperCase().contains(termoUpper)) {
                            match = true;
                        }
                        if (p.getEspecialidadeOrigem() != null && 
                            p.getEspecialidadeOrigem().toUpperCase().contains(termoUpper)) {
                            match = true;
                        }
                        if (p.getOrigemEncaminhamento() != null && 
                            p.getOrigemEncaminhamento().toUpperCase().contains(termoUpper)) {
                            match = true;
                        }
                        if (String.valueOf(p.getId()).contains(termoPesquisa.trim())) {
                            match = true;
                        }
                        return match;
                    })
                    .collect(Collectors.toList());
        }

        return procedimentos.stream()
                .map(procedimentoMapper::toListDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProcedimentoRapidoListDTO> listarAguardando() {
        log.debug("Listando procedimentos aguardando atendimento");

        List<ProcedimentoRapido> procedimentos = procedimentoRepository.findAguardandoAtendimento();
        return procedimentos.stream()
                .map(procedimentoMapper::toListDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProcedimentoRapidoListDTO> listarEmAtendimentoPorOperador(Long operadorId) {
        log.debug("Listando procedimentos em atendimento por operador ID: {}", operadorId);

        List<ProcedimentoRapido> procedimentos = procedimentoRepository.findEmAtendimentoPorOperador(operadorId);
        return procedimentos.stream()
                .map(procedimentoMapper::toListDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProcedimentoRapidoListDTO> listarComAtividadesUrgentes() {
        log.debug("Listando procedimentos com atividades urgentes");

        List<ProcedimentoRapido> procedimentos = procedimentoRepository.findWithAtividadesUrgentes();
        return procedimentos.stream()
                .map(procedimentoMapper::toListDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProcedimentoRapidoDTO atualizarStatus(Long id, StatusProcedimento novoStatus, String operadorLogin) {
        log.info("Atualizando status do procedimento ID: {} para {}", id, novoStatus);

        ProcedimentoRapido procedimento = procedimentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procedimento rápido não encontrado"));

        procedimento.setStatus(novoStatus);
        procedimento.setAtualizadoPor(operadorLogin);

        ProcedimentoRapido atualizado = procedimentoRepository.save(procedimento);
        return procedimentoMapper.toDTO(atualizado);
    }

    @Override
    @Transactional
    public ProcedimentoRapidoDTO iniciarAtendimento(Long id, Long operadorId, String operadorLogin) {
        log.info("Iniciando atendimento do procedimento ID: {} pelo operador ID: {}", id, operadorId);

        ProcedimentoRapido procedimento = procedimentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procedimento rápido não encontrado"));

        // Validações
        if (procedimento.getStatus() != StatusProcedimento.AGUARDANDO) {
            throw new BusinessException("Procedimento não está aguardando atendimento");
        }

        if (procedimento.isBloqueado()) {
            throw new BusinessException("Procedimento já está bloqueado por outro operador");
        }

        // Busca operador
        Operador operador = operadorRepository.findById(operadorId)
                .orElseThrow(() -> new ResourceNotFoundException("Operador não encontrado"));

        // Inicia atendimento
        procedimento.setOperadorResponsavel(operador);
        procedimento.iniciarAtendimento(operadorId);
        procedimento.setAtualizadoPor(operadorLogin);

        ProcedimentoRapido atualizado = procedimentoRepository.save(procedimento);
        log.info("Atendimento iniciado com sucesso para procedimento ID: {}", id);

        return procedimentoMapper.toDTO(atualizado);
    }

    @Override
    @Transactional
    public ProcedimentoRapidoDTO adicionarAtividade(Long id, AtividadeEnfermagemDTO atividadeDTO, String operadorLogin) {
        log.info("Adicionando atividade ao procedimento ID: {}", id);

        ProcedimentoRapido procedimento = procedimentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procedimento rápido não encontrado"));

        // Validações
        if (procedimento.getStatus() == StatusProcedimento.FINALIZADO) {
            throw new BusinessException("Não é possível adicionar atividades a um procedimento finalizado");
        }

        if (procedimento.getStatus() == StatusProcedimento.CANCELADO) {
            throw new BusinessException("Não é possível adicionar atividades a um procedimento cancelado");
        }

        // Cria e adiciona atividade
        AtividadeEnfermagem atividade = atividadeMapper.toEntity(atividadeDTO);
        atividade.setSituacao(SituacaoAtividade.PENDENTE);
        procedimento.adicionarAtividade(atividade);
        procedimento.setAtualizadoPor(operadorLogin);

        ProcedimentoRapido atualizado = procedimentoRepository.save(procedimento);
        log.info("Atividade adicionada com sucesso ao procedimento ID: {}", id);

        return procedimentoMapper.toDTO(atualizado);
    }

    @Override
    @Transactional
    public ProcedimentoRapidoDTO executarAtividade(
            Long procedimentoId,
            Long atividadeId,
            ExecutarAtividadeRequest request,
            String operadorLogin
    ) {
        log.info("Executando atividade ID: {} do procedimento ID: {}", atividadeId, procedimentoId);

        ProcedimentoRapido procedimento = procedimentoRepository.findById(procedimentoId)
                .orElseThrow(() -> new ResourceNotFoundException("Procedimento rápido não encontrado"));

        AtividadeEnfermagem atividade = atividadeRepository.findById(atividadeId)
                .orElseThrow(() -> new ResourceNotFoundException("Atividade não encontrada"));

        // Validações
        if (!atividade.getProcedimentoRapido().getId().equals(procedimentoId)) {
            throw new BusinessException("Atividade não pertence ao procedimento informado");
        }

        // Atualiza atividade
        SituacaoAtividade situacaoAnterior = atividade.getSituacao();
        atividade.setSituacao(request.getSituacao());
        atividade.setProfissional(request.getProfissional());
        atividade.setObservacoes(request.getObservacoes());

        // Se executou, registra data/hora e move horário
        if (request.getSituacao() == SituacaoAtividade.EXECUTADO) {
            if (situacaoAnterior == SituacaoAtividade.PENDENTE) {
                atividade.setDataHoraInicial(LocalDateTime.now());
            }
            atividade.setDataHoraFinal(LocalDateTime.now());
            atividade.registrarHorarioExecutado();
        } else if (request.getSituacao() == SituacaoAtividade.EM_EXECUCAO) {
            atividade.setDataHoraInicial(LocalDateTime.now());
        }

        atividadeRepository.save(atividade);
        procedimento.setAtualizadoPor(operadorLogin);
        procedimentoRepository.save(procedimento);

        log.info("Atividade ID: {} executada com sucesso. Nova situação: {}", atividadeId, request.getSituacao());

        return procedimentoMapper.toDTO(procedimento);
    }

    @Override
    @Transactional
    public ProcedimentoRapidoDTO aprazarAtividade(
            Long procedimentoId,
            Long atividadeId,
            AprazarAtividadeRequest request,
            String operadorLogin
    ) {
        log.info("Aprazando atividade ID: {} do procedimento ID: {}", atividadeId, procedimentoId);

        ProcedimentoRapido procedimento = procedimentoRepository.findById(procedimentoId)
                .orElseThrow(() -> new ResourceNotFoundException("Procedimento rápido não encontrado"));

        AtividadeEnfermagem atividade = atividadeRepository.findById(atividadeId)
                .orElseThrow(() -> new ResourceNotFoundException("Atividade não encontrada"));

        // Validações
        if (!atividade.getProcedimentoRapido().getId().equals(procedimentoId)) {
            throw new BusinessException("Atividade não pertence ao procedimento informado");
        }

        if (atividade.getSituacao() != SituacaoAtividade.PENDENTE) {
            throw new BusinessException("Só é possível aprazamento de atividades pendentes");
        }

        // Validação 1: Deve ser maior que a data/hora inicial da atividade
        if (atividade.getDataHoraInicial() != null && 
            request.getNovoHorario().isBefore(atividade.getDataHoraInicial())) {
            throw new BusinessException("O novo horário deve ser maior que a data/hora inicial da atividade");
        }

        // Validação 2: Deve ser maior que as execuções anteriores
        if (!atividade.getHorariosAnteriores().isEmpty()) {
            LocalDateTime ultimoHorarioAnterior = atividade.getHorariosAnteriores()
                    .stream()
                    .max(LocalDateTime::compareTo)
                    .orElse(null);
            if (ultimoHorarioAnterior != null && request.getNovoHorario().isBefore(ultimoHorarioAnterior)) {
                throw new BusinessException("O novo horário deve ser maior que as execuções anteriores");
            }
        }

        // Validação 3: Permite aprazamento de no máximo um dia a partir da data atual
        LocalDateTime limiteMaximo = LocalDateTime.now().plusDays(1);
        if (request.getNovoHorario().isAfter(limiteMaximo)) {
            throw new BusinessException("O aprazamento não pode ser superior a 1 dia a partir da data atual");
        }

        // Validação 4: Se já houver atividades executadas na sequência, não permite aprazamento
        // Verifica se há atividades da mesma programação já executadas
        List<AtividadeEnfermagem> atividadesMesmaProgramacao = procedimento.getAtividades().stream()
                .filter(a -> a.getIntervaloMinutos() != null && 
                            a.getIntervaloMinutos().equals(atividade.getIntervaloMinutos()) &&
                            a.getDataHoraInicial() != null &&
                            atividade.getDataHoraInicial() != null &&
                            a.getDataHoraInicial().equals(atividade.getDataHoraInicial()))
                .collect(Collectors.toList());

        boolean temAtividadesExecutadas = atividadesMesmaProgramacao.stream()
                .anyMatch(a -> a.getSituacao() == SituacaoAtividade.EXECUTADO);

        if (temAtividadesExecutadas) {
            throw new BusinessException("Não é possível informar novo horário pois existem atividades já executadas na sequência");
        }

        // Salva horário anterior
        if (!atividade.getHorariosAprazados().isEmpty()) {
            LocalDateTime horarioAnterior = atividade.getHorariosAprazados().get(0);
            atividade.getHorariosAnteriores().add(horarioAnterior);
        }

        // Atualiza horários
        List<LocalDateTime> novosHorarios = new ArrayList<>();
        novosHorarios.add(request.getNovoHorario());

        // Recalcula horários subsequentes se houver intervalo
        if (atividade.getIntervaloMinutos() != null && atividade.getIntervaloMinutos() > 0) {
            int quantidadeHorarios = atividade.getHorariosAprazados().size();
            for (int i = 1; i < quantidadeHorarios; i++) {
                LocalDateTime proximoHorario = novosHorarios.get(i - 1).plusMinutes(atividade.getIntervaloMinutos());
                novosHorarios.add(proximoHorario);
            }
        }

        atividade.setHorariosAprazados(novosHorarios);
        atividadeRepository.save(atividade);

        procedimento.setAtualizadoPor(operadorLogin);
        procedimentoRepository.save(procedimento);

        log.info("Atividade ID: {} aprazada com sucesso para: {}", atividadeId, request.getNovoHorario());

        return procedimentoMapper.toDTO(procedimento);
    }

    @Override
    @Transactional
    public ProcedimentoRapidoDTO registrarDesfecho(Long id, RegistrarDesfechoRequest request, String operadorLogin) {
        log.info("Registrando desfecho para procedimento ID: {}", id);

        ProcedimentoRapido procedimento = procedimentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procedimento rápido não encontrado"));

        // Validações
        if (procedimento.getStatus() == StatusProcedimento.FINALIZADO) {
            throw new BusinessException("Procedimento já foi finalizado");
        }

        if (procedimento.getStatus() == StatusProcedimento.CANCELADO) {
            throw new BusinessException("Não é possível registrar desfecho em procedimento cancelado");
        }

        // Cria desfecho
        Desfecho desfecho = Desfecho.builder()
                .tipo(request.getTipo())
                .setorDestino(request.getSetorDestino())
                .especialidade(request.getEspecialidade())
                .procedimentoSolicitado(request.getProcedimentoSolicitado())
                .dataAgendadaReavaliacao(request.getDataAgendadaReavaliacao())
                .observacoes(request.getObservacoes())
                .dataRegistro(LocalDateTime.now())
                .profissionalResponsavel(operadorLogin)
                .build();

        procedimento.setDesfecho(desfecho);
        procedimento.finalizar();
        procedimento.setAtualizadoPor(operadorLogin);

        ProcedimentoRapido atualizado = procedimentoRepository.save(procedimento);
        log.info("Desfecho registrado e procedimento finalizado. ID: {}", id);

        return procedimentoMapper.toDTO(atualizado);
    }

    @Override
    @Transactional
    public ProcedimentoRapidoDTO cancelar(Long id, CancelarProcedimentoRequest request, String operadorLogin) {
        log.info("Cancelando procedimento ID: {}", id);

        ProcedimentoRapido procedimento = procedimentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procedimento rápido não encontrado"));

        // Validações
        if (procedimento.getStatus() == StatusProcedimento.FINALIZADO) {
            throw new BusinessException("Não é possível cancelar um procedimento finalizado");
        }

        if (procedimento.getStatus() == StatusProcedimento.CANCELADO) {
            throw new BusinessException("Procedimento já está cancelado");
        }

        // Verifica se há atividades pendentes
        boolean temAtividadesPendentes = procedimento.temAtividadesPendentes();
        long quantidadeAtividadesPendentes = procedimento.contarAtividadesPendentes();

        if (temAtividadesPendentes) {
            // Se não foi solicitado cancelar atividades pendentes, exige observações
            if (!request.getCancelarAtividadesPendentes() && 
                (request.getObservacoes() == null || request.getObservacoes().trim().isEmpty())) {
                throw new BusinessException(
                    "O usuário possui " + quantidadeAtividadesPendentes + 
                    " atividade(s) pendente(s) para execução. " +
                    "É obrigatório informar observações ao cancelar o atendimento com atividades pendentes."
                );
            }

            log.warn("Cancelando procedimento ID: {} com {} atividades pendentes", id, quantidadeAtividadesPendentes);

            // Cancela todas as atividades pendentes
            String observacaoCancelamento = request.getObservacoes() != null && !request.getObservacoes().trim().isEmpty()
                ? request.getObservacoes()
                : "Cancelado automaticamente junto com o procedimento";

            procedimento.getAtividades().stream()
                    .filter(a -> a.getSituacao() == SituacaoAtividade.PENDENTE)
                    .forEach(a -> {
                        a.setSituacao(SituacaoAtividade.CANCELADO);
                        a.setObservacoes(observacaoCancelamento);
                    });
        }

        procedimento.cancelar(operadorLogin, request.getMotivo());
        procedimento.setAtualizadoPor(operadorLogin);

        ProcedimentoRapido atualizado = procedimentoRepository.save(procedimento);
        log.info("Procedimento ID: {} cancelado com sucesso", id);

        return procedimentoMapper.toDTO(atualizado);
    }

    @Override
    @Transactional
    public ProcedimentoRapidoDTO desbloquear(Long id, Long operadorId) {
        log.info("Desbloqueando procedimento ID: {} pelo operador ID: {}", id, operadorId);

        ProcedimentoRapido procedimento = procedimentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procedimento rápido não encontrado"));

        // Validações
        if (!procedimento.isBloqueado()) {
            throw new BusinessException("Procedimento não está bloqueado");
        }

        if (!procedimento.podeDesbloquear(operadorId)) {
            throw new BusinessException("Apenas outro operador pode desbloquear este procedimento");
        }

        if (procedimento.getStatus() != StatusProcedimento.EM_ATENDIMENTO) {
            throw new BusinessException("Só é possível desbloquear procedimentos em atendimento");
        }

        procedimento.desbloquear();
        procedimento.setStatus(StatusProcedimento.AGUARDANDO);
        procedimento.setOperadorResponsavel(null);

        ProcedimentoRapido atualizado = procedimentoRepository.save(procedimento);
        log.info("Procedimento ID: {} desbloqueado com sucesso", id);

        return procedimentoMapper.toDTO(atualizado);
    }

    @Override
    @Transactional(readOnly = true)
    public ProcedimentoRapidoDTO obterHistorico(Long id) {
        log.debug("Obtendo histórico completo do procedimento ID: {}", id);

        ProcedimentoRapido procedimento = procedimentoRepository.findByIdWithAssociations(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procedimento rápido não encontrado"));

        return procedimentoMapper.toDTO(procedimento);
    }

    @Override
    @Transactional
    public ProcedimentoRapidoDTO encaminharDeAtendimento(EncaminharParaProcedimentoRequest request, String operadorLogin) {
        log.info("Encaminhando paciente ID: {} do atendimento ID: {} para Procedimentos Rápidos",
                request.getPacienteId(), request.getAtendimentoId());

        // Valida se paciente existe
        if (!pacienteRepository.existsById(request.getPacienteId())) {
            throw new ResourceNotFoundException("Paciente não encontrado");
        }

        // Determina a origem do encaminhamento baseado no tipo de desfecho
        String origem = "Atendimento Ambulatorial";
        if (request.getTipoDesfecho() != null) {
            switch (request.getTipoDesfecho()) {
                case "ALTA_SE_MELHORA":
                    origem = "Atendimento Ambulatorial - Alta se melhora";
                    break;
                case "ALTA_APOS_MEDICACAO":
                    origem = "Atendimento Ambulatorial - Alta após medicação/procedimento";
                    break;
                case "CUIDADOS_ENFERMAGEM":
                    origem = "Atendimento Ambulatorial - Cuidados de Enfermagem";
                    break;
                default:
                    origem = "Atendimento Ambulatorial";
            }
        }

        // Cria procedimento rápido
        CriarProcedimentoRapidoRequest criarRequest = CriarProcedimentoRapidoRequest.builder()
                .pacienteId(request.getPacienteId())
                .origemEncaminhamento(origem)
                .atendimentoMedicoOrigemId(request.getAtendimentoId())
                .medicoSolicitante(request.getMedicoSolicitante())
                .especialidadeOrigem(request.getEspecialidadeOrigem())
                .alergias(request.getAlergias())
                .observacoesGerais(request.getObservacoes())
                .atividades(request.getAtividades())
                .build();

        ProcedimentoRapidoDTO procedimento = criar(criarRequest, operadorLogin);

        // Se foi informado setorId, atualiza o procedimento com essa informação
        // (Nota: isso pode requerer uma atualização adicional se a entidade tiver campo setor)
        if (request.getSetorId() != null) {
            log.debug("Setor ID informado: {} para procedimento ID: {}", request.getSetorId(), procedimento.getId());
            // O setor pode ser armazenado nas observações ou em um campo específico se existir
            if (procedimento.getObservacoesGerais() != null && !procedimento.getObservacoesGerais().isEmpty()) {
                procedimento.setObservacoesGerais(
                    procedimento.getObservacoesGerais() + 
                    String.format(" | Setor ID: %d | Tipo Desfecho: %s", 
                        request.getSetorId(), 
                        request.getTipoDesfecho() != null ? request.getTipoDesfecho() : "N/A")
                );
            } else {
                procedimento.setObservacoesGerais(
                    String.format("Setor ID: %d | Tipo Desfecho: %s", 
                        request.getSetorId(), 
                        request.getTipoDesfecho() != null ? request.getTipoDesfecho() : "N/A")
                );
            }
        }

        return procedimento;
    }

    @Override
    @Transactional
    public ProcedimentoRapidoDTO vincularPaciente(Long id, Long pacienteId, String operadorLogin) {
        log.info("Vinculando paciente ID: {} ao procedimento ID: {}", pacienteId, id);

        ProcedimentoRapido procedimento = procedimentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procedimento rápido não encontrado"));

        // Validações
        if (procedimento.getStatus() == StatusProcedimento.FINALIZADO) {
            throw new BusinessException("Não é possível vincular paciente a um procedimento finalizado");
        }

        if (procedimento.getStatus() == StatusProcedimento.CANCELADO) {
            throw new BusinessException("Não é possível vincular paciente a um procedimento cancelado");
        }

        // Busca o novo paciente
        Paciente novoPaciente = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado"));

        // Atualiza o paciente do procedimento
        procedimento.setPaciente(novoPaciente);
        procedimento.setAtualizadoPor(operadorLogin);

        ProcedimentoRapido atualizado = procedimentoRepository.save(procedimento);
        log.info("Paciente vinculado com sucesso ao procedimento ID: {}", id);

        return procedimentoMapper.toDTO(atualizado);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean temProcedimentoAtivo(Long pacienteId) {
        log.debug("Verificando se paciente ID: {} tem procedimento ativo", pacienteId);
        return procedimentoRepository.temProcedimentoAtivo(pacienteId);
    }

    @Override
    @Transactional(readOnly = true)
    public ProcedimentoRapidoDTO buscarProcedimentoAtivoPorPaciente(Long pacienteId) {
        log.debug("Buscando procedimento ativo para paciente ID: {}", pacienteId);
        ProcedimentoRapido procedimento = procedimentoRepository.findProcedimentoAtivoPorPaciente(pacienteId)
                .orElseThrow(() -> new ResourceNotFoundException("Nenhum procedimento ativo encontrado para o paciente"));
        return procedimentoMapper.toDTO(procedimento);
    }
}
