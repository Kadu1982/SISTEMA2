package com.sistemadesaude.backend.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.oned.Code128Writer;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Serviço para geração de códigos de barras e QR codes
 */
@Slf4j
@Service
public class BarcodeService {

    private static final int BARCODE_WIDTH = 300;
    private static final int BARCODE_HEIGHT = 100;
    private static final int QRCODE_SIZE = 250;

    /**
     * Gera um código único para documentos
     * Formato: PREFIXO-AAAAMMDD-SEQUENCIA
     */
    public String gerarCodigoUnico(String prefixo) {
        String data = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String sequencia = String.format("%08d", System.currentTimeMillis() % 100000000);
        return String.format("%s-%s-%s", prefixo, data, sequencia);
    }

    /**
     * Gera um código único baseado em UUID
     * Formato: PREFIXO-UUID (20 caracteres)
     */
    public String gerarCodigoUUID(String prefixo) {
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
        return String.format("%s-%s", prefixo, uuid);
    }

    /**
     * Gera código de barras Code128 como imagem PNG em bytes
     */
    public byte[] gerarCodigoBarras(String codigo) throws WriterException, IOException {
        Code128Writer barcodeWriter = new Code128Writer();
        BitMatrix bitMatrix = barcodeWriter.encode(codigo, BarcodeFormat.CODE_128, BARCODE_WIDTH, BARCODE_HEIGHT);

        BufferedImage bufferedImage = MatrixToImageWriter.toBufferedImage(bitMatrix);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ImageIO.write(bufferedImage, "PNG", outputStream);

        return outputStream.toByteArray();
    }

    /**
     * Gera QR Code como imagem PNG em bytes
     */
    public byte[] gerarQRCode(String conteudo) throws WriterException, IOException {
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
        hints.put(EncodeHintType.MARGIN, 1);

        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(conteudo, BarcodeFormat.QR_CODE, QRCODE_SIZE, QRCODE_SIZE, hints);

        BufferedImage bufferedImage = MatrixToImageWriter.toBufferedImage(bitMatrix);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ImageIO.write(bufferedImage, "PNG", outputStream);

        return outputStream.toByteArray();
    }

    /**
     * Gera código de barras com tamanho customizado
     */
    public byte[] gerarCodigoBarras(String codigo, int largura, int altura) throws WriterException, IOException {
        Code128Writer barcodeWriter = new Code128Writer();
        BitMatrix bitMatrix = barcodeWriter.encode(codigo, BarcodeFormat.CODE_128, largura, altura);

        BufferedImage bufferedImage = MatrixToImageWriter.toBufferedImage(bitMatrix);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ImageIO.write(bufferedImage, "PNG", outputStream);

        return outputStream.toByteArray();
    }

    /**
     * Gera QR Code com tamanho customizado
     */
    public byte[] gerarQRCode(String conteudo, int tamanho) throws WriterException, IOException {
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
        hints.put(EncodeHintType.MARGIN, 1);

        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(conteudo, BarcodeFormat.QR_CODE, tamanho, tamanho, hints);

        BufferedImage bufferedImage = MatrixToImageWriter.toBufferedImage(bitMatrix);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ImageIO.write(bufferedImage, "PNG", outputStream);

        return outputStream.toByteArray();
    }

    /**
     * Gera código para recepção de exames laboratoriais
     */
    public String gerarCodigoRecepcaoLaboratorio() {
        return gerarCodigoUnico("LAB");
    }

    /**
     * Gera código para SADT
     */
    public String gerarCodigoSADT() {
        return gerarCodigoUnico("SADT");
    }

    /**
     * Gera código para comprovante de agendamento
     */
    public String gerarCodigoAgendamento() {
        return gerarCodigoUnico("AGD");
    }

    /**
     * Valida formato de código
     */
    public boolean validarFormatoCodigo(String codigo, String prefixo) {
        if (codigo == null || codigo.isEmpty()) {
            return false;
        }
        return codigo.startsWith(prefixo + "-");
    }

    /**
     * Extrai o prefixo de um código
     */
    public String extrairPrefixo(String codigo) {
        if (codigo == null || !codigo.contains("-")) {
            return null;
        }
        return codigo.substring(0, codigo.indexOf("-"));
    }

    /**
     * Determina o tipo de documento baseado no código
     */
    public TipoDocumentoCodigo identificarTipoDocumento(String codigo) {
        String prefixo = extrairPrefixo(codigo);
        if (prefixo == null) {
            return TipoDocumentoCodigo.DESCONHECIDO;
        }

        return switch (prefixo) {
            case "LAB" -> TipoDocumentoCodigo.RECEPCAO_LABORATORIO;
            case "SADT" -> TipoDocumentoCodigo.SADT;
            case "AGD" -> TipoDocumentoCodigo.AGENDAMENTO;
            default -> TipoDocumentoCodigo.DESCONHECIDO;
        };
    }

    /**
     * Enum para tipos de documento identificados por código
     */
    public enum TipoDocumentoCodigo {
        RECEPCAO_LABORATORIO,
        SADT,
        AGENDAMENTO,
        DESCONHECIDO
    }
}
