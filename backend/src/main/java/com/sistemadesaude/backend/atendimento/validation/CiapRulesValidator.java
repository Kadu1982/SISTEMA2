package com.sistemadesaude.backend.atendimento.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.List;
import java.util.regex.Pattern;

/**
 * Validação CIAP:
 *  - Formato: [A-Z][0-9]{2}
 *  - RFE:           01-29
 *  - Procedimentos: 30-69
 *  - Diagnósticos:  70-99
 *  - Pelo menos 1 entre RFE ou Diagnóstico
 *
 * A validação é por reflexão para desacoplar do seu DTO real. Espera getters:
 *   getCiapRfe():           List<String> ou String (aceitamos ambos)
 *   getCiapDiagnosticos():  List<String>
 *   getCiapProcedimentos(): List<String>
 */
public class CiapRulesValidator implements ConstraintValidator<CiapRules, Object> {

    private static final Pattern CIAP = Pattern.compile("^[A-Z][0-9]{2}$");

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext ctx) {
        if (value == null) return true;

        try {
            var accessor = new ReflectiveCiapAccessor(value);

            var rfeMaybeList = accessor.getRfeAsList();
            List<String> rfe        = rfeMaybeList;
            List<String> diags      = accessor.getList("getCiapDiagnosticos");
            List<String> procs      = accessor.getList("getCiapProcedimentos");

            boolean ok = true;
            ctx.disableDefaultConstraintViolation();

            // Regra 0: Pelo menos 1 entre RFE ou Diagnóstico
            if ((rfe == null || rfe.isEmpty()) && (diags == null || diags.isEmpty())) {
                violation(ctx, "Obrigatório informar RFE (01–29) ou Diagnóstico (70–99)", "ciapDiagnosticos");
                ok = false;
            }

            ok &= validateList(ctx, rfe,   "ciapRfe",           1, 29);
            ok &= validateList(ctx, procs, "ciapProcedimentos", 30, 69);
            ok &= validateList(ctx, diags, "ciapDiagnosticos",  70, 99);

            return ok;
        } catch (Exception e) {
            violation(ctx, "Erro na validação CIAP: " + e.getMessage(), null);
            return false;
        }
    }

    private boolean validateList(ConstraintValidatorContext ctx, List<String> list,
                                 String node, int min, int max) {
        if (list == null) return true;
        boolean ok = true;
        for (String c : list) {
            if (c == null || !CIAP.matcher(c).matches()) {
                violation(ctx, "Código CIAP inválido: " + c, node);
                ok = false;
                continue;
            }
            int n = Integer.parseInt(c.substring(1));
            if (n < min || n > max) {
                violation(ctx, String.format("Código %s fora da faixa permitida (%02d–%02d)", c, min, max), node);
                ok = false;
            }
        }
        return ok;
    }

    private void violation(ConstraintValidatorContext ctx, String msg, String node) {
        var b = ctx.buildConstraintViolationWithTemplate(msg);
        if (node != null) b.addPropertyNode(node);
        b.addConstraintViolation();
    }

    // -----------------------------------------------------
    // Acesso por reflexão (suporta RFE String ou List<String>)
    // -----------------------------------------------------
    static class ReflectiveCiapAccessor {
        private final Object target;
        ReflectiveCiapAccessor(Object t){ this.target = t; }

        @SuppressWarnings("unchecked")
        List<String> getList(String method) throws Exception {
            var m = target.getClass().getMethod(method);
            return (List<String>) m.invoke(target);
        }

        @SuppressWarnings("unchecked")
        List<String> getRfeAsList() throws Exception {
            try {
                // Tenta como lista
                var m = target.getClass().getMethod("getCiapRfe");
                var val = m.invoke(target);
                if (val == null) return null;
                if (val instanceof String s) return s.isBlank() ? null : java.util.List.of(s);
                return (List<String>) val;
            } catch (NoSuchMethodException ex) {
                return null;
            }
        }
    }
}
