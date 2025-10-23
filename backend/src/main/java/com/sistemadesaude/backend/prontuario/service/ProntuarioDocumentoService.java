package com.sistemadesaude.backend.prontuario.service;

import com.sistemadesaude.backend.prontuario.entity.ProntuarioDocumento;
import com.sistemadesaude.backend.prontuario.enums.TipoDocumento;
import com.sistemadesaude.backend.prontuario.repository.ProntuarioDocumentoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Serviço para salvar e consultar documentos do prontuário.
 *
 * ► Importante: este service garante que o conteúdo PDF seja sempre byte[].
 *   Evita o erro do Postgres "bytea vs bigint" garantindo tipos e ordem corretos.
 *
 * ► Rodamos o salvarDocumento em transação ISOLADA (REQUIRES_NEW) para que
 *   qualquer falha aqui NÃO marque a transação do chamador como rollback-only.
 *
 * ATENÇÃO: Este arquivo substitui completamente a versão anterior.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProntuarioDocumentoService {

    private final ProntuarioDocumentoRepository repository;

    /**
     * Salva um documento no prontuário do paciente.
     *
     * @param tipo              TipoDocumento (ex.: COMPROVANTE_AGENDAMENTO)
     * @param pacienteId        ID do paciente (String, conforme migration)
     * @param atendimentoId     ID textual do atendimento (pode ser null)
     * @param agendamentoId     ID do agendamento (pode ser null)
     * @param numeroReferencia  Número de referência (ex.: número SADT, ID do agendamento) (pode ser null)
     * @param arquivoNome       Nome do arquivo (ex.: "Comprovante-Agendamento-123.pdf")
     * @param arquivoPdf        O PDF em bytes (OBRIGATÓRIO)
     * @return                  Entidade persistida
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ProntuarioDocumento salvarDocumento(
            final TipoDocumento tipo,
            final String pacienteId,
            final String atendimentoId,
            final Long agendamentoId,
            final String numeroReferencia,
            final String arquivoNome,
            final byte[] arquivoPdf
    ) {
        // ► Validações simples e log didático
        if (tipo == null) throw new IllegalArgumentException("Tipo do documento é obrigatório.");
        if (pacienteId == null || pacienteId.isBlank()) throw new IllegalArgumentException("pacienteId é obrigatório.");
        if (arquivoNome == null || arquivoNome.isBlank()) throw new IllegalArgumentException("arquivoNome é obrigatório.");
        if (arquivoPdf == null || arquivoPdf.length == 0)
            throw new IllegalArgumentException("arquivoPdf (byte[]) é obrigatório e não pode ser vazio.");

        log.debug(
                "📎 Salvando documento no prontuário: tipo={}, pacienteId={}, agendamentoId={}, atendimentoId={}, numeroRef={}, nome={}, pdfBytes={}",
                tipo, pacienteId, agendamentoId, atendimentoId, numeroReferencia, arquivoNome, arquivoPdf.length
        );

        // ► Monta a entidade corretamente (arquivoPdf é byte[])
        ProntuarioDocumento entidade = ProntuarioDocumento.builder()
                .tipo(tipo)
                .pacienteId(pacienteId)
                .atendimentoId(atendimentoId)
                .agendamentoId(agendamentoId)
                .numeroReferencia(numeroReferencia)
                .arquivoNome(arquivoNome)
                .contentType("application/pdf")
                .arquivoPdf(arquivoPdf) // ← CRÍTICO: byte[]
                .criadoPorOperadorId(getOperadorAtualId())
                .build();

        ProntuarioDocumento salvo = repository.save(entidade);

        log.info(
                "✅ Documento salvo no prontuário. id={}, tipo={}, pacienteId={}, nome={}, tamanho={} bytes",
                salvo.getId(), salvo.getTipo(), salvo.getPacienteId(), salvo.getArquivoNome(),
                salvo.getArquivoPdf() != null ? salvo.getArquivoPdf().length : 0
        );

        return salvo;
    }

    /** Exemplo simples para auditoria; ajuste para seu UserDetails quando desejar. */
    private Long getOperadorAtualId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() != null) {
                // Caso tenha um principal customizado, recupere o ID aqui.
                // No momento, retornamos null para não travar o fluxo.
            }
        } catch (Exception ignored) {}
        return null;
    }
}
