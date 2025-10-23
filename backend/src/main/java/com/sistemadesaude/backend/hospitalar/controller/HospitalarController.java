package com.sistemadesaude.backend.hospitalar.controller;

import com.sistemadesaude.backend.hospitalar.dto.*;
import com.sistemadesaude.backend.hospitalar.entity.*;
import com.sistemadesaude.backend.hospitalar.service.*;
import com.sistemadesaude.backend.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hospitalar")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Hospitalar", description = "API do Módulo Hospitalar - Gestão completa de senhas, leitos, classificação de risco e controle de acesso")
public class HospitalarController {

    private final SenhaAtendimentoService senhaAtendimentoService;
    private final LeitoService leitoService;
    private final ClassificacaoRiscoService classificacaoRiscoService;
    private final ControleAcessoService controleAcessoService;
    private final FilaAtendimentoService filaAtendimentoService;

    // ============== ENDPOINTS DE STATUS E INFORMAÇÕES ==============

    @GetMapping("/status")
    @Operation(summary = "Obter status do módulo hospitalar",
               description = "Retorna informações sobre o status e funcionalidades do módulo hospitalar")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatus() {
        Map<String, Object> status = Map.of(
            "modulo", "Hospitalar",
            "versao", "1.0.0",
            "status", "ATIVO",
            "funcionalidades", List.of(
                "Sistema de Senhas e Filas de Atendimento",
                "Gestão de Leitos",
                "Classificação de Risco",
                "Controle de Acesso",
                "Painéis de Atendimento",
                "Solicitação de Leitos",
                "Configurações Hospitalares",
                "Ambulatório Hospitalar",
                "Agendamentos Ambulatoriais",
                "Escalas Médicas",
                "Controle de Presença",
                "Encaminhamentos Internos"
            ),
            "endpoints", Map.of(
                "senhas", List.of("emitir", "chamar", "iniciar-atendimento", "concluir", "fila"),
                "leitos", List.of("ocupar", "liberar", "transferir", "disponiveis", "estatisticas"),
                "classificacao", List.of("criar", "reavaliar", "listar", "estatisticas"),
                "acesso", List.of("registrar-entrada", "registrar-saida", "bloquear", "ativos")
            )
        );
        return ResponseEntity.ok(ApiResponse.success(status));
    }

    // ============== SISTEMA DE SENHAS DE ATENDIMENTO ==============

