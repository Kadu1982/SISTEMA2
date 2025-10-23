package com.sistemadesaude.backend.exames.service;

import com.sistemadesaude.backend.exames.dto.CriarRecepcaoRequest;
import com.sistemadesaude.backend.exames.entity.*;
import com.sistemadesaude.backend.exames.repository.*;
import com.sistemadesaude.backend.exception.BusinessException;
import com.sistemadesaude.backend.exception.ResourceNotFoundException;
import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.paciente.repository.PacienteRepository;
import com.sistemadesaude.backend.service.BarcodeService;
import com.google.zxing.WriterException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecepcaoExameService {

    private final RecepcaoExameRepository recepcaoRepository;
    private final PacienteRepository pacienteRepository;
    private final ExameRepository exameRepository;
    private final MotivoExameRepository motivoExameRepository;
    private final ConfiguracaoLaboratorioRepository configuracaoRepository;
    private final BarcodeService barcodeService;

    @Transactional
    public RecepcaoExame criar(CriarRecepcaoRequest request, Operador operador) {
        // Buscar paciente
        Paciente paciente = pacienteRepository.findById(request.getPacienteId())
            .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado"));

        // Validar exames duplicados se configurado
        ConfiguracaoLaboratorio config = configuracaoRepository
            .findByUnidadeId(request.getUnidadeId())
            .orElse(null);

        if (config != null && !config.getPermitirExameDuplicado()) {
            validarExamesDuplicados(paciente.getId(), request);
        }

        // Criar recepção
        RecepcaoExame recepcao = RecepcaoExame.builder()
            .numeroRecepcao(gerarNumeroRecepcao())
            .paciente(paciente)
            .dataRecepcao(LocalDateTime.now())
            .urgente(request.getUrgente())
            .observacoes(request.getObservacoes())
            .biometriaColetada(request.getBiometriaTemplate() != null)
            .biometriaTemplate(request.getBiometriaTemplate())
            .convenioId(request.getConvenioId())
            .numeroCarteirinha(request.getNumeroCarteirinha())
            .tipoAtendimento(request.getTipoAtendimento())
            .operadorRecepcao(operador)
            .build();

        // Gerar código de barras se configurado
        if (config != null && config.getGerarCodigoBarrasAutomatico()) {
            String codigoBarras = barcodeService.gerarCodigoRecepcaoLaboratorio();
            recepcao.setCodigoBarras(codigoBarras);

            try {
                byte[] imagemBarras = barcodeService.gerarCodigoBarras(codigoBarras);
                // Armazenar a imagem se necessário (pode ser gerado on-demand também)
                log.info("Código de barras gerado para recepção: {}", codigoBarras);
            } catch (WriterException | IOException e) {
                log.error("Erro ao gerar imagem do código de barras", e);
            }
        }

        // Adicionar exames
        for (CriarRecepcaoRequest.ExameSolicitadoDTO exameDto : request.getExames()) {
            Exame exame = exameRepository.findById(exameDto.getExameId())
                .orElseThrow(() -> new ResourceNotFoundException("Exame não encontrado"));

            // Validar idade se configurado
            if (config != null && config.getValidarIdadeExame()) {
                validarIdadePaciente(paciente, exame);
            }

            MotivoExame motivo = null;
            if (exameDto.getMotivoExameId() != null) {
                motivo = motivoExameRepository.findById(exameDto.getMotivoExameId())
                    .orElse(null);
            }

            ExameRecepcao exameRecepcao = ExameRecepcao.builder()
                .recepcao(recepcao)
                .exame(exame)
                .motivoExame(motivo)
                .quantidade(exameDto.getQuantidade())
                .autorizado(exameDto.getAutorizado())
                .numeroAutorizacao(exameDto.getNumeroAutorizacao())
                .valorExame(exame.getValorParticular())
                .observacoes(exameDto.getObservacoes())
                .build();

            recepcao.getExames().add(exameRecepcao);
        }

        return recepcaoRepository.save(recepcao);
    }

    @Transactional(readOnly = true)
    public RecepcaoExame buscarPorId(Long id) {
        return recepcaoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Recepção não encontrada"));
    }

    @Transactional(readOnly = true)
    public RecepcaoExame buscarPorNumero(String numeroRecepcao) {
        return recepcaoRepository.findByNumeroRecepcao(numeroRecepcao)
            .orElseThrow(() -> new ResourceNotFoundException("Recepção não encontrada"));
    }

    @Transactional(readOnly = true)
    public List<RecepcaoExame> listarPorPaciente(Long pacienteId) {
        return recepcaoRepository.findByPacienteIdOrderByDataRecepcaoDesc(pacienteId);
    }

    @Transactional
    public void cancelar(Long id, String motivo) {
        RecepcaoExame recepcao = buscarPorId(id);
        recepcao.setStatus(RecepcaoExame.StatusRecepcao.CANCELADO);
        recepcao.setObservacoes(recepcao.getObservacoes() + "\nCANCELADO: " + motivo);
        recepcaoRepository.save(recepcao);
    }

    private String gerarNumeroRecepcao() {
        String prefixo = "LAB";
        String data = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String sequencia = String.format("%06d", System.currentTimeMillis() % 1000000);
        return prefixo + data + sequencia;
    }

    // Método obsoleto - usar BarcodeService.gerarCodigoRecepcaoLaboratorio()
    @Deprecated
    private String gerarCodigoBarras() {
        return barcodeService.gerarCodigoRecepcaoLaboratorio();
    }

    private void validarExamesDuplicados(Long pacienteId, CriarRecepcaoRequest request) {
        List<RecepcaoExame> recepcoes = recepcaoRepository
            .findByPacienteIdOrderByDataRecepcaoDesc(pacienteId);

        LocalDateTime limite = LocalDateTime.now().minusDays(90);

        for (RecepcaoExame recepcao : recepcoes) {
            if (recepcao.getDataRecepcao().isAfter(limite)) {
                for (ExameRecepcao exameRecepcao : recepcao.getExames()) {
                    Long exameId = exameRecepcao.getExame().getId();
                    boolean duplicado = request.getExames().stream()
                        .anyMatch(e -> e.getExameId().equals(exameId));

                    if (duplicado) {
                        throw new BusinessException(
                            "Exame " + exameRecepcao.getExame().getNome() +
                            " já foi realizado recentemente"
                        );
                    }
                }
            }
        }
    }

    private void validarIdadePaciente(Paciente paciente, Exame exame) {
        if (exame.getIdadeMinima() != null || exame.getIdadeMaxima() != null) {
            int idadePaciente = calcularIdade(paciente.getDataNascimento());

            if (exame.getIdadeMinima() != null && idadePaciente < exame.getIdadeMinima()) {
                throw new BusinessException(
                    "Paciente não atende a idade mínima para o exame " + exame.getNome()
                );
            }

            if (exame.getIdadeMaxima() != null && idadePaciente > exame.getIdadeMaxima()) {
                throw new BusinessException(
                    "Paciente excede a idade máxima para o exame " + exame.getNome()
                );
            }
        }
    }

    private int calcularIdade(java.time.LocalDate dataNascimento) {
        return java.time.Period.between(dataNascimento, java.time.LocalDate.now()).getYears();
    }
}