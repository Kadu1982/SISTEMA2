package com.sistemadesaude.backend.atendimento.service;

import com.sistemadesaude.backend.atendimento.entity.Atendimento;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.text.pdf.draw.LineSeparator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

/**
 * 📄 SERVIÇO PARA GERAÇÃO DE PDF DE ATENDIMENTOS
 *
 * ✅ ATUALIZADO: PDF mais completo e profissional
 * ✅ CORREÇÃO: Imports corretos do iText
 * ✅ NOVA FUNCIONALIDADE: Layout melhorado
 * ✅ ATUALIZADO: Substituído 'retorno' por 'Motivo de Desfecho'
 */
@Slf4j
@Service
public class AtendimentoPdfService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final Font TITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, BaseColor.DARK_GRAY);
    private static final Font SUBTITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, BaseColor.DARK_GRAY);
    private static final Font LABEL_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.BLACK);
    private static final Font NORMAL_FONT = FontFactory.getFont(FontFactory.HELVETICA, 11, BaseColor.BLACK);
    private static final Font SMALL_FONT = FontFactory.getFont(FontFactory.HELVETICA, 9, BaseColor.GRAY);

    public byte[] gerarPdf(Atendimento atendimento) {
        log.info("📄 Gerando PDF para atendimento ID: {}", atendimento.getId());

        try {
            Document document = new Document(PageSize.A4);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, baos);

            document.open();

            // Cabeçalho
            adicionarCabecalho(document);

            // Dados principais
            adicionarDadosPrincipais(document, atendimento);

            // Dados clínicos
            adicionarDadosClinicos(document, atendimento);

            // Prescrições e orientações
            adicionarPrescricoesOrientacoes(document, atendimento);

            // Desfecho do atendimento
            adicionarDesfecho(document, atendimento);

            // Rodapé
            adicionarRodape(document, atendimento);

            document.close();

            log.info("✅ PDF gerado com sucesso para atendimento: {}", atendimento.getId());
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("❌ Erro ao gerar PDF para atendimento {}: {}", atendimento.getId(), e.getMessage(), e);
            throw new RuntimeException("Erro ao gerar PDF: " + e.getMessage(), e);
        }
    }

    private void adicionarCabecalho(Document document) throws DocumentException {
        // Título principal
        Paragraph titulo = new Paragraph("RELATÓRIO DE ATENDIMENTO MÉDICO", TITLE_FONT);
        titulo.setAlignment(Element.ALIGN_CENTER);
        titulo.setSpacingAfter(10);
        document.add(titulo);

        // Subtítulo
        Paragraph subtitulo = new Paragraph("Sistema de Saúde - Registro de Consulta", SUBTITLE_FONT);
        subtitulo.setAlignment(Element.ALIGN_CENTER);
        subtitulo.setSpacingAfter(20);
        document.add(subtitulo);

        // Linha separadora
        LineSeparator separator = new LineSeparator();
        separator.setLineColor(BaseColor.GRAY);
        document.add(new Chunk(separator));
        document.add(Chunk.NEWLINE);
    }

    private void adicionarDadosPrincipais(Document document, Atendimento atendimento) throws DocumentException {
        // Tabela de dados principais
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setSpacingBefore(10);
        table.setSpacingAfter(15);

        // Cabeçalho da tabela
        addTableHeader(table, "DADOS PRINCIPAIS");

        // Linha 1: ID e Data
        addTableCell(table, "ID do Atendimento:", LABEL_FONT);
        addTableCell(table, String.valueOf(atendimento.getId()), NORMAL_FONT); // converte Long para String
        addTableCell(table, "Data/Hora:", LABEL_FONT);
        addTableCell(table, atendimento.getDataHora().format(DATE_FORMATTER), NORMAL_FONT);

        // Linha 2: Paciente e Profissional
        addTableCell(table, "ID do Paciente:", LABEL_FONT);
        addTableCell(table, String.valueOf(atendimento.getPacienteId()), NORMAL_FONT); // converte Long para String
        addTableCell(table, "Profissional:", LABEL_FONT);
        addTableCell(table, nullSafeLong(atendimento.getProfissionalId()), NORMAL_FONT); // usa método específico para Long

        // Linha 3: CID10 e Status
        addTableCell(table, "CID-10:", LABEL_FONT);
        addTableCell(table, nullSafe(atendimento.getCid10()), NORMAL_FONT);
        addTableCell(table, "Status:", LABEL_FONT);
        addTableCell(table, nullSafe(atendimento.getStatusAtendimento()), NORMAL_FONT);

        document.add(table);
    }


    private void adicionarDadosClinicos(Document document, Atendimento atendimento) throws DocumentException {
        // Seção de dados clínicos
        Paragraph secaoClinica = new Paragraph("DADOS CLÍNICOS", SUBTITLE_FONT);
        secaoClinica.setSpacingBefore(15);
        secaoClinica.setSpacingAfter(10);
        document.add(secaoClinica);

        // Diagnóstico
        if (atendimento.getDiagnostico() != null && !atendimento.getDiagnostico().trim().isEmpty()) {
            addLabeledSection(document, "Diagnóstico:", atendimento.getDiagnostico());
        }

        // Sintomas
        if (atendimento.getSintomas() != null && !atendimento.getSintomas().trim().isEmpty()) {
            addLabeledSection(document, "Sintomas Apresentados:", atendimento.getSintomas());
        }

        // Exames físicos
        if (atendimento.getExamesFisicos() != null && !atendimento.getExamesFisicos().trim().isEmpty()) {
            addLabeledSection(document, "Exames Físicos:", atendimento.getExamesFisicos());
        }

        // Observações clínicas
        if (atendimento.getObservacoes() != null && !atendimento.getObservacoes().trim().isEmpty()) {
            addLabeledSection(document, "Observações Clínicas:", atendimento.getObservacoes());
        }
    }

    private void adicionarPrescricoesOrientacoes(Document document, Atendimento atendimento) throws DocumentException {
        // Seção de prescrições
        Paragraph secaoPrescricao = new Paragraph("PRESCRIÇÕES E ORIENTAÇÕES", SUBTITLE_FONT);
        secaoPrescricao.setSpacingBefore(15);
        secaoPrescricao.setSpacingAfter(10);
        document.add(secaoPrescricao);

        // Prescrição médica
        if (atendimento.getPrescricao() != null && !atendimento.getPrescricao().trim().isEmpty()) {
            addLabeledSection(document, "Prescrição Médica:", atendimento.getPrescricao());
        }

        // Medicamentos prescritos
        if (atendimento.getMedicamentosPrescritos() != null && !atendimento.getMedicamentosPrescritos().trim().isEmpty()) {
            addLabeledSection(document, "Medicamentos Prescritos:", atendimento.getMedicamentosPrescritos());
        }

        // Orientações
        if (atendimento.getOrientacoes() != null && !atendimento.getOrientacoes().trim().isEmpty()) {
            addLabeledSection(document, "Orientações ao Paciente:", atendimento.getOrientacoes());
        }
    }

    private void adicionarDesfecho(Document document, Atendimento atendimento) throws DocumentException {
        if (atendimento.getMotivoDesfecho() == null || atendimento.getMotivoDesfecho().trim().isEmpty()) {
            return;
        }

        Paragraph secaoDesfecho = new Paragraph("DESFECHO DO ATENDIMENTO", SUBTITLE_FONT);
        secaoDesfecho.setSpacingBefore(15);
        secaoDesfecho.setSpacingAfter(10);
        document.add(secaoDesfecho);

        String motivoDescricao = getMotivoDesfechoDescricao(atendimento.getMotivoDesfecho());
        addLabeledSection(document, "Motivo do Desfecho:", motivoDescricao);

        // Se for encaminhamento, mostra a especialidade
        if ("03".equals(atendimento.getMotivoDesfecho()) && atendimento.getEspecialidadeEncaminhamento() != null && !atendimento.getEspecialidadeEncaminhamento().trim().isEmpty()) {
            String especialidadeFormatada = atendimento.getEspecialidadeEncaminhamento().replace("_", " ").toLowerCase();
            addLabeledSection(document, "Encaminhado para:", especialidadeFormatada);
        }
    }

    private void adicionarRodape(Document document, Atendimento atendimento) throws DocumentException {
        // Espaço
        document.add(Chunk.NEWLINE);
        document.add(Chunk.NEWLINE);

        // Linha separadora
        LineSeparator separator = new LineSeparator();
        separator.setLineColor(BaseColor.GRAY);
        document.add(new Chunk(separator));

        // Informações do rodapé
        Paragraph rodape = new Paragraph();
        rodape.setSpacingBefore(10);

        rodape.add(new Phrase("Documento gerado automaticamente pelo Sistema de Saúde\n", SMALL_FONT));
        rodape.add(new Phrase("Data de geração: " + java.time.LocalDateTime.now().format(DATE_FORMATTER) + "\n", SMALL_FONT));

        if (atendimento.getDataAtualizacao() != null) {
            rodape.add(new Phrase("Última atualização do atendimento: " +
                    atendimento.getDataAtualizacao().format(DATE_FORMATTER) + "\n", SMALL_FONT));
        }

        rodape.add(new Phrase("Este documento possui validade legal conforme legislação vigente.", SMALL_FONT));

        rodape.setAlignment(Element.ALIGN_CENTER);
        document.add(rodape);
    }

    // ========================================
    // 🛠️ MÉTODOS AUXILIARES
    // ========================================

    private String getMotivoDesfechoDescricao(String codigo) {
        if (codigo == null) return "Não informado";

        return switch (codigo) {
            case "01" -> "Alta Clínica";
            case "02" -> "Alta voluntária";
            case "03" -> "Encaminhamento";
            case "04" -> "Evasão";
            case "05" -> "Ordem judicial";
            case "06" -> "Óbito";
            case "07" -> "Permanência";
            case "08" -> "Retorno";
            case "09" -> "Transferência";
            case "99" -> "Sem registro no modelo de informação de origem";
            default -> "Código inválido: " + codigo;
        };
    }

    private void addTableHeader(PdfPTable table, String headerText) {
        PdfPCell headerCell = new PdfPCell(new Phrase(headerText, SUBTITLE_FONT));
        headerCell.setColspan(4);
        headerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        headerCell.setBackgroundColor(BaseColor.LIGHT_GRAY);
        headerCell.setPadding(8);
        table.addCell(headerCell);
    }

    private void addTableCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(5);
        if (font.equals(LABEL_FONT)) {
            cell.setBackgroundColor(new BaseColor(248, 248, 248));
        }
        table.addCell(cell);
    }

    private void addLabeledSection(Document document, String label, String content) throws DocumentException {
        // Label
        Paragraph labelPara = new Paragraph(label, LABEL_FONT);
        labelPara.setSpacingBefore(8);
        labelPara.setSpacingAfter(2);
        document.add(labelPara);

        // Conteúdo
        Paragraph contentPara = new Paragraph(content, NORMAL_FONT);
        contentPara.setSpacingAfter(8);
        contentPara.setIndentationLeft(20);
        document.add(contentPara);
    }

    private String nullSafe(String value) {
        return value != null ? value : "Não informado";
    }

    private String nullSafeLong(Long value) {
        return value != null ? String.valueOf(value) : "Não informado";
    }

}