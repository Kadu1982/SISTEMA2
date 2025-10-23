package com.sistemadesaude.backend.upa.service;

import com.sistemadesaude.backend.upa.dto.UpaDTO;
import com.sistemadesaude.backend.upa.entity.Upa;
import com.sistemadesaude.backend.upa.enums.UpaStatus;
import com.sistemadesaude.backend.upa.mapper.UpaMapper;
import com.sistemadesaude.backend.upa.repository.UpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Serviço da ocorrência UPA.
 *
 * NOTA:
 * - Não removi nenhum método que você já tinha.
 * - ADICIONEI: buscarPorId, salvar, deletar (nomes que o controller usa).
 * - Ajustei alterarStatus para RETORNAR UpaDTO (o controller espera DTO).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UpaService {

    private final UpaRepository upaRepository;
    private final UpaMapper upaMapper;

    /* ----------------------------------------------------------------------
       LISTAGENS
       ---------------------------------------------------------------------- */

    /** Lista todas as ocorrências ATIVAS ordenadas por data/hora desc. */
    @Transactional(readOnly = true)
    public List<UpaDTO> listarTodos() {
        try {
            log.info("📋 Listando UPAs ativas (ordem data_hora_registro desc)");
            // Fallback simples por JPA derivado (mais estável)
            List<Upa> upas = upaRepository.findByAtivoTrueOrderByDataHoraRegistroDesc();
            return upas.stream().map(upaMapper::toDTO).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("❌ Erro ao listar UPAs", e);
            throw new RuntimeException("Erro ao listar UPAs: " + e.getMessage(), e);
        }
    }

    /** Lista UPAs ativas por status. */
    @Transactional(readOnly = true)
    public List<UpaDTO> listarPorStatus(UpaStatus status) {
        try {
            log.info("📋 Listando UPAs por status: {}", status);
            List<Upa> upas = upaRepository.findByAtivoTrueAndStatusOrderByDataHoraRegistroDesc(status);
            return upas.stream().map(upaMapper::toDTO).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("❌ Erro ao listar UPAs por status {}", status, e);
            throw new RuntimeException("Erro ao listar UPAs por status: " + e.getMessage(), e);
        }
    }

    /** Lista UPAs ativas por período. */
    @Transactional(readOnly = true)
    public List<UpaDTO> listarPorPeriodo(LocalDateTime inicio, LocalDateTime fim) {
        try {
            log.info("📅 Listando UPAs ativas no período {} -> {}", inicio, fim);
            List<Upa> upas = upaRepository
                    .findByAtivoTrueAndDataHoraRegistroBetweenOrderByDataHoraRegistroDesc(inicio, fim);
            return upas.stream().map(upaMapper::toDTO).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("❌ Erro ao listar UPAs por período {} -> {}", inicio, fim, e);
            throw new RuntimeException("Erro ao listar UPAs por período: " + e.getMessage(), e);
        }
    }

    /** Lista UPAs ativas de um paciente. */
    @Transactional(readOnly = true)
    public List<UpaDTO> listarPorPaciente(Long pacienteId) {
        try {
            log.info("👤 Listando UPAs do paciente {}", pacienteId);
            List<Upa> upas = upaRepository.findByAtivoTrueAndPaciente_IdOrderByDataHoraRegistroDesc(pacienteId);
            return upas.stream().map(upaMapper::toDTO).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("❌ Erro ao listar UPAs por paciente {}", pacienteId, e);
            throw new RuntimeException("Erro ao listar UPAs por paciente: " + e.getMessage(), e);
        }
    }

    /** Lista UPAs aguardando triagem (ativas e sem registro em upa_triagem). */
    @Transactional(readOnly = true)
    public List<UpaDTO> listarAguardandoTriagem() {
        try {
            log.info("🧪 Listando UPAs aguardando triagem");
            var upas = upaRepository.findAguardandoTriagem();
            return upas.stream().map(upaMapper::toDTO).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("❌ Erro ao listar UPAs aguardando triagem", e);
            throw new RuntimeException("Erro ao listar UPAs aguardando triagem: " + e.getMessage(), e);
        }
    }

    /* ----------------------------------------------------------------------
       CONTADORES
       ---------------------------------------------------------------------- */

    @Transactional(readOnly = true)
    public long contarPorStatus(UpaStatus status) {
        try {
            return upaRepository.countByStatusAndAtivoTrue(status);
        } catch (Exception e) {
            log.error("❌ Erro ao contar UPAs por status {}", status, e);
            throw new RuntimeException("Erro ao contar UPAs por status: " + e.getMessage(), e);
        }
    }

    /* ----------------------------------------------------------------------
       CRUD / REGRAS DE NEGÓCIO
       ---------------------------------------------------------------------- */

    /**
     * Usado pelo controller: busca por ID e retorna DTO.
     */
    @Transactional(readOnly = true)
    public UpaDTO buscarPorId(Long id) {
        Upa upa = upaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("UPA não encontrada: id=" + id));
        return upaMapper.toDTO(upa);
    }

    /**
     * Usado pelo controller: cria/atualiza conforme o DTO ter ou não ID.
     * Mantém defaults (status=ABERTO, ativo=true, dataHoraRegistro=agora) quando necessário.
     */
    @Transactional
    public UpaDTO salvar(UpaDTO dto) {
        if (dto == null) throw new IllegalArgumentException("DTO da UPA não pode ser nulo");
        // Defaults de criação (se for novo)
        if (dto.getId() == null) {
            if (dto.getAtivo() == null) dto.setAtivo(true);
            if (dto.getStatus() == null) dto.setStatus(UpaStatus.ABERTO);
            if (dto.getDataHoraRegistro() == null) dto.setDataHoraRegistro(LocalDateTime.now());
        }

        Upa entidade = upaMapper.toEntity(dto);
        Upa salvo = upaRepository.save(entidade);
        return upaMapper.toDTO(salvo);
    }

    /**
     * Atualiza parcialmente uma UPA existente a partir do DTO.
     */
    @Transactional
    public UpaDTO atualizar(Long id, UpaDTO dto) {
        Upa existente = upaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("UPA não encontrada: id=" + id));

        upaMapper.updateEntityFromDTO(dto, existente);
        Upa salvo = upaRepository.save(existente);
        return upaMapper.toDTO(salvo);
    }

    /**
     * Usado pelo controller: deleta por ID.
     */
    @Transactional
    public void deletar(Long id) {
        if (!upaRepository.existsById(id)) {
            throw new IllegalArgumentException("UPA não encontrada: id=" + id);
        }
        upaRepository.deleteById(id);
    }

    /**
     * Altera o status e RETORNA o DTO (o controller espera UpaDTO).
     */
    @Transactional
    public UpaDTO alterarStatus(Long id, UpaStatus novoStatus) {
        Upa upa = upaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("UPA não encontrada: id=" + id));
        upa.setStatus(novoStatus);
        Upa salvo = upaRepository.save(upa);
        return upaMapper.toDTO(salvo);
    }

    /** Inativa uma UPA (não remove o registro). */
    @Transactional
    public UpaDTO inativar(Long id) {
        Upa upa = upaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("UPA não encontrada: id=" + id));
        if (upa.isAtivo()) {
            upa.setAtivo(false);
            upa = upaRepository.save(upa);
        }
        return upaMapper.toDTO(upa);
    }

    /** Reativa uma UPA. */
    @Transactional
    public UpaDTO reativar(Long id) {
        Upa upa = upaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("UPA não encontrada: id=" + id));
        if (!upa.isAtivo()) {
            upa.setAtivo(true);
            upa = upaRepository.save(upa);
        }
        return upaMapper.toDTO(upa);
    }
}
