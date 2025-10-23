package com.sistemadesaude.backend.recepcao.service;

import com.sistemadesaude.backend.exception.ResourceNotFoundException;
import com.sistemadesaude.backend.exames.dto.GerarSadtRequest;
import com.sistemadesaude.backend.exames.dto.GerarSadtRequest.ProcedimentoRequest;
import com.sistemadesaude.backend.exames.dto.SadtResponseDTO;
import com.sistemadesaude.backend.exames.service.SadtService;
import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.paciente.repository.PacienteRepository;
import com.sistemadesaude.backend.prontuario.enums.TipoDocumento;
import com.sistemadesaude.backend.prontuario.service.ProntuarioDocumentoService;
import com.sistemadesaude.backend.recepcao.dto.AgendamentoDTO;
import com.sistemadesaude.backend.recepcao.dto.NovoAgendamentoRequest;
import com.sistemadesaude.backend.recepcao.entity.Agendamento;
import com.sistemadesaude.backend.recepcao.entity.StatusAgendamento;
import com.sistemadesaude.backend.recepcao.entity.TipoConsulta;
import com.sistemadesaude.backend.recepcao.mapper.AgendamentoMapper;
import com.sistemadesaude.backend.documentos.service.ComprovantePdfService; // ✅ import necessário
import com.sistemadesaude.backend.recepcao.repository.AgendamentoRepository;
import com.sistemadesaude.backend.service.BarcodeService;
import com.google.zxing.WriterException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;

import java.lang.reflect.Method;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;
import java.util.Base64;

