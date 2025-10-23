package com.sistemadesaude.backend.saudefamilia;

import com.sistemadesaude.backend.saudefamilia.entity.*;
import com.sistemadesaude.backend.saudefamilia.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class AcsDemoDataRunner implements CommandLineRunner {

    private final AreaRepository areaRepository;
    private final MicroareaRepository microareaRepository;
    private final VinculoAreaProfissionalRepository vinculoRepository;
    private final MetaRepository metaRepository;
    private final VisitaDomiciliarRepository visitaRepository;
    private final TrackPointRepository trackPointRepository;
    private final DispositivoRepository dispositivoRepository;

    private final Random rnd = new Random(42);

    @Override
    public void run(String... args) {
        try {
            if (areaRepository.count() > 0) {
                log.info("[ACS DEMO] Dados já existentes, não será feito seed.");
                return;
            }
            log.info("[ACS DEMO] Iniciando carga de dados de demonstração para ACS...");

            // Áreas
            Area a1 = Area.builder().descricao("Área 01").ine("0000001").segmento("Urbana").tipoEquipe("ESF")
                    .situacao("ATIVA").atendePopGeral(true).importacaoCnes(false).build();
            Area a2 = Area.builder().descricao("Área 02").ine("0000002").segmento("Urbana").tipoEquipe("ESF")
                    .situacao("ATIVA").atendePopGeral(true).importacaoCnes(false).build();
            a1 = areaRepository.save(a1);
            a2 = areaRepository.save(a2);

            // Microáreas (4)
            Microarea m11 = Microarea.builder().area(a1).codigo(1).profissionalResponsavelId(101L).situacao("ATIVA").build();
            Microarea m12 = Microarea.builder().area(a1).codigo(2).profissionalResponsavelId(102L).situacao("ATIVA").build();
            Microarea m21 = Microarea.builder().area(a2).codigo(1).profissionalResponsavelId(103L).situacao("ATIVA").build();
            Microarea m22 = Microarea.builder().area(a2).codigo(2).profissionalResponsavelId(104L).situacao("ATIVA").build();
            m11 = microareaRepository.save(m11);
            m12 = microareaRepository.save(m12);
            m21 = microareaRepository.save(m21);
            m22 = microareaRepository.save(m22);

            // Vínculos (5 ACS fictícios)
            vinculoRepository.save(VinculoAreaProfissional.builder().area(a1).profissionalId(201L).situacao("ATIVO").especialidade("ACS").treinamentoIntrodutorio(true).build());
            vinculoRepository.save(VinculoAreaProfissional.builder().area(a1).profissionalId(202L).situacao("ATIVO").especialidade("ACS").assistenciaMulher(true).build());
            vinculoRepository.save(VinculoAreaProfissional.builder().area(a1).profissionalId(203L).situacao("ATIVO").especialidade("ACS").assistenciaCrianca(true).build());
            vinculoRepository.save(VinculoAreaProfissional.builder().area(a2).profissionalId(204L).situacao("ATIVO").especialidade("ACS").capacitacaoPedagogica(true).build());
            vinculoRepository.save(VinculoAreaProfissional.builder().area(a2).profissionalId(205L).situacao("ATIVO").especialidade("ACS").build());

            // Metas (3 por mês, últimos 12 meses)
            YearMonth now = YearMonth.now();
            for (int i = 0; i < 12; i++) {
                YearMonth ym = now.minusMonths(i);
                String comp = String.format("%04d%02d", ym.getYear(), ym.getMonthValue());
                metaRepository.save(Meta.builder().competencia(comp).tipo("FAMILIAS").area(a1).valorMeta(300 + rnd.nextInt(50)).build());
                metaRepository.save(Meta.builder().competencia(comp).tipo("INTEGRANTES").area(a1).valorMeta(900 + rnd.nextInt(100)).build());
                metaRepository.save(Meta.builder().competencia(comp).tipo("ACOMPANHAMENTO").area(a1).valorMeta(120 + rnd.nextInt(30)).build());
            }

            // Dispositivos (2)
            dispositivoRepository.save(Dispositivo.builder().operadorId(201L).imei("IMEI-DEMO-1").app("ACS Mobile").versao("1.0.0").ultimaImportacao(LocalDateTime.now().minusDays(1)).build());
            dispositivoRepository.save(Dispositivo.builder().operadorId(204L).imei("IMEI-DEMO-2").app("ACS Mobile").versao("1.0.1").ultimaExportacao(LocalDateTime.now().minusHours(6)).build());

            // Visitas domiciliares + trackpoints (distribuídos em 30 dias)
            List<VisitaDomiciliar> visitas = new ArrayList<>();
            LocalDate start = LocalDate.now().minusDays(30);
            for (int d = 0; d < 30; d++) {
                LocalDate dia = start.plusDays(d);
                // duas visitas por dia
                visitas.add(criarVisita(a1, m11, 201L, dia, VisitaDomiciliar.MotivoVisita.ACOMPANHAMENTO, VisitaDomiciliar.DesfechoVisita.REALIZADA, -23.55 + rnd.nextDouble() * 0.02, -46.63 + rnd.nextDouble() * 0.02));
                visitas.add(criarVisita(a2, m21, 204L, dia, VisitaDomiciliar.MotivoVisita.BUSCA_ATIVA, VisitaDomiciliar.DesfechoVisita.RECUSADA, -23.57 + rnd.nextDouble() * 0.02, -46.65 + rnd.nextDouble() * 0.02));
            }
            visitaRepository.saveAll(visitas);

            List<TrackPoint> trilha = new ArrayList<>();
            for (VisitaDomiciliar v : visitas) {
                // 3 pontos por visita
                for (int i = 0; i < 3; i++) {
                    trilha.add(TrackPoint.builder()
                            .profissionalId(v.getProfissionalId())
                            .dataHora(v.getDataHora().minusMinutes(30 - i * 10))
                            .latitude((v.getLatitude() != null ? v.getLatitude() : -23.56) + rnd.nextDouble() * 0.001)
                            .longitude((v.getLongitude() != null ? v.getLongitude() : -46.64) + rnd.nextDouble() * 0.001)
                            .origem("MOBILE")
                            .visita(v)
                            .build());
                }
            }
            trackPointRepository.saveAll(trilha);

            log.info("[ACS DEMO] Carga de demonstração concluída.");
        } catch (Exception e) {
            log.warn("[ACS DEMO] Falha ao carregar dados de demonstração: {}", e.getMessage());
        }
    }

    private VisitaDomiciliar criarVisita(Area area, Microarea micro, Long prof, LocalDate dia,
                                         VisitaDomiciliar.MotivoVisita motivo, VisitaDomiciliar.DesfechoVisita desfecho,
                                         Double lat, Double lng) {
        return VisitaDomiciliar.builder()
                .dataHora(dia.atTime(9 + rnd.nextInt(6), rnd.nextBoolean() ? 0 : 30))
                .area(area)
                .microarea(micro)
                .profissionalId(prof)
                .motivo(motivo)
                .desfecho(desfecho)
                .latitude(lat)
                .longitude(lng)
                .fonte(VisitaDomiciliar.FonteRegistro.MOBILE)
                .build();
    }
}
