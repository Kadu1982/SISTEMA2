package com.sistemadesaude.backend.samu.service;

import com.sistemadesaude.backend.exception.BusinessException;
import com.sistemadesaude.backend.exception.ResourceNotFoundException;
import com.sistemadesaude.backend.samu.dto.AtualizarStatusViaturaDTO;
import com.sistemadesaude.backend.samu.dto.ViaturaDTO;
import com.sistemadesaude.backend.samu.dto.ViaturaRequestDTO;
import com.sistemadesaude.backend.samu.entity.BaseOperacional;
import com.sistemadesaude.backend.samu.entity.Viatura;
import com.sistemadesaude.backend.samu.enums.StatusViatura;
import com.sistemadesaude.backend.samu.enums.TipoViatura;
import com.sistemadesaude.backend.samu.mapper.ViaturaMapper;
import com.sistemadesaude.backend.samu.repository.BaseOperacionalRepository;
import com.sistemadesaude.backend.samu.repository.ViaturaRepository;
import com.sistemadesaude.backend.samu.websocket.SamuWebSocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service para gerenciar Viaturas
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ViaturaService {

    private final ViaturaRepository viaturaRepository;
    private final BaseOperacionalRepository baseRepository;
    private final ViaturaMapper mapper;
    private final SamuWebSocketService webSocketService;

    /**
     * Lista todas as viaturas ativas
     */
    @Transactional(readOnly = true)
    public List<ViaturaDTO> listarAtivas() {
        log.info("Listando viaturas ativas");
        return viaturaRepository.findByAtivaTrue().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lista viaturas por status
     */
    @Transactional(readOnly = true)
    public List<ViaturaDTO> listarPorStatus(StatusViatura status) {
        log.info("Listando viaturas com status: {}", status);
        return viaturaRepository.findByStatusAndAtivaTrue(status).stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lista viaturas por tipo
     */
    @Transactional(readOnly = true)
    public List<ViaturaDTO> listarPorTipo(TipoViatura tipo) {
        log.info("Listando viaturas tipo: {}", tipo);
        return viaturaRepository.findByTipoAndAtivaTrue(tipo).stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lista viaturas disponíveis
     */
    @Transactional(readOnly = true)
    public List<ViaturaDTO> listarDisponiveis() {
        log.info("Listando viaturas disponíveis");
        return viaturaRepository.findDisponivels().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lista viaturas disponíveis por tipo
     */
    @Transactional(readOnly = true)
    public List<ViaturaDTO> listarDisponiveisPorTipo(TipoViatura tipo) {
        log.info("Listando viaturas disponíveis tipo: {}", tipo);
        return viaturaRepository.findDisponiveisPorTipo(tipo).stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Busca viatura por ID
     */
    @Transactional(readOnly = true)
    public ViaturaDTO buscarPorId(Long id) {
        log.info("Buscando viatura por ID: {}", id);
        Viatura viatura = viaturaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Viatura não encontrada: " + id));
        return mapper.toDTO(viatura);
    }

    /**
     * Busca viatura por identificação
     */
    @Transactional(readOnly = true)
    public ViaturaDTO buscarPorIdentificacao(String identificacao) {
        log.info("Buscando viatura por identificação: {}", identificacao);
        Viatura viatura = viaturaRepository.findByIdentificacao(identificacao)
                .orElseThrow(() -> new ResourceNotFoundException("Viatura não encontrada: " + identificacao));
        return mapper.toDTO(viatura);
    }

    /**
     * Cria nova viatura
     */
    @Transactional
    public ViaturaDTO criar(ViaturaRequestDTO request) {
        log.info("Criando nova viatura: {}", request.getIdentificacao());

        // Valida se identificação já existe
        if (viaturaRepository.findByIdentificacao(request.getIdentificacao()).isPresent()) {
            throw new BusinessException("Já existe viatura com identificação: " + request.getIdentificacao());
        }

        // Busca base
        BaseOperacional base = baseRepository.findById(request.getBaseId())
                .orElseThrow(() -> new ResourceNotFoundException("Base operacional não encontrada: " + request.getBaseId()));

        // Cria viatura
        Viatura viatura = mapper.toEntity(request, base);
        Viatura saved = viaturaRepository.save(viatura);

        log.info("Viatura criada com sucesso - ID: {}", saved.getId());
        return mapper.toDTO(saved);
    }

    /**
     * Atualiza viatura
     */
    @Transactional
    public ViaturaDTO atualizar(Long id, ViaturaRequestDTO request) {
        log.info("Atualizando viatura ID: {}", id);

        Viatura viatura = viaturaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Viatura não encontrada: " + id));

        // Valida se nova identificação já existe (se foi alterada)
        if (!viatura.getIdentificacao().equals(request.getIdentificacao())) {
            if (viaturaRepository.findByIdentificacao(request.getIdentificacao()).isPresent()) {
                throw new BusinessException("Já existe viatura com identificação: " + request.getIdentificacao());
            }
        }

        // Busca nova base se foi alterada
        BaseOperacional base = null;
        if (!viatura.getBase().getId().equals(request.getBaseId())) {
            base = baseRepository.findById(request.getBaseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Base operacional não encontrada: " + request.getBaseId()));
        }

        // Atualiza
        mapper.updateEntity(request, viatura, base);
        Viatura updated = viaturaRepository.save(viatura);

        log.info("Viatura atualizada com sucesso - ID: {}", updated.getId());
        return mapper.toDTO(updated);
    }

    /**
     * Atualiza status da viatura
     */
    @Transactional
    public ViaturaDTO atualizarStatus(Long id, AtualizarStatusViaturaDTO request) {
        log.info("Atualizando status da viatura ID: {} para {}", id, request.getNovoStatus());

        Viatura viatura = viaturaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Viatura não encontrada: " + id));

        // Valida transição de status
        validarTransicaoStatus(viatura.getStatus(), request.getNovoStatus());

        // Atualiza status
        viatura.setStatus(request.getNovoStatus());

        // Adiciona observação se fornecida
        if (request.getObservacao() != null && !request.getObservacao().isBlank()) {
            String novaObservacao = "[" + java.time.LocalDateTime.now() + "] " + request.getObservacao();
            if (viatura.getObservacoes() != null) {
                viatura.setObservacoes(viatura.getObservacoes() + "\n" + novaObservacao);
            } else {
                viatura.setObservacoes(novaObservacao);
            }
        }

        Viatura updated = viaturaRepository.save(viatura);
        log.info("Status atualizado com sucesso");

        // Notifica via WebSocket
        ViaturaDTO dto = mapper.toDTO(updated);
        Map<String, Object> dados = new HashMap<>();
        dados.put("identificacao", updated.getIdentificacao());
        dados.put("tipo", updated.getTipo().name());
        dados.put("status", updated.getStatus().name());
        dados.put("nivelProntidao", updated.calcularNivelProntidao());

        webSocketService.notificarAtualizacaoViatura(
            updated.getId(),
            updated.getStatus().name(),
            dados
        );

        return dto;
    }

    /**
     * Inativa viatura
     */
    @Transactional
    public void inativar(Long id) {
        log.info("Inativando viatura ID: {}", id);

        Viatura viatura = viaturaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Viatura não encontrada: " + id));

        // Valida se pode inativar (não pode estar em operação)
        if (viatura.isEmOperacao()) {
            throw new BusinessException("Não é possível inativar viatura em operação");
        }

        viatura.setAtiva(false);
        viatura.setStatus(StatusViatura.INDISPONIVEL);
        viaturaRepository.save(viatura);

        log.info("Viatura inativada com sucesso");
    }

    /**
     * Reativa viatura
     */
    @Transactional
    public ViaturaDTO reativar(Long id) {
        log.info("Reativando viatura ID: {}", id);

        Viatura viatura = viaturaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Viatura não encontrada: " + id));

        viatura.setAtiva(true);
        viatura.setStatus(StatusViatura.DISPONIVEL);
        Viatura updated = viaturaRepository.save(viatura);

        log.info("Viatura reativada com sucesso");
        return mapper.toDTO(updated);
    }

    /**
     * Deleta viatura
     */
    @Transactional
    public void deletar(Long id) {
        log.info("Deletando viatura ID: {}", id);

        Viatura viatura = viaturaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Viatura não encontrada: " + id));

        // Valida se pode deletar
        if (viatura.isEmOperacao()) {
            throw new BusinessException("Não é possível deletar viatura em operação");
        }

        viaturaRepository.delete(viatura);
        log.info("Viatura deletada com sucesso");
    }

    /**
     * Obtém estatísticas das viaturas
     */
    @Transactional(readOnly = true)
    public ViaturaEstatisticasDTO obterEstatisticas() {
        log.info("Obtendo estatísticas de viaturas");

        long total = viaturaRepository.count();
        long ativas = viaturaRepository.findByAtivaTrue().size();
        long disponiveis = viaturaRepository.countDisponivels();
        long emOperacao = viaturaRepository.countEmOperacao();

        return ViaturaEstatisticasDTO.builder()
                .total(total)
                .ativas(ativas)
                .disponiveis(disponiveis)
                .emOperacao(emOperacao)
                .inativas(total - ativas)
                .build();
    }

    /**
     * Valida transição de status
     */
    private void validarTransicaoStatus(StatusViatura statusAtual, StatusViatura novoStatus) {
        // Algumas transições não são permitidas
        if (statusAtual == StatusViatura.AVARIADA && novoStatus != StatusViatura.MANUTENCAO) {
            throw new BusinessException("Viatura avariada deve ir para manutenção antes de outros status");
        }

        if (statusAtual == StatusViatura.DISPONIVEL && novoStatus == StatusViatura.TRANSPORTANDO) {
            throw new BusinessException("Viatura disponível não pode ir direto para transportando");
        }

        // Adicione mais regras conforme necessário
    }

    /**
     * DTO para estatísticas
     */
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class ViaturaEstatisticasDTO {
        private Long total;
        private Long ativas;
        private Long inativas;
        private Long disponiveis;
        private Long emOperacao;
    }
}
