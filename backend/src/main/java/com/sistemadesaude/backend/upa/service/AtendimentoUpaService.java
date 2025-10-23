package com.sistemadesaude.backend.upa.service;

import com.sistemadesaude.backend.paciente.repository.PacienteRepository;
import com.sistemadesaude.backend.upa.dto.CriarAtendimentoUpaRequest;
import com.sistemadesaude.backend.upa.entity.AtendimentoUpa;
import com.sistemadesaude.backend.upa.enums.StatusAtendimento;
import com.sistemadesaude.backend.upa.repository.AtendimentoUpaRepository;
import com.sistemadesaude.backend.upa.repository.TriagemUpaRepository;
import com.sistemadesaude.backend.upa.repository.UpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/** Regras de negócio do Atendimento UPA. */
@Service
@RequiredArgsConstructor
@Slf4j
public class AtendimentoUpaService {

    private final UpaRepository upaRepo;
    private final TriagemUpaRepository triagemRepo;
    private final PacienteRepository pacienteRepo;
    private final AtendimentoUpaRepository atendimentoRepo;

    public Long salvar(CriarAtendimentoUpaRequest req) {
        validar(req);

        var upa = upaRepo.findById(req.getOcorrenciaId())
                .orElseThrow(() -> new IllegalArgumentException("Ocorrência (UPA) não encontrada: id=" + req.getOcorrenciaId()));

        var triagem = triagemRepo.findById(req.getTriagemId())
                .orElseThrow(() -> new IllegalArgumentException("Triagem não encontrada: id=" + req.getTriagemId()));

        var paciente = pacienteRepo.findById(req.getPacienteId())
                .orElseThrow(() -> new IllegalArgumentException("Paciente não encontrado: id=" + req.getPacienteId()));

        var status = parseStatus(req.getStatusAtendimento());
        if (status == null) status = StatusAtendimento.CONCLUIDO;

        var entity = AtendimentoUpa.builder()
                .upa(upa)
                .triagem(triagem)
                .paciente(paciente)
                .cid10(req.getCid10().trim())
                .anamnese(emptyToNull(req.getAnamnese()))
                .exameFisico(emptyToNull(req.getExameFisico()))
                .hipoteseDiagnostica(emptyToNull(req.getHipoteseDiagnostica()))
                .conduta(emptyToNull(req.getConduta()))
                .prescricao(emptyToNull(req.getPrescricao()))
                .observacoes(emptyToNull(req.getObservacoes()))
                .retorno(emptyToNull(req.getRetorno()))
                .statusAtendimento(status)
                .build();

        return atendimentoRepo.save(entity).getId();
    }

    // ===== Desfechos rápidos (Manual UPA) =====
    public void liberarUsuario(Long atendimentoId, String observacoes) {
        var at = atendimentoRepo.findById(atendimentoId)
                .orElseThrow(() -> new IllegalArgumentException("Atendimento não encontrado: id=" + atendimentoId));
        at.setStatusAtendimento(StatusAtendimento.FINALIZADO);
        at.setObservacoes(append(at.getObservacoes(), tag("LIBERAR"), observacoes));
        atendimentoRepo.save(at);
    }

    public void observacao(Long atendimentoId, String setorDestino, String observacoes) {
        var at = atendimentoRepo.findById(atendimentoId)
                .orElseThrow(() -> new IllegalArgumentException("Atendimento não encontrado: id=" + atendimentoId));
        at.setStatusAtendimento(StatusAtendimento.OBSERVACAO);
        String extra = setorDestino != null ? "Setor: " + setorDestino : null;
        at.setObservacoes(append(at.getObservacoes(), tag("OBSERVACAO"), extra, observacoes));
        atendimentoRepo.save(at);
    }

    public void encaminhamentoInterno(Long atendimentoId, String setorDestino, String observacoes) {
        var at = atendimentoRepo.findById(atendimentoId)
                .orElseThrow(() -> new IllegalArgumentException("Atendimento não encontrado: id=" + atendimentoId));
        at.setStatusAtendimento(StatusAtendimento.ENCAMINHAMENTO_INTERNO);
        String extra = setorDestino != null ? "Destino: " + setorDestino : null;
        at.setObservacoes(append(at.getObservacoes(), tag("ENCAMINHAMENTO"), extra, observacoes));
        atendimentoRepo.save(at);
    }

    public void reavaliacao(Long atendimentoId, Integer prazoMinutos, String observacoes) {
        var at = atendimentoRepo.findById(atendimentoId)
                .orElseThrow(() -> new IllegalArgumentException("Atendimento não encontrado: id=" + atendimentoId));
        at.setStatusAtendimento(StatusAtendimento.REAVALIACAO);
        String extra = prazoMinutos != null ? ("Reavaliar em " + prazoMinutos + " min") : null;
        at.setRetorno(extra);
        at.setObservacoes(append(at.getObservacoes(), tag("REAVALIACAO"), extra, observacoes));
        atendimentoRepo.save(at);
    }

    private String tag(String t) { return "[" + t + "]"; }

    private String append(String original, String... parts) {
        StringBuilder sb = new StringBuilder();
        if (original != null && !original.isBlank()) sb.append(original.trim());
        for (String p : parts) {
            if (p == null || p.isBlank()) continue;
            if (sb.length() > 0) sb.append("\n");
            sb.append(p.trim());
        }
        return sb.length() == 0 ? null : sb.toString();
    }

    private void validar(CriarAtendimentoUpaRequest req) {
        if (req.getOcorrenciaId() == null) throw new IllegalArgumentException("ocorrenciaId é obrigatório");
        if (req.getTriagemId() == null) throw new IllegalArgumentException("triagemId é obrigatório");
        if (req.getPacienteId() == null) throw new IllegalArgumentException("pacienteId é obrigatório");
        if (!StringUtils.hasText(req.getCid10())) throw new IllegalArgumentException("cid10 é obrigatório");
    }

    private StatusAtendimento parseStatus(String s) {
        if (!StringUtils.hasText(s)) return null;
        try { return StatusAtendimento.valueOf(s.toUpperCase()); }
        catch (Exception e) { return null; }
    }

    private String emptyToNull(String x) {
        return StringUtils.hasText(x) ? x : null;
    }
}
