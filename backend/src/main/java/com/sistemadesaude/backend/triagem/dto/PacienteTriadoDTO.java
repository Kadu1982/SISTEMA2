package com.sistemadesaude.backend.triagem.dto;

import com.sistemadesaude.backend.triagem.entity.ClassificacaoRisco;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PacienteTriadoDTO {
    private Long triagemId;
    private Long pacienteId;
    private String nomeCompleto;
    private LocalDate dataNascimento;
    private Long agendamentoId;
    private LocalDateTime dataTriagem;
    private ClassificacaoRisco classificacaoRisco;
    private ClassificacaoRisco classificacaoOriginal;
    private String queixaPrincipal;
    private Integer escalaDor;
    private String protocoloAplicado;
    private String condutaSugerida;
    private String diagnosticosSugeridos;
    private String profissionalTriagem;
    private Boolean cancelada;
    private String motivoCancelamento;

    // Sinais vitais principais
    private String pressaoArterial;
    private Double temperatura;
    private Integer frequenciaCardiaca;
    private Integer saturacaoOxigenio;

    // ✅ Método helper para idade
    public int getIdade() {
        if (dataNascimento == null) return 0;
        return LocalDate.now().getYear() - dataNascimento.getYear();
    }

    // ✅ Método helper para verificar reclassificação
    public boolean foiReclassificada() {
        return classificacaoOriginal != null && !classificacaoOriginal.equals(classificacaoRisco);
    }
}
