package com.sistemadesaude.backend.paciente.service;

import com.sistemadesaude.backend.paciente.entity.Paciente;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.Period;

/**
 * Serviço de domínio que contém lógica de negócio relacionada a pacientes.
 * Diferente dos serviços de aplicação, os serviços de domínio contêm apenas
 * regras de negócio puras, sem dependências de infraestrutura.
 */
@Service
public class PacienteDomainService {

    /**
     * Calcula a idade do paciente com base na data de nascimento.
     * 
     * @param paciente O paciente para calcular a idade
     * @return A idade em anos
     */
    public int calcularIdade(Paciente paciente) {
        if (paciente.getDataNascimento() == null) {
            throw new IllegalArgumentException("Paciente não possui data de nascimento");
        }

        return Period.between(paciente.getDataNascimento(), LocalDate.now()).getYears();
    }

    /**
     * Verifica se o paciente é considerado idoso (60 anos ou mais).
     * 
     * @param paciente O paciente para verificar
     * @return true se o paciente for idoso, false caso contrário
     */
    public boolean isIdoso(Paciente paciente) {
        return calcularIdade(paciente) >= 60;
    }

    /**
     * Verifica se o paciente é considerado criança (menos de 12 anos).
     * 
     * @param paciente O paciente para verificar
     * @return true se o paciente for criança, false caso contrário
     */
    public boolean isCrianca(Paciente paciente) {
        return calcularIdade(paciente) < 12;
    }

    /**
     * Verifica se o paciente possui condições especiais que requerem atenção.
     * 
     * @param paciente O paciente para verificar
     * @return true se o paciente possuir condições especiais, false caso contrário
     */
    public boolean possuiCondicoesEspeciais(Paciente paciente) {
        return paciente.getAcamado() != null && paciente.getAcamado() ||
               paciente.getDomiciliado() != null && paciente.getDomiciliado() ||
               paciente.getCondSaudeMental() != null && paciente.getCondSaudeMental();
    }

    /**
     * Verifica se o paciente está em situação de vulnerabilidade.
     * 
     * @param paciente O paciente para verificar
     * @return true se o paciente estiver em situação de vulnerabilidade, false caso contrário
     */
    public boolean isVulneravel(Paciente paciente) {
        return isIdoso(paciente) || isCrianca(paciente) || possuiCondicoesEspeciais(paciente);
    }
}
