package com.sistemadesaude.backend.saudefamilia.service;

import com.sistemadesaude.backend.saudefamilia.entity.*;
import com.sistemadesaude.backend.saudefamilia.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AreaService {
    private final AreaRepository areaRepository;
    private final MicroareaRepository microareaRepository;
    private final VinculoAreaProfissionalRepository vinculoRepository;
    private final VisitaDomiciliarRepository visitaRepository;

    public Page<Area> listarAreas(Pageable pageable) {
        return areaRepository.findAll(pageable);
    }

    public Optional<Area> buscarPorId(Long id) {
        return areaRepository.findById(id);
    }

    @Transactional
    public Area salvar(Area area) {
        return areaRepository.save(area);
    }

    @Transactional
    public Area atualizar(Area areaExistente) {
        return areaRepository.save(areaExistente);
    }

    @Transactional
    public void excluirOuInativar(Long id) {
        Area area = areaRepository.findById(id).orElseThrow();
        boolean temMicro = microareaRepository.findByArea(area).size() > 0;
        boolean temVisitas = visitaRepository.countByArea(area) > 0;
        if (temMicro || temVisitas) {
            area.setSituacao("INATIVA");
            areaRepository.save(area);
        } else {
            areaRepository.delete(area);
        }
    }

    public List<VinculoAreaProfissional> listarProfissionais(Area area) {
        return vinculoRepository.findByArea(area);
    }

    @Transactional
    public VinculoAreaProfissional vincularProfissional(Area area, VinculoAreaProfissional vinculo) {
        vinculo.setArea(area);
        return vinculoRepository.save(vinculo);
    }

    public List<Microarea> listarMicroareas(Area area) {
        return microareaRepository.findByArea(area);
    }

    @Transactional
    public Microarea adicionarMicroarea(Area area, Microarea micro) {
        if (microareaRepository.existsByAreaAndCodigo(area, micro.getCodigo())) {
            throw new IllegalArgumentException("Código de microárea já existe nesta área");
        }
        micro.setArea(area);
        return microareaRepository.save(micro);
    }

    @Transactional
    public void removerMicroarea(Long microareaId) {
        microareaRepository.deleteById(microareaId);
    }
}