/**
 * Serviço de Agendamentos
 *
 * Regra:
 *  - CONSULTA → gera COMPROVANTE_AGENDAMENTO (e anexa)
 *  - EXAMES (lab/imagem/procedimento) → gera SADT (e anexa)
 *
 * Compatibilidade:
 *  - Alguns ambientes têm o campo de data como "dataHora" e outros como "dataAgendamento" (ambos @NotNull).
 *  - Para evitar 400 "not-null property ...", setamos AMBOS via reflexão, e ao ler/ordenar usamos um getter seguro.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AgendamentoServiceImpl implements AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;
    private final PacienteRepository pacienteRepository;
    private final AgendamentoMapper agendamentoMapper;

    private final ProntuarioDocumentoService prontuarioDocumentoService;
    private final ComprovantePdfService comprovantePdfService;
    private final SadtService sadtService;
    private final BarcodeService barcodeService;

    // ===================== PRINCIPAIS AÇÕES =====================

    @Override
    @Transactional
    public AgendamentoDTO criarAgendamento(NovoAgendamentoRequest request) {
        log.info("Criando agendamento. pacienteId={} tipo={}", request.getPacienteId(), request.getTipo());

        // 1) Paciente
        Paciente paciente = pacienteRepository.findById(request.getPacienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado: " + request.getPacienteId()));

        // 2) Monta entidade
        Agendamento agendamento = new Agendamento();
        agendamento.setPaciente(paciente);

        // 2.1) Data/Hora (resolver para UTC/LocalDateTime e setar no(s) campo(s) da entidade)
        LocalDateTime dataHora = resolverDataHora(request);
        if (dataHora == null) {
            throw new IllegalArgumentException("Data/Hora do agendamento não informada ou inválida.");
        }
        safeSetData(agendamento, dataHora); // <— preenche dataHora e/ou dataAgendamento

        // 2.2) Status
        agendamento.setStatus(StatusAgendamento.AGENDADO);

        // 2.3) Tipo
        TipoConsulta tipoEnum = resolveTipoConsulta(request.getTipo());
        agendamento.setTipoConsulta(tipoEnum);

        // 2.4) Especialidade (se não vier, inferimos por string)
        String especialidade = safeUpper(request.getEspecialidade());
        if (especialidade == null || especialidade.isBlank()) {
            especialidade = inferEspecialidadeDefault(tipoEnum, request.getTipo());
        }
        agendamento.setEspecialidade(especialidade);

        // 2.5) Observações
        agendamento.setObservacoes(safeTrim(request.getObservacoes()));

        // 2.6) Gerar código de barras
        String codigoBarras = barcodeService.gerarCodigoAgendamento();
        agendamento.setCodigoBarras(codigoBarras);
        try {
            byte[] imagemBarras = barcodeService.gerarCodigoBarras(codigoBarras);
            agendamento.setCodigoBarrasImagem(imagemBarras);
            log.info("Código de barras gerado para agendamento: {}", codigoBarras);
        } catch (WriterException | IOException e) {
            log.error("Erro ao gerar imagem do código de barras para agendamento", e);
        }

        // 3) Salva
        Agendamento salvo = agendamentoRepository.save(agendamento);
        agendamentoRepository.flush(); // ✅ garante ID antes de gerar PDF/SADT (importante com IDENTITY)

        // 4) Retorna DTO primeiro
        AgendamentoDTO resultado = agendamentoMapper.toDTO(salvo);

        // 5) Documento conforme REGRA DE NEGÓCIO:
        //    - EXAMES (qualquer natureza) → gera SADT (SEM comprovante)
        //    - CONSULTAS/CURATIVOS/OUTROS → gera Comprovante (SEM SADT)
        // Estratégia: executar em nova thread após pequeno delay para garantir que a transação principal commitou
        final NovoAgendamentoRequest reqCopy = request;
        final Agendamento salvoFinal = salvo;
        final String operadorAtual = getOperadorAtual();

        new Thread(() -> {
            try {
                Thread.sleep(100); // 100ms para garantir commit
                if (isExameAgendamento(reqCopy, tipoEnum, salvoFinal.getEspecialidade(), salvoFinal.getObservacoes())) {
                    log.info("✅ Agendamento {} é EXAME → gerar APENAS SADT (async).", salvoFinal.getId());
                    gerarSadtParaAgendamento(reqCopy, salvoFinal, operadorAtual);
                } else {
                    log.info("✅ Agendamento {} é CONSULTA/OUTRO → gerar APENAS Comprovante (async).", salvoFinal.getId());
                    gerarEAnexarComprovante(salvoFinal);
                }
            } catch (Exception e) {
                log.error("❌ Erro ao gerar documento para agendamento {}", salvoFinal.getId(), e);
            }
        }).start();

        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public AgendamentoDTO buscarPorId(Long id) {
        Agendamento ag = agendamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado: " + id));
        return agendamentoMapper.toDTO(ag);
    }

    @Override
    @Transactional(readOnly = true)
    public AgendamentoDTO buscarPorIdComPdf(Long id) {
        Agendamento ag = agendamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado: " + id));

        AgendamentoDTO dto = agendamentoMapper.toDTO(ag);

        if (!isExameFromEntity(ag)) {
            byte[] pdf = comprovantePdfService.gerarPdf(dto);
            try { dto.setComprovantePdfBase64(Base64.getEncoder().encodeToString(pdf)); }
            catch (Throwable t) { log.warn("Não foi possível setar comprovantePdfBase64: {}", t.getMessage()); }
        } else {
            try { dto.setComprovantePdfBase64(null); } catch (Throwable ignored) {}
        }
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AgendamentoDTO> listarPorData(LocalDate data) {
        var inicio = data.atStartOfDay();
        var fim = data.atTime(23, 59, 59);

        // Busca tudo e filtra/ordena usando getter seguro (funciona com dataHora ou dataAgendamento)
        return agendamentoRepository.findAll().stream()
                .filter(a -> {
                    LocalDateTime dt = safeGetData(a);
                    return dt != null && !dt.isBefore(inicio) && !dt.isAfter(fim);
                })
                .sorted(Comparator.comparing(this::safeGetData))
                .map(agendamentoMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AgendamentoDTO> listarPorDataSeguro(LocalDate data) {
        return listarPorData(data);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AgendamentoDTO> listarPorPaciente(Long pacienteId) {
        return agendamentoRepository.findAll().stream()
                .filter(a -> a.getPaciente() != null && Objects.equals(a.getPaciente().getId(), pacienteId))
                .sorted(Comparator.comparing(this::safeGetData,
                        Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(agendamentoMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AgendamentoDTO atualizarStatus(Long id, String novoStatus) {
        log.info("🔄 Atualizando status do agendamento ID: {} para {}", id, novoStatus);
        
        Agendamento ag = agendamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado: " + id));
        
        log.debug("📋 Agendamento encontrado - Status atual: {}, Data: {}", 
                ag.getStatus(), ag.getDataAgendamento());
        
        // Atualiza apenas o status, mantendo todos os outros campos intactos
        ag.setStatus(parseStatus(novoStatus));
        
        // O save() do JPA irá atualizar o registro existente porque a entidade já tem ID
        Agendamento agendamentoAtualizado = agendamentoRepository.save(ag);
        
        log.info("✅ Status atualizado com sucesso para: {}", agendamentoAtualizado.getStatus());
        
        return agendamentoMapper.toDTO(agendamentoAtualizado);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean precisaSadt(Long agendamentoId) {
        Agendamento ag = agendamentoRepository.findById(agendamentoId)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado: " + agendamentoId));
        return isExameFromEntity(ag);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AgendamentoDTO> listarTodos() {
        // Ordena em memória por segurança (funciona com dataHora ou dataAgendamento)
        return agendamentoRepository.findAll().stream()
                .sorted(Comparator.comparing(this::safeGetData,
                        Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(agendamentoMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AgendamentoDTO> listarAguardandoTriagem() {
        // Ajuste este filtro se sua entidade tiver outro nome para o status/triagem
        List<StatusAgendamento> statusParaTriagem = List.of(StatusAgendamento.RECEPCIONADO, StatusAgendamento.CONFIRMADO);
        return agendamentoRepository.findAll().stream()
                .filter(a -> a.getStatus() != null && statusParaTriagem.contains(a.getStatus()))
                .filter(a -> {
                    // Se não existir getTriagem(), esse try/catch ignora
                    try {
                        Method m = a.getClass().getMethod("getTriagem");
                        return m.invoke(a) == null;
                    } catch (Throwable ignore) { return true; }
                })
                .map(agendamentoMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public byte[] gerarEArmazenarComprovantePdf(Long agendamentoId) {
        Agendamento ag = agendamentoRepository.findById(agendamentoId)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado: " + agendamentoId));

        byte[] pdf = comprovantePdfService.gerarPdf(agendamentoMapper.toDTO(ag));
        String numeroReferencia = "AGEND-" + ag.getId();
        String nomeArquivo = "Comprovante-Agendamento-" + ag.getId() + ".pdf";

        prontuarioDocumentoService.salvarDocumento(
                TipoDocumento.COMPROVANTE_AGENDAMENTO,            // 1) tipo
                String.valueOf(ag.getPaciente().getId()),         // 2) pacienteId (String)
                null,                                              // 3) atendimentoId (String) - n/a
                ag.getId(),                                        // 4) agendamentoId (Long)
                numeroReferencia,                                  // 5) numeroReferencia
                nomeArquivo,                                       // 6) nomeArquivo
                pdf                                                // 7) PDF
        );
        return pdf;
    }

    // ===================== AUXILIARES =====================

    /** Converte a data/hora do request. Aceita: getDataHoraConvertida(); ISO com 'Z'; ISO sem 'Z'. */
    private LocalDateTime resolverDataHora(NovoAgendamentoRequest req) {
        try {
            LocalDateTime conv = req.getDataHoraConvertida();
            if (conv != null) return conv;
        } catch (Throwable ignored) {}

        try {
            String raw = req.getDataHora();
            if (raw != null && !raw.isBlank()) {
                raw = raw.trim();
                if (raw.endsWith("Z")) {
                    Instant inst = Instant.parse(raw);
                    return LocalDateTime.ofInstant(inst, ZoneId.systemDefault());
                }
                return LocalDateTime.parse(raw.replace("Z","").replace("+00:00",""));
            }
        } catch (Throwable ignored) {}

        return null;
    }

    /** Especialidade padrão quando o front não envia (sem depender de constantes do enum). */
    private String inferEspecialidadeDefault(TipoConsulta tipoEnum, String tipoStrRaw) {
        String raw = (tipoStrRaw == null) ? "" : tipoStrRaw.toLowerCase();
        if (raw.contains("labor")) return "LABORATORIAL";
        if (containsAny(raw.toUpperCase(), "IMAGEM", "RADIO", "RAIO", "RX", "ULTRA", "TOMOG", "RESSON")) return "IMAGEM";
        if (tipoEnum != null && isTipoExame(tipoEnum)) return "IMAGEM";
        return "CONSULTA";
    }

    /** Consulta/Atendimento → gera e anexa Comprovante. */
    private void gerarEAnexarComprovante(Agendamento ag) {
        byte[] pdfBytes = comprovantePdfService.gerarPdf(agendamentoMapper.toDTO(ag));
        if (pdfBytes == null || pdfBytes.length == 0) {
            log.warn("PDF vazio/nulo para agendamento {}. Não anexado.", ag.getId());
            return;
        }
        String numeroReferencia = "AGEND-" + ag.getId();
        String nomeArquivo = "Comprovante-Agendamento-" + ag.getId() + ".pdf";

        prontuarioDocumentoService.salvarDocumento(
                TipoDocumento.COMPROVANTE_AGENDAMENTO,
                String.valueOf(ag.getPaciente().getId()),
                null,
                ag.getId(),
                numeroReferencia,
                nomeArquivo,
                pdfBytes
        );
    }

    /** Detecta EXAME a partir do request + contexto. */
    private boolean isExameAgendamento(NovoAgendamentoRequest req, TipoConsulta tipo, String especialidade, String observacoes) {
        log.info("🔍 isExameAgendamento - Verificando se é exame...");
        log.info("  - examesSelecionados: {}", req.getExamesSelecionados());
        log.info("  - tipo: {}", tipo);
        log.info("  - especialidade: {}", especialidade);
        log.info("  - observacoes: {}", observacoes);

        try {
            if (req.getExamesSelecionados() != null && !req.getExamesSelecionados().isEmpty()) {
                log.info("✅ É EXAME: examesSelecionados não está vazio ({})", req.getExamesSelecionados().size());
                return true;
            }
        } catch (Throwable ignored) {}

        if (tipo != null && isTipoExame(tipo)) {
            log.info("✅ É EXAME: tipo é exame ({})", tipo);
            return true;
        }

        String esp = safeUpper(especialidade);
        if (isEspecialidadeDeExame(esp)) {
            log.info("✅ É EXAME: especialidade sugere exame ({})", especialidade);
            return true;
        }

        String obs = safeUpper(observacoes != null ? observacoes : req.getObservacoes());
        boolean hasKeywords = containsAny(obs, "EXAME", "LABORATORI", "IMAGEM", "RX", "RAIO", "ULTRA", "TOMOG", "RESSON");
        if (hasKeywords) {
            log.info("✅ É EXAME: observações contêm palavras-chave de exame");
            return true;
        }

        log.info("❌ NÃO É EXAME: nenhum critério foi atendido");
        return false;
    }

    /** Detecta EXAME apenas pela entidade persistida. */
    private boolean isExameFromEntity(Agendamento ag) {
        if (ag.getTipoConsulta() != null && isTipoExame(ag.getTipoConsulta())) return true;
        if (isEspecialidadeDeExame(safeUpper(ag.getEspecialidade()))) return true;
        return containsAny(safeUpper(ag.getObservacoes()), "EXAME", "LABORATORI", "IMAGEM", "RX", "RAIO", "ULTRA", "TOMOG", "RESSON");
    }

    /** Gera SADT (SadtService já salva o PDF no prontuário). */
    private void gerarSadtParaAgendamento(NovoAgendamentoRequest req, Agendamento ag, String operador) {
        log.info("🏥 gerarSadtParaAgendamento - Iniciando geração de SADT");
        log.info("  - agendamentoId: {}", ag.getId());
        log.info("  - pacienteId: {}", ag.getPaciente().getId());
        log.info("  - operador: {}", operador);

        GerarSadtRequest sreq = new GerarSadtRequest();
        sreq.setAgendamentoId(ag.getId());
        sreq.setPacienteId(ag.getPaciente().getId());

        List<String> nomes = Optional.ofNullable(req.getExamesSelecionados()).orElse(Collections.emptyList());
        log.info("  - examesSelecionados do request: {}", nomes);

        List<ProcedimentoRequest> itens = new ArrayList<>();
        if (nomes.isEmpty()) {
            log.info("⚠️ Lista de exames vazia, criando procedimento genérico");
            itens.add(procedFromEspecialidadeOuObs(req, ag));
        } else {
            log.info("✅ Convertendo {} exames em procedimentos", nomes.size());
            for (String n : nomes) {
                log.info("   - Adicionando exame: {}", n);
                itens.add(procedFromNomeExame(n));
            }
        }
        sreq.setProcedimentos(itens);

        log.info("📋 Total de procedimentos na SADT: {}", itens.size());

        SadtResponseDTO resp = sadtService.gerarSadt(sreq, operador);
        if (resp == null || Boolean.FALSE.equals(resp.getSucesso())) {
            log.error("❌ SADT não pôde ser gerada. agendamentoId={}, mensagem: {}",
                ag.getId(), resp != null ? resp.getMensagem() : "resposta nula");
        } else {
            log.info("✅ SADT gerada com sucesso! agendamentoId={}, numeroSadt={}", ag.getId(), resp.getNumeroSadt());
        }
    }

    /** Cria ProcedimentoRequest a partir do nome (via setters). */
    private ProcedimentoRequest procedFromNomeExame(String nome) {
        String nomeTrim = (nome == null || nome.isBlank()) ? "Procedimento" : nome.trim();
        ProcedimentoRequest pr = new ProcedimentoRequest();
        pr.setCodigo(mapCodigoSigTap(nomeTrim));
        pr.setNome(nomeTrim);
        pr.setQuantidade(1);
        // pr.setCid10(null);
        // pr.setJustificativa(null);
        // pr.setPreparo(null);
        return pr;
    }

    /** Fallback quando não veio a lista de exames: usa especialidade/observações. */
    private ProcedimentoRequest procedFromEspecialidadeOuObs(NovoAgendamentoRequest req, Agendamento ag) {
        String base = (req.getObservacoes() != null && !req.getObservacoes().isBlank())
                ? req.getObservacoes()
                : ag.getEspecialidade();
        String nome = (base == null || base.isBlank()) ? "Exame/Procedimento" : base;
        return procedFromNomeExame(nome);
    }

    /** Mini mapa SIGTAP (exemplos). Usa código sintético se não casar. */
    private String mapCodigoSigTap(String nomeExame) {
        String key = safeUpper(nomeExame);
        Map<String,String> map = new HashMap<>();
        map.put("HEMOGRAMA", "0202020380");
        map.put("GLICEMIA", "0202010473");
        map.put("COLESTEROL", "0202010295");
        map.put("URINA", "0202050017");
        map.put("RAIO", "0204030153");
        map.put("RX", "0204030153");
        map.put("ULTRA", "0205020046");
        return map.entrySet().stream()
                .filter(e -> key.contains(e.getKey()))
                .map(Map.Entry::getValue)
                .findFirst()
                .orElse(genCodigoSintetico());
    }

    private String genCodigoSintetico() { return "EXAM" + UUID.randomUUID().toString().substring(0, 4).toUpperCase(); }

    private boolean isTipoExame(TipoConsulta tipo) {
        String t = tipo.name();
        return t.contains("EXAME") || t.contains("PROCEDIMENTO");
    }

    private boolean isEspecialidadeDeExame(String espUpper) {
        return containsAny(espUpper, "IMAGEM", "RADIO", "RAIO", "RX", "ULTRA", "TOMOG", "RESSON", "LABORATORI", "PATOLOGIA", "COLETA");
    }

    private boolean containsAny(String haystackUpper, String... needles) {
        if (haystackUpper == null) return false;
        String s = haystackUpper.toUpperCase();
        for (String n : needles) if (s.contains(n.toUpperCase())) return true;
        return false;
    }

    private String getOperadorAtual() {
        try {
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            return (auth != null && auth.getName() != null) ? auth.getName() : "sistema";
        } catch (Exception e) {
            return "sistema";
        }
    }

    private TipoConsulta resolveTipoConsulta(String tipoStr) {
        if (tipoStr == null || tipoStr.isBlank()) return TipoConsulta.CONSULTA;
        try { return TipoConsulta.valueOf(tipoStr.trim().toUpperCase()); }
        catch (IllegalArgumentException e) {
            log.warn("TipoConsulta desconhecido: {}. Usando CONSULTA.", tipoStr);
            return TipoConsulta.CONSULTA;
        }
    }

    private StatusAgendamento parseStatus(String value) {
        if (value == null || value.isBlank()) return StatusAgendamento.CONFIRMADO;
        try { return StatusAgendamento.valueOf(value.trim().toUpperCase()); }
        catch (IllegalArgumentException e) {
            log.warn("StatusAgendamento inválido: {}. Mantendo CONFIRMADO.", value);
            return StatusAgendamento.CONFIRMADO;
        }
    }

    private String safeUpper(String s) { return (s == null) ? null : s.trim().toUpperCase(); }
    private String safeTrim(String s)   { return (s == null) ? ""   : s.trim(); }

    // ---------- Compat helpers (funcionam mesmo que a entidade mude o nome da propriedade) ----------

    /** Seta data no(s) campo(s) da entidade: tenta setDataHora e setDataAgendamento via reflexão. */
    private void safeSetData(Agendamento ag, LocalDateTime dt) {
        try {
            Method m = ag.getClass().getMethod("setDataHora", LocalDateTime.class);
            m.invoke(ag, dt);
        } catch (Throwable ignored) {}
        try {
            Method m = ag.getClass().getMethod("setDataAgendamento", LocalDateTime.class);
            m.invoke(ag, dt);
        } catch (Throwable ignored) {}
    }

    /** Obtém a data do agendamento por reflexão: getDataHora() ou getDataAgendamento(). */
    private LocalDateTime safeGetData(Agendamento ag) {
        try {
            Method m = ag.getClass().getMethod("getDataHora");
            Object v = m.invoke(ag);
            if (v instanceof LocalDateTime) return (LocalDateTime) v;
        } catch (Throwable ignored) {}
        try {
            Method m = ag.getClass().getMethod("getDataAgendamento");
            Object v = m.invoke(ag);
            if (v instanceof LocalDateTime) return (LocalDateTime) v;
        } catch (Throwable ignored) {}
        return null;
    }
}
