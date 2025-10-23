package com.sistemadesaude.backend.documentos.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.sistemadesaude.backend.documentos.dto.ReceituarioDTO;
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
 * Gera PDF do RECEITUÁRIO conforme seu modelo:
 * - Cabeçalho Prefeitura/Fundação + Unidade
 * - Paciente (nome, CNS, endereço/município)
 * - Lista enumerada de medicamentos com dose, via, posologia, duração
 * - Data, assinatura do profissional e número do conselho (CRM/CRO)
 *
 * Alteração importante:
 *  - Foi removida a chamada direta a getRegistroConselho() (que não existe no seu tipo).
 *  - Incluí um helper robusto que tenta várias formas comuns (getCrm, getRegistroCRM, getNumeroConselho, getCro, etc.)
 *    tanto no Profissional quanto no objeto Documentos do profissional, via reflexão.
 */
@Service
@Slf4j
public class ReceituarioPdfService {

    private static final Locale PT_BR = new Locale("pt", "BR");

    public byte[] gerarPdf(ReceituarioDTO dto, Paciente p, Profissional prof, UnidadeSaude un) {
        try {
            Document document = new Document(PageSize.A4, 36, 36, 28, 28);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, baos);
            document.open();

            Font title = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font head = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            Font normal = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font small = FontFactory.getFont(FontFactory.HELVETICA, 9);

            // ===== Cabeçalho simples
            Paragraph cab = new Paragraph();
            if (dto.getEstabelecimentoCnpj() != null) {
                cab.add(new Phrase("C.N.P.J.: " + dto.getEstabelecimentoCnpj() + "\n", small));
            }
            String prefeitura = dto.getEstabelecimentoNome() != null ? dto.getEstabelecimentoNome() : "PREFEITURA MUNICIPAL";
            cab.add(new Phrase(prefeitura + "\n", small));
            cab.add(new Phrase("Fundação Municipal de Saúde\n", small));
            cab.setAlignment(Element.ALIGN_CENTER);
            document.add(cab);

            Paragraph titulo = new Paragraph("RECEITUÁRIO", title);
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingBefore(6);
            titulo.setSpacingAfter(10);
            document.add(titulo);

            // ===== Unidade
            String unidadeNome = dto.getUnidadeNome() != null ? dto.getUnidadeNome()
                    : (un != null ? un.getNome() : "UNIDADE DE SAÚDE");
            document.add(new Paragraph("Unidade: " + unidadeNome, head));

            // ===== Paciente
            String pacienteNome = dto.getPacienteNome() != null ? dto.getPacienteNome()
                    : (p != null ? p.getNomeCompleto() : "PACIENTE");
            String cns = dto.getPacienteCns() != null ? dto.getPacienteCns()
                    : (p != null ? p.getCns() : "");
            String endereco = dto.getPacienteEndereco() != null ? dto.getPacienteEndereco()
                    : (p != null ? (p.getLogradouro() != null ? p.getLogradouro() + ", " : "")
                    + (p.getNumero() != null ? p.getNumero() + " - " : "")
                    + (p.getBairro() != null ? p.getBairro() + " - " : "")
                    + (p.getMunicipio() != null ? p.getMunicipio() : "") : "");
            String municipio = dto.getPacienteMunicipio() != null ? dto.getPacienteMunicipio()
                    : (p != null && p.getMunicipio() != null ? p.getMunicipio() : "");

            document.add(new Paragraph("Ao Senhor(a)  -  " + pacienteNome, normal));
            if (cns != null && !cns.isBlank()) {
                document.add(new Paragraph("Cartão SUS: " + cns, normal));
            }
            if (endereco != null && !endereco.isBlank()) {
                document.add(new Paragraph("Endereço: " + endereco + (municipio == null || municipio.isBlank() ? "" : " - Município: " + municipio), normal));
            }

            document.add(new Paragraph(" "));

            // ===== Lista de itens (item numerado com via/dose/posologia/duração)
            int i = 1;
            if (dto.getItens() != null) {
                for (ReceituarioDTO.ItemReceita it : dto.getItens()) {
                    document.add(new Paragraph(i + ") " + (it.getNome() != null ? it.getNome() : ""), head));
                    if (it.getQuantidade() != null && !it.getQuantidade().isBlank()) {
                        document.add(new Paragraph(it.getQuantidade(), normal));
                    }
                    if (it.getVia() != null && !it.getVia().isBlank()) {
                        document.add(new Paragraph(it.getVia() + " - Via", normal)); // ex.: VO - Via Oral
                    }
                    if (it.getDose() != null && !it.getDose().isBlank()) {
                        document.add(new Paragraph("Dose/Posologia: " + it.getDose(), normal));
                    }
                    if (it.getPosologia() != null && !it.getPosologia().isBlank()) {
                        document.add(new Paragraph("Posologia: " + it.getPosologia(), normal));
                    }
                    if (it.getDuracao() != null && !it.getDuracao().isBlank()) {
                        document.add(new Paragraph("Duração: " + it.getDuracao(), normal));
                    }
                    if (it.getObservacoes() != null && !it.getObservacoes().isBlank()) {
                        document.add(new Paragraph("Obs.: " + it.getObservacoes(), normal));
                    }
                    document.add(new Paragraph(" "));
                    i++;
                }
            }

            // ===== Data e assinatura
            String data = LocalDate.now().format(DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy", PT_BR));
            Paragraph pData = new Paragraph("Rio Claro, " + data, normal);
            document.add(pData);

            document.add(new Paragraph(" "));
            String nomeProf = prof != null ? safeString(invokeString(prof, "getNomeCompleto"), "Profissional") : "Profissional";
            ConselhoRegistro reg = obterRegistroConselho(prof); // <<<<<<<<<<<<<< FIX AQUI

            Paragraph ass = new Paragraph(
                    "_________________________________\n" + nomeProf + "\n" + reg.sigla + ": " + reg.numero,
                    small
            );
            ass.setAlignment(Element.ALIGN_CENTER);
            document.add(ass);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Erro ao gerar PDF de receituário", e);
            throw new RuntimeException("Erro ao gerar PDF de receituário", e);
        }
    }

