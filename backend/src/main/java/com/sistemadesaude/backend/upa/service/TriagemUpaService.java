
package com.sistemadesaude.backend.upa.service;

import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.paciente.repository.PacienteRepository;
import com.sistemadesaude.backend.upa.dto.AguardandoTriagemDTO;
import com.sistemadesaude.backend.upa.dto.CriarTriagemUpaRequest;
import com.sistemadesaude.backend.upa.dto.TriadoDTO;
import com.sistemadesaude.backend.upa.entity.TriagemUpa;
import com.sistemadesaude.backend.upa.entity.Upa;
import com.sistemadesaude.backend.upa.enums.ClassificacaoRisco;
import com.sistemadesaude.backend.upa.repository.TriagemUpaRepository;
import com.sistemadesaude.backend.upa.repository.UpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * Regras de negócio para triagem UPA
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TriagemUpaService {

    private final UpaRepository upaRepo;
    private final PacienteRepository pacienteRepo;
    private final TriagemUpaRepository triagemRepo;

    /**
     * Lista UPAs aguardando triagem
     */
    public List<AguardandoTriagemDTO> listarAguardando() {
        try {
            log.info("📋 Listando UPAs aguardando triagem");
            List<Upa> upas = upaRepo.findAguardandoTriagem();

            List<AguardandoTriagemDTO> resultado = upas.stream()
                    .map(u -> AguardandoTriagemDTO.builder()
                            .upaId(u.getId())
                            .pacienteId(u.getPacienteId())
                            .pacienteNome(u.getPaciente() != null ? u.getPaciente().getNomeCompleto() : "Nome não disponível")
                            .dataHoraRegistro(u.getDataHoraRegistro())
                            .prioridade(u.getPrioridade() != null ? u.getPrioridade().name() : null)
                            .build())
                    .toList();

            log.info("✅ Encontradas {} UPAs aguardando triagem", resultado.size());
            return resultado;
        } catch (Exception e) {
            log.warn("⚠️ FALHA no método principal (banco legado?). Aplicando fallback básico de aguardando.", e);
            List<com.sistemadesaude.backend.upa.repository.UpaRepository.BasicUpaRow> rows = upaRepo.findAguardandoTriagemBasic();
            return rows.stream().map(r -> AguardandoTriagemDTO.builder()
                    .upaId(r.getId())
                    .pacienteId(r.getPacienteId())
                    .pacienteNome(r.getPacienteNome() != null ? r.getPacienteNome() : "Nome não disponível")
                    .dataHoraRegistro(r.getDataHoraRegistro() != null ? r.getDataHoraRegistro().toLocalDateTime() : null)
                    .prioridade(null)
                    .build()).toList();
        }
    }

    /**
     * Lista triados que ainda não têm atendimento médico
     */
    public List<TriadoDTO> listarTriadosSemAtendimento() {
        try {
            log.info("📋 Listando triados sem atendimento");
            List<TriagemUpa> triagens = triagemRepo.findTriadosSemAtendimento();

            List<TriadoDTO> resultado = triagens.stream()
                    .map(t -> TriadoDTO.builder()
                            .triagemId(t.getId())
                            .upaId(t.getUpa() != null ? t.getUpa().getId() : null)
                            .pacienteId(t.getPaciente() != null ? t.getPaciente().getId() : null)
                            .pacienteNome(t.getPaciente() != null ? t.getPaciente().getNomeCompleto() : "Nome não disponível")
                            .criadoEm(t.getCriadoEm())
                            .classificacaoRisco(t.getClassificacaoRisco() != null ? t.getClassificacaoRisco().name() : null)
                            .build())
                    .toList();

            log.info("✅ Encontrados {} triados sem atendimento", resultado.size());
            return resultado;
        } catch (Exception e) {
            log.warn("⚠️ FALHA na consulta triados (banco legado?). Fallback para todas triagens ordenadas.", e);
            List<TriagemUpa> triagens = triagemRepo.findAllOrderByCriadoEmAsc();
            return triagens.stream()
                    .map(t -> TriadoDTO.builder()
                            .triagemId(t.getId())
                            .upaId(t.getUpa() != null ? t.getUpa().getId() : null)
                            .pacienteId(t.getPaciente() != null ? t.getPaciente().getId() : null)
                            .pacienteNome(t.getPaciente() != null ? t.getPaciente().getNomeCompleto() : "Nome não disponível")
                            .criadoEm(t.getCriadoEm())
                            .classificacaoRisco(t.getClassificacaoRisco() != null ? t.getClassificacaoRisco().name() : null)
                            .build())
                    .toList();
        }
    }

    /**
     * Salva triagem UPA
     */
    @Transactional
    public Long salvarTriagem(CriarTriagemUpaRequest req) {
        try {
            log.info("💾 Salvando triagem UPA: {}", req);

            validar(req);

            Upa upa = upaRepo.findById(req.getOcorrenciaId())
                    .orElseThrow(() -> new IllegalArgumentException("Ocorrência (UPA) não encontrada: id=" + req.getOcorrenciaId()));

            Paciente paciente = pacienteRepo.findById(req.getPacienteId())
                    .orElseThrow(() -> new IllegalArgumentException("Paciente não encontrado: id=" + req.getPacienteId()));

            TriagemUpa entity = TriagemUpa.builder()
                    .upa(upa)
                    .paciente(paciente)
                    .motivoConsulta(req.getMotivoConsulta())
                    .queixaPrincipal(req.getQueixaPrincipal())
                    .observacoes(req.getObservacoes())
                    .alergias(req.getAlergias())
                    .pressaoArterial(req.getPressaoArterial())
                    .temperatura(req.getTemperatura())
                    .peso(req.getPeso())
                    .altura(req.getAltura())
                    .frequenciaCardiaca(req.getFrequenciaCardiaca())
                    .frequenciaRespiratoria(req.getFrequenciaRespiratoria())
                    .saturacaoOxigenio(req.getSaturacaoOxigenio())
                    .escalaDor(req.getEscalaDor())
                    .dumInformada(req.getDumInformada())
                    .gestanteInformado(req.getGestanteInformado())
                    .semanasGestacaoInformadas(req.getSemanasGestacaoInformadas())
                    .classificacaoRisco(parseRisco(req.getClassificacaoRisco()))
                    .build();

            TriagemUpa salva = triagemRepo.save(entity);
            log.info("✅ Triagem UPA salva com ID: {}", salva.getId());

            return salva.getId();
        } catch (Exception e) {
            log.error("❌ Erro ao salvar triagem UPA", e);
            throw e;
        }
    }

    // Métodos privados de validação e parse
    private void validar(CriarTriagemUpaRequest req) {
        if (req.getOcorrenciaId() == null) {
            throw new IllegalArgumentException("ID da ocorrência (UPA) é obrigatório");
        }
        if (req.getPacienteId() == null) {
            throw new IllegalArgumentException("ID do paciente é obrigatório");
        }
        if (!StringUtils.hasText(req.getQueixaPrincipal())) {
            throw new IllegalArgumentException("Queixa principal é obrigatória");
        }
    }

    private ClassificacaoRisco parseRisco(String s) {
        if (!StringUtils.hasText(s)) return null;
        try {
            return ClassificacaoRisco.valueOf(s.toUpperCase());
        } catch (Exception e) {
            log.warn("⚠️ Classificação de risco inválida: {}", s);
            return null;
        }
    }
}
