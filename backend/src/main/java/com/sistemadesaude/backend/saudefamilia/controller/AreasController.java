package com.sistemadesaude.backend.saudefamilia.controller;

import com.sistemadesaude.backend.saudefamilia.dto.AreaCreateUpdateDTO;
import com.sistemadesaude.backend.saudefamilia.dto.AreaDTO;
import com.sistemadesaude.backend.saudefamilia.entity.Area;
import com.sistemadesaude.backend.saudefamilia.entity.Microarea;
import com.sistemadesaude.backend.saudefamilia.entity.VinculoAreaProfissional;
import com.sistemadesaude.backend.saudefamilia.mapper.AreaMapper;
import com.sistemadesaude.backend.saudefamilia.service.AreaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/saude-familia/areas")
@RequiredArgsConstructor
public class AreasController {

    private final AreaService areaService;
    private final AreaMapper areaMapper;

    // ✅ CORRIGIDO: ADMINISTRADOR_SISTEMA
    @GetMapping("/test")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR_SISTEMA','GESTOR_AB','ACS')")
    public ResponseEntity<Map<String, Object>> test() {
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "message", "AreasController funcionando!",
                "timestamp", java.time.LocalDateTime.now().toString()
        ));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR_SISTEMA','GESTOR_AB','ACS')")
    public Page<AreaDTO> listarAreas(Pageable pageable) {
        Page<Area> page = areaService.listarAreas(pageable);
        return page.map(areaMapper::toDto);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR_SISTEMA','GESTOR_AB','ACS')")
    public ResponseEntity<AreaDTO> buscarPorId(@PathVariable Long id) {
        Optional<Area> opt = areaService.buscarPorId(id);
        return opt.map(a -> ResponseEntity.ok(areaMapper.toDto(a)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR_SISTEMA','GESTOR_AB')")
    public ResponseEntity<AreaDTO> criar(@Valid @RequestBody AreaCreateUpdateDTO dto) {
        Area nova = areaMapper.toEntity(dto);
        Area salvo = areaService.salvar(nova);
        return ResponseEntity.created(URI.create("/api/saude-familia/areas/" + salvo.getId()))
                .body(areaMapper.toDto(salvo));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR_SISTEMA','GESTOR_AB')")
    public ResponseEntity<AreaDTO> atualizar(@PathVariable Long id, @Valid @RequestBody AreaCreateUpdateDTO dto) {
        Optional<Area> opt = areaService.buscarPorId(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Area existente = opt.get();
        areaMapper.updateEntityFromDto(dto, existente);
        Area salvo = areaService.atualizar(existente);
        return ResponseEntity.ok(areaMapper.toDto(salvo));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR_SISTEMA','GESTOR_AB')")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        Optional<Area> opt = areaService.buscarPorId(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        areaService.excluirOuInativar(id);
        return ResponseEntity.noContent().build();
    }

    // ---- PROFISSIONAIS VINCULADOS ----

    @GetMapping("/{id}/profissionais")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR_SISTEMA','GESTOR_AB','ACS')")
    public ResponseEntity<List<VinculoAreaProfissional>> listarProfissionais(@PathVariable Long id) {
        Optional<Area> opt = areaService.buscarPorId(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        List<VinculoAreaProfissional> lista = areaService.listarProfissionais(opt.get());
        return ResponseEntity.ok(lista);
    }

    @PostMapping("/{id}/profissionais")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR_SISTEMA','GESTOR_AB')")
    public ResponseEntity<VinculoAreaProfissional> vincularProfissional(@PathVariable Long id,
                                                                        @Valid @RequestBody VinculoAreaProfissional vinculo) {
        Optional<Area> opt = areaService.buscarPorId(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        VinculoAreaProfissional salvo = areaService.vincularProfissional(opt.get(), vinculo);
        return ResponseEntity.created(URI.create("/api/saude-familia/areas/" + id + "/profissionais/" + salvo.getId()))
                .body(salvo);
    }

    // ---- MICROÁREAS ----

    @GetMapping("/{id}/microareas")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR_SISTEMA','GESTOR_AB','ACS')")
    public ResponseEntity<List<Microarea>> listarMicroareas(@PathVariable Long id) {
        Optional<Area> opt = areaService.buscarPorId(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        List<Microarea> lista = areaService.listarMicroareas(opt.get());
        return ResponseEntity.ok(lista);
    }

    @PostMapping("/{id}/microareas")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR_SISTEMA','GESTOR_AB')")
    public ResponseEntity<Microarea> adicionarMicroarea(@PathVariable Long id, @Valid @RequestBody Microarea micro) {
        Optional<Area> opt = areaService.buscarPorId(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Microarea salvo = areaService.adicionarMicroarea(opt.get(), micro);
        return ResponseEntity.created(URI.create("/api/saude-familia/areas/" + id + "/microareas/" + salvo.getId()))
                .body(salvo);
    }

    @DeleteMapping("/{id}/microareas/{microId}")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR_SISTEMA','GESTOR_AB')")
    public ResponseEntity<Void> removerMicroarea(@PathVariable Long id, @PathVariable Long microId) {
        Optional<Area> opt = areaService.buscarPorId(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        areaService.removerMicroarea(microId);
        return ResponseEntity.noContent().build();
    }
}
