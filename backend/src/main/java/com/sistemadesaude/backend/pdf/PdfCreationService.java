package com.sistemadesaude.backend.pdf;

import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

/**
 * Serviço central para criação de documentos PDF.
 * Garante que todos os PDFs gerados tenham um cabeçalho e rodapé padronizados.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class PdfCreationService {

    private final PdfBrandingService pdfBrandingService;

    /**
     * Interface funcional para permitir que os serviços de chamada adicionem seu conteúdo específico ao PDF.
     */
    @FunctionalInterface
    public interface PdfContentGenerator {
        void adicionarConteudo(Document document) throws DocumentException;
    }

    /**
     * Gera um PDF com o cabeçalho padronizado da empresa.
     *
     * @param nomeOrgao Opcional. Nome do órgão para exibir no cabeçalho (ex: "VITALIZA SAÚDE").
     * @param contentGenerator Um lambda que contém a lógica para adicionar o conteúdo específico do documento.
     * @return Os bytes do PDF gerado.
     */
    public byte[] gerarPdfComCabecalho(String nomeOrgao, PdfContentGenerator contentGenerator) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 30, 30, 60, 20); // Aumentei a margem superior para o logo
            PdfWriter writer = PdfWriter.getInstance(document, baos);

            // Anexa o evento de cabeçalho/rodapé
            PdfHeaderFooter event = new PdfHeaderFooter(pdfBrandingService);
            if (nomeOrgao != null) {
                event.setOrgNome(nomeOrgao);
            }
            writer.setPageEvent(event);

            document.open();

            // O serviço de chamada adiciona seu conteúdo aqui
            contentGenerator.adicionarConteudo(document);

            document.close();

            log.info("📄 PDF com cabeçalho padronizado gerado com sucesso.");
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("❌ Erro fatal ao criar PDF centralizado: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao gerar PDF", e);
        }
    }
}