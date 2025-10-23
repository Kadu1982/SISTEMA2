package com.sistemadesaude.backend.exames.service;

import com.sistemadesaude.backend.exames.entity.Sadt;
import com.sistemadesaude.backend.exames.repository.SadtRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

/**
 * Gera números SADT no formato: yyyyMMdd-XXXXXX (com zero-padding).
 * Evita usar SQL com substring/like e funciona em qualquer banco suportado por JPA.
 */
@Service
@RequiredArgsConstructor
public class SadtNumeroService {

    private final SadtRepository sadtRepository;

    private static final DateTimeFormatter DIA = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final int LARGURA = 6;

    /**
     * Gera o próximo número para a data informada.
     * Exemplo: 20250903-000001
     */
    public String gerarProximoNumero(LocalDate data) {
        String prefixo = data.format(DIA) + "-";

        // Busca a última SADT do dia, ordenada pelo numeroSadt (funciona pq tem zero-padding)
        Optional<Sadt> ultimo = sadtRepository.findTopByNumeroSadtStartingWithOrderByNumeroSadtDesc(prefixo);

        long proximo = 1L;
        if (ultimo.isPresent()) {
            String ultimoNumero = ultimo.get().getNumeroSadt(); // ex.: 20250903-000014
            if (ultimoNumero != null && ultimoNumero.startsWith(prefixo)) {
                try {
                    long seq = Long.parseLong(ultimoNumero.substring(prefixo.length())); // "000014"
                    proximo = seq + 1L;
                } catch (NumberFormatException ignore) {
                    proximo = 1L;
                }
            }
        }
        return prefixo + String.format("%0" + LARGURA + "d", proximo);
    }
}
