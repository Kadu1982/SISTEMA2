package com.sistemadesaude.backend.prontuario.aspect;

import com.sistemadesaude.backend.atendimento.entity.Atendimento;
import com.sistemadesaude.backend.documentos.service.ComprovantePdfService;
import com.sistemadesaude.backend.exames.dto.GerarSadtRequest;
import com.sistemadesaude.backend.exames.dto.ProcedimentoSadtDTO;
import com.sistemadesaude.backend.exames.dto.SadtDTO;
import com.sistemadesaude.backend.exames.dto.SadtResponseDTO;
import com.sistemadesaude.backend.exames.service.SadtPdfService;
import com.sistemadesaude.backend.prontuario.enums.TipoDocumento;
import com.sistemadesaude.backend.prontuario.service.ProntuarioDocumentoService;
import com.sistemadesaude.backend.recepcao.dto.AgendamentoDTO;
import com.sistemadesaude.backend.documentos.dto.AtestadoDTO;
import com.sistemadesaude.backend.documentos.dto.ReceituarioDTO;
import com.sistemadesaude.backend.paciente.entity.Paciente;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Aspecto que ANEXA automaticamente PDFs gerados ao prontuário do paciente.
 * ✅ CORREÇÃO: Agora diferencia entre agendamento de consulta e de exame.
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class DocumentosAutoSaveAspect {

    private final ProntuarioDocumentoService prontuario;
    private final ComprovantePdfService comprovantePdfService;
    private final SadtPdfService sadtPdfService;

    // ... (Os outros métodos de Aspect para Atestado, Receituário, etc., permanecem inalterados) ...
    @AfterReturning(
            pointcut = "execution(byte[] com.sistemadesaude.backend.documentos.service.AtestadoPdfService.gerarPdf(..))",
            returning = "pdf"
    )
    public void anexarAtestadoAoProntuario(JoinPoint jp, byte[] pdf) {
        Object[] args = jp.getArgs();
        AtestadoDTO dto = (AtestadoDTO) args[0];
        Paciente p = args.length > 1 ? (Paciente) args[1] : null;

        String pacienteId = dto.getPacienteId() != null ? String.valueOf(dto.getPacienteId())
                : (p != null ? String.valueOf(p.getId()) : null);
        if (pacienteId == null) {
            log.warn("⚠️ Atestado gerado sem pacienteId. Não será anexado.");
            return;
        }

        String nome = "Atestado-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss")) + ".pdf";
        prontuario.salvarDocumento(
                TipoDocumento.ATESTADO, pacienteId, null, null,
                dto.getCid(), // guardamos o CID como 'numeroReferencia' p/ rastreio
                nome, pdf
        );
    }

    @AfterReturning(
            pointcut = "execution(byte[] com.sistemadesaude.backend.documentos.service.ReceituarioPdfService.gerarPdf(..))",
            returning = "pdf"
    )
    public void anexarReceituarioAoProntuario(JoinPoint jp, byte[] pdf) {
        Object[] args = jp.getArgs();
        ReceituarioDTO dto = (ReceituarioDTO) args[0];
        Paciente p = args.length > 1 ? (Paciente) args[1] : null;

        String pacienteId = dto.getPacienteId() != null ? String.valueOf(dto.getPacienteId())
                : (p != null ? String.valueOf(p.getId()) : null);
        if (pacienteId == null) {
            log.warn("⚠️ Receituário gerado sem pacienteId. Não será anexado.");
            return;
        }

        String nome = "Receituario-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss")) + ".pdf";
        prontuario.salvarDocumento(
                TipoDocumento.RECEITUARIO, pacienteId, null, null,
                null, nome, pdf
        );
    }

    @AfterReturning(
            pointcut = "execution(byte[] com.sistemadesaude.backend.atendimento.service.AtendimentoPdfService.gerarPdf(..))",
            returning = "pdf"
    )
    public void anexarFichaAtendimentoAoProntuario(JoinPoint jp, byte[] pdf) {
        Atendimento a = (Atendimento) jp.getArgs()[0];
        String pacienteId = String.valueOf(a.getPacienteId()); // converte Long para String
        if (pacienteId == null || "null".equals(pacienteId)) {
            log.warn("⚠️ Ficha de atendimento sem pacienteId. Não será anexada.");
            return;
        }
        String nome = "FichaAtendimento-" + a.getId() + ".pdf";
        prontuario.salvarDocumento(
                TipoDocumento.FICHA_ATENDIMENTO,
                pacienteId,
                String.valueOf(a.getId()), // converte Long para String
                null,
                null,
                nome,
                pdf
        );
    }


    @AfterReturning(
            pointcut = "execution(* com.sistemadesaude.backend.exames.service.SadtService.gerarSadt(..))",
            returning = "resp"
    )
    public void anexarSadtDiretaAoProntuario(JoinPoint jp, Object resp) {
        if (!(resp instanceof SadtResponseDTO r)) return;
        GerarSadtRequest req = (GerarSadtRequest) jp.getArgs()[0];
        String pacienteId = req.getPacienteId() != null ? String.valueOf(req.getPacienteId()) : null;
        if (pacienteId == null) {
            log.warn("⚠️ SADT gerada sem pacienteId. Não será anexada.");
            return;
        }
        byte[] pdf = null;
        try { pdf = r.getPdfBase64() != null ? Base64.getDecoder().decode(r.getPdfBase64()) : null; }
        catch (Exception ignored) {}
        if (pdf == null || pdf.length == 0) {
            log.warn("⚠️ SADT sem PDF. Não será anexada.");
            return;
        }
        String nome = "SADT-" + (r.getNumeroSadt() != null ? r.getNumeroSadt() : LocalDateTime.now()) + ".pdf";
        prontuario.salvarDocumento(
                TipoDocumento.SADT, pacienteId, null,
                req.getAgendamentoId(), r.getNumeroSadt(), nome, pdf
        );
    }

    // ❌ DESABILITADO: A geração de documentos para agendamentos agora é feita diretamente no
    // AgendamentoServiceImpl com lógica assíncrona para evitar problemas de foreign key constraints.
    // Este Aspect estava criando duplicação e gerando documentos incorretos.
    /*
    @AfterReturning(
            pointcut = "execution(* com.sistemadesaude.backend.recepcao.service.AgendamentoServiceImpl.criarAgendamento(..))",
            returning = "dto"
    )
    public void anexarDocumentoAposAgendamento(JoinPoint jp, Object dto) {
        if (!(dto instanceof AgendamentoDTO ag)) return;

        boolean isAgendamentoExame = "EXAME".equalsIgnoreCase(ag.getTipo()) ||
                (ag.getExamesSelecionados() != null && !ag.getExamesSelecionados().isEmpty());

        if (isAgendamentoExame) {
            log.info("Agendamento de exame detectado (ID: {}). Gerando SADT.", ag.getId());
            gerarEAnexarSadt(ag);
        } else {
            log.info("Agendamento de consulta detectado (ID: {}). Gerando Comprovante.", ag.getId());
            gerarEAnexarComprovante(ag);
        }
    }
    */

    private void gerarEAnexarSadt(AgendamentoDTO ag) {
        try {
            SadtDTO sadtDto = mapAgendamentoToSadt(ag);
            byte[] pdf = sadtPdfService.gerarPdf(sadtDto);
            if (pdf == null || pdf.length == 0) {
                log.warn("⚠️ SADT em PDF não foi gerada para o agendamento ID: {}.", ag.getId());
                return;
            }
            String pacienteId = String.valueOf(ag.getPacienteId());
            String nomeArquivo = "SADT-Agendamento-" + ag.getId() + ".pdf";
            prontuario.salvarDocumento(
                    TipoDocumento.SADT, pacienteId,
                    null,
                    ag.getId(), null, nomeArquivo, pdf
            );
            log.info("✅ SADT anexada com sucesso ao prontuário do paciente {}", pacienteId);
        } catch (Exception e) {
            log.error("❌ Falha crítica ao tentar gerar e anexar a SADT para o agendamento ID: {}", ag.getId(), e);
        }
    }

    private void gerarEAnexarComprovante(AgendamentoDTO ag) {
        try {
            byte[] pdf = comprovantePdfService.gerarPdf(ag);
            if (pdf == null || pdf.length == 0) {
                log.warn("⚠️ Comprovante de agendamento não foi gerado para o ID: {}.", ag.getId());
                return;
            }
            String pacienteId = String.valueOf(ag.getPacienteId());
            String nomeArquivo = "Comprovante-Agendamento-" + ag.getId() + ".pdf";
            prontuario.salvarDocumento(
                    TipoDocumento.COMPROVANTE_AGENDAMENTO, pacienteId,
                    null, ag.getId(), null, nomeArquivo, pdf
            );
            log.info("✅ Comprovante de agendamento anexado com sucesso ao prontuário do paciente {}", pacienteId);
        } catch (Exception e) {
            log.error("❌ Falha crítica ao tentar gerar e anexar o comprovante para o agendamento ID: {}", ag.getId(), e);
        }
    }

    private SadtDTO mapAgendamentoToSadt(AgendamentoDTO ag) {
        List<ProcedimentoSadtDTO> procedimentos = (ag.getExamesSelecionados() != null)
                ? ag.getExamesSelecionados().stream()
                .map(exame -> ProcedimentoSadtDTO.builder().codigo(exame).nome(exame).quantidade(1).build())
                .collect(Collectors.toList())
                : Collections.emptyList();

        return SadtDTO.builder()
                .numeroSadt("AG-" + ag.getId())
                .agendamentoId(ag.getId())
                .dataEmissao(ag.getDataHora())
                .urgente("URGENTE".equalsIgnoreCase(ag.getPrioridade()))
                .tipoSadt(ag.getTipo())
                .observacoes(ag.getObservacoes())
                .criadoPor(ag.getOperadorNome())
                .pacienteId(ag.getPacienteId())
                .pacienteNome(ag.getPacienteNome())
                // ✅ CORREÇÃO: Usa o método que retorna a String formatada.
                .pacienteDataNascimento(ag.getPacienteDataNascimentoFormatado())
                .solicitanteNome(ag.getProfissionalNome())
                .procedimentos(procedimentos)
                .build();
    }
}