    @PostMapping("/senhas/emitir")
    @Operation(summary = "Emitir nova senha de atendimento",
               description = "Emite uma nova senha normal ou prioritária para uma fila específica")
    public ResponseEntity<ApiResponse<SenhaAtendimentoDTO>> emitirSenha(
            @Valid @RequestBody EmitirSenhaRequest request) {
        log.info("Emitindo senha para fila: {}", request.getFilaId());
        ApiResponse<SenhaAtendimentoDTO> response = senhaAtendimentoService.emitirSenha(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/senhas/chamar")
    @Operation(summary = "Chamar próxima senha da fila",
               description = "Chama a próxima senha disponível na fila, priorizando senhas prioritárias")
    public ResponseEntity<ApiResponse<SenhaAtendimentoDTO>> chamarSenha(
            @Valid @RequestBody ChamarSenhaRequest request) {
        log.info("Chamando próxima senha para fila: {}", request.getFilaId());
        ApiResponse<SenhaAtendimentoDTO> response = senhaAtendimentoService.chamarSenha(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/senhas/{id}/iniciar-atendimento")
    @Operation(summary = "Iniciar atendimento de uma senha",
               description = "Marca o início do atendimento para uma senha que foi chamada")
    public ResponseEntity<ApiResponse<SenhaAtendimentoDTO>> iniciarAtendimento(
            @PathVariable Long id,
            @Parameter(description = "ID do operador que está iniciando o atendimento")
            @RequestParam Long operadorId) {
        log.info("Iniciando atendimento para senha: {}", id);
        ApiResponse<SenhaAtendimentoDTO> response = senhaAtendimentoService.iniciarAtendimento(id, operadorId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/senhas/{id}/concluir")
    @Operation(summary = "Concluir atendimento de uma senha",
               description = "Finaliza o atendimento de uma senha e registra observações")
    public ResponseEntity<ApiResponse<SenhaAtendimentoDTO>> concluirAtendimento(
            @PathVariable Long id,
            @Parameter(description = "Observações sobre o atendimento (opcional)")
            @RequestParam(required = false) String observacoes) {
        log.info("Concluindo atendimento para senha: {}", id);
        ApiResponse<SenhaAtendimentoDTO> response = senhaAtendimentoService.concluirAtendimento(id, observacoes);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/senhas/fila/{filaId}")
    @Operation(summary = "Listar senhas de uma fila",
               description = "Lista todas as senhas aguardando, em chamada ou em atendimento de uma fila específica")
    public ResponseEntity<ApiResponse<List<SenhaAtendimentoDTO>>> listarSenhasFila(
            @PathVariable Long filaId) {
        log.info("Listando senhas da fila: {}", filaId);
        ApiResponse<List<SenhaAtendimentoDTO>> response = senhaAtendimentoService.listarSenhasFila(filaId);
        return ResponseEntity.ok(response);
    }

    // ============== GESTÃO DE LEITOS ==============

    @PostMapping("/leitos/{id}/ocupar")
    @Operation(summary = "Ocupar um leito",
               description = "Marca um leito como ocupado por um paciente específico")
    public ResponseEntity<ApiResponse<LeitoDTO>> ocuparLeito(
            @PathVariable Long id,
            @Parameter(description = "ID do paciente que ocupará o leito")
            @RequestParam Long pacienteId,
            @Parameter(description = "ID do operador responsável pela ocupação")
            @RequestParam Long operadorId) {
        log.info("Ocupando leito: {} para paciente: {}", id, pacienteId);
        ApiResponse<LeitoDTO> response = leitoService.ocuparLeito(id, pacienteId, operadorId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/leitos/{id}/liberar")
    @Operation(summary = "Liberar um leito",
               description = "Libera um leito ocupado e coloca em status de limpeza")
    public ResponseEntity<ApiResponse<LeitoDTO>> liberarLeito(
            @PathVariable Long id,
            @Parameter(description = "ID do operador responsável pela liberação")
            @RequestParam Long operadorId,
            @Parameter(description = "Motivo da liberação do leito")
            @RequestParam(required = false) String motivoLiberacao) {
        log.info("Liberando leito: {}", id);
        ApiResponse<LeitoDTO> response = leitoService.liberarLeito(id, operadorId, motivoLiberacao);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/leitos/{origem}/transferir/{destino}")
    @Operation(summary = "Transferir paciente entre leitos",
               description = "Transfere um paciente de um leito para outro, liberando o origem e ocupando o destino")
    public ResponseEntity<ApiResponse<String>> transferirPaciente(
            @PathVariable Long origem,
            @PathVariable Long destino,
            @Parameter(description = "ID do operador responsável pela transferência")
            @RequestParam Long operadorId,
            @Parameter(description = "Motivo da transferência")
            @RequestParam(required = false) String motivoTransferencia) {
        log.info("Transferindo paciente do leito: {} para leito: {}", origem, destino);
        ApiResponse<String> response = leitoService.transferirPaciente(origem, destino, operadorId, motivoTransferencia);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/leitos/{id}/finalizar-limpeza")
    @Operation(summary = "Finalizar limpeza de um leito",
               description = "Marca um leito como limpo e disponível para nova ocupação")
    public ResponseEntity<ApiResponse<LeitoDTO>> finalizarLimpeza(
            @PathVariable Long id,
            @Parameter(description = "ID do operador que finalizou a limpeza")
            @RequestParam Long operadorId) {
        log.info("Finalizando limpeza do leito: {}", id);
        ApiResponse<LeitoDTO> response = leitoService.finalizarLimpeza(id, operadorId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/leitos/disponiveis")
    @Operation(summary = "Listar leitos disponíveis",
               description = "Lista todos os leitos disponíveis de uma unidade")
    public ResponseEntity<ApiResponse<List<LeitoDTO>>> listarLeitosDisponiveis(
            @Parameter(description = "ID da unidade de saúde")
            @RequestParam Long unidadeId) {
        log.info("Listando leitos disponíveis da unidade: {}", unidadeId);
        ApiResponse<List<LeitoDTO>> response = leitoService.listarLeitosDisponiveis(unidadeId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/leitos/status/{status}")
    @Operation(summary = "Listar leitos por status",
               description = "Lista leitos filtrados por status específico")
    public ResponseEntity<ApiResponse<List<LeitoDTO>>> listarLeitosPorStatus(
            @PathVariable Leito.StatusLeito status,
            @Parameter(description = "ID da unidade de saúde")
            @RequestParam Long unidadeId) {
        log.info("Listando leitos com status: {} da unidade: {}", status, unidadeId);
        ApiResponse<List<LeitoDTO>> response = leitoService.listarLeitosPorStatus(unidadeId, status);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/leitos/estatisticas")
    @Operation(summary = "Estatísticas de leitos",
               description = "Obtém estatísticas de ocupação de leitos por unidade")
    public ResponseEntity<ApiResponse<Map<String, Object>>> obterEstatisticasLeitos(
            @Parameter(description = "ID da unidade de saúde")
            @RequestParam Long unidadeId) {
        log.info("Obtendo estatísticas de leitos da unidade: {}", unidadeId);
        ApiResponse<Map<String, Object>> response = leitoService.obterEstatisticasLeitos(unidadeId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/leitos/solicitar")
    @Operation(summary = "Solicitar leito",
               description = "Cria uma solicitação de leito para um paciente")
    public ResponseEntity<ApiResponse<String>> solicitarLeito(
            @Valid @RequestBody SolicitarLeitoRequest request) {
        log.info("Solicitando leito para paciente: {}", request.getPacienteId());
        ApiResponse<String> response = leitoService.solicitarLeito(request);
        return ResponseEntity.ok(response);
    }

    // ============== CLASSIFICAÇÃO DE RISCO ==============

    @PostMapping("/classificacao-risco/criar")
    @Operation(summary = "Criar classificação de risco",
               description = "Cria uma nova classificação de risco para um paciente")
    public ResponseEntity<ApiResponse<ClassificacaoRiscoDTO>> criarClassificacao(
            @Valid @RequestBody CriarClassificacaoRiscoRequest request) {
        log.info("Criando classificação de risco para paciente: {}", request.getPacienteId());
        ApiResponse<ClassificacaoRiscoDTO> response = classificacaoRiscoService.criarClassificacao(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/classificacao-risco/{id}/reavaliar")
    @Operation(summary = "Reavaliar classificação de risco",
               description = "Cria uma nova classificação baseada em uma reavaliação do paciente")
    public ResponseEntity<ApiResponse<ClassificacaoRiscoDTO>> reavaliarClassificacao(
            @PathVariable Long id,
            @Valid @RequestBody CriarClassificacaoRiscoRequest request) {
        log.info("Reavaliando classificação de risco: {}", id);
        ApiResponse<ClassificacaoRiscoDTO> response = classificacaoRiscoService.reavaliarPaciente(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/classificacao-risco/paciente/{pacienteId}")
    @Operation(summary = "Listar classificações por paciente",
               description = "Lista todas as classificações de risco de um paciente")
    public ResponseEntity<ApiResponse<List<ClassificacaoRiscoDTO>>> listarClassificacoesPaciente(
            @PathVariable Long pacienteId) {
        log.info("Listando classificações do paciente: {}", pacienteId);
        ApiResponse<List<ClassificacaoRiscoDTO>> response = classificacaoRiscoService.listarClassificacoesPorPaciente(pacienteId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/classificacao-risco/cor/{cor}")
    @Operation(summary = "Listar classificações por cor de prioridade",
               description = "Lista classificações filtradas por cor de prioridade nas últimas 24h")
    public ResponseEntity<ApiResponse<List<ClassificacaoRiscoDTO>>> listarClassificacoesPorCor(
            @PathVariable ClassificacaoRisco.CorPrioridade cor) {
        log.info("Listando classificações com cor: {}", cor);
        ApiResponse<List<ClassificacaoRiscoDTO>> response = classificacaoRiscoService.listarClassificacoesPorCor(cor);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/classificacao-risco/estatisticas")
    @Operation(summary = "Estatísticas de classificação de risco",
               description = "Obtém estatísticas de classificações por período")
    public ResponseEntity<ApiResponse<Map<String, Object>>> obterEstatisticasClassificacao(
            @Parameter(description = "Data de início do período")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataInicio,
            @Parameter(description = "Data de fim do período")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataFim) {
        log.info("Obtendo estatísticas de classificação - {} a {}", dataInicio, dataFim);
        ApiResponse<Map<String, Object>> response = classificacaoRiscoService.obterEstatisticasClassificacao(dataInicio, dataFim);
        return ResponseEntity.ok(response);
    }

    // ============== CONTROLE DE ACESSO ==============

    @PostMapping("/acesso/registrar-entrada")
    @Operation(summary = "Registrar entrada de visitante",
               description = "Registra a entrada de visitante, acompanhante ou fornecedor")
    public ResponseEntity<ApiResponse<ControleAcessoDTO>> registrarEntrada(
            @Valid @RequestBody RegistrarAcessoRequest request) {
        log.info("Registrando entrada: {} - {}", request.getNome(), request.getTipoVisitante());
        ApiResponse<ControleAcessoDTO> response = controleAcessoService.registrarEntrada(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/acesso/{id}/registrar-saida")
    @Operation(summary = "Registrar saída de visitante",
               description = "Registra a saída de um visitante e calcula tempo de permanência")
    public ResponseEntity<ApiResponse<ControleAcessoDTO>> registrarSaida(
            @PathVariable Long id,
            @Parameter(description = "ID do operador responsável pelo registro")
            @RequestParam Long operadorId,
            @Parameter(description = "Observações sobre a saída (opcional)")
            @RequestParam(required = false) String observacoes) {
        log.info("Registrando saída para controle: {}", id);
        ApiResponse<ControleAcessoDTO> response = controleAcessoService.registrarSaida(id, operadorId, observacoes);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/acesso/{id}/bloquear")
    @Operation(summary = "Bloquear acesso",
               description = "Bloqueia o acesso de um visitante por motivo de segurança")
    public ResponseEntity<ApiResponse<ControleAcessoDTO>> bloquearAcesso(
            @PathVariable Long id,
            @Parameter(description = "ID do operador responsável pelo bloqueio")
            @RequestParam Long operadorId,
            @Parameter(description = "Motivo do bloqueio")
            @RequestParam String motivo) {
        log.info("Bloqueando acesso: {}", id);
        ApiResponse<ControleAcessoDTO> response = controleAcessoService.bloquearAcesso(id, operadorId, motivo);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/acesso/ativos")
    @Operation(summary = "Listar acessos ativos",
               description = "Lista todos os acessos ativos (visitantes ainda presentes)")
    public ResponseEntity<ApiResponse<List<ControleAcessoDTO>>> listarAcessosAtivos(
            @Parameter(description = "ID da unidade de saúde")
            @RequestParam Long unidadeId) {
        log.info("Listando acessos ativos da unidade: {}", unidadeId);
        ApiResponse<List<ControleAcessoDTO>> response = controleAcessoService.listarAcessosAtivos(unidadeId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/acesso/periodo")
    @Operation(summary = "Listar acessos por período",
               description = "Lista acessos filtrados por período de tempo")
    public ResponseEntity<ApiResponse<List<ControleAcessoDTO>>> listarAcessosPorPeriodo(
            @Parameter(description = "Data de início do período")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataInicio,
            @Parameter(description = "Data de fim do período")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataFim,
            @Parameter(description = "ID da unidade (opcional)")
            @RequestParam(required = false) Long unidadeId) {
        log.info("Listando acessos por período - {} a {}", dataInicio, dataFim);
        ApiResponse<List<ControleAcessoDTO>> response = controleAcessoService.listarAcessosPorPeriodo(dataInicio, dataFim, unidadeId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/acesso/cracha/{numeroCracha}")
    @Operation(summary = "Buscar por número do crachá",
               description = "Busca um acesso ativo pelo número do crachá")
    public ResponseEntity<ApiResponse<ControleAcessoDTO>> buscarPorCracha(
            @PathVariable String numeroCracha) {
        log.info("Buscando acesso por crachá: {}", numeroCracha);
        ApiResponse<ControleAcessoDTO> response = controleAcessoService.buscarPorCracha(numeroCracha);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/acesso/estatisticas")
    @Operation(summary = "Estatísticas de controle de acesso",
               description = "Obtém estatísticas de acessos por período")
    public ResponseEntity<ApiResponse<Map<String, Object>>> obterEstatisticasAcesso(
            @Parameter(description = "ID da unidade (opcional)")
            @RequestParam(required = false) Long unidadeId,
            @Parameter(description = "Data de início do período")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataInicio,
            @Parameter(description = "Data de fim do período")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataFim) {
        log.info("Obtendo estatísticas de acesso - {} a {}", dataInicio, dataFim);
        ApiResponse<Map<String, Object>> response = controleAcessoService.obterEstatisticasAcesso(unidadeId, dataInicio, dataFim);
        return ResponseEntity.ok(response);
    }

    // ============== ENDPOINTS ADICIONAIS PARA O FRONTEND ==============

    @GetMapping("/filas")
    @Operation(summary = "Listar filas de atendimento",
               description = "Lista todas as filas de atendimento ativas")
    public ResponseEntity<ApiResponse<List<FilaAtendimentoDTO>>> listarFilas(
            @Parameter(description = "ID da unidade (opcional)")
            @RequestParam(required = false) Long unidadeId) {
        log.info("Listando filas de atendimento - unidade: {}", unidadeId);
        ApiResponse<List<FilaAtendimentoDTO>> response;
        if (unidadeId != null) {
            response = filaAtendimentoService.listarFilasPorUnidade(unidadeId);
        } else {
            response = filaAtendimentoService.listarFilas();
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/filas")
    @Operation(summary = "Criar nova fila de atendimento",
               description = "Cria uma nova fila de atendimento")
    public ResponseEntity<ApiResponse<FilaAtendimentoDTO>> criarFila(
            @Valid @RequestBody FilaAtendimentoDTO filaDTO) {
        log.info("Criando nova fila: {}", filaDTO.getNome());
        ApiResponse<FilaAtendimentoDTO> response = filaAtendimentoService.criarFila(filaDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/leitos")
    @Operation(summary = "Listar todos os leitos",
               description = "Lista todos os leitos com opção de filtrar por unidade")
    public ResponseEntity<ApiResponse<List<LeitoDTO>>> listarTodosLeitos(
            @Parameter(description = "ID da unidade (opcional)")
            @RequestParam(required = false) Long unidadeId,
            @Parameter(description = "Status do leito (opcional)")
            @RequestParam(required = false) Leito.StatusLeito status) {
        log.info("Listando todos os leitos - unidade: {}, status: {}", unidadeId, status);
        ApiResponse<List<LeitoDTO>> response;
        if (status != null && unidadeId != null) {
            response = leitoService.listarLeitosPorStatus(unidadeId, status);
        } else if (unidadeId != null) {
            response = leitoService.listarLeitosDisponiveis(unidadeId);
        } else {
            // Se não informar unidade, usar unidade padrão 1
            response = leitoService.listarLeitosDisponiveis(unidadeId != null ? unidadeId : 1L);
        }
        return ResponseEntity.ok(response);
    }
}