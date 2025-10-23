package com.sistemadesaude.backend.prontuario.controller;

import com.sistemadesaude.backend.prontuario.entity.ProntuarioDocumento;
import com.sistemadesaude.backend.prontuario.enums.TipoDocumento;
import com.sistemadesaude.backend.prontuario.repository.ProntuarioDocumentoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Endpoints utilitários para o frontend listar/baixar os anexos do prontuário.
 * Não interfere na UI atual – somente adiciona capacidades.
 */
@RestController
@RequestMapping("/api/prontuario/documentos")
@RequiredArgsConstructor
@Slf4j
public class ProntuarioDocumentoController {

    private final ProntuarioDocumentoRepository repository;

    @GetMapping("/paciente/{pacienteId}")
    public List<ProntuarioDocumento> listarPorPaciente(@PathVariable String pacienteId,
                                                       @RequestParam(required = false) TipoDocumento tipo) {
        return (tipo == null)
                ? repository.findByPacienteIdOrderByCriadoEmDesc(pacienteId)
                : repository.findByPacienteIdAndTipoOrderByCriadoEmDesc(pacienteId, tipo);
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> baixarPdf(@PathVariable Long id) {
        ProntuarioDocumento d = repository.findById(id).orElse(null);
        if (d == null || d.getArquivoPdf() == null) return ResponseEntity.notFound().build();

        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.APPLICATION_PDF);
        h.setContentDispositionFormData("inline", d.getArquivoNome() != null ? d.getArquivoNome() : "documento.pdf");

        return ResponseEntity.ok().headers(h).body(d.getArquivoPdf());
    }
}
