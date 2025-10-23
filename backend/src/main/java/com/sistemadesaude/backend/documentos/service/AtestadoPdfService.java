package com.sistemadesaude.backend.documentos.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.sistemadesaude.backend.documentos.dto.AtestadoDTO;
import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.profissional.entity.Profissional;
import com.sistemadesaude.backend.unidadesaude.entity.UnidadeSaude;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.lang.reflect.Method;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

/**
 * Gera o PDF do ATESTADO em conformidade com:
 * - Itens obrigatórios (profissional, CRM/CRO, paciente, data, assinatura)
 * - CID só quando houver consentimento do paciente (campo consentimentoCid)
 * - Duas opções: Afastamento (dias) OU Comparecimento (intervalo de horas)
 *
 * Alteração importante:
 *  - Substituímos a chamada direta a getRegistroConselho() por um helper que
 *    tenta várias formas comuns (getCrm, getRegistroCRM, getNumeroConselho, getCro, etc.)
 *    tanto no Profissional quanto no objeto Documentos do profissional, via reflexão.
 */
@Service
@Slf4j
public class AtestadoPdfService {

    private static final Locale PT_BR = new Locale("pt", "BR");

    public byte[] gerarPdf(AtestadoDTO dto, Paciente p, Profissional prof, UnidadeSaude un) {
        try {
            Document document = new Document(PageSize.A4, 36, 36, 28, 28);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, baos);
            document.open();

            // ====== Fontes
            Font title = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font sub = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font normal = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font small = FontFactory.getFont(FontFactory.HELVETICA, 9, BaseColor.DARK_GRAY);

            // ====== Cabeçalho
            Paragraph cab = new Paragraph();
            if (dto.getEstabelecimentoCnpj() != null) {
                cab.add(new Phrase("C.N.P.J.: " + dto.getEstabelecimentoCnpj() + "\n", small));
            }
            String nomeEstab = firstNotBlank(
                    dto.getEstabelecimentoNome(),
                    un != null ? invokeString(un, "getNome") : null,
                    "Secretaria Municipal de Saúde"
            );
            cab.add(new Phrase(nomeEstab + "\n", small));
            cab.setAlignment(Element.ALIGN_CENTER);
            document.add(cab);

            Paragraph titulo = new Paragraph("ATESTADO MÉDICO", title);
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingBefore(6);
            titulo.setSpacingAfter(10);
            document.add(titulo);

            // ====== Bloco "UNIDADE / ENDEREÇO"
            PdfPTable unTable = new PdfPTable(1);
            unTable.setWidthPercentage(100);
            unTable.addCell(cellNoBorder("UNIDADE: " + firstNotBlank(
                    un != null ? invokeString(un, "getNome") : null,
                    dto.getEstabelecimentoNome(),
                    "UNIDADE DE SAÚDE"), normal));
            if (dto.getEstabelecimentoEndereco() != null && !dto.getEstabelecimentoEndereco().isBlank()) {
                unTable.addCell(cellNoBorder("ENDEREÇO: " + dto.getEstabelecimentoEndereco(), normal));
            }
            document.add(unTable);

            document.add(new Paragraph(" ")); // espaçamento

            // ====== Opções (afastamento/comparecimento)
            String nomePaciente = p != null ? safeString(invokeString(p, "getNomeCompleto"), "PACIENTE") : "PACIENTE";
            String cns = p != null ? safeString(invokeString(p, "getCns"), "") : "";

            String linhaAfast = "(  " + (dto.getTipo() == AtestadoDTO.TipoAtestado.AFASTAMENTO ? "X" : " ") + "  ) "
                    + "Atesto que o(a) Sr.(a) " + nomePaciente + (cns.isBlank() ? "" : ", Cartão SUS: " + cns)
                    + ", foi atendido(a) em " + dataHojeBR()
                    + " e necessita de " + (dto.getDiasAfastamento() != null ? dto.getDiasAfastamento() : 0)
                    + " dia(s) de repouso, por motivo de " + (dto.getMotivo() != null ? dto.getMotivo() : "doença") + ".";

            String linhaComp = "(  " + (dto.getTipo() == AtestadoDTO.TipoAtestado.COMPARECIMENTO ? "X" : " ") + "  ) "
                    + "Declaro que o(a) Sr.(a) " + nomePaciente + (cns.isBlank() ? "" : ", Cartão SUS: " + cns)
                    + ", compareceu em " + dataHojeBR()
                    + ", na unidade acima, no período das "
                    + (dto.getHoraInicio() != null ? dto.getHoraInicio() : "__:__")
                    + " às " + (dto.getHoraFim() != null ? dto.getHoraFim() : "__:__") + ".";

            document.add(new Paragraph(linhaAfast, normal));
            document.add(new Paragraph(" ", normal));
            document.add(new Paragraph(linhaComp, normal));

            document.add(new Paragraph(" "));

            // ====== CID + consentimento (só imprime o CID se consentimentoCid = true)
            if (Boolean.TRUE.equals(dto.getConsentimentoCid())
                    && dto.getCid() != null && !dto.getCid().isBlank()) {
                Paragraph cid = new Paragraph("CID: " + dto.getCid(), sub);
                cid.setSpacingBefore(8);
                document.add(cid);
            }

            // ====== Autorização + Assinatura do Paciente
            document.add(new Paragraph(" "));
            Paragraph aut = new Paragraph("Autorizo a divulgação do Diagnóstico (CID) pelo profissional de atendimento.", small);
            document.add(aut);
            document.add(new Paragraph(" "));
            document.add(linhaAssinatura("Assinatura do Paciente ou Responsável"));

            // ====== Rodapé com local/data e assinatura do profissional (CRM/CRO)
            document.add(new Paragraph(" "));
            String localData = firstNotBlank(dto.getMunicipio(), "Rio Claro")
                    + " - " + firstNotBlank(dto.getUf(), "SP") + ", " + dataHojeExtenso();
            Paragraph ld = new Paragraph(localData, normal);
            ld.setAlignment(Element.ALIGN_LEFT);
            document.add(ld);

            document.add(new Paragraph(" "));

            String nomeProf = prof != null ? safeString(invokeString(prof, "getNomeCompleto"), "Profissional") : "Profissional";
            ConselhoRegistro reg = obterRegistroConselho(prof); // <<<<<< FIX: resolve CRM/CRO dinamicamente

            document.add(linhaAssinatura(nomeProf));
            Paragraph crm = new Paragraph(reg.sigla + ": " + reg.numero, small);
            crm.setAlignment(Element.ALIGN_CENTER);
            document.add(crm);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Erro ao gerar PDF de atestado", e);
            throw new RuntimeException("Erro ao gerar PDF de atestado", e);
        }
    }

    // ===================== Helpers visuais =====================

    private PdfPCell cellNoBorder(String text, Font f) {
        PdfPCell c = new PdfPCell(new Phrase(text, f));
        c.setBorder(Rectangle.NO_BORDER);
        return c;
    }

    private Paragraph linhaAssinatura(String rotulo) {
        Paragraph p = new Paragraph("_________________________________\n" + rotulo,
                FontFactory.getFont(FontFactory.HELVETICA,  ninth(10))); // 9~10 para boa leitura
        p.setAlignment(Element.ALIGN_CENTER);
        return p;
    }

    private int ninth(int base) { // micro-ajuste visual opcional
        return Math.max(8, base);
    }

    private String dataHojeBR() {
        return LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy", PT_BR));
    }

    private String dataHojeExtenso() {
        return LocalDate.now().format(DateTimeFormatter.ofPattern("d 'de' MMMM 'de' yyyy", PT_BR));
    }

    // ===================== Helpers de reflexão / dados =====================

    /** Estrutura contendo a sigla do conselho (CRM/CRO/…) e o número. */
    private static class ConselhoRegistro {
        final String sigla;
        final String numero;
        ConselhoRegistro(String sigla, String numero) {
            this.sigla = sigla;
            this.numero = numero;
        }
    }

    /**
     * Tenta descobrir o número do conselho do profissional (CRM/CRO) sem depender
     * de um único nome de getter. Estratégia:
     * 1) Procurar diretamente em Profissional (getCrm, getRegistroCRM, getNumeroConselho, getCro, getRegistroCRO, getRegistro, ...)
     * 2) Se não achar, procurar em prof.getDocumentos() com os mesmos nomes.
     * 3) Tentar obter sigla explícita (getConselhoSigla) e usar como sigla; senão inferir pelo nome do método.
     * 4) Fallback: "CRM" / "_______".
     */
    private ConselhoRegistro obterRegistroConselho(Profissional prof) {
        if (prof == null) return new ConselhoRegistro("CRM", "_______");

        // 1) Direto no Profissional
        for (String m : List.of("getCrm", "getCRM", "getRegistroCRM", "getNumeroConselho", "getRegistro", "getCro", "getCRO", "getRegistroCRO")) {
            String numero = invokeString(prof, m);
            if (notBlank(numero)) {
                String sigla = m.toUpperCase().contains("CRO") ? "CRO" : "CRM";
                return new ConselhoRegistro(sigla, numero.trim());
            }
        }

        String siglaDireta = invokeString(prof, "getConselhoSigla");

        // 2) Dentro do objeto "documentos"
        Object docs = invokeObject(prof, "getDocumentos");
        if (docs != null) {
            String siglaDoc = invokeString(docs, "getConselhoSigla");
            if (notBlank(siglaDoc)) siglaDireta = siglaDoc;

            for (String m : List.of("getRegistroConselho", "getNumeroConselho", "getCrm", "getCRM", "getRegistroCRM", "getCro", "getCRO", "getRegistroCRO", "getRegistro")) {
                String numero = invokeString(docs, m);
                if (notBlank(numero)) {
                    String sigla = notBlank(siglaDireta)
                            ? siglaDireta.toUpperCase()
                            : (m.toUpperCase().contains("CRO") ? "CRO" : "CRM");
                    return new ConselhoRegistro(sigla, numero.trim());
                }
            }
        }

        // 3) Fallback
        return new ConselhoRegistro(notBlank(siglaDireta) ? siglaDireta.toUpperCase() : "CRM", "_______");
    }

    /** Invoca um getter sem parâmetros e retorna String (ou null). */
    private String invokeString(Object target, String methodName) {
        try {
            Method m = target.getClass().getMethod(methodName);
            Object v = m.invoke(target);
            return v != null ? String.valueOf(v) : null;
        } catch (Exception ignored) {
            return null;
        }
    }

    /** Invoca um getter sem parâmetros e retorna Object (ou null). */
    private Object invokeObject(Object target, String methodName) {
        try {
            Method m = target.getClass().getMethod(methodName);
            return m.invoke(target);
        } catch (Exception ignored) {
            return null;
        }
    }

    private boolean notBlank(String s) {
        return s != null && !s.trim().isEmpty();
    }

    private String safeString(String s, String fallback) {
        return notBlank(s) ? s : fallback;
    }

    private String firstNotBlank(String... vals) {
        if (vals == null) return null;
        for (String v : vals) if (notBlank(v)) return v;
        return null;
    }
}
