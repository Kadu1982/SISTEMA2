package com.sistemadesaude.backend.profissional.service;

import com.sistemadesaude.backend.profissional.dto.ProfissionalDTO;
import com.sistemadesaude.backend.profissional.entity.Profissional;
import com.sistemadesaude.backend.profissional.entity.VinculoProfissionalUnidade;
import com.sistemadesaude.backend.profissional.mapper.ProfissionalMapper;
import com.sistemadesaude.backend.profissional.repository.ProfissionalRepository;
import com.sistemadesaude.backend.profissional.repository.VinculoProfissionalUnidadeRepository;
import com.sistemadesaude.backend.unidadesaude.entity.UnidadeSaude;
import com.sistemadesaude.backend.unidadesaude.repository.UnidadeSaudeRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProfissionalServiceImpl implements ProfissionalService {

    private final ProfissionalRepository profissionalRepository;
    private final VinculoProfissionalUnidadeRepository vinculoRepo;
    private final UnidadeSaudeRepository unidadeRepo;
    private final ProfissionalMapper mapper;

    @Override
    public List<ProfissionalDTO> listar(String q) {
        var lista = (StringUtils.hasText(q))
                ? profissionalRepository.buscarPorQuery(q)
                : profissionalRepository.findAll();
        return lista.stream().map(mapper::toDTO).toList();
    }

    @Override
    public Optional<ProfissionalDTO> buscarPorId(Long id) {
        return profissionalRepository.findById(id).map(mapper::toDTO);
    }

    @Override
    @Transactional
    public ProfissionalDTO salvar(ProfissionalDTO dto) {
        validar(dto);
        var entity = mapper.toEntity(dto);

        // Resolver unidade nos vínculos (ManyToOne ignorado no mapper)
        if (entity.getVinculos() != null) {
            for (VinculoProfissionalUnidade v : entity.getVinculos()) {
                if (v.getUnidade() == null && v.getId() == null && v.getProfissional() == null) {
                    // DTO tem apenas unidadeId; buscamos a entidade
                    var dtoV = dto.vinculos.stream()
                            .filter(x -> x.id == null && x.unidadeId != null && x.setor != null && x.setor.equals(v.getSetor()))
                            .findFirst().orElse(null);
                    if (dtoV != null && dtoV.unidadeId != null) {
                        UnidadeSaude u = unidadeRepo.findById(dtoV.unidadeId)
                                .orElseThrow(() -> new IllegalArgumentException("Unidade não encontrada: id=" + dtoV.unidadeId));
                        v.setUnidade(u);
                    }
                }
                v.setProfissional(entity);
            }
        }

        var salvo = profissionalRepository.save(entity);
        return mapper.toDTO(salvo);
    }

    @Override
    @Transactional
    public ProfissionalDTO atualizar(Long id, ProfissionalDTO dto) {
        var existente = profissionalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Profissional não encontrado: id=" + id));

        // Estratégia simples: recriar coleções filhas (como primeira entrega).
        // Em versões futuras, podemos sofisticar o "merge" item a item.
        var novo = mapper.toEntity(dto);
        novo.setId(existente.getId());

        if (novo.getVinculos() != null) {
            for (var v : novo.getVinculos()) {
                // resolver unidade
                var dtoV = dto.vinculos.stream()
                        .filter(x -> (x.id == null && v.getId() == null && x.setor != null && x.setor.equals(v.getSetor())) || (x.id != null && x.id.equals(v.getId())))
                        .findFirst().orElse(null);
                if (dtoV != null && dtoV.unidadeId != null) {
                    var u = unidadeRepo.findById(dtoV.unidadeId)
                            .orElseThrow(() -> new IllegalArgumentException("Unidade não encontrada: id=" + dtoV.unidadeId));
                    v.setUnidade(u);
                }
                v.setProfissional(novo);
            }
        }

        var salvo = profissionalRepository.save(novo);
        return mapper.toDTO(salvo);
    }

    @Override
    public void deletar(Long id) {
        profissionalRepository.deleteById(id);
    }

    private void validar(ProfissionalDTO dto) {
        // Exemplos de validação mínima; você pode plugar validadores de CPF/CNS que já usa no projeto.
        if (!StringUtils.hasText(dto.nomeCompleto)) {
            throw new IllegalArgumentException("Nome do profissional é obrigatório");
        }
        if (dto.documentos != null && StringUtils.hasText(dto.documentos.cpf)) {
            var cpf = dto.documentos.cpf.replaceAll("\\D", "");
            if (cpf.length() != 11) {
                throw new IllegalArgumentException("CPF inválido");
            }
        }
    }
}
