package com.sistemadesaude.backend.documentos.service;

import com.sistemadesaude.backend.exception.ResourceNotFoundException;
import com.sistemadesaude.backend.exames.dto.SadtDTO;
import com.sistemadesaude.backend.exames.service.SadtService;
import com.sistemadesaude.backend.recepcao.dto.AgendamentoDTO;
import com.sistemadesaude.backend.recepcao.service.AgendamentoService;
import com.sistemadesaude.backend.prontuario.enums.TipoDocumento;
import com.sistemadesaude.backend.prontuario.service.ProntuarioDocumentoService;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

/**
 * Fachada única de documentos de agendamento.
 *
 * Regras:
 *  - Se o agendamento é de CONSULTA ⇒ gera COMPROVANTE em PDF.
 *  - Se é de EXAME ⇒ retorna o PDF da SADT mais recente (não gera aqui).
 *
 * Observações:
 *  - Não altera o frontend. O botão continua chamando GET /api/agendamentos/{id}/comprovante.
 *  - Para anexar no prontuário em "reimpressão" não forçamos. A anexação já ocorre na criação.
 *    (Se quiser anexar também na reimpressão, há método auxiliar no final.)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentoAgendamentoService {

    // Serviços já existentes no projeto
    private final AgendamentoService agendamentoService;
    private final ComprovantePdfService comprovantePdfService;
    private final SadtService sadtService;
    private final ProntuarioDocumentoService prontuarioDocumentoService;

    /**
     * Decide e retorna o PDF correto para o agendamento.
     * @param agendamentoId id do agendamento
     * @return wrapper com bytes, nome sugerido e content-type
     */
    public DocumentoGerado obterPdfParaAgendamento(Long agendamentoId) {
        // 1) Busca DTO para gerar comprovante (se for consulta) e decidir a regra
        AgendamentoDTO dto = agendamentoService.buscarPorId(agendamentoId);
        if (dto == null) {
            throw new ResourceNotFoundException("Agendamento não encontrado: " + agendamentoId);
        }

        boolean isExame = agendamentoService.precisaSadt(agendamentoId);

        if (!isExame) {
            // 2A) CONSULTA → gerar Comprovante
            log.info("Gerando COMPROVANTE para agendamento {}", agendamentoId);
            byte[] pdf = comprovantePdfService.gerarPdf(dto);
            if (pdf == null || pdf.length == 0) {
                throw new IllegalStateException("Falha ao gerar PDF do Comprovante para agendamento " + agendamentoId);
            }
            String filename = "comprovante-agendamento-" + agendamentoId + ".pdf";
            return DocumentoGerado.builder()
                    .bytes(pdf)
                    .filename(filename)
                    .contentType(MediaType.APPLICATION_PDF_VALUE)
                    .tipoDocumento(TipoDocumento.COMPROVANTE_AGENDAMENTO)
                    .build();
        }

        // 2B) EXAME → buscar SADT mais recente e retornar seu PDF
        log.info("Reimprimindo SADT do agendamento {}", agendamentoId);
        List<SadtDTO> sadts = sadtService.buscarSadtsPorAgendamento(agendamentoId);
        if (sadts == null || sadts.isEmpty()) {
            throw new ResourceNotFoundException("Nenhuma SADT encontrada para o agendamento: " + agendamentoId);
        }

        SadtDTO sadt = sadts.stream()
                .filter(Objects::nonNull)
                .max(Comparator.comparing(SadtDTO::getDataEmissao,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .orElse(sadts.get(0));

        byte[] pdf;
        if (sadt.getPdfBase64() != null && !sadt.getPdfBase64().isBlank()) {
            pdf = Base64.getDecoder().decode(sadt.getPdfBase64());
        } else if (sadt.getNumeroSadt() != null && !sadt.getNumeroSadt().isBlank()) {
            pdf = sadtService.downloadSadtPdf(sadt.getNumeroSadt());
        } else {
            throw new ResourceNotFoundException("SADT do agendamento " + agendamentoId + " não possui PDF disponível.");
        }

        String filename = "sadt-" + (sadt.getNumeroSadt() != null ? sadt.getNumeroSadt() : agendamentoId) + ".pdf";
        return DocumentoGerado.builder()
                .bytes(pdf)
                .filename(filename)
                .contentType(MediaType.APPLICATION_PDF_VALUE)
                .tipoDocumento(TipoDocumento.SADT)
                .build();
    }

    /**
     * (Opcional) Anexa um documento já gerado ao prontuário do paciente.
     * Use somente se quiser armazenar reimpressões também.
     */
    public void anexarNoProntuario(Long pacienteId, Long agendamentoId, DocumentoGerado doc) {
        if (doc == null || doc.getBytes() == null || doc.getBytes().length == 0) return;
        try {
            prontuarioDocumentoService.salvarDocumento(
                    doc.getTipoDocumento(),
                    String.valueOf(pacienteId),
                    null,                         // atendimentoId textual (não usamos aqui)
                    agendamentoId,
                    gerarNumeroReferencia(doc, agendamentoId),
                    doc.getFilename(),
                    doc.getBytes()
            );
        } catch (Exception e) {
            log.warn("Falha ao anexar reimpressão no prontuário. agendamentoId={}, erro={}", agendamentoId, e.getMessage());
        }
    }

    private String gerarNumeroReferencia(DocumentoGerado doc, Long agendamentoId) {
        if (doc.getTipoDocumento() == TipoDocumento.SADT) {
            // Para SADT, o filename já costuma conter o número SADT. Usamos o mesmo texto.
            return doc.getFilename();
        }
        return "AGEND-" + agendamentoId;
    }

    // ------------------- DTO simples do retorno -------------------

    @Data
    @Builder
    @AllArgsConstructor
    public static class DocumentoGerado {
        private byte[] bytes;
        private String filename;
        private String contentType;
        private TipoDocumento tipoDocumento;
    }
}
