package com.sistemadesaude.backend.samu.service;

import com.sistemadesaude.backend.samu.entity.Ocorrencia;
import com.sistemadesaude.backend.samu.entity.PacienteOcorrencia;
import com.sistemadesaude.backend.samu.entity.EventoOcorrencia;
import com.sistemadesaude.backend.samu.dto.CriarOcorrenciaDTO;
import com.sistemadesaude.backend.samu.dto.OcorrenciaDetalhadaDTO;
import com.sistemadesaude.backend.samu.dto.ResumoOcorrenciaDTO;
import com.sistemadesaude.backend.samu.dto.PacienteOcorrenciaDTO;
import com.sistemadesaude.backend.samu.enums.StatusOcorrencia;
import com.sistemadesaude.backend.samu.enums.TipoEvento;
import com.sistemadesaude.backend.samu.enums.PrioridadeOcorrencia;
import com.sistemadesaude.backend.samu.repository.OcorrenciaRepository;
import com.sistemadesaude.backend.samu.repository.CentralRegulacaoRepository;
import com.sistemadesaude.backend.operador.repository.OperadorRepository;
import com.sistemadesaude.backend.samu.mapper.OcorrenciaMapper;
import com.sistemadesaude.backend.samu.websocket.SamuWebSocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

@Slf4j
@Service  // ✅ ADICIONADA ANOTAÇÃO @Service
@RequiredArgsConstructor
public class RegistroOcorrenciaService {

    private final OcorrenciaRepository ocorrenciaRepository;
    private final CentralRegulacaoRepository centralRegulacaoRepository;
    private final OperadorRepository operadorRepository;
    private final OcorrenciaMapper ocorrenciaMapper;
    private final NotificacaoService notificacaoService;
    private final GeocodeService geocodeService;
    private final SamuWebSocketService webSocketService;

    private static final AtomicLong numeroSequencial = new AtomicLong(1);

    @Transactional
    public OcorrenciaDetalhadaDTO criarOcorrencia(CriarOcorrenciaDTO dto, Long operadorId) {
        log.info("Criando nova ocorrência. Operador: {}", operadorId);

        // Validações
        var centralRegulacao = centralRegulacaoRepository.findById(dto.getCentralRegulacaoId())
                .orElseThrow(() -> new IllegalArgumentException("Central de regulação não encontrada"));

        var operador = operadorRepository.findById(operadorId)
                .orElseThrow(() -> new IllegalArgumentException("Operador não encontrado"));

        // Geocoding se necessário
        if (dto.getLatitude() == null || dto.getLongitude() == null) {
            var coordenadas = geocodeService.obterCoordenadas(dto.getEnderecoCompleto());
            dto.setLatitude(coordenadas.getLatitude());
            dto.setLongitude(coordenadas.getLongitude());
        }

        // Criar ocorrência
        var ocorrencia = Ocorrencia.builder()
                .numeroOcorrencia(gerarNumeroOcorrencia())
                .tipoOcorrencia(dto.getTipoOcorrencia())
                .status(StatusOcorrencia.ABERTA)
                .prioridade(dto.getPrioridade())
                .telefoneSolicitante(dto.getTelefoneSolicitante())
                .nomeSolicitante(dto.getNomeSolicitante())
                .enderecoCompleto(dto.getEnderecoCompleto())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .descricaoOcorrencia(dto.getDescricaoOcorrencia())
                .queixaPrincipal(dto.getQueixaPrincipal())
                .centralRegulacao(centralRegulacao)
                .operador(operador)
                .observacoes(dto.getObservacoes())
                .build();

        // Salvar ocorrência
        ocorrencia = ocorrenciaRepository.save(ocorrencia);

        // Adicionar pacientes se informados
        if (dto.getPacientes() != null && !dto.getPacientes().isEmpty()) {
            for (var pacienteDto : dto.getPacientes()) {
                adicionarPacienteOcorrencia(ocorrencia, pacienteDto);
            }
        }

        // Registrar evento de abertura
        registrarEvento(ocorrencia, TipoEvento.ABERTURA_OCORRENCIA,
                "Ocorrência aberta pelo operador", operadorId);

        // Notificar regulação se prioridade alta
        if (isPrioridadeAlta(dto.getPrioridade())) {
            notificacaoService.notificarRegulacoesUrgentes(ocorrencia);
        }

        log.info("Ocorrência criada com sucesso. Número: {}", ocorrencia.getNumeroOcorrencia());

        // Notifica via WebSocket
        Map<String, Object> dados = new HashMap<>();
        dados.put("numeroOcorrencia", ocorrencia.getNumeroOcorrencia());
        dados.put("prioridade", ocorrencia.getPrioridade().name());
        dados.put("status", ocorrencia.getStatus().name());
        dados.put("endereco", ocorrencia.getEnderecoCompleto());
        dados.put("queixa", ocorrencia.getQueixaPrincipal());

        webSocketService.notificarNovaOcorrencia(
            ocorrencia.getId(),
            ocorrencia.getPrioridade().name(),
            dados
        );

        return ocorrenciaMapper.toDetalhadaDTO(ocorrencia);
    }

