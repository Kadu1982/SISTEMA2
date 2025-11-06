package com.sistemadesaude.backend.procedimentosrapidos.dto;

import com.sistemadesaude.backend.procedimentosrapidos.enums.SituacaoAtividade;
import com.sistemadesaude.backend.procedimentosrapidos.enums.TipoAtividade;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtividadeEnfermagemDTO {

    private Long id;

    @NotNull(message = "O tipo da atividade é obrigatório")
    private TipoAtividade tipo;

    @NotBlank(message = "A descrição da atividade é obrigatória")
    private String atividade;

    private SituacaoAtividade situacao;
    private LocalDateTime dataHoraInicial;
    private LocalDateTime dataHoraFinal;
    private String profissional;
    private String observacoes;

    @Builder.Default
    private Boolean urgente = false;

    private String alerta;
    private Integer intervaloMinutos;

    @Builder.Default
    private List<LocalDateTime> horariosAprazados = new ArrayList<>();

    @Builder.Default
    private List<LocalDateTime> horariosAnteriores = new ArrayList<>();

    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;

    // Campos calculados
    private Boolean atrasada;
    private LocalDateTime proximoHorario;
}
