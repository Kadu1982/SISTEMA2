package com.sistemadesaude.backend.estoque.controller;

import com.sistemadesaude.backend.estoque.dto.SaldoPorLoteDTO;
import com.sistemadesaude.backend.estoque.service.ConsultaSaldoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/estoque")
@RequiredArgsConstructor
public class ConsultaSaldoController {
    private final ConsultaSaldoService service;

    @GetMapping("/saldos")
    public List<SaldoPorLoteDTO> listarSaldos(@RequestParam Long localId, @RequestParam Long insumoId) {
        return service.listarSaldosPorInsumo(localId, insumoId);
        // "Saldo Atual" é visualizado por insumo/lote conforme manual, sem permitir edição. :contentReference[oaicite:17]{index=17}
    }

    @GetMapping("/vencimentos")
    public List<SaldoPorLoteDTO> vencimentos(@RequestParam Long localId,
                                             @RequestParam String dataLimite) {
        // Cobertura para "Verificação de Vencimentos de Insumos" por data. :contentReference[oaicite:18]{index=18}
        return service.listarVencimentos(localId, LocalDate.parse(dataLimite));
    }
}
