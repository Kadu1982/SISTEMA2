package com.sistemadesaude.backend.atendimento.dto;

import com.sistemadesaude.backend.atendimento.validation.CiapRules;
import jakarta.validation.constraints.Size;
import java.util.List;

@CiapRules
public class AtendimentoRequestDTO {
    private Long pacienteId;
    private Long profissionalId;
    // ... demais campos do seu request

    // Se você preferir 1 RFE apenas, deixe String; o validador aceita.
    private String ciapRfe;

    @Size(max = 5, message = "Até 5 diagnósticos CIAP")
    private List<String> ciapDiagnosticos;

    @Size(max = 5, message = "Até 5 procedimentos CIAP")
    private List<String> ciapProcedimentos;

    // getters/setters
    public String getCiapRfe() { return ciapRfe; }
    public void setCiapRfe(String v) { this.ciapRfe = v; }

    public List<String> getCiapDiagnosticos() { return ciapDiagnosticos; }
    public void setCiapDiagnosticos(List<String> v) { this.ciapDiagnosticos = v; }

    public List<String> getCiapProcedimentos() { return ciapProcedimentos; }
    public void setCiapProcedimentos(List<String> v) { this.ciapProcedimentos = v; }
}
