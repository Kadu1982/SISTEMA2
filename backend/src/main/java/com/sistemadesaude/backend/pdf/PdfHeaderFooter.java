package com.sistemadesaude.backend.pdf;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.ColumnText;
import com.itextpdf.text.pdf.PdfPageEventHelper;
import com.itextpdf.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.experimental.Accessors;
import lombok.extern.slf4j.Slf4j;

/**
 * PageEvent que desenha o cabeçalho padronizado em todas as páginas.
 * - Logo da empresa no canto superior direito.
 * - Nome do sistema/órgão no canto superior esquerdo.
 */
@Slf4j
@RequiredArgsConstructor
@Accessors(chain = true)
public class PdfHeaderFooter extends PdfPageEventHelper {

    private final PdfBrandingService brandingService;

    @Setter private String orgNome; // Opcional ("Sistema de Saúde", etc.)

    @Override
    public void onEndPage(PdfWriter writer, Document document) {
        try {
            // Define a posição Y inicial para o conteúdo do cabeçalho, um pouco abaixo do topo da página.
            final float headerTopY = document.getPageSize().getTop() - 20;

            // 1. Desenha o LOGO no canto SUPERIOR DIREITO
            Image logo = brandingService.getLogoImageOrNull();
            if (logo != null) {
                // Converte 2.5 cm para points (1 cm = 72 / 2.54 pt ≈ 28.35 pt)
                float sizeInPoints = 4.5f * 28.35f; // Aprox. 71 pontos
                // Escala o logo para o tamanho absoluto de 2.5cm x 2.5cm.
                logo.scaleAbsolute(sizeInPoints, sizeInPoints);

                // Calcula a posição X para alinhar o logo à margem direita.
                float x = document.right() - logo.getScaledWidth();
                // Calcula a posição Y, alinhando o topo do logo com a linha do cabeçalho.
                float y = headerTopY - logo.getScaledHeight();

                logo.setAbsolutePosition(x, y);
                writer.getDirectContent().addImage(logo);
            }

            // 2. Desenha o NOME DO ÓRGÃO no canto SUPERIOR ESQUERDO
            if (orgNome != null && !orgNome.isBlank()) {
                Font f = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.DARK_GRAY);
                Phrase p = new Phrase(orgNome, f);

                // Posição X na margem esquerda.
                float leftX = document.left();
                // Alinha o texto na mesma altura do topo do logo para um visual consistente.
                ColumnText.showTextAligned(
                        writer.getDirectContent(),
                        Element.ALIGN_LEFT,
                        p,
                        leftX,
                        headerTopY - 10f, // Ajuste vertical para alinhar com o centro do logo.
                        0
                );
            }

        } catch (Exception e) {
            log.warn("Falha ao desenhar header com logo.", e);
        }
    }
}