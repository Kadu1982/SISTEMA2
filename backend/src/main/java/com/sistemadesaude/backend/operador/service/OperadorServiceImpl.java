package com.sistemadesaude.backend.operador.service;

import com.sistemadesaude.backend.operador.dto.OperadorDTO;
import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.operador.mapper.OperadorMapper;
import com.sistemadesaude.backend.operador.repository.OperadorRepository;
import com.sistemadesaude.backend.operador.service.OperadorService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

/**
 * Implementação padrão do serviço de Operador.
 *
 * Padrões:
 * - Métodos de escrita com @Transactional.
 * - Fallback em buscarPorTermo (funciona mesmo sem método custom no repository).
 * - Atualização campo-a-campo (não depende de updateFromDto).
 * - Exclusão simples; se houver FKs sem ON DELETE CASCADE, limpe-as em suas services.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OperadorServiceImpl implements OperadorService {

    private final OperadorRepository operadorRepository;
    private final OperadorMapper operadorMapper;

    // ====================================================
    // LISTAGEM / BUSCA
    // ====================================================

    @Override
    public List<OperadorDTO> listarTodos() {
        log.debug("Listando todos os operadores");
        List<Operador> lista = operadorRepository.findAll(Sort.by(Sort.Direction.ASC, "nome"));
        return lista.stream().map(operadorMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    public Page<OperadorDTO> buscarPorTermo(String termo, Pageable pageable) {
        // Se existir método específico no repository, troque por ele.
        Page<Operador> page = operadorRepository.findAll(pageable);

        if (termo == null || termo.isBlank()) {
            return page.map(operadorMapper::toDTO);
        }

        final String q = termo.trim().toLowerCase(Locale.ROOT);

        List<OperadorDTO> filtrados = page.getContent().stream()
                .filter(o ->
                        (o.getNome()  != null && o.getNome().toLowerCase(Locale.ROOT).contains(q)) ||
                                (o.getLogin() != null && o.getLogin().toLowerCase(Locale.ROOT).contains(q)) ||
                                (o.getCpf()   != null && o.getCpf().toLowerCase(Locale.ROOT).contains(q))   ||
                                (o.getEmail() != null && o.getEmail().toLowerCase(Locale.ROOT).contains(q))
                )
                .map(operadorMapper::toDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(filtrados, pageable, filtrados.size());
    }

    // ====================================================
    // OBTÉM POR ID
    // ====================================================

    @Override
    public OperadorDTO obterPorId(Long id) throws EntityNotFoundException {
        log.debug("Buscando operador por ID: {}", id);
        Operador operador = operadorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Operador não encontrado com ID: " + id));
        return operadorMapper.toDTO(operador);
    }

    // ====================================================
    // CRIAR / ATUALIZAR
    // ====================================================

    @Override
    @Transactional
    public OperadorDTO criar(OperadorDTO dto) {
        log.info("Criando operador: {}", dto != null ? dto.getLogin() : "null");

        Operador entity = operadorMapper.toEntity(dto);

        // Defaults seguros
        if (entity.getAtivo() == null) entity.setAtivo(Boolean.TRUE);

        Operador salvo = operadorRepository.save(entity);
        return operadorMapper.toDTO(salvo);
    }

    @Override
    @Transactional
    public OperadorDTO atualizar(Long id, OperadorDTO dto) throws EntityNotFoundException {
        log.info("Atualizando operador ID: {}", id);

        Operador entity = operadorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Operador não encontrado com ID: " + id));

        // ⚙️ Merge defensivo campo a campo (ajuste os nomes conforme sua entidade/DTO)
        if (dto.getNome() != null)           entity.setNome(dto.getNome());
        if (dto.getLogin() != null)          entity.setLogin(dto.getLogin());
        if (dto.getEmail() != null)          entity.setEmail(dto.getEmail());
        if (dto.getCpf() != null)            entity.setCpf(dto.getCpf());
        // if (dto.getCns() != null)         entity.setCns(dto.getCns());  // ❌ REMOVIDO: sua entidade não possui setCns
        if (dto.getAtivo() != null)          entity.setAtivo(dto.getAtivo());
        if (dto.getUnidadeAtualId() != null) entity.setUnidadeAtualId(dto.getUnidadeAtualId());
        // 🔐 Senha: se for atualizar aqui, usar encoder
        // if (dto.getSenha() != null)       entity.setSenha(passwordEncoder.encode(dto.getSenha()));

        Operador salvo = operadorRepository.save(entity);
        return operadorMapper.toDTO(salvo);
    }

    // ====================================================
    // STATUS
    // ====================================================

    @Override
    @Transactional
    public void alterarStatus(Long id, Boolean ativo) throws EntityNotFoundException {
        log.info("Alterando status do operador {} para {}", id, ativo);
        Operador entity = operadorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Operador não encontrado com ID: " + id));
        entity.setAtivo(Boolean.TRUE.equals(ativo));
        operadorRepository.save(entity);
    }

    // ====================================================
    // DELETAR
    // ====================================================

    @Override
    @Transactional
    public void deletar(Long id) throws EntityNotFoundException {
        log.warn("Excluindo operador ID: {}", id);

        if (!operadorRepository.existsById(id)) {
            throw new EntityNotFoundException("Operador não encontrado com ID: " + id);
        }

        // Se existirem FKs sem ON DELETE CASCADE (ex.: operador_perfis, operador_unidade),
        // limpe as junções nas suas respectivas services antes do delete.
        operadorRepository.deleteById(id);
    }
}
