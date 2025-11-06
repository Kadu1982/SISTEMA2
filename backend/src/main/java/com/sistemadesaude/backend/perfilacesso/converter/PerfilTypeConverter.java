package com.sistemadesaude.backend.perfilacesso.converter;

import com.sistemadesaude.backend.perfilacesso.entity.Perfil;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.extern.slf4j.Slf4j;

import java.util.Locale;

/**
 * Converter customizado para mapear valores de tipo inválidos no banco para valores válidos do enum Perfil.
 * Ex: "UPA_RECEPCIONISTA" → RECEPCIONISTA, "Enfermeiro UPA" → ENFERMEIRO
 */
@Converter(autoApply = true)
@Slf4j
public class PerfilTypeConverter implements AttributeConverter<Perfil, String> {

    @Override
    public String convertToDatabaseColumn(Perfil perfil) {
        if (perfil == null) {
            return null;
        }
        return perfil.name();
    }

    @Override
    public Perfil convertToEntityAttribute(String dbValue) {
        if (dbValue == null || dbValue.trim().isEmpty()) {
            return null;
        }
        
        String dbValueUpper = dbValue.trim().toUpperCase(Locale.ROOT);
        
        // Tenta converter diretamente pelo nome do enum
        try {
            return Perfil.valueOf(dbValueUpper);
        } catch (IllegalArgumentException e) {
            // Valor inválido no banco - tenta mapear para um valor válido
            log.warn("⚠️ Valor de tipo inválido no banco: '{}', tentando mapear...", dbValue);
            
            Perfil mapeado = mapearTipoInvalidoParaEnum(dbValueUpper);
            if (mapeado != null) {
                log.info("✅ Tipo '{}' mapeado para: {}", dbValue, mapeado);
                return mapeado;
            }
            
            // Se não conseguiu mapear, usa padrão
            log.warn("⚠️ Não foi possível mapear tipo '{}', usando padrão USUARIO_SISTEMA", dbValue);
            return Perfil.USUARIO_SISTEMA;
        }
    }
    
    /**
     * Mapeia valores de tipo inválidos no banco para valores válidos do enum Perfil.
     */
    private Perfil mapearTipoInvalidoParaEnum(String tipoInvalido) {
        if (tipoInvalido == null || tipoInvalido.isEmpty()) {
            return null;
        }
        
        // Mapeia valores inválidos conhecidos para valores válidos do enum
        if (tipoInvalido.contains("UPA_RECEPCIONISTA") || 
            tipoInvalido.contains("RECEPCIONISTA UPA") || 
            tipoInvalido.equals("UPA")) {
            return Perfil.RECEPCIONISTA;
        }
        if (tipoInvalido.contains("UPA_ENFERMEIRO") || 
            tipoInvalido.contains("ENFERMEIRO UPA")) {
            return Perfil.ENFERMEIRO;
        }
        if (tipoInvalido.contains("UPA_MEDICO") || 
            tipoInvalido.contains("MEDICO UPA") ||
            tipoInvalido.contains("MÉDICO UPA")) {
            return Perfil.MEDICO;
        }
        if (tipoInvalido.contains("UPA_TECNICO_ENFERMAGEM") || 
            tipoInvalido.contains("TECNICO_ENFERMAGEM UPA")) {
            return Perfil.TECNICO_ENFERMAGEM;
        }
        if (tipoInvalido.equals("DENTISTA")) {
            return Perfil.DENTISTA;
        }
        
        // Tenta encontrar um enum que corresponda parcialmente
        for (Perfil perfil : Perfil.values()) {
            if (tipoInvalido.contains(perfil.name()) || perfil.name().contains(tipoInvalido)) {
                return perfil;
            }
        }
        
        return null;
    }
}

