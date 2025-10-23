package com.sistemadesaude.backend.imunizacao.dto;

import com.sistemadesaude.backend.imunizacao.enums.EstrategiaVacinacao;
import com.sistemadesaude.backend.imunizacao.enums.LocalAtendimento;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AplicacaoVacinaDTO {

    private Long id;

    @NotNull(message = "Paciente é obrigatório")
    private Long pacienteId;

    @NotNull(message = "Vacina é obrigatória")
    private Long vacinaId;

    @NotNull(message = "Unidade é obrigatória")
    private Long unidadeId;

    private Long profissionalId;

    @NotNull(message = "Data de aplicação é obrigatória")
    private LocalDate dataAplicacao;

    @Size(max = 10, message = "Hora deve ter no máximo 10 caracteres")
    private String horaAplicacao;

    @NotNull(message = "Estratégia de vacinação é obrigatória")
    private EstrategiaVacinacao estrategiaVacinacao;

    @NotNull(message = "Local de atendimento é obrigatório")
    private LocalAtendimento localAtendimento;

    @Size(max = 50, message = "Dose deve ter no máximo 50 caracteres")
    private String dose;

    @Size(max = 50, message = "Lote deve ter no máximo 50 caracteres")
    private String lote;

    @Size(max = 100, message = "Fabricante deve ter no máximo 100 caracteres")
    private String fabricante;

    private LocalDate dataValidade;

    @Size(max = 50, message = "Via de administração deve ter no máximo 50 caracteres")
    private String viaAdministracao;

    @Size(max = 100, message = "Local de aplicação deve ter no máximo 100 caracteres")
    private String localAplicacao;

    @Size(max = 500, message = "Observações devem ter no máximo 500 caracteres")
    private String observacoes;

    // Campos de controle de exportação
    private Boolean exportadoEsus;
    private Boolean exportadoSipni;
    private Boolean exportadoRnds;
    private LocalDateTime dataExportacaoEsus;
    private LocalDateTime dataExportacaoSipni;
    private LocalDateTime dataExportacaoRnds;

    // Campos auxiliares para visualização
    private String nomePaciente;
    private String nomeVacina;
    private String nomeUnidade;
    private String nomeProfissional;
    private String operadorRegistro;
}