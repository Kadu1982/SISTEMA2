package com.sistemadesaude.backend.prontuario.enums;

/**
 * Tipos de documentos que podem ser anexados ao prontuário do paciente.
 * Mantemos nomes claros para facilitar filtros e auditoria.
 */
public enum TipoDocumento {
    ATESTADO,
    FICHA_ATENDIMENTO,
    RECEITUARIO,
    SADT,
    COMPROVANTE_AGENDAMENTO
}
