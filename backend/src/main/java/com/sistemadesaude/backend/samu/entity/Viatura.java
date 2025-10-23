package com.sistemadesaude.backend.samu.entity;

import com.sistemadesaude.backend.samu.enums.TipoViatura;
import com.sistemadesaude.backend.samu.enums.StatusViatura;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "samu_viatura")
public class Viatura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "identificacao", unique = true, nullable = false)
    private String identificacao;

    @Column(name = "placa")
    private String placa;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false)
    private TipoViatura tipo;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private StatusViatura status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "base_id", nullable = false)
    private BaseOperacional base;

    @OneToMany(mappedBy = "viatura", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<EquipeViatura> equipe = new ArrayList<>();

    @OneToMany(mappedBy = "viatura", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<EquipamentoViatura> equipamentos = new ArrayList<>();

    @Column(name = "km_atual")
    private Integer kmAtual;

    @Column(name = "combustivel_atual")
    private Double combustivelAtual;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "ativa", nullable = false)
    private Boolean ativa = true;

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @PreUpdate
    private void preUpdate() {
        this.dataAtualizacao = LocalDateTime.now();
    }

    // ========================================
    // 🚀 MÉTODOS HELPER INTELIGENTES
    // ========================================

    /**
     * ✅ Verifica se a viatura está ativa
     */
    public boolean isAtiva() {
        return Boolean.TRUE.equals(ativa);
    }

    /**
     * 🟢 Verifica se está disponível para atendimento
     */
    public boolean isDisponivel() {
        return isAtiva() && StatusViatura.DISPONIVEL.equals(status);
    }

    /**
     * 🚑 Verifica se está em operação (atendendo ocorrência)
     */
    public boolean isEmOperacao() {
        return StatusViatura.A_CAMINHO.equals(status) ||
                StatusViatura.NO_LOCAL.equals(status) ||
                StatusViatura.TRANSPORTANDO.equals(status);
    }

    /**
     * 🔧 Verifica se precisa de manutenção
     */
    public boolean precisaManutencao() {
        return StatusViatura.MANUTENCAO.equals(status) ||
                StatusViatura.AVARIADA.equals(status);
    }

    /**
     * 👥 Obtém quantidade de membros na equipe ativa
     */
    public long getQuantidadeEquipeAtiva() {
        return equipe.stream()
                .filter(e -> e.isAtivo())
                .count();
    }

    /**
     * 🔧 Obtém quantidade de equipamentos operacionais
     */
    public long getQuantidadeEquipamentosOperacionais() {
        return equipamentos.stream()
                .filter(e -> e.isOperacional())
                .count();
    }

    /**
     * ⚠️ Obtém equipamentos que precisam de atenção
     */
    public List<EquipamentoViatura> getEquipamentosComAlerta() {
        return equipamentos.stream()
                .filter(e -> !"OK".equals(e.getStatusAlerta()))
                .toList();
    }

    /**
     * 👨‍⚕️ Verifica se tem médico na equipe
     */
    public boolean temMedicoNaEquipe() {
        return equipe.stream()
                .anyMatch(e -> e.isAtivo() && "MEDICO".equals(e.getFuncao()));
    }

    /**
     * 👩‍⚕️ Verifica se tem enfermeiro na equipe
     */
    public boolean temEnfermeiroNaEquipe() {
        return equipe.stream()
                .anyMatch(e -> e.isAtivo() && "ENFERMEIRO".equals(e.getFuncao()));
    }

    /**
     * 🎯 Calcula nível de prontidão operacional (0-100%)
     */
    public Double calcularNivelProntidao() {
        if (!isAtiva()) return 0.0;

        double pontuacao = 0.0;

        // Status (40% do peso)
        if (StatusViatura.DISPONIVEL.equals(status)) {
            pontuacao += 40.0;
        } else if (isEmOperacao()) {
            pontuacao += 20.0; // Em operação, mas não disponível
        }

        // Equipe (30% do peso)
        long equipeMinima = tipo.getEquipeMinima().split("\\+").length;
        long equipeAtual = getQuantidadeEquipeAtiva();
        if (equipeAtual >= equipeMinima) {
            pontuacao += 30.0;
        } else {
            pontuacao += (equipeAtual / (double) equipeMinima) * 30.0;
        }

        // Equipamentos (20% do peso)
        long equipamentosTotal = equipamentos.size();
        long equipamentosOk = getQuantidadeEquipamentosOperacionais();
        if (equipamentosTotal > 0) {
            pontuacao += (equipamentosOk / (double) equipamentosTotal) * 20.0;
        }

        // Combustível (10% do peso)
        if (combustivelAtual != null && combustivelAtual > 50.0) {
            pontuacao += 10.0;
        } else if (combustivelAtual != null && combustivelAtual > 25.0) {
            pontuacao += 5.0;
        }

        return Math.min(100.0, pontuacao);
    }

    /**
     * 🚨 Obtém prioridade de manutenção
     */
    public String getPrioridadeManutencao() {
        if (StatusViatura.AVARIADA.equals(status)) return "URGENTE";
        if (StatusViatura.MANUTENCAO.equals(status)) return "PROGRAMADA";

        long equipamentosComProblema = getEquipamentosComAlerta().size();
        if (equipamentosComProblema > 0) return "PREVENTIVA";

        if (combustivelAtual != null && combustivelAtual < 25.0) return "ABASTECIMENTO";

        return "NORMAL";
    }

    /**
     * 📊 Obtém resumo do status para dashboards
     */
    public String getResumoStatus() {
        if (!isAtiva()) return "Inativa";
        if (isDisponivel()) return "Disponível (" + calcularNivelProntidao().intValue() + "%)";
        if (isEmOperacao()) return "Em Operação - " + status.getDescricao();
        if (precisaManutencao()) return "Manutenção - " + getPrioridadeManutencao();
        return status.getDescricao();
    }

    /**
     * 🎨 Obtém cor para interface baseada no status
     */
    public String getCorInterface() {
        return status.getCorInterface();
    }

    /**
     * ⏱️ Verifica se está há muito tempo no mesmo status
     */
    public boolean isTempoExcessivoNoStatus() {
        int tempoMaximo = status.getTempoMaximoEsperado();
        if (tempoMaximo == -1) return false; // Status sem limite

        // Calcular diferença em minutos desde a última atualização
        if (dataAtualizacao != null) {
            long minutosNoStatus = java.time.Duration.between(dataAtualizacao, LocalDateTime.now()).toMinutes();
            return minutosNoStatus > tempoMaximo;
        }

        return false;
    }

    /**
     * 📋 Obtém próxima ação recomendada
     */
    public String getProximaAcaoRecomendada() {
        if (isTempoExcessivoNoStatus()) {
            return "Verificar status - tempo excessivo em " + status.getDescricao();
        }

        if (!getEquipamentosComAlerta().isEmpty()) {
            return "Verificar equipamentos com alerta";
        }

        if (combustivelAtual != null && combustivelAtual < 25.0) {
            return "Abastecer - combustível baixo";
        }

        if (getQuantidadeEquipeAtiva() == 0) {
            return "Alocar equipe para operação";
        }

        return "Operação normal";
    }
}
