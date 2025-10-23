package com.sistemadesaude.backend.exames.dto;

import com.sistemadesaude.backend.exames.dto.ProcedimentoSadtDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SadtDTO {

    private Long id;
    private String numeroSadt;
    private Long agendamentoId;
    private Long pacienteId;

    // Dados do estabelecimento
    private String estabelecimentoNome;
    private String estabelecimentoCnes;
    private String estabelecimentoEndereco;
    private String estabelecimentoTelefone;
    private String estabelecimentoMunicipio;
    private String estabelecimentoUf;

    // Dados do paciente
    private String pacienteNome;
    private String pacienteCpf;
    private String pacienteCns;
    private String pacienteDataNascimento;
    private String pacienteSexo;
    private String pacienteEndereco;
    private String pacienteTelefone;

    // Dados do solicitante
    private String solicitanteNome;
    private String solicitanteCbo;
    private String solicitanteConselho;
    private String solicitanteNumeroConselho;

    // Dados da solicitação
    private LocalDateTime dataEmissao;
    private String tipoSadt;
    private String status;
    private List<ProcedimentoSadtDTO> procedimentos;
    private String observacoes;
    private Boolean urgente;

    // Campos de auditoria
    private String criadoPor;
    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;

    // Campo para armazenar PDF em cache
    private String pdfBase64;
}
