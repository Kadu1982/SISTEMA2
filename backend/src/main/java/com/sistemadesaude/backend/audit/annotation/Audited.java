package com.sistemadesaude.backend.audit.annotation;

import com.sistemadesaude.backend.audit.entity.AuditLog;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Anotação para marcar métodos que devem ser auditados automaticamente.
 * Usar em endpoints ou métodos de serviço que manipulam dados sensíveis.
 *
 * Exemplo:
 * <pre>
 * {@code
 * @Audited(
 *     tipoOperacao = AuditLog.TipoOperacao.READ,
 *     entidadeTipo = "Paciente",
 *     descricao = "Consulta de dados do paciente"
 * )
 * public PacienteDTO buscarPaciente(Long id) {
 *     // ...
 * }
 * }
 * </pre>
 */
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Audited {

    /**
     * Tipo de operação sendo auditada
     */
    AuditLog.TipoOperacao tipoOperacao();

    /**
     * Tipo da entidade afetada (ex: "Paciente", "Exame", "Prontuario")
     */
    String entidadeTipo() default "";

    /**
     * Descrição da operação
     */
    String descricao();

    /**
     * Se deve auditar mesmo em caso de erro
     */
    boolean auditarErros() default true;

    /**
     * Se deve capturar dados antes/depois (cuidado com dados sensíveis!)
     */
    boolean capturarDados() default false;
}
