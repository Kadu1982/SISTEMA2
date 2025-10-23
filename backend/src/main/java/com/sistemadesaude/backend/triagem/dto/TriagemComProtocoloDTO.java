package com.sistemadesaude.backend.triagem.dto;

import com.sistemadesaude.backend.triagem.entity.ClassificacaoRisco;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 🧠 DTO PARA TRIAGEM COM INFORMAÇÕES DETALHADAS DE PROTOCOLO
 *
 * Contém dados completos da triagem incluindo protocolos aplicados
 * e sugestões inteligentes do sistema
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor  // ✅ ADICIONADO PARA RESOLVER O PROBLEMA DO BUILDER
public class TriagemComProtocoloDTO {

    // ========================================
    // 📋 DADOS BÁSICOS DA TRIAGEM
    // ========================================

    private Long id;
    private Long pacienteId;
    private String pacienteNome;
    private LocalDate pacienteDataNascimento;
    private LocalDateTime dataTriagem;
    private String queixaPrincipal;

    // ========================================
    // 🎯 CLASSIFICAÇÃO DE RISCO
    // ========================================

    private ClassificacaoRisco classificacaoOriginal;
    private ClassificacaoRisco classificacaoRisco;
    private Boolean foiReclassificada;

    // ========================================
    // 🧠 INFORMAÇÕES DE PROTOCOLO
    // ========================================

    private String protocoloAplicado;
    private String nomeProtocolo;
    private String observacoes1;
    private String observacoes2;
    private String condutaSugerida;
    private String diagnosticosSugeridos;
    private String observacoes3;

    // ========================================
    // 🩺 SINAIS VITAIS
    // ========================================

    private Double temperatura;
    private Integer saturacaoOxigenio;
    private String pressaoArterial;
    private Integer frequenciaCardiaca;
    private Integer escalaDor;

    // ========================================
    // 👨‍⚕️ INFORMAÇÕES DO ATENDIMENTO
    // ========================================

    private String operadorNome;
    private Long operadorId;
    private LocalDateTime dataCriacao;

    // ✅ CONSTRUTOR ESPECÍFICO PARA QUERY JPQL (23 parâmetros)
    /**
     * 🔧 CONSTRUTOR PARA QUERY JPQL
     *
     * Este construtor é usado especificamente pela query do TriagemRepository.
     * O @AllArgsConstructor irá gerar outro construtor com TODOS os campos.
     */
    public TriagemComProtocoloDTO(
            Long id,                          // 1.  t.id
            Long pacienteId,                  // 2.  t.paciente.id
            String pacienteNome,              // 3.  t.paciente.nomeCompleto
            LocalDate pacienteDataNascimento, // 4.  t.paciente.dataNascimento
            LocalDateTime dataTriagem,        // 5.  t.dataTriagem
            String queixaPrincipal,           // 6.  t.queixaPrincipal
            ClassificacaoRisco classificacaoOriginal, // 7.  t.classificacaoOriginal
            ClassificacaoRisco classificacaoRisco,    // 8.  t.classificacaoRisco
            Boolean foiReclassificada,        // 9.  (CASE WHEN t.classificacaoOriginal != t.classificacaoRisco THEN true ELSE false END)
            String protocoloAplicado,         // 10. t.protocoloAplicado
            String nomeProtocolo,             // 11. CONCAT('Protocolo ', COALESCE(t.protocoloAplicado, 'Manual'))
            String observacoes1,              // 12. COALESCE(t.observacoes, '')
            String observacoes2,              // 13. COALESCE(t.observacoes, '')
            String condutaSugerida,           // 14. t.condutaSugerida
            String diagnosticosSugeridos,     // 15. t.diagnosticosSugeridos
            String observacoes3,              // 16. COALESCE(t.observacoes, '')
            Double temperatura,               // 17. t.temperatura
            Integer saturacaoOxigenio,        // 18. t.saturacaoOxigenio
            String pressaoArterial,           // 19. t.pressaoArterial
            Integer frequenciaCardiaca,       // 20. t.frequenciaCardiaca
            Integer escalaDor,                // 21. t.escalaDor
            String operadorNome,              // 22. 'Sistema'
            LocalDateTime dataCriacao         // 23. t.dataCriacao
    ) {
        this.id = id;
        this.pacienteId = pacienteId;
        this.pacienteNome = pacienteNome;
        this.pacienteDataNascimento = pacienteDataNascimento;
        this.dataTriagem = dataTriagem;
        this.queixaPrincipal = queixaPrincipal;
        this.classificacaoOriginal = classificacaoOriginal;
        this.classificacaoRisco = classificacaoRisco;
        this.foiReclassificada = foiReclassificada;
        this.protocoloAplicado = protocoloAplicado;
        this.nomeProtocolo = nomeProtocolo;
        this.observacoes1 = observacoes1;
        this.observacoes2 = observacoes2;
        this.condutaSugerida = condutaSugerida;
        this.diagnosticosSugeridos = diagnosticosSugeridos;
        this.observacoes3 = observacoes3;
        this.temperatura = temperatura;
        this.saturacaoOxigenio = saturacaoOxigenio;
        this.pressaoArterial = pressaoArterial;
        this.frequenciaCardiaca = frequenciaCardiaca;
        this.escalaDor = escalaDor;
        this.operadorNome = operadorNome;
        this.dataCriacao = dataCriacao;

        // operadorId será setado via builder se necessário
        this.operadorId = null;
    }

