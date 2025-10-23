package com.sistemadesaude.backend.exception;

/**
 * Exceção personalizada para operações com Paciente
 * Segue o padrão das exceções existentes no projeto
 */
public class PacienteException extends RuntimeException {

    // ========== CONSTRUTORES ==========

    public PacienteException(String message) {
        super(message);
    }

    public PacienteException(String message, Throwable cause) {
        super(message, cause);
    }

    // ========== EXCEÇÕES ESPECÍFICAS INTERNAS ==========

    /**
     * Exceção para CPF já existente
     */
    public static class CpfJaExisteException extends PacienteException {
        public CpfJaExisteException(String cpf) {
            super(String.format("Já existe um paciente cadastrado com o CPF: %s", formatarCpf(cpf)));
        }

        public CpfJaExisteException(String cpf, Long pacienteId, String nomePaciente) {
            super(String.format("CPF %s já está sendo usado pelo paciente: %s (ID: %d)",
                    formatarCpf(cpf), nomePaciente, pacienteId));
        }
    }

    /**
     * Exceção para CPF obrigatório por idade
     */
    public static class CpfObrigatorioPorIdadeException extends PacienteException {
        public CpfObrigatorioPorIdadeException(int idadeMeses) {
            super(String.format("CPF é obrigatório para pacientes com %d meses ou mais de idade (%s)",
                    idadeMeses, formatarIdade(idadeMeses)));
        }
    }

    /**
     * Exceção para justificativa obrigatória em bebês
     */
    public static class JustificativaObrigatoriaException extends PacienteException {
        public JustificativaObrigatoriaException(int idadeMeses) {
            super(String.format("Para bebês com %s, é obrigatório informar CPF OU justificativa da ausência",
                    formatarIdade(idadeMeses)));
        }
    }

    /**
     * Exceção para CPF com formato inválido
     */
    public static class CpfInvalidoException extends PacienteException {
        public CpfInvalidoException(String cpf) {
            super(String.format("CPF informado é inválido: %s. Verifique os dígitos.", formatarCpf(cpf)));
        }
    }

    /**
     * Exceção para paciente não encontrado
     */
    public static class PacienteNaoEncontradoException extends PacienteException {
        public PacienteNaoEncontradoException(Long id) {
            super(String.format("Paciente não encontrado com o ID: %d", id));
        }

        public PacienteNaoEncontradoException(String cpf) {
            super(String.format("Paciente não encontrado com o CPF: %s", formatarCpf(cpf)));
        }
    }

    /**
     * Exceção para nome social obrigatório
     */
    public static class NomeSocialObrigatorioException extends PacienteException {
        public NomeSocialObrigatorioException() {
            super("Nome Social é obrigatório quando o sexo for 'OUTRO'");
        }
    }

    /**
     * Exceção para data de nascimento inválida
     */
    public static class DataNascimentoInvalidaException extends PacienteException {
        public DataNascimentoInvalidaException(String motivo) {
            super(String.format("Data de nascimento inválida: %s", motivo));
        }
    }

    // ========== MÉTODOS UTILITÁRIOS ==========

    /**
     * Formata CPF para exibição
     */
    private static String formatarCpf(String cpf) {
        if (cpf == null || cpf.trim().isEmpty()) {
            return "não informado";
        }

        String cpfLimpo = cpf.replaceAll("[^0-9]", "");

        if (cpfLimpo.length() != 11) {
            return cpf;
        }

        return String.format("%s.%s.%s-%s",
                cpfLimpo.substring(0, 3),
                cpfLimpo.substring(3, 6),
                cpfLimpo.substring(6, 9),
                cpfLimpo.substring(9, 11)
        );
    }

    /**
     * Formata idade em meses para exibição
     */
    private static String formatarIdade(int idadeMeses) {
        if (idadeMeses < 1) {
            return "menos de 1 mês";
        } else if (idadeMeses < 12) {
            return String.format("%d mês%s", idadeMeses, idadeMeses > 1 ? "es" : "");
        } else {
            int anos = idadeMeses / 12;
            int mesesRestantes = idadeMeses % 12;

            if (mesesRestantes == 0) {
                return String.format("%d ano%s", anos, anos > 1 ? "s" : "");
            } else {
                return String.format("%d ano%s e %d mês%s",
                        anos, anos > 1 ? "s" : "",
                        mesesRestantes, mesesRestantes > 1 ? "es" : "");
            }
        }
    }
}
