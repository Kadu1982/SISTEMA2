package com.sistemadesaude.backend.documentos.service;

import com.sistemadesaude.backend.recepcao.dto.AgendamentoDTO;
import com.sistemadesaude.backend.recepcao.entity.Agendamento;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Serviço ÚNICO para gerar o PDF de Comprovante de Agendamento.
 * - Compatível com DTO e com a entidade.
 * - PDF minimalista (sem libs externas).
 * - Tolerante a diferenças de nomes de getters (usa reflexão).
 */
@Service
@Slf4j
public class ComprovantePdfService {

    private static final DateTimeFormatter DF_DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DF_HORA  = DateTimeFormatter.ofPattern("HH:mm");

    // =================== DTO ===================
    public byte[] gerarPdf(AgendamentoDTO dto) {
        if (dto == null) throw new IllegalArgumentException("AgendamentoDTO não pode ser nulo.");

        try {
            String pacienteNome    = safe(tryGet(dto, "getPacienteNome", "getNomePaciente", "getNome"));
            String pacienteDoc     = safe(tryGet(dto, "getPacienteDocumento", "getDocumento",
                    "getPacienteCpf", "getCpf", "getPacienteCns", "getCns", "getCartaoSus", "getCartaoSUS", "getCnsSus"));
            String especialidade   = safe(tryGet(dto, "getEspecialidade"));
            String tipoAtendimento = safe(tryGet(dto, "getTipo", "getTipoConsulta"));
            String prioridade      = safe(tryGet(dto, "getPrioridade"));
            String observacoes     = safe(tryGet(dto, "getObservacoes"));

            LocalDateTime dataHora = extractDate(dto, "getDataHora", "getDataAgendamento");
            String dataStr = dataHora != null ? DF_DATA.format(dataHora) : "-";
            String horaStr = dataHora != null ? DF_HORA.format(dataHora) : "-";

            String texto = buildTexto(pacienteNome, pacienteDoc, dataStr, horaStr,
                    especialidade, tipoAtendimento, prioridade, observacoes);

            byte[] pdf = MinimalPdf.fromText(texto);
            log.debug("Comprovante (DTO) gerado: {} bytes", pdf.length);
            return pdf;
        } catch (Exception e) {
            log.error("Erro ao gerar PDF do comprovante: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao gerar PDF do comprovante: " + e.getMessage(), e);
        }
    }

    // =================== ENTIDADE ===================
    public byte[] gerarPdf(Agendamento ag) {
        if (ag == null) throw new IllegalArgumentException("Agendamento não pode ser nulo.");

        String pacienteNome = "";
        String pacienteDoc  = "";
        try {
            Object p = ag.getPaciente();
            if (p != null) {
                pacienteNome = safe(tryGet(p, "getNome", "getNomeCompleto", "getPacienteNome"));
                pacienteDoc  = safe(tryGet(p, "getDocumento", "getCpf", "getCns", "getCartaoSus", "getCartaoSUS", "getCnsSus"));
            }
        } catch (Throwable ignored) {}
        if (pacienteNome.isBlank()) pacienteNome = safe(tryGet(ag, "getPacienteNome", "getNomePaciente", "getNome"));
        if (pacienteDoc.isBlank())  pacienteDoc  = safe(tryGet(ag, "getDocumento", "getPacienteDocumento", "getCpf", "getCns"));

        String especialidade   = safe(tryGet(ag, "getEspecialidade"));
        String tipoAtendimento = safe(tryGet(ag, "getTipo", "getTipoConsulta"));
        String prioridade      = safe(tryGet(ag, "getPrioridade"));
        String observacoes     = safe(tryGet(ag, "getObservacoes"));

        LocalDateTime dataHora = extractDate(ag, "getDataHora", "getDataAgendamento");
        String dataStr = dataHora != null ? DF_DATA.format(dataHora) : "-";
        String horaStr = dataHora != null ? DF_HORA.format(dataHora) : "-";

        String texto = buildTexto(pacienteNome, pacienteDoc, dataStr, horaStr,
                especialidade, tipoAtendimento, prioridade, observacoes);

        byte[] pdf = MinimalPdf.fromText(texto);
        log.debug("Comprovante (Entidade) gerado: {} bytes", pdf.length);
        return pdf;
    }

