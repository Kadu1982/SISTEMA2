package com.sistemadesaude.backend.recepcao.controller;

import com.sistemadesaude.backend.exames.dto.GerarSadtRequest;
import com.sistemadesaude.backend.exames.dto.GerarSadtRequest.ProcedimentoRequest;
import com.sistemadesaude.backend.exames.dto.SadtDTO;
import com.sistemadesaude.backend.exames.dto.SadtResponseDTO;
import com.sistemadesaude.backend.exames.service.SadtService;
import com.sistemadesaude.backend.recepcao.dto.AgendamentoDTO;
import com.sistemadesaude.backend.recepcao.service.AgendamentoService;
import com.sistemadesaude.backend.exception.ResourceNotFoundException;

// 👉 usamos o serviço JÁ existente no módulo de documentos
import com.sistemadesaude.backend.documentos.service.ComprovantePdfService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/agendamentos")
@RequiredArgsConstructor
@Slf4j
public class AgendamentoDocumentoController {

    private final AgendamentoService agendamentoService;
    private final ComprovantePdfService comprovantePdfService; // bean do seu módulo "documentos"
    private final SadtService sadtService;

    /**
     * ÚNICO endpoint público para reimpressão/visualização.
     * - Se o agendamento for CONSULTA → gera/retorna COMPROVANTE.
     * - Se for EXAME → retorna a SADT mais recente (PDF).
     *
     * Frontend permanece chamando: GET /api/agendamentos/{id}/comprovante
     */
    @GetMapping("/{id}/comprovante")
    public ResponseEntity<byte[]> exibirComprovante(@PathVariable Long id) {
        try {
            // 1) Busca o agendamento (DTO) e decide se precisa de SADT
            AgendamentoDTO dto = agendamentoService.buscarPorId(id);
            if (dto == null) {
                throw new ResourceNotFoundException("Agendamento não encontrado: " + id);
            }

            boolean isExame = agendamentoService.precisaSadt(id);

            byte[] pdf;
            String filename;

            if (!isExame) {
                // 2A) CONSULTA → gerar comprovante pelo serviço existente
                log.info("Reimprimindo COMPROVANTE do agendamento {}", id);
                pdf = comprovantePdfService.gerarPdf(dto);
                if (pdf == null || pdf.length == 0) {
                    throw new IllegalStateException("Falha ao gerar PDF do Comprovante para agendamento " + id);
                }
                filename = "comprovante-agendamento-" + id + ".pdf";
            } else {
                // 2B) EXAME → pegar SADT mais recente do agendamento ou gerar se não existir
                log.info("Buscando/Gerando SADT do agendamento {}", id);
                List<SadtDTO> sadts = sadtService.buscarSadtsPorAgendamento(id);
                
                if (sadts == null || sadts.isEmpty()) {
                    // Nenhuma SADT encontrada - vamos gerar uma baseada no agendamento
                    log.info("Nenhuma SADT encontrada para agendamento {}. Gerando SADT...", id);
                    try {
                        sadts = gerarSadtParaAgendamento(dto);
                        if (sadts == null || sadts.isEmpty()) {
                            throw new ResourceNotFoundException("Não foi possível gerar SADT para o agendamento: " + id);
                        }
                    } catch (Exception e) {
                        log.error("Erro ao gerar SADT para agendamento {}: {}", id, e.getMessage());
                        throw new ResourceNotFoundException("Erro ao gerar SADT para o agendamento: " + id + ". " + e.getMessage());
                    }
                }

                // pega a mais recente
                SadtDTO sadt = sadts.stream()
                        .max(Comparator.comparing(SadtDTO::getDataEmissao, Comparator.nullsLast(Comparator.naturalOrder())))
                        .orElse(sadts.get(0));

                if (sadt.getPdfBase64() != null && !sadt.getPdfBase64().isBlank()) {
                    pdf = Base64.getDecoder().decode(sadt.getPdfBase64());
                } else if (sadt.getNumeroSadt() != null && !sadt.getNumeroSadt().isBlank()) {
                    pdf = sadtService.downloadSadtPdf(sadt.getNumeroSadt());
                } else {
                    throw new ResourceNotFoundException("SADT do agendamento " + id + " não possui PDF disponível.");
                }
                filename = "sadt-" + (sadt.getNumeroSadt() != null ? sadt.getNumeroSadt() : id) + ".pdf";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(pdf);
        } catch (Exception e) {
            log.error("Erro ao gerar documento para agendamento {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Erro ao gerar documento: " + e.getMessage(), e);
        }
    }

    /**
     * Gera SADT para um agendamento baseado nos dados do agendamento.
     * Usa uma lógica simplificada para criar os procedimentos baseado na especialidade.
     */
    private List<SadtDTO> gerarSadtParaAgendamento(AgendamentoDTO dto) {
        log.info("Gerando SADT para agendamento {}", dto.getId());
        
        try {
            // Criar request para geração de SADT
            GerarSadtRequest request = new GerarSadtRequest();
            request.setAgendamentoId(dto.getId());
            request.setPacienteId(dto.getPacienteId());
            
            // Criar lista de procedimentos baseado na especialidade e observações
            List<ProcedimentoRequest> procedimentos = new ArrayList<>();
            
            // Criar procedimento baseado na especialidade
            ProcedimentoRequest procedimento = new ProcedimentoRequest();
            String nome = determinarNomeProcedimento(dto);
            procedimento.setNome(nome);
            procedimento.setCodigo(mapearCodigoSigTap(nome));
            procedimento.setQuantidade(1);
            procedimentos.add(procedimento);
            
            request.setProcedimentos(procedimentos);
            
            // Se houver observações, adicionar no request
            if (dto.getObservacoes() != null && !dto.getObservacoes().isBlank()) {
                request.setObservacoes(dto.getObservacoes());
            }
            
            // Gerar SADT
            String operador = obterOperadorAtual();
            SadtResponseDTO response = sadtService.gerarSadt(request, operador);
            
            if (response == null || Boolean.FALSE.equals(response.getSucesso())) {
                throw new RuntimeException("Falha na geração da SADT: " + 
                    (response != null ? response.getMensagem() : "Resposta nula"));
            }
            
            log.info("SADT {} gerada com sucesso para agendamento {}", response.getNumeroSadt(), dto.getId());
            
            // Retornar a SADT recém-gerada
            List<SadtDTO> sadts = sadtService.buscarSadtsPorAgendamento(dto.getId());
            if (sadts == null || sadts.isEmpty()) {
                // Se não encontrou, criar uma lista com a SADT do response
                if (response.getSadtData() != null) {
                    sadts = List.of(response.getSadtData());
                } else {
                    throw new RuntimeException("SADT gerada mas não foi possível recuperá-la");
                }
            }
            return sadts;
        } catch (Exception e) {
            log.error("Erro ao gerar SADT para agendamento {}: {}", dto.getId(), e.getMessage(), e);
            throw new RuntimeException("Erro ao gerar SADT: " + e.getMessage(), e);
        }
    }
    
    /**
     * Determina o nome do procedimento baseado na especialidade do agendamento
     */
    private String determinarNomeProcedimento(AgendamentoDTO dto) {
        String especialidade = dto.getEspecialidade() != null ? dto.getEspecialidade().toUpperCase() : "";
        String observacoes = dto.getObservacoes() != null ? dto.getObservacoes().toUpperCase() : "";
        String tipo = dto.getTipo() != null ? dto.getTipo().toUpperCase() : "";
        
        // Mapear especialidades para procedimentos específicos
        if (especialidade.contains("LABORATORI") || observacoes.contains("LABORATORI")) {
            return "Exame Laboratorial";
        }
        if (especialidade.contains("IMAGEM") || especialidade.contains("RADIO") || 
            observacoes.contains("IMAGEM") || observacoes.contains("RADIO")) {
            return "Exame de Imagem";
        }
        if (observacoes.contains("HEMOGRAMA")) {
            return "Hemograma Completo";
        }
        if (observacoes.contains("GLICEMIA") || observacoes.contains("GLICOSE")) {
            return "Glicemia de Jejum";
        }
        if (observacoes.contains("ULTRA")) {
            return "Ultrassonografia";
        }
        if (observacoes.contains("RAIO") || observacoes.contains("RX")) {
            return "Radiografia";
        }
        
        // Fallback baseado no tipo
        if (tipo.contains("EXAME")) {
            return "Exame/Procedimento";
        }
        
        // Se não conseguir determinar, usar especialidade ou genérico
        return especialidade.isBlank() ? "Exame/Procedimento" : especialidade;
    }
    
    /**
     * Mapear nome do exame para código SIGTAP (versão simplificada)
     */
    private String mapearCodigoSigTap(String nomeExame) {
        String nome = nomeExame.toUpperCase();
        Map<String, String> mapa = new HashMap<>();
        mapa.put("HEMOGRAMA", "0202020380");
        mapa.put("GLICEMIA", "0202010473");
        mapa.put("COLESTEROL", "0202010295");
        mapa.put("URINA", "0202050017");
        mapa.put("RADIOGRAFIA", "0204030153");
        mapa.put("ULTRASSONOGRAFIA", "0205020046");
        mapa.put("LABORATORIAL", "0202010000");
        mapa.put("IMAGEM", "0204010000");
        
        for (Map.Entry<String, String> entry : mapa.entrySet()) {
            if (nome.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        
        // Código genérico se não encontrar
        return "EXAM" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }
    
    /**
     * Força a geração de um comprovante para agendamento (mesmo que seja exame)
     * GET /api/agendamentos/{id}/comprovante/forcar
     */
    @GetMapping("/{id}/comprovante/forcar")
    public ResponseEntity<byte[]> forcarComprovante(@PathVariable Long id) {
        try {
            log.info("Forçando geração de COMPROVANTE para agendamento {}", id);
            
            AgendamentoDTO dto = agendamentoService.buscarPorId(id);
            if (dto == null) {
                throw new ResourceNotFoundException("Agendamento não encontrado: " + id);
            }

            byte[] pdf = comprovantePdfService.gerarPdf(dto);
            if (pdf == null || pdf.length == 0) {
                throw new IllegalStateException("Falha ao gerar PDF do Comprovante para agendamento " + id);
            }

            String filename = "comprovante-agendamento-" + id + ".pdf";
            
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(pdf);
        } catch (Exception e) {
            log.error("Erro ao forçar geração de comprovante para agendamento {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Erro ao gerar comprovante: " + e.getMessage(), e);
        }
    }

    /**
     * Obter operador atual do contexto de segurança
     */
    private String obterOperadorAtual() {
        try {
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            return (auth != null && auth.getName() != null) ? auth.getName() : "sistema";
        } catch (Exception e) {
            return "sistema";
        }
    }
}
