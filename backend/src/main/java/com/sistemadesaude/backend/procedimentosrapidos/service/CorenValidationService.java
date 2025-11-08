package com.sistemadesaude.backend.procedimentosrapidos.service;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Serviço para validação de COREN (Conselho Regional de Enfermagem)
 * 
 * Formato esperado: COREN-UF-NNNNNN
 * Exemplo: COREN-SP-123456
 * 
 * Validações:
 * - Formato correto (COREN-UF-NNNNNN)
 * - UF válida (27 estados brasileiros)
 * - 6 dígitos numéricos
 */
@Service
public class CorenValidationService {

    // Pattern para validar formato COREN-UF-NNNNNN
    private static final Pattern COREN_PATTERN = Pattern.compile("^COREN-[A-Z]{2}-\\d{6}$");

    // Todos os estados brasileiros
    private static final Set<String> UFS_VALIDAS = new HashSet<>(Arrays.asList(
        "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
        "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
        "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
    ));

    /**
     * Valida o formato do COREN
     * @param coren COREN a ser validado
     * @return true se formato válido, false caso contrário
     */
    public boolean validarFormato(String coren) {
        if (coren == null || coren.trim().isEmpty()) {
            return false;
        }
        return COREN_PATTERN.matcher(coren.trim()).matches();
    }

    /**
     * Verifica se a UF é válida
     * @param uf Unidade Federativa (2 letras)
     * @return true se UF válida, false caso contrário
     */
    public boolean isUfValida(String uf) {
        if (uf == null) {
            return false;
        }
        return UFS_VALIDAS.contains(uf.toUpperCase());
    }

    /**
     * Extrai a UF do COREN
     * @param coren COREN completo (ex: COREN-SP-123456)
     * @return UF (ex: SP) ou null se formato inválido
     */
    public String extrairUf(String coren) {
        if (!validarFormato(coren)) {
            return null;
        }
        String[] partes = coren.split("-");
        return partes.length >= 2 ? partes[1] : null;
    }

    /**
     * Extrai o número do COREN
     * @param coren COREN completo (ex: COREN-SP-123456)
     * @return Número (ex: 123456) ou null se formato inválido
     */
    public String extrairNumero(String coren) {
        if (!validarFormato(coren)) {
            return null;
        }
        String[] partes = coren.split("-");
        return partes.length >= 3 ? partes[2] : null;
    }

    /**
     * Valida COREN completo (formato + UF válida)
     * @param coren COREN a ser validado
     * @return true se válido, false caso contrário
     * @throws IllegalArgumentException se coren for null ou vazio
     */
    public boolean validar(String coren) {
        if (coren == null || coren.trim().isEmpty()) {
            throw new IllegalArgumentException("COREN não pode ser null ou vazio");
        }

        // Normalizar antes de validar
        String corenNormalizado = normalizar(coren);

        // Validar formato
        if (!validarFormato(corenNormalizado)) {
            return false;
        }

        // Validar UF
        String uf = extrairUf(corenNormalizado);
        return isUfValida(uf);
    }

    /**
     * Normaliza o COREN (trim + uppercase)
     * @param coren COREN a ser normalizado
     * @return COREN normalizado
     */
    public String normalizar(String coren) {
        if (coren == null) {
            return null;
        }
        return coren.trim().toUpperCase();
    }
}