    // =================== HELPERS ===================
    private String buildTexto(String pacienteNome,
                              String pacienteDoc,
                              String dataStr,
                              String horaStr,
                              String especialidade,
                              String tipoAtendimento,
                              String prioridade,
                              String observacoes) {

        StringBuilder sb = new StringBuilder();
        sb.append("[TITULO] COMPROVANTE DE AGENDAMENTO\n"); // marcador p/ estilo do título
        sb.append("\n");
        sb.append("Paciente: ").append(pacienteNome.isBlank() ? "-" : pacienteNome).append("\n");
        if (!pacienteDoc.isBlank()) sb.append("Documento: ").append(pacienteDoc).append("\n");
        sb.append("Data: ").append(dataStr).append("   Hora: ").append(horaStr).append("\n");
        if (!especialidade.isBlank())   sb.append("Especialidade: ").append(especialidade).append("\n");
        if (!tipoAtendimento.isBlank()) sb.append("Tipo: ").append(tipoAtendimento).append("\n");
        if (!prioridade.isBlank())      sb.append("Prioridade: ").append(prioridade).append("\n");
        if (!observacoes.isBlank())     sb.append("Obs.: ").append(observacoes).append("\n");
        return sb.toString();
    }

    private String tryGet(Object target, String... getters) {
        if (target == null || getters == null) return "";
        for (String g : getters) {
            try {
                Method m = target.getClass().getMethod(g);
                Object v = m.invoke(target);
                if (v != null) {
                    String s = v.toString().trim();
                    if (!s.isBlank()) return s;
                }
            } catch (Throwable ignored) {}
        }
        return "";
    }

    private LocalDateTime extractDate(Object src, String... getters) {
        for (String g : getters) {
            try {
                Method m = src.getClass().getMethod(g);
                Object v = m.invoke(src);
                if (v instanceof LocalDateTime ldt) return ldt;
                if (v instanceof String s && !s.isBlank()) {
                    String norm = s.replace("Z", "").replace("+00:00", "");
                    return LocalDateTime.parse(norm);
                }
            } catch (Throwable ignored) {}
        }
        return null;
    }

    private String safe(String s) { return s == null ? "" : s.trim(); }

    // =================== PDF MÍNIMO ===================
    static class MinimalPdf {
        /**
         * Gera um PDF 1.4 básico com:
         * - título (Helvetica-Bold 16) na primeira linha
         * - corpo (Helvetica 12) com espaçamento de linha (14pt)
         */
        static byte[] fromText(String text) {
            // Escapes básicos
            String escaped = text.replace("\\", "\\\\")
                    .replace("(", "\\(")
                    .replace(")", "\\)")
                    .replace("\r\n", "\n");

            String[] lines = escaped.split("\n", -1);

            // Monta stream de conteúdo com leading (14 TL)
            StringBuilder content = new StringBuilder();
            content.append("BT\n");

            // Título (primeira linha marcada com [TITULO])
            String first = (lines.length > 0 ? lines[0] : "");
            if (first.startsWith("[TITULO] ")) {
                String titulo = first.substring(9);
                content.append("/F2 16 Tf\n"); // Helvetica-Bold 16
                content.append("50 800 Td\n");
                content.append("(").append(titulo).append(") Tj\n");
            } else {
                // caso não tenha marcador
                content.append("/F2 16 Tf\n");
                content.append("50 800 Td\n");
                content.append("(").append(first).append(") Tj\n");
            }

            // Corpo
            content.append("14 TL\n");        // <-- LEADING DEFINIDO (resolve sobreposição)
            content.append("/F1 12 Tf\n");    // Helvetica 12
            content.append("T*\n");           // desce 14pt a partir do título

            for (int i = 1; i < lines.length; i++) {
                content.append("(").append(lines[i]).append(") Tj\n");
                content.append("T*\n"); // próxima linha (usa 14 TL)
            }

            content.append("ET\n");

            byte[] streamBytes = content.toString().getBytes(StandardCharsets.US_ASCII);

            // Objetos PDF
            String header =
                    "%PDF-1.4\n" +
                            "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n" +
                            "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n" +
                            "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] " +
                            "/Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >> endobj\n" +
                            "4 0 obj << /Length " + streamBytes.length + " >> stream\n";

            String footer =
                    "endstream endobj\n" +
                            "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n" +
                            "6 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj\n";

            String body = header + new String(streamBytes, StandardCharsets.US_ASCII) + "\n" + footer;

            // XREF/TRAILER simples (offsets aproximados aceitos por viewers modernos)
            String end =
                    "xref\n" +
                            "0 7\n" +
                            "0000000000 65535 f \n" +
                            "0000000010 00000 n \n" +
                            "0000000060 00000 n \n" +
                            "0000000120 00000 n \n" +
                            "0000000330 00000 n \n" +
                            "0000000500 00000 n \n" +
                            "0000000580 00000 n \n" +
                            "trailer << /Size 7 /Root 1 0 R >>\n" +
                            "startxref\n" +
                            (body.length()) + "\n" +
                            "%%EOF";

            String pdf = body + end;
            return pdf.getBytes(StandardCharsets.US_ASCII);
        }
    }
}
