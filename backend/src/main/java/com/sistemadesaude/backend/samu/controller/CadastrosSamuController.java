package com.sistemadesaude.backend.samu.controller;

import com.sistemadesaude.backend.response.ApiResponse;
import com.sistemadesaude.backend.samu.entity.*;
import com.sistemadesaude.backend.samu.enums.TipoViatura;
import com.sistemadesaude.backend.samu.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controller para gerenciar Cadastros do Módulo SAMU
 * Substituído mockdata por persistência real
 */
@Slf4j
@RestController
@RequestMapping("/api/samu/cadastros")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CadastrosSamuController {

    private final TipoSolicitanteRepository tipoSolicitanteRepository;
    private final TipoLigacaoRepository tipoLigacaoRepository;
    private final OrigemSolicitacaoRepository origemSolicitacaoRepository;
    private final TipoEncaminhamentoRepository tipoEncaminhamentoRepository;
    private final ViaturaRepository viaturaRepository;

    // ==================== TIPOS DE AMBULÂNCIAS ====================
    @GetMapping("/tipos-ambulancia")
    @PreAuthorize("hasRole('SAMU_OPERADOR') or hasRole('SAMU_REGULADOR') or hasRole('ADMIN') or hasRole('ADMINISTRADOR_DO_SISTEMA')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listarTiposAmbulancia() {
        try {
            // Retorna os tipos do enum TipoViatura
            List<Map<String, Object>> tipos = new ArrayList<>();

            int ordem = 1;
            for (TipoViatura tipo : TipoViatura.values()) {
                Map<String, Object> tipoMap = new HashMap<>();
                tipoMap.put("id", ordem++);
                tipoMap.put("codigo", tipo.name());
                tipoMap.put("sigla", tipo.name()); // USA, USB, VIR, etc
                tipoMap.put("descricao", tipo.getDescricao());
                tipoMap.put("detalhamento", tipo.getDetalhamento());
                tipoMap.put("equipeMinima", tipo.getEquipeMinima());
                tipoMap.put("nivelAtendimento", tipo.getNivelAtendimento());
                tipoMap.put("capacidadePacientes", tipo.getCapacidadePacientes());
                tipoMap.put("ativo", true);
                tipos.add(tipoMap);
            }

            ApiResponse<List<Map<String, Object>>> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Tipos de ambulância listados com sucesso");
            response.setData(tipos);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao listar tipos de ambulância", e);
            ApiResponse<List<Map<String, Object>>> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao listar tipos de ambulância: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // ==================== AMBULÂNCIAS ====================
    @GetMapping("/ambulancias")
    @PreAuthorize("hasRole('SAMU_OPERADOR') or hasRole('SAMU_REGULADOR') or hasRole('ADMIN') or hasRole('ADMINISTRADOR_DO_SISTEMA')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listarAmbulancia() {
        try {
            // Busca viaturas ativas do banco de dados
            List<Viatura> viaturas = viaturaRepository.findByAtivaTrue();

            List<Map<String, Object>> ambulancias = viaturas.stream()
                    .map(v -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", v.getId());
                        map.put("descricao", v.getIdentificacao());
                        map.put("placa", v.getPlaca());
                        map.put("tipo", v.getTipo().name());
                        map.put("tipoDescricao", v.getTipo().getDescricao());
                        map.put("status", v.getStatus().name());
                        map.put("statusDescricao", v.getStatus().getDescricao());
                        map.put("ativo", v.isAtiva());
                        return map;
                    })
                    .collect(Collectors.toList());

            ApiResponse<List<Map<String, Object>>> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Ambulâncias listadas com sucesso");
            response.setData(ambulancias);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao listar ambulâncias", e);
            ApiResponse<List<Map<String, Object>>> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao listar ambulâncias: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // ==================== SITUAÇÕES DE AMBULÂNCIAS ====================
    @GetMapping("/situacoes-ambulancia")
    @PreAuthorize("hasRole('SAMU_OPERADOR') or hasRole('SAMU_REGULADOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listarSituacoesAmbulancia() {
        try {
            List<Map<String, Object>> situacoes = new ArrayList<>();

            Map<String, Object> disponivel = new HashMap<>();
            disponivel.put("id", 1);
            disponivel.put("descricao", "Disponível");
            disponivel.put("cor", "#22c55e"); // verde
            disponivel.put("ativo", true);
            situacoes.add(disponivel);

            Map<String, Object> emEspera = new HashMap<>();
            emEspera.put("id", 2);
            emEspera.put("descricao", "Em Espera");
            emEspera.put("cor", "#f59e0b"); // amarelo
            emEspera.put("ativo", true);
            situacoes.add(emEspera);

            Map<String, Object> emOcorrencia = new HashMap<>();
            emOcorrencia.put("id", 3);
            emOcorrencia.put("descricao", "Em Ocorrência");
            emOcorrencia.put("cor", "#ef4444"); // vermelho
            emOcorrencia.put("ativo", true);
            situacoes.add(emOcorrencia);

            Map<String, Object> manutencao = new HashMap<>();
            manutencao.put("id", 4);
            manutencao.put("descricao", "Em Manutenção");
            manutencao.put("cor", "#6b7280"); // cinza
            manutencao.put("ativo", true);
            situacoes.add(manutencao);

            ApiResponse<List<Map<String, Object>>> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Situações de ambulância listadas com sucesso");
            response.setData(situacoes);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao listar situações de ambulância", e);
            ApiResponse<List<Map<String, Object>>> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao listar situações: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // ==================== TIPOS DE ENCAMINHAMENTOS ====================
    @GetMapping("/tipos-encaminhamento")
    @PreAuthorize("hasRole('SAMU_OPERADOR') or hasRole('SAMU_REGULADOR') or hasRole('ADMIN') or hasRole('ADMINISTRADOR_DO_SISTEMA')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listarTiposEncaminhamento() {
        try {
            // Busca do banco de dados
            List<TipoEncaminhamento> tiposDb = tipoEncaminhamentoRepository.findByAtivoTrue();

            List<Map<String, Object>> tipos = tiposDb.stream()
                    .map(t -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", t.getId());
                        map.put("nome", t.getNome());
                        map.put("descricao", t.getDescricao());
                        map.put("encerramento", t.isEncerramento());
                        map.put("ativo", t.isAtivo());
                        return map;
                    })
                    .collect(Collectors.toList());

            ApiResponse<List<Map<String, Object>>> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Tipos de encaminhamento listados com sucesso");
            response.setData(tipos);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao listar tipos de encaminhamento", e);
            ApiResponse<List<Map<String, Object>>> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao listar tipos de encaminhamento: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // ==================== TIPOS DE LIGAÇÕES ====================
    @GetMapping("/tipos-ligacao")
    @PreAuthorize("hasRole('SAMU_OPERADOR') or hasRole('SAMU_REGULADOR') or hasRole('ADMIN') or hasRole('ADMINISTRADOR_DO_SISTEMA')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listarTiposLigacao() {
        try {
            // Busca do banco de dados
            List<TipoLigacao> tiposDb = tipoLigacaoRepository.findByAtivoTrue();

            List<Map<String, Object>> tipos = tiposDb.stream()
                    .map(t -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", t.getId());
                        map.put("nome", t.getNome());
                        map.put("descricao", t.getDescricao());
                        map.put("encerramento", t.isEncerramento());
                        map.put("ativo", t.isAtivo());
                        return map;
                    })
                    .collect(Collectors.toList());

            ApiResponse<List<Map<String, Object>>> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Tipos de ligação listados com sucesso");
            response.setData(tipos);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao listar tipos de ligação", e);
            ApiResponse<List<Map<String, Object>>> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao listar tipos de ligação: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // ==================== TIPOS DE SOLICITANTES ====================
    @GetMapping("/tipos-solicitante")
    @PreAuthorize("hasRole('SAMU_OPERADOR') or hasRole('SAMU_REGULADOR') or hasRole('ADMIN') or hasRole('ADMINISTRADOR_DO_SISTEMA')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listarTiposSolicitante() {
        try {
            // Busca do banco de dados
            List<TipoSolicitante> tiposDb = tipoSolicitanteRepository.findByAtivoTrue();

            List<Map<String, Object>> tipos = tiposDb.stream()
                    .map(t -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", t.getId());
                        map.put("nome", t.getNome());
                        map.put("descricao", t.getDescricao());
                        map.put("ativo", t.isAtivo());
                        return map;
                    })
                    .collect(Collectors.toList());

            ApiResponse<List<Map<String, Object>>> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Tipos de solicitante listados com sucesso");
            response.setData(tipos);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao listar tipos de solicitante", e);
            ApiResponse<List<Map<String, Object>>> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao listar tipos de solicitante: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // ==================== ORIGENS DE SOLICITAÇÕES ====================
    @GetMapping("/origens-solicitacao")
    @PreAuthorize("hasRole('SAMU_OPERADOR') or hasRole('SAMU_REGULADOR') or hasRole('ADMIN') or hasRole('ADMINISTRADOR_DO_SISTEMA')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listarOrigensSolicitacao() {
        try {
            // Busca do banco de dados
            List<OrigemSolicitacao> origensDb = origemSolicitacaoRepository.findByAtivoTrue();

            List<Map<String, Object>> origens = origensDb.stream()
                    .map(o -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", o.getId());
                        map.put("nome", o.getNome());
                        map.put("descricao", o.getDescricao());
                        map.put("ativo", o.isAtivo());
                        return map;
                    })
                    .collect(Collectors.toList());

            ApiResponse<List<Map<String, Object>>> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Origens de solicitação listadas com sucesso");
            response.setData(origens);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao listar origens de solicitação", e);
            ApiResponse<List<Map<String, Object>>> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao listar origens: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // ==================== TIPOS DE OCORRÊNCIAS ====================
    @GetMapping("/tipos-ocorrencia")
    @PreAuthorize("hasRole('SAMU_OPERADOR') or hasRole('SAMU_REGULADOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listarTiposOcorrencia() {
        try {
            List<Map<String, Object>> tipos = new ArrayList<>();

            Map<String, Object> clinica = new HashMap<>();
            clinica.put("id", 1);
            clinica.put("descricao", "Clínica");
            clinica.put("ativo", true);
            tipos.add(clinica);

            Map<String, Object> trauma = new HashMap<>();
            trauma.put("id", 2);
            trauma.put("descricao", "Trauma");
            trauma.put("ativo", true);
            tipos.add(trauma);

            Map<String, Object> obstetrica = new HashMap<>();
            obstetrica.put("id", 3);
            obstetrica.put("descricao", "Obstétrica");
            obstetrica.put("ativo", true);
            tipos.add(obstetrica);

            Map<String, Object> pediatrica = new HashMap<>();
            pediatrica.put("id", 4);
            pediatrica.put("descricao", "Pediátrica");
            pediatrica.put("ativo", true);
            tipos.add(pediatrica);

            ApiResponse<List<Map<String, Object>>> response = new ApiResponse<>();
            response.setSuccess(true);
            response.setMessage("Tipos de ocorrência listados com sucesso");
            response.setData(tipos);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao listar tipos de ocorrência", e);
            ApiResponse<List<Map<String, Object>>> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Erro ao listar tipos de ocorrência: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
