package com.sistemadesaude.backend.exames.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.sistemadesaude.backend.exames.dto.ProcedimentoSadtDTO;
import com.sistemadesaude.backend.exames.dto.SadtDTO;
import com.sistemadesaude.backend.pdf.PdfCreationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * Serviço responsável pela geração de PDFs para SADTs, utilizando um serviço central
 * para garantir cabeçalho e rodapé padronizados.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class SadtPdfService {

    private final PdfCreationService pdfCreationService;

    // Mapeamento dos códigos para nomes do frontend
    private static final Map<String, String> MAPA_EXAMES = new HashMap<>();
    static {
        MAPA_EXAMES.put("hemograma_completo", "Hemograma Completo");
        MAPA_EXAMES.put("glicemia_jejum", "Glicemia de Jejum");
        MAPA_EXAMES.put("colesterol_total", "Colesterol Total e Frações");
        MAPA_EXAMES.put("ureia_creatinina", "Ureia e Creatinina");
        MAPA_EXAMES.put("tsh", "TSH - Hormônio Tireoestimulante");
        MAPA_EXAMES.put("eas", "Exame de Urina (EAS)");
        MAPA_EXAMES.put("radiografia_torax", "Radiografia de Tórax");
        MAPA_EXAMES.put("ultrassom_abdominal", "Ultrassom Abdominal");
        MAPA_EXAMES.put("ecocardiograma", "Ecocardiograma");
        MAPA_EXAMES.put("mamografia", "Mamografia");
        MAPA_EXAMES.put("tomografia_cranio", "Tomografia de Crânio");
        MAPA_EXAMES.put("ressonancia_joelho", "Ressonância Magnética de Joelho");
    }

    public byte[] gerarPdf(SadtDTO sadtDto) {
        log.info("📋 Gerando PDF da SADT via serviço central: {}", sadtDto.getNumeroSadt());

        try {
            String nomeEstabelecimento = sadtDto.getEstabelecimentoNome() != null ? sadtDto.getEstabelecimentoNome() : "Clínica Padrão";

            return pdfCreationService.gerarPdfComCabecalho(nomeEstabelecimento, document -> {
            // Fontes
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.BLACK);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, BaseColor.BLACK);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 8, BaseColor.BLACK);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 7, BaseColor.GRAY);

            // Adiciona o título específico do SADT e o número (abaixo do logo)
            adicionarTituloSadt(document, sadtDto, titleFont, headerFont, normalFont, smallFont);

            // Adiciona o restante do conteúdo
            adicionarDadosEstabelecimentoCompacto(document, sadtDto, headerFont, normalFont);
            document.add(new Paragraph(" ", FontFactory.getFont(FontFactory.HELVETICA, 3)));
            adicionarDadosPacienteCompacto(document, sadtDto, headerFont, normalFont);
            document.add(new Paragraph(" ", FontFactory.getFont(FontFactory.HELVETICA, 3)));
            adicionarDadosSolicitanteCompacto(document, sadtDto, headerFont, normalFont);
            document.add(new Paragraph(" ", FontFactory.getFont(FontFactory.HELVETICA, 3)));
            adicionarProcedimentosLista(document, sadtDto, headerFont, normalFont);

            if (sadtDto.getObservacoes() != null && !sadtDto.getObservacoes().trim().isEmpty()) {
                document.add(new Paragraph(" ", FontFactory.getFont(FontFactory.HELVETICA, 3)));
                adicionarObservacoesCompacto(document, sadtDto, headerFont, normalFont);
            }

            adicionarRodapeCompacto(document, sadtDto, smallFont);
            });
        } catch (Exception e) {
            log.error("Erro ao gerar PDF da SADT {}: {}", sadtDto.getNumeroSadt(), e.getMessage(), e);
            throw new RuntimeException("Erro ao gerar PDF da SADT: " + e.getMessage(), e);
        }
    }

    private void adicionarTituloSadt(Document document, SadtDTO sadtDto, Font titleFont, Font headerFont, Font normalFont, Font smallFont) throws DocumentException {
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{0.75f, 0.25f});

        PdfPCell tituloCell = new PdfPCell();
        tituloCell.setBorder(Rectangle.NO_BORDER);
        tituloCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        Paragraph titulo = new Paragraph("SOLICITAÇÃO DE AUXÍLIO DIAGNÓSTICO E TERAPIA", titleFont);
        titulo.setAlignment(Element.ALIGN_CENTER);
        titulo.setSpacingAfter(2);
        tituloCell.addElement(titulo);
        if (sadtDto.getEstabelecimentoMunicipio() != null && !sadtDto.getEstabelecimentoMunicipio().isEmpty()) {
            Paragraph municipio = new Paragraph("Município: " + sadtDto.getEstabelecimentoMunicipio(), smallFont);
            municipio.setAlignment(Element.ALIGN_CENTER);
            tituloCell.addElement(municipio);
        }
        headerTable.addCell(tituloCell);

        PdfPCell infoCell = new PdfPCell();
        infoCell.setBorder(Rectangle.NO_BORDER);
        infoCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        infoCell.addElement(new Paragraph("SADT Nº: " + sadtDto.getNumeroSadt(), headerFont));
        infoCell.addElement(new Paragraph("Data: " + sadtDto.getDataEmissao().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")), normalFont));
        if (sadtDto.getUrgente() != null && sadtDto.getUrgente()) {
            Paragraph urgente = new Paragraph("🚨 URGENTE", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.RED));
            urgente.setAlignment(Element.ALIGN_RIGHT);
            infoCell.addElement(urgente);
        }
        headerTable.addCell(infoCell);
        document.add(headerTable);

        Paragraph tipoSadt = new Paragraph("Tipo: " + formatarTipoSadt(sadtDto.getTipoSadt()), normalFont);
        tipoSadt.setAlignment(Element.ALIGN_CENTER);
        document.add(tipoSadt);

        document.add(new Paragraph("_____________________________________________________________________", smallFont));
    }


    private void adicionarDadosEstabelecimentoCompacto(Document document, SadtDTO sadtDto, Font headerFont, Font normalFont) throws DocumentException {
        Paragraph secao = new Paragraph("IDENTIFICAÇÃO DO DOCUMENTO", headerFont);
        secao.setSpacingAfter(2);
        document.add(secao);

        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{0.25f, 0.25f, 0.25f, 0.25f});
        table.setSpacingAfter(2);

        PdfPCell nomeLabel = new PdfPCell(new Phrase("Estabelecimento:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8)));
        nomeLabel.setBorder(Rectangle.NO_BORDER);
        nomeLabel.setPadding(1);
        table.addCell(nomeLabel);

        PdfPCell nomeValue = new PdfPCell(new Phrase(sadtDto.getEstabelecimentoNome() != null ? sadtDto.getEstabelecimentoNome() : "", FontFactory.getFont(FontFactory.HELVETICA, 8)));
        nomeValue.setBorder(Rectangle.NO_BORDER);
        nomeValue.setPadding(1);
        nomeValue.setColspan(3);
        table.addCell(nomeValue);

        PdfPCell cnesLabel = new PdfPCell(new Phrase("CNES:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8)));
        cnesLabel.setBorder(Rectangle.NO_BORDER);
        cnesLabel.setPadding(1);
        table.addCell(cnesLabel);

        PdfPCell cnesValue = new PdfPCell(new Phrase(sadtDto.getEstabelecimentoCnes() != null ? sadtDto.getEstabelecimentoCnes() : "", FontFactory.getFont(FontFactory.HELVETICA, 8)));
        cnesValue.setBorder(Rectangle.NO_BORDER);
        cnesValue.setPadding(1);
        table.addCell(cnesValue);

        PdfPCell telefoneLabel = new PdfPCell(new Phrase("Telefone:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8)));
        telefoneLabel.setBorder(Rectangle.NO_BORDER);
        telefoneLabel.setPadding(1);
        table.addCell(telefoneLabel);

        PdfPCell telefoneValue = new PdfPCell(new Phrase(sadtDto.getEstabelecimentoTelefone() != null ? sadtDto.getEstabelecimentoTelefone() : "", FontFactory.getFont(FontFactory.HELVETICA, 8)));
        telefoneValue.setBorder(Rectangle.NO_BORDER);
        telefoneValue.setPadding(1);
        table.addCell(telefoneValue);

        document.add(table);
    }

    private void adicionarDadosPacienteCompacto(Document document, SadtDTO sadtDto, Font headerFont, Font normalFont) throws DocumentException {
        Paragraph secao = new Paragraph("DADOS DO PACIENTE", headerFont);
        secao.setSpacingAfter(3);
        document.add(secao);

        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);

        String pacienteCompleto = String.format("ID: %d - %s", sadtDto.getPacienteId(), sadtDto.getPacienteNome() != null ? sadtDto.getPacienteNome() : "N/A");
        adicionarCelulaSimples(table, "Paciente:", pacienteCompleto, normalFont);

        if (sadtDto.getPacienteCpf() != null) {
            adicionarCelulaSimples(table, "CPF:", sadtDto.getPacienteCpf(), normalFont);
        }

        if (sadtDto.getPacienteDataNascimento() != null) {
            // ✅ CORREÇÃO: Usar a String diretamente, sem tentar formatar.
            adicionarCelulaSimples(table, "Nascimento:", sadtDto.getPacienteDataNascimento(), normalFont);
        } else {
            adicionarCelulaSimples(table, "Nascimento:", "Não informado", normalFont);
        }

        document.add(table);
    }

    private void adicionarDadosSolicitanteCompacto(Document document, SadtDTO sadtDto, Font headerFont, Font normalFont) throws DocumentException {
        Paragraph secao = new Paragraph("DADOS DO SOLICITANTE", headerFont);
        secao.setSpacingAfter(3);
        document.add(secao);

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1f, 1f});

        adicionarCelulaCompacta(table, "Profissional:", sadtDto.getSolicitanteNome() != null ? sadtDto.getSolicitanteNome() : "N/A", normalFont);
        adicionarCelulaCompacta(table, "Conselho:", (sadtDto.getSolicitanteConselho() != null ? sadtDto.getSolicitanteConselho() : "CRM") + " " + (sadtDto.getSolicitanteNumeroConselho() != null ? sadtDto.getSolicitanteNumeroConselho() : "N/A"), normalFont);

        document.add(table);
    }

    private void adicionarProcedimentosLista(Document document, SadtDTO sadtDto, Font headerFont, Font normalFont) throws DocumentException {
        Paragraph secao = new Paragraph("PROCEDIMENTOS SOLICITADOS", headerFont);
        secao.setSpacingAfter(2);
        document.add(secao);

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{0.2f, 0.8f});
        table.setSpacingAfter(0);

        if (sadtDto.getProcedimentos() != null && !sadtDto.getProcedimentos().isEmpty()) {
            for (ProcedimentoSadtDTO procedimento : sadtDto.getProcedimentos()) {
                String codigo = procedimento.getCodigo() != null ? procedimento.getCodigo() : "N/A";
                // ✅ CORREÇÃO: Usar getNome() em vez de getDescricao()
                String nome = obterNomeExameFormatado(codigo, procedimento.getNome());
                Integer quantidade = procedimento.getQuantidade() != null ? procedimento.getQuantidade() : 1;

                PdfPCell codigoCell = new PdfPCell(new Phrase(codigo, FontFactory.getFont(FontFactory.HELVETICA, 7)));
                codigoCell.setBorder(Rectangle.NO_BORDER);
                codigoCell.setPadding(1);
                table.addCell(codigoCell);

                String nomeFormatado = nome;
                if (quantidade > 1) {
                    nomeFormatado += " (Qtd: " + quantidade + ")";
                }

                PdfPCell nomeCell = new PdfPCell(new Phrase(nomeFormatado, FontFactory.getFont(FontFactory.HELVETICA, 7)));
                nomeCell.setBorder(Rectangle.NO_BORDER);
                nomeCell.setPadding(1);
                table.addCell(nomeCell);
            }
        } else {
            PdfPCell nomeCell = new PdfPCell(new Phrase("Nenhum procedimento solicitado.", FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 7)));
            nomeCell.setBorder(Rectangle.NO_BORDER);
            nomeCell.setColspan(2);
            nomeCell.setPadding(1);
            table.addCell(nomeCell);
        }

        document.add(table);
    }

    private void adicionarObservacoesCompacto(Document document, SadtDTO sadtDto, Font headerFont, Font normalFont) throws DocumentException {
        Paragraph secao = new Paragraph("OBSERVAÇÕES", headerFont);
        secao.setSpacingAfter(1);
        document.add(secao);

        Font obsFont = FontFactory.getFont(FontFactory.HELVETICA, 7);
        Paragraph observacoes = new Paragraph(sadtDto.getObservacoes(), obsFont);
        observacoes.setIndentationLeft(5);
        observacoes.setAlignment(Element.ALIGN_JUSTIFIED);
        document.add(observacoes);
    }

    private void adicionarRodapeCompacto(Document document, SadtDTO sadtDto, Font smallFont) throws DocumentException {
        document.add(new Paragraph("\n"));

        PdfPTable assinaturasTable = new PdfPTable(2);
        assinaturasTable.setWidthPercentage(100);
        assinaturasTable.setWidths(new float[]{1f, 1f});

        PdfPCell assinaturaMedicoCell = new PdfPCell();
        assinaturaMedicoCell.setBorder(Rectangle.TOP);
        assinaturaMedicoCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        assinaturaMedicoCell.setPadding(2);
        Paragraph medicoNome = new Paragraph(sadtDto.getSolicitanteNome() != null ? sadtDto.getSolicitanteNome() : "Dr. Sistema", FontFactory.getFont(FontFactory.HELVETICA, 7));
        medicoNome.setAlignment(Element.ALIGN_CENTER);
        assinaturaMedicoCell.addElement(medicoNome);
        Paragraph medicoLabel = new Paragraph("Médico Solicitante", FontFactory.getFont(FontFactory.HELVETICA, 7, BaseColor.GRAY));
        medicoLabel.setAlignment(Element.ALIGN_CENTER);
        assinaturaMedicoCell.addElement(medicoLabel);
        assinaturasTable.addCell(assinaturaMedicoCell);

        PdfPCell operadorCell = new PdfPCell();
        operadorCell.setBorder(Rectangle.TOP);
        operadorCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        operadorCell.setPadding(2);
        Paragraph operadorNome = new Paragraph(sadtDto.getCriadoPor() != null ? sadtDto.getCriadoPor() : "Operador do Sistema", FontFactory.getFont(FontFactory.HELVETICA, 7));
        operadorNome.setAlignment(Element.ALIGN_CENTER);
        operadorCell.addElement(operadorNome);
        Paragraph operadorLabel = new Paragraph("Responsável pela Autorização", FontFactory.getFont(FontFactory.HELVETICA, 7, BaseColor.GRAY));
        operadorLabel.setAlignment(Element.ALIGN_CENTER);
        operadorCell.addElement(operadorLabel);
        assinaturasTable.addCell(operadorCell);
        document.add(assinaturasTable);

        document.add(new Paragraph("\n", FontFactory.getFont(FontFactory.HELVETICA, 5)));
        PdfPTable rodapeTable = new PdfPTable(2);
        rodapeTable.setWidthPercentage(100);
        rodapeTable.setWidths(new float[]{1f, 1f});

        PdfPCell leftFooter = new PdfPCell();
        leftFooter.setBorder(Rectangle.NO_BORDER);
        leftFooter.setVerticalAlignment(Element.ALIGN_BOTTOM);
        String tipoImpressao = isReimpressao(sadtDto) ? "🖨️ REIMPRESSÃO" : "📋 IMPRESSÃO ORIGINAL";
        Paragraph tipoDoc = new Paragraph(tipoImpressao, FontFactory.getFont(FontFactory.HELVETICA, 6, BaseColor.GRAY));
        leftFooter.addElement(tipoDoc);
        rodapeTable.addCell(leftFooter);

        PdfPCell rightFooter = new PdfPCell();
        rightFooter.setBorder(Rectangle.NO_BORDER);
        rightFooter.setHorizontalAlignment(Element.ALIGN_RIGHT);
        rightFooter.setVerticalAlignment(Element.ALIGN_BOTTOM);
        Paragraph sistema = new Paragraph("Sistema de Saúde Digital v2.0", FontFactory.getFont(FontFactory.HELVETICA, 6, BaseColor.GRAY));
        sistema.setAlignment(Element.ALIGN_RIGHT);
        rightFooter.addElement(sistema);
        rodapeTable.addCell(rightFooter);
        document.add(rodapeTable);
    }

    private void adicionarCelulaCompacta(PdfPTable table, String label, String value, Font font) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9)));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPadding(2);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value != null ? value : "", font));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPadding(2);
        table.addCell(valueCell);
    }

    private void adicionarCelulaSimples(PdfPTable table, String label, String value, Font font) {
        String conteudo = label + " " + (value != null ? value : "");
        PdfPCell cell = new PdfPCell(new Phrase(conteudo, font));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(3);
        table.addCell(cell);
    }

    private String obterNomeExameFormatado(String codigo, String nomeFallback) {
        String nomeDoMapa = MAPA_EXAMES.get(codigo);
        if (nomeDoMapa != null) {
            return nomeDoMapa;
        }
        if (nomeFallback != null && !nomeFallback.trim().isEmpty()) {
            return nomeFallback;
        }
        return codigo.replace("_", " ").toUpperCase();
    }

    private String formatarTipoSadt(String tipo) {
        if (tipo == null) return "Terapêutico";
        switch (tipo.toLowerCase()) {
            case "laboratorial": return "Laboratorial";
            case "imagem": return "Exame de Imagem";
            case "terapeutico": return "Terapêutico";
            default: return tipo;
        }
    }

    private boolean isReimpressao(SadtDTO sadtDto) {
        if (sadtDto.getCriadoEm() != null) {
            return sadtDto.getCriadoEm().isBefore(java.time.LocalDateTime.now().minusMinutes(2));
        }
        return false;
    }
}