    // ========================================
    // 🎨 MÉTODOS HELPER PARA INTERFACE
    // ========================================

    /**
     * 🎯 Verifica se houve reclassificação
     */
    public boolean temReclassificacao() {
        return Boolean.TRUE.equals(foiReclassificada) &&
                classificacaoOriginal != null &&
                !classificacaoOriginal.equals(classificacaoRisco);
    }

    /**
     * 🧠 Verifica se tem protocolo aplicado
     */
    public boolean temProtocolo() {
        return protocoloAplicado != null && !protocoloAplicado.trim().isEmpty();
    }

    /**
     * 💡 Verifica se tem conduta sugerida
     */
    public boolean temCondutaSugerida() {
        return condutaSugerida != null && !condutaSugerida.trim().isEmpty();
    }

    /**
     * 🩺 Verifica se tem diagnósticos sugeridos
     */
    public boolean temDiagnosticosSugeridos() {
        return diagnosticosSugeridos != null && !diagnosticosSugeridos.trim().isEmpty();
    }

    /**
     * 📝 Obtém observações consolidadas
     */
    public String getObservacoesConsolidadas() {
        StringBuilder sb = new StringBuilder();

        if (observacoes1 != null && !observacoes1.trim().isEmpty()) {
            sb.append(observacoes1.trim());
        }

        if (observacoes2 != null && !observacoes2.trim().isEmpty()) {
            if (sb.length() > 0) sb.append(" | ");
            sb.append(observacoes2.trim());
        }

        if (observacoes3 != null && !observacoes3.trim().isEmpty()) {
            if (sb.length() > 0) sb.append(" | ");
            sb.append(observacoes3.trim());
        }

        return sb.toString();
    }

    /**
     * 👶 Calcula idade do paciente
     */
    public Integer getIdadePaciente() {
        if (pacienteDataNascimento == null) return null;

        return LocalDate.now().getYear() - pacienteDataNascimento.getYear();
    }

    /**
     * 🎨 Obtém cor da classificação para interface
     */
    public String getCorClassificacao() {
        if (classificacaoRisco == null) return "#6B7280";

        return switch (classificacaoRisco) {
            case VERMELHO -> "#DC2626";
            case LARANJA -> "#EA580C";
            case AMARELO -> "#D97706";
            case VERDE -> "#059669";
            case AZUL -> "#2563EB";
        };
    }

    /**
     * 📊 Obtém nível de prioridade (1-5)
     */
    public int getNivelPrioridade() {
        if (classificacaoRisco == null) return 5;
        return classificacaoRisco.getPrioridade();
    }

    /**
     * 🕐 Obtém tempo decorrido desde a triagem
     */
    public String getTempoDecorrido() {
        if (dataTriagem == null) return "N/A";

        LocalDateTime agora = LocalDateTime.now();
        long minutos = java.time.Duration.between(dataTriagem, agora).toMinutes();

        if (minutos < 60) {
            return minutos + " min";
        } else if (minutos < 1440) { // menos de 24h
            return (minutos / 60) + "h " + (minutos % 60) + "min";
        } else {
            return (minutos / 1440) + " dias";
        }
    }

    /**
     * 🚨 Verifica se é caso urgente (tempo > limite)
     */
    public boolean isUrgente() {
        if (dataTriagem == null || classificacaoRisco == null) return false;

        long minutosDecorridos = java.time.Duration.between(dataTriagem, LocalDateTime.now()).toMinutes();

        return switch (classificacaoRisco) {
            case VERMELHO -> minutosDecorridos > 0; // Imediato
            case LARANJA -> minutosDecorridos > 10; // 10 minutos
            case AMARELO -> minutosDecorridos > 60; // 1 hora
            case VERDE -> minutosDecorridos > 120; // 2 horas
            case AZUL -> minutosDecorridos > 240; // 4 horas
        };
    }

