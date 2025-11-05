package com.sistemadesaude.backend.exames.service;

import com.sistemadesaude.backend.exames.dto.ColetaMaterialDTO;
import com.sistemadesaude.backend.exames.dto.MaterialColetadoDTO;
import com.sistemadesaude.backend.exames.entity.*;
import com.sistemadesaude.backend.exames.repository.*;
import com.sistemadesaude.backend.exception.BusinessException;
import com.sistemadesaude.backend.exception.ResourceNotFoundException;
import com.sistemadesaude.backend.operador.entity.Operador;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ColetaService {

    private final ColetaMaterialRepository coletaRepository;
    private final RecepcaoExameRepository recepcaoRepository;
    private final MaterialExameRepository materialExameRepository;
    private final MotivoNovaColetaRepository motivoNovaColetaRepository;
    private final ConfiguracaoLaboratorioRepository configuracaoRepository;

    @Transactional(readOnly = true)
    public List<RecepcaoExame> listarPacientesAguardandoColeta(Long unidadeId) {
        try {
            log.debug("Listando pacientes aguardando coleta para unidadeId: {}", unidadeId);
            List<RecepcaoExame> result = recepcaoRepository.findByStatusAndUnidade(RecepcaoExame.StatusRecepcao.AGUARDANDO_COLETA, unidadeId);
            log.debug("Encontrados {} pacientes aguardando coleta", result != null ? result.size() : 0);
            return result;
        } catch (Exception e) {
            log.error("Erro ao listar pacientes aguardando coleta para unidadeId: {}", unidadeId, e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public List<ColetaMaterialDTO> listarColetasPorPeriodo(LocalDateTime dataInicio, LocalDateTime dataFim) {
        List<ColetaMaterial> coletas = coletaRepository.findByPeriodo(dataInicio, dataFim);
        return coletas.stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ColetaMaterialDTO buscarColetaPorId(Long id) {
        ColetaMaterial coleta = coletaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coleta não encontrada"));
        return converterParaDTO(coleta);
    }

    @Transactional
    public ColetaMaterialDTO realizarColeta(Long recepcaoId, List<MaterialColetadoDTO> materiaisColetados, 
                                           Operador operador) {
        RecepcaoExame recepcao = recepcaoRepository.findById(recepcaoId)
                .orElseThrow(() -> new ResourceNotFoundException("Recepção não encontrada"));

        // Verificar se já existe coleta para esta recepção
        List<ColetaMaterial> coletasExistentes = coletaRepository.findByRecepcaoId(recepcaoId);
        if (!coletasExistentes.isEmpty()) {
            throw new BusinessException("Já existe coleta registrada para esta recepção");
        }

        // Criar coleta
        ColetaMaterial coleta = ColetaMaterial.builder()
                .recepcao(recepcao)
                .dataColeta(LocalDateTime.now())
                .operadorColeta(operador)
                .observacoes("")
                .build();

        // Adicionar materiais coletados
        for (MaterialColetadoDTO materialDto : materiaisColetados) {
            MaterialExame material = materialExameRepository.findById(materialDto.getMaterialId())
                    .orElseThrow(() -> new ResourceNotFoundException("Material não encontrado"));

            // Buscar o ExameRecepcao correspondente
            ExameRecepcao exameRecepcao = recepcao.getExames().stream()
                    .filter(er -> er.getExame().getMateriais().contains(material))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Exame não encontrado para o material"));

            MaterialColetado materialColetado = MaterialColetado.builder()
                    .coleta(coleta)
                    .exameRecepcao(exameRecepcao)
                    .material(material)
                    .quantidade(materialDto.getQuantidade())
                    .codigoTubo(gerarCodigoTubo())
                    .observacoes(materialDto.getObservacoes())
                    .build();

            coleta.getMateriaisColetados().add(materialColetado);
        }

        // Atualizar status da recepção
        recepcao.setStatus(RecepcaoExame.StatusRecepcao.COLETADO);

        ColetaMaterial coletaSalva = coletaRepository.save(coleta);
        return converterParaDTO(coletaSalva);
    }

    @Transactional
    public ColetaMaterialDTO registrarNovaColeta(Long coletaId, Long materialId, Long motivoNovaColetaId, 
                                                String observacoes, Operador operador) {
        ColetaMaterial coleta = coletaRepository.findById(coletaId)
                .orElseThrow(() -> new ResourceNotFoundException("Coleta não encontrada"));

        MotivoNovaColeta motivo = motivoNovaColetaRepository.findById(motivoNovaColetaId)
                .orElseThrow(() -> new ResourceNotFoundException("Motivo não encontrado"));

        // Encontrar o material coletado original
        MaterialColetado materialOriginal = coleta.getMateriaisColetados().stream()
                .filter(mc -> mc.getMaterial().getId().equals(materialId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Material não foi coletado originalmente"));

        // Registrar nova coleta
        materialOriginal.setNovaColeta(true);
        materialOriginal.setMotivoNovaColeta(motivo);
        materialOriginal.setDataNovaColeta(LocalDateTime.now());

        ColetaMaterial coletaSalva = coletaRepository.save(coleta);
        return converterParaDTO(coletaSalva);
    }

    @Transactional
    public void imprimirEtiquetas(Long coletaId) {
        ColetaMaterial coleta = coletaRepository.findById(coletaId)
                .orElseThrow(() -> new ResourceNotFoundException("Coleta não encontrada"));

        // Marcar etiquetas como impressas para todos os materiais coletados
        for (MaterialColetado materialColetado : coleta.getMateriaisColetados()) {
            materialColetado.setEtiquetaImpressa(true);
        }
        
        coletaRepository.save(coleta);
    }

    @Transactional(readOnly = true)
    public List<MotivoNovaColeta> listarMotivosNovaColeta() {
        return motivoNovaColetaRepository.findAll();
    }

    private ColetaMaterialDTO converterParaDTO(ColetaMaterial coleta) {
        List<MaterialColetadoDTO> materiaisColetados = coleta.getMateriaisColetados().stream()
                .map(this::converterMaterialParaDTO)
                .collect(Collectors.toList());

        return ColetaMaterialDTO.builder()
                .id(coleta.getId())
                .recepcaoId(coleta.getRecepcao().getId())
                .numeroRecepcao(coleta.getRecepcao().getNumeroRecepcao())
                .pacienteNome(coleta.getRecepcao().getPaciente().getNomeExibicao())
                .dataColeta(coleta.getDataColeta())
                .operadorColeta(coleta.getOperadorColeta().getNome())
                .materiaisColetados(materiaisColetados)
                .observacoes(coleta.getObservacoes())
                .build();
    }

    private MaterialColetadoDTO converterMaterialParaDTO(MaterialColetado materialColetado) {
        return MaterialColetadoDTO.builder()
                .id(materialColetado.getId())
                .coletaId(materialColetado.getColeta().getId())
                .materialId(materialColetado.getMaterial().getId())
                .materialSigla(materialColetado.getMaterial().getSigla())
                .quantidade(materialColetado.getQuantidade())
                .codigoTubo(materialColetado.getCodigoTubo())
                .etiquetaImpressa(materialColetado.getEtiquetaImpressa())
                .novaColeta(materialColetado.getNovaColeta())
                .motivoNovaColetaId(materialColetado.getMotivoNovaColeta() != null ? 
                                   materialColetado.getMotivoNovaColeta().getId() : null)
                .motivoNovaColetaDescricao(materialColetado.getMotivoNovaColeta() != null ? 
                                          materialColetado.getMotivoNovaColeta().getDescricao() : null)
                .dataNovaColeta(materialColetado.getDataNovaColeta())
                .observacoes(materialColetado.getObservacoes())
                .build();
    }

    private String gerarCodigoTubo() {
        return "TB" + System.currentTimeMillis();
    }

    private String gerarCodigoEtiqueta() {
        return "ET" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}