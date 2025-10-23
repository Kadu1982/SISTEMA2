package com.sistemadesaude.backend.pdf;

import com.itextpdf.text.Image;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Serviço central para obter recursos de branding da empresa, como o logo.
 * Carrega o logo configurável via propriedade app.brand.logo-filename do frontend/public/.
 * CONFORME ISSUE: Logo deve ser carregado via propriedade configurável com fallback robusto.
 */
@Service
@Slf4j
public class PdfBrandingService {

    // Configurações injetadas do application.properties
    @Value("${app.brand.logo-filename:}")
    private String logoFilename;

    @Value("${app.brand.public-base-url:http://localhost:5173/}")
    private String publicBaseUrl;

    // Cache para evitar carregar a imagem do disco repetidamente
    private Image logoCache = null;
    private boolean isCacheInicializado = false;

    /**
     * Carrega a imagem do logo conforme configurado em app.brand.logo-filename.
     * ESTRATÉGIA DE BUSCA (conforme issue):
     * 1) Primeiro tenta carregar de frontend/public/ (relativo ao projeto)
     * 2) Fallback para classpath resources/images/
     * 3) Se nada funcionar, retorna null com logs claros
     *
     * @return um objeto com.itextpdf.text.Image ou null se não encontrar
     */
    public Image getLogoImageOrNull() {
        // Usa cache simples para evitar recarregar a imagem toda vez
        if (isCacheInicializado) {
            return logoCache;
        }

        if (!StringUtils.hasText(logoFilename)) {
            log.warn("⚠️ Propriedade app.brand.logo-filename não está configurada. Logo será null.");
            isCacheInicializado = true;
            return null;
        }

        log.info("🔍 Tentando carregar logo: {} (via app.brand.logo-filename)", logoFilename);

        // ESTRATÉGIA 1: Buscar no frontend/public/ (relativo ao projeto)
        logoCache = tentarCarregarDoFrontendPublic();
        if (logoCache != null) {
            isCacheInicializado = true;
            return logoCache;
        }

        // ESTRATÉGIA 2: Fallback para classpath resources/images/
        logoCache = tentarCarregarDoClasspath();
        if (logoCache != null) {
            isCacheInicializado = true;
            return logoCache;
        }

        // ESTRATÉGIA 3: Nenhuma funcionou
        log.error("❌ Logo '{}' não foi encontrado nem em frontend/public/ nem no classpath. " +
                  "Verifique se o arquivo existe e a propriedade app.brand.logo-filename está correta.", logoFilename);
        isCacheInicializado = true;
        return null;
    }

    /**
     * Tenta carregar o logo do diretório frontend/public/ (relativo ao projeto).
     * Esta é a estratégia principal conforme especificado na issue.
     */
    private Image tentarCarregarDoFrontendPublic() {
        try {
            // Caminho relativo ao projeto: ../frontend/public/logo.png
            Path projectRoot = Paths.get("").toAbsolutePath();
            Path frontendPublicPath = projectRoot.resolve("frontend").resolve("public").resolve(logoFilename);
            
            log.debug("🔍 Tentando carregar logo de: {}", frontendPublicPath);

            if (!Files.exists(frontendPublicPath)) {
                log.debug("⚠️ Logo não encontrado em: {}", frontendPublicPath);
                return null;
            }

            if (!Files.isReadable(frontendPublicPath)) {
                log.warn("⚠️ Logo encontrado mas não é legível: {}", frontendPublicPath);
                return null;
            }

            byte[] bytes = Files.readAllBytes(frontendPublicPath);
            Image image = Image.getInstance(bytes);
            log.info("✅ Logo carregado com sucesso de frontend/public/: {}", frontendPublicPath);
            return image;

        } catch (IOException e) {
            log.warn("❌ Erro de I/O ao tentar carregar logo do frontend/public/: {}", e.getMessage());
            return null;
        } catch (Exception e) {
            log.warn("❌ Erro inesperado ao carregar logo do frontend/public/: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Fallback: tenta carregar o logo do classpath resources/images/.
     */
    private Image tentarCarregarDoClasspath() {
        String classpathPath = "images/" + logoFilename;
        log.debug("🔍 Fallback: tentando carregar logo do classpath: {}", classpathPath);

        try {
            ClassPathResource resource = new ClassPathResource(classpathPath);
            if (!resource.exists()) {
                log.debug("⚠️ Logo não encontrado no classpath: {}", classpathPath);
                return null;
            }

            try (InputStream inputStream = resource.getInputStream()) {
                byte[] bytes = inputStream.readAllBytes();
                Image image = Image.getInstance(bytes);
                log.info("✅ Logo carregado com sucesso do classpath (fallback): {}", classpathPath);
                return image;
            }

        } catch (IOException e) {
            log.warn("❌ Erro de I/O ao carregar logo do classpath: {}", e.getMessage());
            return null;
        } catch (Exception e) {
            log.warn("❌ Erro inesperado ao carregar logo do classpath: {}", e.getMessage());
            return null;
        }
    }
}