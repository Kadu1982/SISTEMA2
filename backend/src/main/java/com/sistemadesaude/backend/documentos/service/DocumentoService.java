package com.sistemadesaude.backend.documentos.service;

import com.sistemadesaude.backend.documentos.entity.Documento;
import com.sistemadesaude.backend.documentos.entity.Documento.TipoDocumento;
import com.sistemadesaude.backend.documentos.repository.DocumentoRepository;
import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

/**
 * Serviço para gerenciar persistência e reimpressão de documentos PDF.
 * CONFORME ISSUE: Salvar PDF gerado (ex.: storage/documentos/{tipo}/{yyyy}/{MM}/{id}.pdf) 
 * e gravar metadados em tabela documentos.
 */
@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class DocumentoService {

    private final DocumentoRepository documentoRepository;

    /**
     * Diretório base para armazenamento dos PDFs.
     * Padrão: storage/documentos/
     */
    @Value("${app.storage.documentos.path:storage/documentos}")
    private String storageBasePath;

    // ========== PERSISTÊNCIA DE DOCUMENTOS ==========

    /**
     * Salva um documento PDF no sistema de arquivos e persiste metadados no banco.
     * CONFORME ISSUE: storage/documentos/{tipo}/{yyyy}/{MM}/{id}.pdf
     *
     * @param tipo Tipo do documento (ATESTADO, RECEITUARIO, COMPROVANTE)
     * @param paciente Paciente proprietário do documento
     * @param pdfBytes Conteúdo do PDF em bytes
     * @param nomeArquivoSugerido Nome sugerido para o arquivo (opcional)
     * @return Documento persistido com ID e caminho do arquivo
     */
    public Documento salvarDocumento(TipoDocumento tipo, Paciente paciente, 
                                   byte[] pdfBytes, String nomeArquivoSugerido) {
        log.info("Iniciando salvamento de documento {} para paciente ID {}", tipo, paciente.getId());

        try {
            // 1. Calcular hash do conteúdo para integridade
            String hash = calcularHashSHA256(pdfBytes);
            
            // 2. Verificar se já existe documento com mesmo hash (evitar duplicatas)
            if (documentoRepository.existsByHashAndAtivoTrue(hash)) {
                log.warn("Documento com hash {} já existe. Possível duplicata.", hash);
                // Nota: Dependendo da regra de negócio, pode retornar o existente ou continuar
            }

            // 3. Criar entrada no banco primeiro (para obter ID)
            Documento documento = new Documento();
            documento.setTipo(tipo);
            documento.setPaciente(paciente);
            documento.setHash(hash);
            documento.setNomeArquivo(gerarNomeArquivo(tipo, nomeArquivoSugerido));
            documento.setTamanhoBytes((long) pdfBytes.length);
            documento.setAtivo(true);

            // Salvar para obter ID
            documento = documentoRepository.save(documento);
            
            // 4. Gerar caminho do arquivo baseado no ID
            String caminhoRelativo = gerarCaminhoArquivo(tipo, documento.getId());
            documento.setCaminhoArquivo(caminhoRelativo);

            // 5. Salvar arquivo no sistema de arquivos
            Path caminhoCompleto = Paths.get(storageBasePath).resolve(caminhoRelativo);
            criarDiretorioSeNaoExistir(caminhoCompleto.getParent());
            Files.write(caminhoCompleto, pdfBytes, StandardOpenOption.CREATE, StandardOpenOption.WRITE);

            // 6. Atualizar documento com caminho do arquivo
            documento = documentoRepository.save(documento);

            log.info("✅ Documento {} salvo com sucesso. ID: {}, Arquivo: {}", 
                    tipo, documento.getId(), caminhoCompleto);

            return documento;

        } catch (Exception e) {
            log.error("❌ Erro ao salvar documento {} para paciente {}: {}", 
                     tipo, paciente.getId(), e.getMessage(), e);
            throw new RuntimeException("Erro ao salvar documento: " + e.getMessage(), e);
        }
    }

    /**
     * Recupera o conteúdo de um documento PDF pelo ID.
     * Para reimpressão conforme especificado na issue.
     */
    public byte[] recuperarConteudoDocumento(Long documentoId) {
        log.info("Recuperando conteúdo do documento ID {}", documentoId);

        Documento documento = documentoRepository.findByIdAndAtivoTrue(documentoId)
                .orElseThrow(() -> new ResourceNotFoundException("Documento não encontrado ou inativo: " + documentoId));

        try {
            Path caminhoCompleto = Paths.get(storageBasePath).resolve(documento.getCaminhoArquivo());
            
            if (!Files.exists(caminhoCompleto)) {
                log.error("❌ Arquivo físico não encontrado: {}", caminhoCompleto);
                throw new ResourceNotFoundException("Arquivo PDF não encontrado no sistema de arquivos");
            }

            byte[] conteudo = Files.readAllBytes(caminhoCompleto);
            
            // Verificar integridade via hash
            String hashCalculado = calcularHashSHA256(conteudo);
            if (!hashCalculado.equals(documento.getHash())) {
                log.error("❌ Hash do arquivo não confere. Arquivo pode estar corrompido. " +
                         "Esperado: {}, Calculado: {}", documento.getHash(), hashCalculado);
                throw new RuntimeException("Arquivo corrompido - hash não confere");
            }

            log.info("✅ Conteúdo do documento {} recuperado com sucesso", documentoId);
            return conteudo;

        } catch (IOException e) {
            log.error("❌ Erro de I/O ao recuperar documento {}: {}", documentoId, e.getMessage(), e);
            throw new RuntimeException("Erro ao recuperar arquivo: " + e.getMessage(), e);
        }
    }

    // ========== CONSULTAS ==========

    /**
     * Busca documentos de um paciente
     */
    @Transactional(readOnly = true)
    public List<Documento> buscarDocumentosPorPaciente(Long pacienteId) {
        return documentoRepository.findByPacienteIdAndAtivoTrueOrderByCreatedAtDesc(pacienteId);
    }

    /**
     * Busca documentos por tipo e paciente
     */
    @Transactional(readOnly = true)
    public List<Documento> buscarDocumentosPorPacienteETipo(Long pacienteId, TipoDocumento tipo) {
        return documentoRepository.findByPacienteIdAndTipoAndAtivoTrueOrderByCreatedAtDesc(pacienteId, tipo);
    }

    /**
     * Busca documento por ID
     */
    @Transactional(readOnly = true)
    public Optional<Documento> buscarPorId(Long id) {
        return documentoRepository.findByIdAndAtivoTrue(id);
    }

    // ========== MÉTODOS AUXILIARES ==========

    /**
     * Gera caminho relativo do arquivo conforme padrão da issue:
     * {tipo}/{yyyy}/{MM}/{id}.pdf
     */
    private String gerarCaminhoArquivo(TipoDocumento tipo, Long documentoId) {
        LocalDateTime agora = LocalDateTime.now();
        String ano = agora.format(DateTimeFormatter.ofPattern("yyyy"));
        String mes = agora.format(DateTimeFormatter.ofPattern("MM"));
        
        return String.format("%s/%s/%s/%d.pdf", 
                           tipo.name().toLowerCase(), ano, mes, documentoId);
    }

    /**
     * Gera nome de arquivo amigável para download
     */
    private String gerarNomeArquivo(TipoDocumento tipo, String nomeArquivoSugerido) {
        if (StringUtils.hasText(nomeArquivoSugerido)) {
            // Garantir que termine com .pdf
            if (!nomeArquivoSugerido.toLowerCase().endsWith(".pdf")) {
                nomeArquivoSugerido += ".pdf";
            }
            return nomeArquivoSugerido;
        }

        // Gerar nome padrão
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss"));
        return String.format("%s_%s.pdf", tipo.getDescricao().replace(" ", "_"), timestamp);
    }

    /**
     * Calcula hash SHA-256 do conteúdo para integridade
     */
    private String calcularHashSHA256(byte[] conteudo) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(conteudo);
            
            // Converter para hexadecimal
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
            
        } catch (NoSuchAlgorithmException e) {
            log.error("❌ Algoritmo SHA-256 não disponível", e);
            throw new RuntimeException("Erro ao calcular hash do documento", e);
        }
    }

    /**
     * Cria diretórios necessários se não existirem
     */
    private void criarDiretorioSeNaoExistir(Path diretorio) throws IOException {
        if (!Files.exists(diretorio)) {
            Files.createDirectories(diretorio);
            log.debug("📁 Diretório criado: {}", diretorio);
        }
    }

    /**
     * Verifica se um documento existe e está acessível
     */
    @Transactional(readOnly = true)
    public boolean documentoExisteEAcessivel(Long documentoId) {
        Optional<Documento> documento = buscarPorId(documentoId);
        if (documento.isEmpty()) {
            return false;
        }

        Path caminhoCompleto = Paths.get(storageBasePath).resolve(documento.get().getCaminhoArquivo());
        return Files.exists(caminhoCompleto) && Files.isReadable(caminhoCompleto);
    }

    /**
     * Soft delete de documento (marca como inativo)
     */
    public void marcarComoInativo(Long documentoId) {
        log.info("Marcando documento {} como inativo", documentoId);
        documentoRepository.marcarComoInativo(documentoId);
    }
}