    // ===================== Helpers =====================

    /**
     * Estrutura simples contendo a sigla do conselho (CRM/CRO/…) e o número.
     */
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
     * de um único nome de getter. A estratégia é:
     * 1) Procurar diretamente em Profissional (getCrm, getRegistroCRM, getNumeroConselho, getCro, getRegistroCRO, getRegistro, ...)
     * 2) Se não achar, procurar em prof.getDocumentos() com os mesmos nomes.
     * 3) Descobrir a sigla (CRM/CRO) pela origem do método, ou cair em "CRM".
     */
    private ConselhoRegistro obterRegistroConselho(Profissional prof) {
        if (prof == null) return new ConselhoRegistro("CRM", "_______");

        // 1) Tenta direto no Profissional
        for (String m : List.of("getCrm", "getCRM", "getRegistroCRM", "getNumeroConselho", "getRegistro", "getCro", "getCRO", "getRegistroCRO")) {
            String numero = invokeString(prof, m);
            if (notBlank(numero)) {
                String sigla = m.toUpperCase().contains("CRO") ? "CRO" : "CRM";
                return new ConselhoRegistro(sigla, numero.trim());
            }
        }

        // Tenta pegar uma sigla explícita, se houver
        String siglaDireta = invokeString(prof, "getConselhoSigla");

        // 2) Tenta no objeto de documentos do profissional
        Object docs = invokeObject(prof, "getDocumentos");
        if (docs != null) {
            // Primeiro, se houver uma sigla explícita dentro de documentos
            String siglaDoc = invokeString(docs, "getConselhoSigla");
            if (notBlank(siglaDoc)) siglaDireta = siglaDoc;

            for (String m : List.of("getRegistroConselho", "getNumeroConselho", "getCrm", "getCRM", "getRegistroCRM", "getCro", "getCRO", "getRegistroCRO", "getRegistro")) {
                String numero = invokeString(docs, m);
                if (notBlank(numero)) {
                    String sigla = siglaDireta != null && !siglaDireta.isBlank()
                            ? siglaDireta.toUpperCase()
                            : (m.toUpperCase().contains("CRO") ? "CRO" : "CRM");
                    return new ConselhoRegistro(sigla, numero.trim());
                }
            }
        }

        // 3) Fallback
        return new ConselhoRegistro(siglaDireta != null ? siglaDireta.toUpperCase() : "CRM", "_______");
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
}
