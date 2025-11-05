package com.sistemadesaude.backend.operador.security;

import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.operador.entity.OperadorHorarioAcesso;
import com.sistemadesaude.backend.operador.repository.OperadorHorarioAcessoRepository;
import com.sistemadesaude.backend.operador.repository.OperadorUnidadeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Validador central das regras de acesso do Operador:
 *
 * 1) Validação de JANELA DE HORÁRIO no login (sem unidade definida).
 * 2) Checagem de horário quando já se conhece a unidade.
 * 3) Filtragem de unidades candidatas conforme vínculos do operador.
 *
 * 🔧 Compatibilidade:
 * - A entidade {@link OperadorHorarioAcesso} expõe agora o campo {@code unidadeId};
 *   entradas com valor {@code null} são tratadas como regras globais.
 * - O repositório {@link OperadorHorarioAcessoRepository} precisa disponibilizar
 *   {@code findByOperadorIdAndDiaSemana(Long, Short)} para recuperarmos apenas o dia atual.
 * - Para vínculos de unidades usamos {@link OperadorUnidadeRepository#findUnidadeIds(Long)}.
*/
@Component
@RequiredArgsConstructor
public class AcessoValidator {
    private final OperadorHorarioAcessoRepository horarioRepo;
    private final OperadorUnidadeRepository unidadeRepo;

    /** ✅ Valida a janela de horário no momento do LOGIN (sem unidade definida). */
    public void validarJanelaDeLogin(Operador operador, LocalDateTime agora) {
        if (operador == null) throw new AccessDeniedException("Operador inválido.");
        if (Boolean.TRUE.equals(operador.getIsMaster())) return; // master ignora restrições

        final short dia = mapDia(agora.getDayOfWeek());
        final LocalTime hora = agora.toLocalTime();

        var horariosDoDia = horarioRepo.findByOperadorIdAndDiaSemana(operador.getId(), dia);
        if (horariosDoDia == null || horariosDoDia.isEmpty()) return; // sem regras → permite
        var ativos = horariosDoDia.stream()
                .filter(h -> Boolean.TRUE.equals(h.getAtivo()))
                .toList();
        if (ativos.isEmpty()) return; // sem regras ativas

        // Só contam horários GLOBAIS (sem unidade) para o login sem unidade
        boolean permitido = ativos.stream()
                .filter(h -> h.getUnidadeId() == null)
                .anyMatch(h -> contem(h.getHoraInicio(), h.getHoraFim(), hora));

        if (!permitido) {
            throw new AccessDeniedException("Acesso fora do horário permitido para este operador.");
        }
    }

    /**
     * ✅ Checa se um login/uso numa UNIDADE específica está dentro de uma janela válida.
     * Se a modelagem de horário não tiver unidade, vale somente regras globais.
     */
    public boolean isHorarioPermitido(Operador operador, LocalDateTime dataHora, Long unidadeId) {
        if (operador == null || Boolean.TRUE.equals(operador.getIsMaster())) return true;

        final short dia = mapDia(dataHora.getDayOfWeek());
        final LocalTime hora = dataHora.toLocalTime();

        var horariosDoDia = horarioRepo.findByOperadorIdAndDiaSemana(operador.getId(), dia);
        if (horariosDoDia == null || horariosDoDia.isEmpty()) return true; // sem regras → permite
        var ativos = horariosDoDia.stream()
                .filter(h -> Boolean.TRUE.equals(h.getAtivo()))
                .toList();
        if (ativos.isEmpty()) return true;

        boolean possuiAlgumComUnidade = ativos.stream()
                .anyMatch(h -> h.getUnidadeId() != null);

        if (possuiAlgumComUnidade && unidadeId != null) {
            // há regras por unidade → avalia apenas as da unidade informada
            return ativos.stream()
                    .filter(h -> unidadeId.equals(h.getUnidadeId()))
                    .anyMatch(h -> contem(h.getHoraInicio(), h.getHoraFim(), hora));
        }

        // não há regras por unidade → avalia apenas as GLOBAIS
        return ativos.stream()
                .filter(h -> h.getUnidadeId() == null)
                .anyMatch(h -> contem(h.getHoraInicio(), h.getHoraFim(), hora));
    }

    /**
     * ✅ Filtra uma lista de unidades candidatas pelos vínculos do operador.
     * Se o operador não tiver vínculos (lista vazia), não restringe.
     */
    public List<Long> filtrarUnidadesPermitidas(Operador operador, List<Long> candidatas) {
        if (operador == null || candidatas == null || candidatas.isEmpty()) return candidatas;
        if (Boolean.TRUE.equals(operador.getIsMaster())) return candidatas;

        List<Long> vinculadas = unidadeRepo.findUnidadeIds(operador.getId());
        if (vinculadas == null || vinculadas.isEmpty()) return candidatas;

        List<Long> out = new ArrayList<>();
        for (Long u : candidatas) {
            if (u == null) continue;
            if (vinculadas.contains(u)) out.add(u);
        }
        return out;
    }

    /* ========================================================================
       Utilitários
       ======================================================================== */

    /** Retorna true se a hora "hora" está dentro do intervalo [inicio, fim].
     *  Suporta intervalos que cruzam a meia-noite (ex.: 22:00 → 06:00). */
    private boolean contem(LocalTime inicio, LocalTime fim, LocalTime hora) {
        if (inicio == null && fim == null) return true;            // janela totalmente aberta
        if (inicio == null) return !hora.isAfter(fim);             // até "fim"
        if (fim == null) return !hora.isBefore(inicio);            // a partir de "inicio"
        if (!fim.isBefore(inicio)) {                               // janela normal (mesmo dia)
            return !hora.isBefore(inicio) && !hora.isAfter(fim);
        }
        // janela que cruza a meia-noite (ex.: 22:00-06:00)
        return !hora.isBefore(inicio) || !hora.isAfter(fim);
    }

    /** Converte DayOfWeek (MON..SUN) para o padrão usado na tabela (0=domingo, 1=segunda ... 6=sábado). */
    private short mapDia(DayOfWeek d) {
        return switch (d) {
            case MONDAY -> 1;
            case TUESDAY -> 2;
            case WEDNESDAY -> 3;
            case THURSDAY -> 4;
            case FRIDAY -> 5;
            case SATURDAY -> 6;
            case SUNDAY -> 0; // Modelagem atual usa 0 = domingo
        };
    }
}
