
package com.sistemadesaude.backend.samu.entity;

import com.sistemadesaude.backend.operador.entity.Operador;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

/**
 * 🚑 ENTIDADE PARA VIATURA ASSOCIADA À OCORRÊNCIA - CORRIGIDA
 *
 * ✅ CORREÇÃO: Removido relacionamento @OneToMany que causava erro circular
 * ✅ Mantidas TODAS as funcionalidades através de métodos helper
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "samu_viatura_ocorrencia")
public class ViaturaOcorrencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ocorrencia_id", nullable = false)
    private Ocorrencia ocorrencia;

    @Column(name = "codigo", nullable = false)
    private String codigo;

    @Column(name = "placa", nullable = false)
    private String placa;

    @Column(name = "tipo_viatura", nullable = false) // USA, USB, UTI_MOVEL, HELICOPTERO, MOTOLANCIA
    private String tipoViatura;

    @Column(name = "modelo")
    private String modelo;

    @Column(name = "ano")
    private Integer ano;

    // Status operacional
    @Column(name = "status_viatura", nullable = false) // DISPONIVEL, A_CAMINHO, NO_LOCAL, TRANSPORTANDO, INDISPONIVEL
    private String statusViatura;

    @Column(name = "ativa")
    private Boolean ativa = true;

    // Timeline da operação
    @Column(name = "hora_acionamento")
    private LocalDateTime horaAcionamento;

    @Column(name = "hora_saida")
    private LocalDateTime horaSaida;

    @Column(name = "hora_chegada_local")
    private LocalDateTime horaChegadaLocal;

    @Column(name = "hora_saida_local")
    private LocalDateTime horaSaidaLocal;

    @Column(name = "hora_chegada_hospital")
    private LocalDateTime horaChegadaHospital;

    @Column(name = "hora_liberacao")
    private LocalDateTime horaLiberacao;

    // Localização atual
    @Column(name = "latitude_atual")
    private Double latitudeAtual;

    @Column(name = "longitude_atual")
    private Double longitudeAtual;

    @Column(name = "endereco_atual")
    private String enderecoAtual;

    @Column(name = "velocidade_atual")
    private Double velocidadeAtual;

    @Column(name = "direcao")
    private String direcao;

    // Equipamentos e recursos
    @Column(name = "equipamentos_disponiveis", columnDefinition = "TEXT")
    private String equipamentosDisponiveis; // JSON ou lista separada por vírgula

    @Column(name = "nivel_atendimento") // BASICO, AVANCADO, UTI
    private String nivelAtendimento;

    @Column(name = "capacidade_pacientes")
    private Integer capacidadePacientes;

    @Column(name = "tem_medico")
    private Boolean temMedico = false;

    @Column(name = "tem_enfermeiro")
    private Boolean temEnfermeiro = false;

    // Equipe principal
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "condutor_id")
    private Operador condutor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medico_responsavel_id")
    private Operador medicoResponsavel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enfermeiro_responsavel_id")
    private Operador enfermeiroResponsavel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tecnico_enfermagem_id")
    private Operador tecnicoEnfermagem;

    // Quilometragem e consumo
    @Column(name = "km_inicial")
    private Integer kmInicial;

    @Column(name = "km_final")
    private Integer kmFinal;

    @Column(name = "combustivel_consumido")
    private Double combustivelConsumido;

    // Controle de qualidade
    @Column(name = "avaliacao_atendimento")
    private Integer avaliacaoAtendimento; // 1-5 estrelas

    @Column(name = "observacoes_equipe", columnDefinition = "TEXT")
    private String observacoesEquipe;

    @Column(name = "intercorrencias", columnDefinition = "TEXT")
    private String intercorrencias;

    // Dados de controle
    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @PreUpdate
    private void preUpdate() {
        this.dataAtualizacao = LocalDateTime.now();
    }

    // ========================================
    // 🚀 MÉTODOS HELPER INTELIGENTES (MANTIDOS TODOS!)
    // ========================================

    /**
     * ✅ CORREÇÃO: Método para acessar eventos através da ocorrência
     *
     * Como os eventos pertencem à ocorrência e não diretamente à viatura,
     * este método busca os eventos através do relacionamento com a ocorrência.
     */
    public List<EventoOcorrencia> getEventos() {
        if (ocorrencia == null || ocorrencia.getEventos() == null) {
            return Collections.emptyList();
        }
        return ocorrencia.getEventos();
    }

    /**
     * 🔍 Busca eventos específicos desta viatura
     *
     * Filtra os eventos da ocorrência que podem estar relacionados
     * a esta viatura específica através de informações nos dados adicionais.
     */
    public List<EventoOcorrencia> getEventosEspecificosDaViatura() {
        return getEventos().stream()
                .filter(evento -> {
                    String descricao = evento.getDescricao();
                    String dadosAdicionais = evento.getDadosAdicionais();

                    // Verifica se o evento menciona esta viatura específica
                    boolean mencionaViatura = (descricao != null && descricao.contains(this.codigo)) ||
                            (dadosAdicionais != null && dadosAdicionais.contains(this.codigo));

                    return mencionaViatura;
                })
                .toList();
    }

    /**
     * ✅ Verifica se a viatura está ativa na ocorrência
     */
    public boolean isAtivaOcorrencia() {
        return Boolean.TRUE.equals(ativa) &&
                !"INDISPONIVEL".equals(statusViatura);
    }

    /**
     * 🚑 Verifica se está a caminho do local
     */
    public boolean isACaminho() {
        return "A_CAMINHO".equals(statusViatura);
    }

    /**
     * 📍 Verifica se está no local da ocorrência
     */
    public boolean isNoLocal() {
        return "NO_LOCAL".equals(statusViatura);
    }

    /**
     * 🏥 Verifica se está transportando paciente
     */
    public boolean isTransportando() {
        return "TRANSPORTANDO".equals(statusViatura);
    }

    /**
     * ⏱️ Calcula tempo total de atendimento
     */
    public Long getTempoTotalAtendimento() {
        if (horaAcionamento == null) return null;

        LocalDateTime fimAtendimento = horaLiberacao != null ? horaLiberacao : LocalDateTime.now();
        return Duration.between(horaAcionamento, fimAtendimento).toMinutes();
    }

    /**
     * ⏱️ Calcula tempo de resposta (acionamento até chegada no local)
     */
    public Long getTempoResposta() {
        if (horaAcionamento == null || horaChegadaLocal == null) return null;
        return Duration.between(horaAcionamento, horaChegadaLocal).toMinutes();
    }

    /**
     * ⏱️ Calcula tempo no local
     */
    public Long getTempoNoLocal() {
        if (horaChegadaLocal == null || horaSaidaLocal == null) return null;
        return Duration.between(horaChegadaLocal, horaSaidaLocal).toMinutes();
    }

    /**
     * ⏱️ Calcula tempo de transporte
     */
    public Long getTempoTransporte() {
        if (horaSaidaLocal == null || horaChegadaHospital == null) return null;
        return Duration.between(horaSaidaLocal, horaChegadaHospital).toMinutes();
    }

    /**
     * 🛣️ Calcula quilometragem rodada na ocorrência
     */
    public Integer getKmRodados() {
        if (kmInicial == null || kmFinal == null) return null;
        return kmFinal - kmInicial;
    }

    /**
     * ⛽ Calcula consumo médio (km/l)
     */
    public Double getConsumoMedio() {
        Integer km = getKmRodados();
        if (km == null || combustivelConsumido == null || combustivelConsumido == 0) return null;
        return km / combustivelConsumido;
    }

    /**
     * 👥 Verifica se tem equipe médica completa
     */
    public boolean temEquipeMedicaCompleta() {
        return condutor != null &&
                medicoResponsavel != null &&
                enfermeiroResponsavel != null;
    }

    /**
     * 👥 Verifica se tem equipe básica completa
     */
    public boolean temEquipeBasicaCompleta() {
        return condutor != null &&
                (enfermeiroResponsavel != null || tecnicoEnfermagem != null);
    }

    /**
     * 🎯 Obtém nível de atendimento real baseado na equipe
     */
    public String getNivelAtendimentoReal() {
        if (medicoResponsavel != null) {
            return "UTI";
        } else if (enfermeiroResponsavel != null) {
            return "AVANCADO";
        } else {
            return "BASICO";
        }
    }

    /**
     * 📊 Obtém status formatado para interface
     */
    public String getStatusFormatado() {
        return switch (statusViatura) {
            case "DISPONIVEL" -> "✅ Disponível";
            case "A_CAMINHO" -> "🚑 A Caminho";
            case "NO_LOCAL" -> "📍 No Local";
            case "TRANSPORTANDO" -> "🏥 Transportando";
            case "INDISPONIVEL" -> "❌ Indisponível";
            default -> statusViatura;
        };
    }

    /**
     * 🎨 Obtém cor para interface baseada no status
     */
    public String getCorInterface() {
        return switch (statusViatura) {
            case "DISPONIVEL" -> "text-green-600 bg-green-50";
            case "A_CAMINHO" -> "text-yellow-600 bg-yellow-50";
            case "NO_LOCAL" -> "text-blue-600 bg-blue-50";
            case "TRANSPORTANDO" -> "text-purple-600 bg-purple-50";
            case "INDISPONIVEL" -> "text-red-600 bg-red-50";
            default -> "text-gray-600 bg-gray-50";
        };
    }

    /**
     * ⭐ Verifica se teve boa avaliação
     */
    public boolean teveBomAtendimento() {
        return avaliacaoAtendimento != null && avaliacaoAtendimento >= 4;
    }

    /**
     * 🚨 Verifica se teve intercorrências graves
     */
    public boolean teveIntercorrenciasGraves() {
        if (intercorrencias == null) return false;
        String intercorrenciasLower = intercorrencias.toLowerCase();
        return intercorrenciasLower.contains("grave") ||
                intercorrenciasLower.contains("obito") ||
                intercorrenciasLower.contains("parada") ||
                intercorrenciasLower.contains("urgente");
    }

    /**
     * 📋 Obtém resumo da operação
     */
    public String getResumoOperacao() {
        StringBuilder resumo = new StringBuilder();
        resumo.append("Viatura ").append(codigo);

        if (getTempoResposta() != null) {
            resumo.append(" - Resposta: ").append(getTempoResposta()).append("min");
        }

        if (getKmRodados() != null) {
            resumo.append(" - ").append(getKmRodados()).append("km");
        }

        if (avaliacaoAtendimento != null) {
            resumo.append(" - ⭐").append(avaliacaoAtendimento).append("/5");
        }

        return resumo.toString();
    }

    /**
     * 🔍 Verifica se está dentro dos padrões de tempo
     */
    public boolean isTempoRespostaDentroPadrao() {
        Long tempoResposta = getTempoResposta();
        if (tempoResposta == null) return true; // Se não tem dados, considera OK

        // Padrão SAMU: até 8 minutos em área urbana
        return tempoResposta <= 8;
    }

    /**
     * 📊 Obtém indicadores de performance
     */
    public Map<String, Object> getIndicadoresPerformance() {
        Map<String, Object> indicadores = new HashMap<>();

        indicadores.put("tempoResposta", getTempoResposta());
        indicadores.put("tempoTotal", getTempoTotalAtendimento());
        indicadores.put("kmRodados", getKmRodados());
        indicadores.put("consumoMedio", getConsumoMedio());
        indicadores.put("avaliacaoAtendimento", avaliacaoAtendimento);
        indicadores.put("dentroPadrao", isTempoRespostaDentroPadrao());
        indicadores.put("teveIntercorrencias", teveIntercorrenciasGraves());

        return indicadores;
    }
}
