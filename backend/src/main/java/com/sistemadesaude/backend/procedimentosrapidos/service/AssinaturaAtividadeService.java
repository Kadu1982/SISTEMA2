package com.sistemadesaude.backend.procedimentosrapidos.service;

import com.sistemadesaude.backend.procedimentosrapidos.dto.AssinaturaDigitalRequestDTO;
import com.sistemadesaude.backend.procedimentosrapidos.dto.AssinaturaDigitalResponseDTO;
import com.sistemadesaude.backend.procedimentosrapidos.entity.AssinaturaDigital;
import com.sistemadesaude.backend.procedimentosrapidos.entity.AtividadeEnfermagem;
import com.sistemadesaude.backend.procedimentosrapidos.entity.ChecklistCincoCertos;
import com.sistemadesaude.backend.procedimentosrapidos.enums.SituacaoAtividade;
import com.sistemadesaude.backend.procedimentosrapidos.exception.AssinaturaDigitalException;
import com.sistemadesaude.backend.procedimentosrapidos.exception.ChecklistIncompletoException;
import com.sistemadesaude.backend.procedimentosrapidos.exception.CorenInvalidoException;
import com.sistemadesaude.backend.procedimentosrapidos.mapper.AssinaturaDigitalMapper;
import com.sistemadesaude.backend.procedimentosrapidos.repository.AtividadeEnfermagemRepository;
import com.sistemadesaude.backend.operador.repository.OperadorRepository;
import com.sistemadesaude.backend.operador.entity.Operador;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.List;

/**
 * Serviço para assinar atividades de enfermagem
 * Orquestra o processo completo de assinatura digital
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AssinaturaAtividadeService {

    private final AtividadeEnfermagemRepository atividadeRepository;
    private final AssinaturaDigitalService assinaturaDigitalService;
    private final CorenValidationService corenValidationService;
    private final AssinaturaDigitalMapper assinaturaMapper;
    private final OperadorRepository operadorRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    /**
     * Assina uma atividade de enfermagem com validação completa
     */
    @Transactional
    public AssinaturaDigitalResponseDTO assinarAtividade(
            Long atividadeId, 
            AssinaturaDigitalRequestDTO request) {
        
        log.info("Iniciando assinatura da atividade {} pelo operador {}", 
                 atividadeId, request.getOperadorId());

        // 1. Buscar atividade
        AtividadeEnfermagem atividade = atividadeRepository.findById(atividadeId)
                .orElseThrow(() -> new AssinaturaDigitalException(
                        "Atividade não encontrada: " + atividadeId));

        // 2. Validar senha de login
        Operador operador = operadorRepository.findById(request.getOperadorId())
                .orElseThrow(() -> new AssinaturaDigitalException(
                        "Operador não encontrado: " + request.getOperadorId()));

        if (operador.getSenha() == null || !passwordEncoder.matches(request.getSenhaLogin(), operador.getSenha())) {
            throw new AssinaturaDigitalException("Senha de login inválida");
        }

        // 3. Validar COREN
        if (!corenValidationService.validar(request.getCoren())) {
            throw new CorenInvalidoException(request.getCoren());
        }

        // 4. Validar checklist dos 5 certos (se for medicação)
        if (atividade.getMedicamentoId() != null) {
            validarChecklist(atividade);
        }

        // 5. Validar que atividade está executada
        if (atividade.getSituacao() != SituacaoAtividade.EXECUTADO) {
            throw new AssinaturaDigitalException(
                    "Atividade deve estar executada para ser assinada");
        }

        // 6. Validar senha de assinatura e criar assinatura
        AssinaturaDigital assinatura;
        try {
            assinatura = assinaturaDigitalService.assinarAtividade(
                    request.getOperadorId(),
                    atividadeId,
                    request.getSenhaAssinatura(),
                    request.getIpAddress(),
                    request.getCoren()
            );
        } catch (IllegalArgumentException e) {
            throw new AssinaturaDigitalException("Senha de assinatura inválida", e);
        }

        // 7. Gerar hash SHA-256 e atualizar atividade
        String hash = gerarHashAssinatura(assinatura);
        atividade.setHashAssinaturaDigital(hash);
        atividade.setCorenRealizacao(request.getCoren());
        atividadeRepository.save(atividade);

        // 8. Criar response
        AssinaturaDigitalResponseDTO response = assinaturaMapper.toResponseDTO(assinatura);
        response.setSucesso(true);
        response.setMensagem("Assinatura digital realizada com sucesso");
        response.setAtividadeId(atividadeId);

        log.info("Assinatura da atividade {} concluída com sucesso", atividadeId);
        
        return response;
    }

    /**
     * Valida checklist dos 5 certos
     */
    private void validarChecklist(AtividadeEnfermagem atividade) {
        ChecklistCincoCertos checklist = atividade.getChecklist();
        
        if (checklist == null) {
            throw new ChecklistIncompletoException(
                    List.of("pacienteCerto", "medicamentoCerto", "doseCerta", 
                           "viaCerta", "horarioCerto"));
        }

        if (!checklist.isCompleto()) {
            throw new ChecklistIncompletoException(checklist.getCamposNaoValidados());
        }
    }

    /**
     * Gera hash SHA-256 da assinatura
     */
    private String gerarHashAssinatura(AssinaturaDigital assinatura) {
        try {
            String dados = assinatura.getOperadorId() + 
                          assinatura.getDataHoraAssinatura().toString() +
                          assinatura.getIpAddress() +
                          assinatura.getCorenOperador();
            
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(dados.getBytes());
            return Base64.getEncoder().encodeToString(hash);
            
        } catch (NoSuchAlgorithmException e) {
            throw new AssinaturaDigitalException("Erro ao gerar hash da assinatura", e);
        }
    }
}