    /**
     * 📋 Verifica se todos os sinais vitais estão preenchidos
     */
    public boolean temSinaisVitaisCompletos() {
        return temperatura != null &&
                saturacaoOxigenio != null &&
                pressaoArterial != null && !pressaoArterial.trim().isEmpty() &&
                frequenciaCardiaca != null &&
                escalaDor != null;
    }

    /**
     * ⚠️ Verifica se algum sinal vital está alterado
     */
    public boolean temSinaisVitaisAlterados() {
        if (temperatura != null && (temperatura > 38.0 || temperatura < 35.0)) return true;
        if (saturacaoOxigenio != null && saturacaoOxigenio < 95) return true;
        if (frequenciaCardiaca != null && (frequenciaCardiaca > 100 || frequenciaCardiaca < 60)) return true;
        if (escalaDor != null && escalaDor >= 7) return true;

        return false;
    }

    /**
     * 🎯 Obtém resumo da classificação
     */
    public String getResumoClassificacao() {
        if (classificacaoRisco == null) return "Não classificado";

        String resumo = classificacaoRisco.getDescricao();

        if (temReclassificacao()) {
            resumo += " (reclassificado de " + classificacaoOriginal.getDescricao() + ")";
        }

        return resumo;
    }

    /**
     * 🏥 Verifica se requer internação baseado na classificação
     */
    public boolean requerInternacao() {
        return classificacaoRisco == ClassificacaoRisco.VERMELHO ||
                classificacaoRisco == ClassificacaoRisco.LARANJA;
    }

    /**
     * 📊 Obtém pontuação de gravidade (0-100)
     */
    public int getPontuacaoGravidade() {
        int pontos = 0;

        // Classificação de risco (peso 40)
        if (classificacaoRisco != null) {
            pontos += switch (classificacaoRisco) {
                case VERMELHO -> 40;
                case LARANJA -> 32;
                case AMARELO -> 24;
                case VERDE -> 16;
                case AZUL -> 8;
            };
        }

        // Escala de dor (peso 20)
        if (escalaDor != null) {
            pontos += (escalaDor * 2);
        }

        // Sinais vitais alterados (peso 20)
        if (temSinaisVitaisAlterados()) {
            pontos += 20;
        }

        // Protocolo aplicado (peso 10)
        if (temProtocolo()) {
            pontos += 10;
        }

        // Reclassificação (peso 10)
        if (temReclassificacao()) {
            pontos += 10;
        }

        return Math.min(pontos, 100);
    }

    /**
     * 🎯 Verifica se a triagem está no tempo adequado
     */
    public boolean isTempoAdequado() {
        if (dataTriagem == null || classificacaoRisco == null) return true;

        long minutosDecorridos = java.time.Duration.between(dataTriagem, LocalDateTime.now()).toMinutes();

        return switch (classificacaoRisco) {
            case VERMELHO -> minutosDecorridos <= 0; // Imediato
            case LARANJA -> minutosDecorridos <= 10; // 10 minutos
            case AMARELO -> minutosDecorridos <= 60; // 1 hora
            case VERDE -> minutosDecorridos <= 120; // 2 horas
            case AZUL -> minutosDecorridos <= 240; // 4 horas
        };
    }

    /**
     * 📈 Obtém status de prioridade baseado no tempo
     */
    public String getStatusTempo() {
        if (dataTriagem == null) return "NORMAL";

        if (isUrgente()) return "ATRASADO";
        if (isTempoAdequado()) return "NORMAL";
        return "ATENÇÃO";
    }

    /**
     * 🎨 Obtém cor do status de tempo
     */
    public String getCorStatusTempo() {
        return switch (getStatusTempo()) {
            case "ATRASADO" -> "#DC2626"; // Vermelho
            case "ATENÇÃO" -> "#F59E0B";  // Amarelo
            default -> "#10B981";         // Verde
        };
    }

    /**
     * 👨‍⚕️ Verifica se tem operador registrado
     */
    public boolean temOperadorRegistrado() {
        return operadorId != null || (operadorNome != null && !operadorNome.trim().isEmpty());
    }

    /**
     * 📝 Obtém informação do operador (nome ou ID)
     */
    public String getInfoOperador() {
        if (operadorNome != null && !operadorNome.trim().isEmpty()) {
            return operadorNome;
        }
        if (operadorId != null) {
            return "Operador ID: " + operadorId;
        }
        return "Sistema";
    }
}
