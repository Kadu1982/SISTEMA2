package com.sistemadesaude.backend.exames.service;

import com.sistemadesaude.backend.exames.dto.EntregaExameDTO;
import com.sistemadesaude.backend.exames.entity.*;
import com.sistemadesaude.backend.exames.repository.*;
import com.sistemadesaude.backend.exception.BusinessException;
import com.sistemadesaude.backend.exception.ResourceNotFoundException;
import com.sistemadesaude.backend.operador.entity.Operador;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EntregaService {

    private final EntregaExameRepository entregaRepository;
    private final RecepcaoExameRepository recepcaoRepository;
    private final ResultadoExameRepository resultadoRepository;
    private final ConfiguracaoLaboratorioRepository configuracaoRepository;

    @Transactional(readOnly = true)
    public List<RecepcaoExame> listarExamesParaEntrega(Long unidadeId) {
        return recepcaoRepository.findByStatusAndUnidade(RecepcaoExame.StatusRecepcao.FINALIZADO, unidadeId);
    }

    @Transactional(readOnly = true)
    public RecepcaoExame buscarRecepcaoParaEntrega(String numeroRecepcao) {
        RecepcaoExame recepcao = recepcaoRepository.findByNumeroRecepcao(numeroRecepcao)
                .orElseThrow(() -> new ResourceNotFoundException("Recepção não encontrada"));

        if (recepcao.getStatus() != RecepcaoExame.StatusRecepcao.FINALIZADO) {
            throw new BusinessException("Exames ainda não estão finalizados para entrega");
        }

        return recepcao;
    }

    @Transactional(readOnly = true)
    public EntregaExameDTO buscarEntregaPorId(Long id) {
        EntregaExame entrega = entregaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Entrega não encontrada"));
        return converterParaDTO(entrega);
    }

    @Transactional(readOnly = true)
    public List<EntregaExameDTO> listarEntregasPorPeriodo(LocalDateTime dataInicio, LocalDateTime dataFim) {
        List<EntregaExame> entregas = entregaRepository.findByPeriodo(dataInicio, dataFim);
        return entregas.stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public EntregaExameDTO realizarEntrega(Long recepcaoId, String nomeRetirou, String documentoRetirou, 
                                          String parentescoRetirou, String biometriaTemplate, 
                                          String assinaturaRetirada, List<Long> examesEntreguesIds,
                                          Operador operador) {
        
        RecepcaoExame recepcao = recepcaoRepository.findById(recepcaoId)
                .orElseThrow(() -> new ResourceNotFoundException("Recepção não encontrada"));

        // Validar configurações de entrega
        ConfiguracaoLaboratorio config = configuracaoRepository
                .findByUnidadeId(recepcao.getUnidade().getId())
                .orElse(null);

        boolean biometriaValida = false;
        boolean documentoValido = false;

        if (config != null) {
            validarEntrega(config, documentoRetirou, biometriaTemplate, recepcao);
            biometriaValida = biometriaTemplate != null && validarBiometria(recepcao.getBiometriaTemplate(), biometriaTemplate);
            documentoValido = documentoRetirou != null && !documentoRetirou.trim().isEmpty();
        }

        // Verificar se já existe entrega
        EntregaExame entregaExistente = entregaRepository.findByRecepcaoId(recepcaoId).orElse(null);
        EntregaExame entrega;

        if (entregaExistente != null) {
            // Entrega parcial - adicionar mais exames
            entrega = entregaExistente;
        } else {
            // Nova entrega
            entrega = EntregaExame.builder()
                    .recepcao(recepcao)
                    .dataEntrega(LocalDateTime.now())
                    .operadorEntrega(operador)
                    .nomeRetirou(nomeRetirou)
                    .documentoRetirou(documentoRetirou)
                    .parentescoRetirou(parentescoRetirou)
                    .biometriaValidada(biometriaValida)
                    .documentoValidado(documentoValido)
                    .assinaturaRetirada(assinaturaRetirada)
                    .build();
        }

        // Adicionar exames entregues
        for (Long exameRecepcaoId : examesEntreguesIds) {
            ExameRecepcao exameRecepcao = recepcao.getExames().stream()
                    .filter(er -> er.getId().equals(exameRecepcaoId))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Exame não encontrado na recepção"));

            // Verificar se o resultado existe e está assinado
            ResultadoExame resultado = resultadoRepository.findByExameRecepcaoId(exameRecepcaoId)
                    .orElseThrow(() -> new BusinessException("Resultado não encontrado para o exame"));

            if (resultado.getProfissionalAssinatura() == null) {
                throw new BusinessException("Exame " + exameRecepcao.getExame().getNome() + " ainda não foi assinado");
            }

            // Verificar se já foi entregue
            boolean jaEntregue = entrega.getExamesEntregues().stream()
                    .anyMatch(ee -> ee.getExameRecepcao().getId().equals(exameRecepcaoId));

            if (!jaEntregue) {
                ExameEntregue exameEntregue = ExameEntregue.builder()
                        .entrega(entrega)
                        .exameRecepcao(exameRecepcao)
                        .viasImpressas(1)
                        .build();

                entrega.getExamesEntregues().add(exameEntregue);
            }
        }

        // Verificar se todos os exames foram entregues
        boolean todosEntregues = recepcao.getExames().size() == entrega.getExamesEntregues().size();
        if (todosEntregues) {
            recepcao.setStatus(RecepcaoExame.StatusRecepcao.ENTREGUE);
        }

        EntregaExame entregaSalva = entregaRepository.save(entrega);
        return converterParaDTO(entregaSalva);
    }

    @Transactional(readOnly = true)
    public List<EntregaExameDTO> buscarEntregasPorNome(String nomeRetirou) {
        List<EntregaExame> entregas = entregaRepository.findByNomeRetirou(nomeRetirou);
        return entregas.stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EntregaExameDTO> buscarEntregasPorDocumento(String documentoRetirou) {
        List<EntregaExame> entregas = entregaRepository.findByDocumentoRetirou(documentoRetirou);
        return entregas.stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    private void validarEntrega(ConfiguracaoLaboratorio config, String documentoRetirou, 
                               String biometriaTemplate, RecepcaoExame recepcao) {
        
        if (config.getVerificarDocumentoEntrega() && (documentoRetirou == null || documentoRetirou.trim().isEmpty())) {
            throw new BusinessException("Documento é obrigatório para entrega");
        }

        if (config.getVerificarBiometriaEntrega() && (biometriaTemplate == null || biometriaTemplate.trim().isEmpty())) {
            throw new BusinessException("Biometria é obrigatória para entrega");
        }

        // Validar biometria se foi coletada na recepção
        if (config.getVerificarBiometriaEntrega() && recepcao.getBiometriaColetada()) {
            if (!validarBiometria(recepcao.getBiometriaTemplate(), biometriaTemplate)) {
                throw new BusinessException("Biometria não confere com a coletada na recepção");
            }
        }
    }

    private boolean validarBiometria(String biometriaRecepcao, String biometriaEntrega) {
        // Implementação simplificada - em produção usaria SDK de biometria
        return biometriaRecepcao != null && biometriaRecepcao.equals(biometriaEntrega);
    }

    private EntregaExameDTO converterParaDTO(EntregaExame entrega) {
        List<EntregaExameDTO.ExameEntregueDTO> examesEntregues = entrega.getExamesEntregues().stream()
                .map(ee -> EntregaExameDTO.ExameEntregueDTO.builder()
                        .exameRecepcaoId(ee.getExameRecepcao().getId())
                        .exameNome(ee.getExameRecepcao().getExame().getNome())
                        .viasImpressas(ee.getViasImpressas())
                        .build())
                .collect(Collectors.toList());

        return EntregaExameDTO.builder()
                .id(entrega.getId())
                .recepcaoId(entrega.getRecepcao().getId())
                .numeroRecepcao(entrega.getRecepcao().getNumeroRecepcao())
                .pacienteNome(entrega.getRecepcao().getPaciente().getNomeExibicao())
                .dataEntrega(entrega.getDataEntrega())
                .operadorEntrega(entrega.getOperadorEntrega().getNome())
                .nomeRetirou(entrega.getNomeRetirou())
                .documentoRetirou(entrega.getDocumentoRetirou())
                .parentescoRetirou(entrega.getParentescoRetirou())
                .biometriaValidada(entrega.getBiometriaValidada())
                .documentoValidado(entrega.getDocumentoValidado())
                .examesEntregues(examesEntregues)
                .observacoes(entrega.getObservacoes())
                .build();
    }
}