    @Transactional(readOnly = true)
    public Page<ResumoOcorrenciaDTO> buscarOcorrenciasAbertas(Pageable pageable, Long centralId) {
        var status = List.of(StatusOcorrencia.ABERTA, StatusOcorrencia.AGUARDANDO_REGULACAO);

        Page<Ocorrencia> ocorrencias;
        if (centralId != null) {
            ocorrencias = ocorrenciaRepository.findByStatusInAndCentralRegulacaoIdOrderByPrioridadeAscDataAberturaAsc(
                    status, centralId, pageable);
        } else {
            ocorrencias = ocorrenciaRepository.findByStatusInOrderByPrioridadeAscDataAberturaAsc(
                    status, pageable);
        }

        return ocorrencias.map(ocorrenciaMapper::toResumoDTO);
    }

    @Transactional
    public void encaminharParaRegulacao(Long ocorrenciaId, Long operadorId) {
        log.info("Encaminhando ocorrência {} para regulação. Operador: {}", ocorrenciaId, operadorId);

        var ocorrencia = buscarOcorrenciaPorId(ocorrenciaId);

        if (ocorrencia.getStatus() != StatusOcorrencia.ABERTA) {
            throw new IllegalStateException("Apenas ocorrências abertas podem ser encaminhadas para regulação");
        }

        ocorrencia.setStatus(StatusOcorrencia.AGUARDANDO_REGULACAO);
        ocorrenciaRepository.save(ocorrencia);

        registrarEvento(ocorrencia, TipoEvento.ENCAMINHAMENTO_REGULACAO,
                "Ocorrência encaminhada para regulação médica", operadorId);

        notificacaoService.notificarNovaOcorrenciaRegulacao(ocorrencia);
    }

    @Transactional(readOnly = true)
    public OcorrenciaDetalhadaDTO buscarOcorrenciaDetalhada(Long id) {
        var ocorrencia = buscarOcorrenciaPorId(id);
        return ocorrenciaMapper.toDetalhadaDTO(ocorrencia);
    }

    @Transactional
    public void adicionarPaciente(Long ocorrenciaId, PacienteOcorrenciaDTO pacienteDto, Long operadorId) {
        var ocorrencia = buscarOcorrenciaPorId(ocorrenciaId);
        adicionarPacienteOcorrencia(ocorrencia, pacienteDto);

        registrarEvento(ocorrencia, TipoEvento.ADICAO_PACIENTE,
                "Paciente adicionado: " + pacienteDto.getNomeInformado(), operadorId);
    }

    @Transactional
    public void atualizarLocalizacao(Long ocorrenciaId, Double latitude, Double longitude, Long operadorId) {
        var ocorrencia = buscarOcorrenciaPorId(ocorrenciaId);

        ocorrencia.setLatitude(latitude);
        ocorrencia.setLongitude(longitude);
        ocorrenciaRepository.save(ocorrencia);

        registrarEvento(ocorrencia, TipoEvento.ATUALIZACAO_LOCALIZACAO,
                String.format("Localização atualizada: %.6f, %.6f", latitude, longitude), operadorId);
    }

    // Métodos auxiliares privados
    private Ocorrencia buscarOcorrenciaPorId(Long id) {
        return ocorrenciaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ocorrência não encontrada"));
    }

    private void adicionarPacienteOcorrencia(Ocorrencia ocorrencia, PacienteOcorrenciaDTO pacienteDto) {
        var pacienteOcorrencia = PacienteOcorrencia.builder()
                .ocorrencia(ocorrencia)
                .nomeInformado(pacienteDto.getNomeInformado())
                .idadeAnos(pacienteDto.getIdadeAnos())
                .idadeMeses(pacienteDto.getIdadeMeses())
                .sexo(pacienteDto.getSexo())
                .queixaEspecifica(pacienteDto.getQueixaEspecifica())
                .build();

        ocorrencia.getPacientes().add(pacienteOcorrencia);
    }

    /**
     * 🔧 MÉTODO CORRIGIDO - USA ENUM DIRETO, NÃO STRING
     */
    private void registrarEvento(Ocorrencia ocorrencia, TipoEvento tipoEvento, String descricao, Long operadorId) {
        // ✅ Buscar a entidade Operador para o relacionamento JPA
        var operador = operadorRepository.findById(operadorId)
                .orElseThrow(() -> new IllegalArgumentException("Operador não encontrado"));

        var evento = EventoOcorrencia.builder()
                .ocorrencia(ocorrencia)
                .tipoEvento(tipoEvento) // ✅ CORRIGIDO: usa enum diretamente, não .name()
                .descricao(descricao) // ✅ CORRIGIDO: campo se chama 'descricao', não 'descricaoEvento'
                .operador(operador) // ✅ Relacionamento JPA com entidade Operador
                .dataHora(LocalDateTime.now()) // ✅ CORRIGIDO: campo se chama 'dataHora', não 'dataHoraEvento'
                .dadosAdicionais("Evento registrado automaticamente pelo sistema") // ✅ Campo adicional
                .build();

        // ✅ Verificar se a coleção de eventos existe, caso contrário inicializar
        if (ocorrencia.getEventos() == null) {
            ocorrencia.setEventos(new java.util.ArrayList<>());
        }

        // ✅ Adicionar o evento à coleção da ocorrência
        ocorrencia.getEventos().add(evento);
    }

    private String gerarNumeroOcorrencia() {
        var agora = LocalDateTime.now();
        var formato = DateTimeFormatter.ofPattern("yyyyMMdd");
        var data = agora.format(formato);
        var sequencial = String.format("%05d", numeroSequencial.getAndIncrement());
        return data + "-" + sequencial;
    }

    private boolean isPrioridadeAlta(PrioridadeOcorrencia prioridade) {
        return prioridade.getNivel() <= 2; // Emergência ou Urgência
    }
}
