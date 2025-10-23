package com.sistemadesaude.backend.exames.service;

import com.sistemadesaude.backend.exames.dto.GerarSadtRequest;
import com.sistemadesaude.backend.exames.dto.GerarSadtRequest.ProcedimentoRequest;
import com.sistemadesaude.backend.exames.dto.ProcedimentoSadtDTO;
import com.sistemadesaude.backend.exames.dto.SadtDTO;
import com.sistemadesaude.backend.exames.dto.SadtResponseDTO;
import com.sistemadesaude.backend.exames.entity.ProcedimentoSadt;
import com.sistemadesaude.backend.exames.entity.Sadt;
import com.sistemadesaude.backend.exames.entity.Sadt.TipoSadt;
import com.sistemadesaude.backend.exames.repository.SadtRepository;
import com.sistemadesaude.backend.prontuario.enums.TipoDocumento;
import com.sistemadesaude.backend.prontuario.service.ProntuarioDocumentoService;
import com.sistemadesaude.backend.service.BarcodeService;
import com.sistemadesaude.backend.unidadesaude.entity.UnidadeSaude;
import com.sistemadesaude.backend.unidadesaude.repository.UnidadeSaudeRepository;
import com.google.zxing.WriterException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.io.IOException;

import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Serviço responsável pela emissão da SADT:
 *  - Geração de número (via SadtNumeroService)
 *  - Persistência da entidade e dos procedimentos
 *  - Geração do PDF (SadtPdfService)
 *  - Anexação do PDF ao prontuário (ProntuarioDocumentoService)
 *
 * Observações:
 *  - Não altera nada no frontend.
 *  - Se sua entidade Sadt NÃO tiver cascade nos procedimentos, avise que eu adapto com repository específico.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SadtService {

    private final SadtRepository sadtRepository;
    private final SadtPdfService sadtPdfService;
    private final ProntuarioDocumentoService prontuarioDocumentoService;
    private final SadtNumeroService sadtNumeroService;
    private final UnidadeSaudeRepository unidadeSaudeRepository;
    private final BarcodeService barcodeService;

    private static final DateTimeFormatter DIA = DateTimeFormatter.ofPattern("yyyyMMdd");

    // ===================== AÇÃO PRINCIPAL =====================

    /**
     * Gera uma nova SADT (entidade + procedimentos), emite o PDF e anexa no prontuário.
     * Retorna um SadtResponseDTO com dados, número e PDF em base64.
     *
     * IMPORTANTE: transação ISOLADA (REQUIRES_NEW) para não marcar a transação do agendamento
     * como rollback-only em caso de erro aqui dentro.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public SadtResponseDTO gerarSadt(GerarSadtRequest request, String operador) {
        try {
            validarRequest(request);

            log.info("🏥 Gerando SADT | agendamentoId={} pacienteId={}",
                    request.getAgendamentoId(), request.getPacienteId());

            // 1) Criar entidade base
            Sadt sadt = new Sadt();
            sadt.setPacienteId(request.getPacienteId());
            sadt.setAgendamentoId(request.getAgendamentoId());
            sadt.setDataEmissao(LocalDateTime.now());
            sadt.setOperador(operador != null ? operador : "sistema");
            sadt.setObservacoes(nullSafe(request.getObservacoes()));
            sadt.setTipoSadt(resolveTipoSadt(request)); // LABORATORIAL/IMAGEM (inferido caso não venha)

            // 1.5) Preencher dados obrigatórios do estabelecimento
            preencherDadosEstabelecimento(sadt);

            // 2) Gerar número (yyyyMMdd-XXXXXX) com unicidade simples
            String prefixo = LocalDate.now().format(DIA) + "-";
            String numero = proximoNumeroSeguro(prefixo);
            sadt.setNumeroSadt(numero);

            // 3) Mapear procedimentos (associação bidirecional)
            List<ProcedimentoSadt> itens = mapProcedimentos(request, sadt, sadt.getOperador());
            sadt.setProcedimentos(itens); // assume CascadeType.ALL em Sadt.procedimentos

            // 3.5) Gerar código de barras
            String codigoBarras = barcodeService.gerarCodigoSADT();
            sadt.setCodigoBarras(codigoBarras);
            try {
                byte[] imagemBarras = barcodeService.gerarCodigoBarras(codigoBarras);
                sadt.setCodigoBarrasImagem(imagemBarras);
                log.info("Código de barras gerado para SADT: {}", codigoBarras);
            } catch (WriterException | IOException e) {
                log.error("Erro ao gerar imagem do código de barras para SADT", e);
            }

            // 4) Persistir SADT
            sadt = sadtRepository.save(sadt);
            log.info("✅ SADT {} persistida (id={}) com código de barras: {}", numero, sadt.getId(), codigoBarras);

            // 5) Montar DTO para geração do PDF
            SadtDTO dto = mapearParaDTO(sadt);
            // Garante que os procedimentos recém-criados entrem no DTO:
            if (dto.getProcedimentos() == null || dto.getProcedimentos().isEmpty()) {
                dto.setProcedimentos(
                        itens.stream().map(this::toDTO).collect(Collectors.toList())
                );
            }

            // 6) Gerar PDF
            byte[] pdf = sadtPdfService.gerarPdf(dto);

            // 7) Cache em base64 + anexar no prontuário
            if (pdf != null && pdf.length > 0) {
                sadt.setPdfBase64(Base64.getEncoder().encodeToString(pdf));
                sadtRepository.save(sadt); // atualiza cache

                prontuarioDocumentoService.salvarDocumento(
                        TipoDocumento.SADT,                      // 1) tipo
                        String.valueOf(sadt.getPacienteId()),    // 2) pacienteId (String)
                        null,                                     // 3) atendimentoId (String) - n/a
                        sadt.getAgendamentoId(),                  // 4) agendamentoId (Long)
                        sadt.getNumeroSadt(),                     // 5) numeroReferencia
                        "SADT-" + sadt.getNumeroSadt() + ".pdf",  // 6) nomeArquivo
                        pdf                                       // 7) PDF
                );
                log.info("📎 PDF da SADT {} anexado ao prontuário.", sadt.getNumeroSadt());
            } else {
                log.warn("PDF da SADT {} veio nulo/vazio; não foi anexado.", sadt.getNumeroSadt());
            }

            return SadtResponseDTO.builder()
                    .sucesso(true)
                    .mensagem("SADT gerada com sucesso")
                    .numeroSadt(sadt.getNumeroSadt())
                    .sadtData(dto)
                    .pdfBase64(sadt.getPdfBase64())
                    .operador(sadt.getOperador())
                    .dataGeracao(LocalDateTime.now())
                    .build();

        } catch (Exception e) {
            // garante rollback APENAS desta transação isolada
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            log.error("❌ Erro ao gerar SADT", e);
            return SadtResponseDTO.builder()
                    .sucesso(false)
                    .mensagem(rootCause(e))
                    .dataGeracao(LocalDateTime.now())
                    .build();
        }
    }

    // ===================== CONSULTAS DE APOIO =====================

    @Transactional(readOnly = true)
    public List<SadtDTO> buscarSadtsPorPaciente(Long pacienteId) {
        return sadtRepository.findByPacienteIdOrderByDataEmissaoDesc(pacienteId)
                .stream()
                .map(this::mapearParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SadtDTO> buscarSadtsPorAgendamento(Long agendamentoId) {
        return sadtRepository.findByAgendamentoIdOrderByDataEmissaoDesc(agendamentoId)
                .stream()
                .map(this::mapearParaDTO)
                .collect(Collectors.toList());
    }

    /**
     * Download do PDF pelo número da SADT:
     *  - 1º tenta o cache base64 na entidade
     *  - 2º reemite o PDF em memória
     * (se você também baixa pelo prontuário, esse método pode ser um atalho do controller)
     */
    @Transactional(readOnly = true)
    public byte[] downloadSadtPdf(String numeroSadt) {
        Sadt sadt = sadtRepository.findByNumeroSadt(numeroSadt)
                .orElseThrow(() -> new IllegalArgumentException("SADT não encontrada: " + numeroSadt));

        if (sadt.getPdfBase64() != null && !sadt.getPdfBase64().isBlank()) {
            try {
                return Base64.getDecoder().decode(sadt.getPdfBase64());
            } catch (IllegalArgumentException ex) {
                log.warn("Cache base64 inválido para SADT {} — regerando PDF.", numeroSadt);
            }
        }

        SadtDTO dto = mapearParaDTO(sadt);
        return sadtPdfService.gerarPdf(dto);
    }
    // ===================== DOWNLOAD POR AGENDAMENTO =====================
    @Transactional(readOnly = true)
    public byte[] downloadSadtPdfByAgendamento(Long agendamentoId) {
        var lista = sadtRepository.findByAgendamentoIdOrderByDataEmissaoDesc(agendamentoId);
        if (lista == null || lista.isEmpty()) {
            throw new IllegalArgumentException("Nenhuma SADT encontrada para o agendamento " + agendamentoId);
        }
        var sadt = lista.get(0); // a mais recente

        // Primeiro tenta cache base64; se não houver, reemite o PDF
        if (sadt.getPdfBase64() != null && !sadt.getPdfBase64().isBlank()) {
            try {
                return java.util.Base64.getDecoder().decode(sadt.getPdfBase64());
            } catch (IllegalArgumentException ignore) { /* cai para regeração */ }
        }
        return sadtPdfService.gerarPdf(mapearParaDTO(sadt));
    }


    // ===================== HELPERS / MAPEAMENTOS =====================

    private void validarRequest(GerarSadtRequest req) {
        if (req == null) throw new IllegalArgumentException("Requisição nula");
        if (req.getPacienteId() == null) throw new IllegalArgumentException("PacienteId é obrigatório");
        if (req.getProcedimentos() == null || req.getProcedimentos().isEmpty())
            throw new IllegalArgumentException("Ao menos um procedimento é obrigatório");
    }

    /** Garante unicidade simples para o número (evita colisão em concorrência leve). */
    private String proximoNumeroSeguro(String prefixo) {
        // Usa o gerador (que olha a última do dia e incrementa)
        String numero = sadtNumeroService.gerarProximoNumero(LocalDate.now());

        // Se, por algum motivo, alguém salvou o mesmo número em paralelo, tenta de novo
        int tentativas = 0;
        while (sadtRepository.findByNumeroSadt(numero).isPresent() && tentativas < 5) {
            tentativas++;
            // força novo cálculo: como o gerador consulta o "último", ele incrementa
            numero = sadtNumeroService.gerarProximoNumero(LocalDate.now());
        }
        if (sadtRepository.findByNumeroSadt(numero).isPresent()) {
            throw new IllegalStateException("Não foi possível gerar um número SADT único após múltiplas tentativas.");
        }
        return numero;
    }

    /** Converte o request em entidades de procedimento ligadas à SADT. */
    private List<ProcedimentoSadt> mapProcedimentos(GerarSadtRequest request, Sadt sadt, String operador) {
        return request.getProcedimentos().stream().map(pr -> {
            ProcedimentoSadt p = new ProcedimentoSadt();
            p.setSadt(sadt);
            p.setCodigoSigtap(nullSafe(pr.getCodigo()));
            p.setNomeProcedimento(nullSafe(pr.getNome()));
            p.setQuantidade(pr.getQuantidade() != null ? pr.getQuantidade() : 1);
            p.setCid10(nullSafe(pr.getCid10()));
            p.setJustificativa(nullSafe(pr.getJustificativa()));
            p.setPreparo(nullSafe(pr.getPreparo()));
            p.setValorSus(BigDecimal.ZERO); // se precisar mapear SIGTAP, colocamos aqui
            // pr.getAutorizado() NÃO EXISTE no seu DTO → default false
            p.setAutorizado(Boolean.FALSE);
            p.setExecutado(Boolean.FALSE); // default
            p.setCriadoPor(operador != null ? operador : "sistema");
            return p;
        }).collect(Collectors.toList());
    }

    /** Mapeia a entidade completa para o DTO que o SadtPdfService usa. */
    public SadtDTO mapearParaDTO(Sadt sadt) {
        if (sadt == null) return null;

        SadtDTO.SadtDTOBuilder b = SadtDTO.builder()
                .id(sadt.getId())
                .numeroSadt(sadt.getNumeroSadt())
                .agendamentoId(sadt.getAgendamentoId())
                .pacienteId(sadt.getPacienteId())
                .dataEmissao(sadt.getDataEmissao())
                .tipoSadt(safeTipo(sadt.getTipoSadt()))
                .status(resolveStatusText(sadt))
                .observacoes(sadt.getObservacoes())
                .urgente(resolveUrgente(sadt))
                .criadoPor(sadt.getOperador())
                .criadoEm(safeCreatedAt(sadt))
                .atualizadoEm(safeUpdatedAt(sadt))
                // ——— campos de estabelecimento/solicitante (se existirem na Sadt) ———
                .estabelecimentoNome(sadt.getEstabelecimentoNome() != null ? sadt.getEstabelecimentoNome() : "VITALIZA SAÚDE")
                .estabelecimentoCnes(sadt.getEstabelecimentoCnes() != null ? sadt.getEstabelecimentoCnes() : "0000000")
                .estabelecimentoEndereco(sadt.getEstabelecimentoEndereco() != null ? sadt.getEstabelecimentoEndereco() : "Endereço não informado")
                .estabelecimentoTelefone(sadt.getEstabelecimentoTelefone() != null ? sadt.getEstabelecimentoTelefone() : "(00) 0000-0000")
                .estabelecimentoMunicipio(sadt.getEstabelecimentoMunicipio() != null ? sadt.getEstabelecimentoMunicipio() : "Não informado")
                .estabelecimentoUf(sadt.getEstabelecimentoUf() != null ? sadt.getEstabelecimentoUf() : "--")
                .solicitanteNome(sadt.getSolicitanteNome() != null ? sadt.getSolicitanteNome() : "Sistema VITALIZA")
                .solicitanteCbo(sadt.getSolicitanteCbo() != null ? sadt.getSolicitanteCbo() : "225125")
                .solicitanteConselho(sadt.getSolicitanteConselho() != null ? sadt.getSolicitanteConselho() : "CRM")
                .solicitanteNumeroConselho(sadt.getSolicitanteNumeroConselho() != null ? sadt.getSolicitanteNumeroConselho() : "000000")
                .pdfBase64(sadt.getPdfBase64());

        // Procedimentos
        if (sadt.getProcedimentos() != null) {
            b.procedimentos(
                    sadt.getProcedimentos().stream()
                            .filter(Objects::nonNull)
                            .map(this::toDTO)
                            .collect(Collectors.toList())
            );
        }

        // Adicionar dados do paciente se disponíveis
        SadtDTO dto = b.build();
        if (dto != null) {
            // Buscar dados do paciente se não estiverem preenchidos
            if (dto.getPacienteNome() == null || dto.getPacienteNome().isBlank()) {
                dto.setPacienteNome("Paciente " + dto.getPacienteId());
            }
            if (dto.getPacienteCpf() == null || dto.getPacienteCpf().isBlank()) {
                dto.setPacienteCpf("Não informado");
            }
            if (dto.getPacienteDataNascimento() == null || dto.getPacienteDataNascimento().isBlank()) {
                dto.setPacienteDataNascimento("Não informado");
            }
        }

        return dto;
    }

    private ProcedimentoSadtDTO toDTO(ProcedimentoSadt p) {
        return ProcedimentoSadtDTO.builder()
                .id(p.getId())
                .codigo(p.getCodigoSigtap())
                .nome(p.getNomeProcedimento())
                .quantidade(p.getQuantidade())
                .cid10(p.getCid10())
                .justificativa(p.getJustificativa())
                .preparo(p.getPreparo())
                .valorSus(p.getValorSus() != null ? p.getValorSus() : BigDecimal.ZERO)
                .autorizado(Boolean.TRUE.equals(p.getAutorizado()))
                .executado(Boolean.TRUE.equals(p.getExecutado()))
                .build();
    }

    private String nullSafe(String s) { return s == null ? null : s.trim(); }

    private String safeTipo(TipoSadt tipo) {
        if (tipo == null) return "laboratorial";
        return tipo.name();
    }

    // ——— helpers que toleram ausência de campos na entidade ———

    private String resolveStatusText(Sadt s) {
        try { return s.getStatus() != null ? s.getStatus().name() : "GERADA"; }
        catch (Throwable t) { return "GERADA"; }
    }

    private boolean resolveUrgente(Sadt s) {
        try { return s.getUrgente() != null && s.getUrgente(); }
        catch (Throwable t) { return false; }
    }

    private LocalDateTime safeCreatedAt(Sadt s) {
        try { return s.getCreatedAt(); } catch (Throwable t) { return null; }
    }

    private LocalDateTime safeUpdatedAt(Sadt s) {
        try { return s.getUpdatedAt(); } catch (Throwable t) { return null; }
    }

    /**
     * Determina o TipoSadt:
     *  - tenta via reflexão "getTipoSadt()" ou "getTipo()" se existirem no request;
     *  - caso contrário, infere pelos nomes dos procedimentos.
     */
    private TipoSadt resolveTipoSadt(GerarSadtRequest request) {
        // 1) tentar via reflexão (compila mesmo sem o método existir)
        try {
            Method m = request.getClass().getMethod("getTipoSadt");
            Object v = m.invoke(request);
            if (v != null) {
                String s = v.toString().toUpperCase();
                for (TipoSadt t : TipoSadt.values()) {
                    if (t.name().equalsIgnoreCase(s)) return t;
                    if (s.contains("IMAGEM") && t.name().contains("IMAGEM")) return t;
                    if (s.contains("LABOR") && t.name().contains("LABOR")) return t;
                }
            }
        } catch (Throwable ignored) {}

        try {
            Method m2 = request.getClass().getMethod("getTipo");
            Object v2 = m2.invoke(request);
            if (v2 != null) {
                String s = v2.toString().toUpperCase();
                for (TipoSadt t : TipoSadt.values()) {
                    if (t.name().equalsIgnoreCase(s)) return t;
                    if (s.contains("IMAGEM") && t.name().contains("IMAGEM")) return t;
                    if (s.contains("LABOR") && t.name().contains("LABOR")) return t;
                }
            }
        } catch (Throwable ignored) {}

        // 2) inferir pelos procedimentos
        boolean imagem = request.getProcedimentos().stream()
                .map(ProcedimentoRequest::getNome)
                .filter(Objects::nonNull)
                .map(String::toUpperCase)
                .anyMatch(n -> n.contains("RAIO") || n.contains("RX") || n.contains("ULTRA")
                        || n.contains("TOMO") || n.contains("RESSON") || n.contains("IMAGEM"));
        return imagem ? TipoSadt.IMAGEM : TipoSadt.LABORATORIAL;
    }

    private String rootCause(Throwable t) {
        Throwable x = t;
        while (x.getCause() != null) x = x.getCause();
        return x.getMessage() != null ? x.getMessage() : t.toString();
    }

    /**
     * Preenche os dados obrigatórios do estabelecimento na SADT.
     * Tenta buscar a primeira unidade de saúde disponível ou usa valores padrão.
     */
    private void preencherDadosEstabelecimento(Sadt sadt) {
        try {
            // Tenta buscar a primeira unidade de saúde disponível
            UnidadeSaude unidade = unidadeSaudeRepository.findAll()
                    .stream()
                    .findFirst()
                    .orElse(null);

            if (unidade != null) {
                // Usa dados da unidade encontrada
                sadt.setEstabelecimentoNome(unidade.getNome() != null ? unidade.getNome() : "VITALIZA SAÚDE");
                sadt.setEstabelecimentoCnes(unidade.getCodigoCnes() != null ? unidade.getCodigoCnes() : "0000000");
                sadt.setEstabelecimentoEndereco(montarEnderecoCompleto(unidade));
                sadt.setEstabelecimentoTelefone(unidade.getTelefone());
                sadt.setEstabelecimentoMunicipio(unidade.getMunicipio() != null ? unidade.getMunicipio() : unidade.getCidade());
                sadt.setEstabelecimentoUf(unidade.getUf() != null ? unidade.getUf() : unidade.getEstado());
            } else {
                // Valores padrão se não encontrar nenhuma unidade
                sadt.setEstabelecimentoNome("VITALIZA SAÚDE");
                sadt.setEstabelecimentoCnes("0000000");
                sadt.setEstabelecimentoEndereco("Endereço não informado");
                sadt.setEstabelecimentoTelefone("(00) 0000-0000");
                sadt.setEstabelecimentoMunicipio("Não informado");
                sadt.setEstabelecimentoUf("--");
            }

            // Dados do solicitante (valores padrão - pode ser melhorado futuramente)
            sadt.setSolicitanteNome("Sistema VITALIZA");
            sadt.setSolicitanteCbo("225125"); // CBO genérico para médico
            sadt.setSolicitanteConselho("CRM");
            sadt.setSolicitanteNumeroConselho("000000");

        } catch (Exception e) {
            log.warn("Erro ao buscar dados da unidade de saúde, usando valores padrão: {}", e.getMessage());
            // Valores de fallback em caso de erro
            sadt.setEstabelecimentoNome("VITALIZA SAÚDE");
            sadt.setEstabelecimentoCnes("0000000");
            sadt.setEstabelecimentoEndereco("Endereço não informado");
            sadt.setEstabelecimentoTelefone("(00) 0000-0000");
            sadt.setEstabelecimentoMunicipio("Não informado");
            sadt.setEstabelecimentoUf("--");
            sadt.setSolicitanteNome("Sistema VITALIZA");
            sadt.setSolicitanteCbo("225125");
            sadt.setSolicitanteConselho("CRM");
            sadt.setSolicitanteNumeroConselho("000000");
        }
    }

    /**
     * Monta o endereço completo da unidade de saúde
     */
    private String montarEnderecoCompleto(UnidadeSaude unidade) {
        if (unidade.getEndereco() != null && !unidade.getEndereco().trim().isEmpty()) {
            return unidade.getEndereco();
        }

        StringBuilder endereco = new StringBuilder();
        if (unidade.getLogradouro() != null) {
            endereco.append(unidade.getLogradouro());
            if (unidade.getNumero() != null) {
                endereco.append(", ").append(unidade.getNumero());
            }
            if (unidade.getComplemento() != null) {
                endereco.append(", ").append(unidade.getComplemento());
            }
            if (unidade.getBairro() != null) {
                endereco.append(" - ").append(unidade.getBairro());
            }
        }

        return endereco.length() > 0 ? endereco.toString() : "Endereço não informado";
    }
}
