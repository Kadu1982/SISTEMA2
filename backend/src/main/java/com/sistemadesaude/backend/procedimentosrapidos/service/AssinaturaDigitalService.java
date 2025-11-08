package com.sistemadesaude.backend.procedimentosrapidos.service;

import com.sistemadesaude.backend.procedimentosrapidos.entity.AssinaturaDigital;
import com.sistemadesaude.backend.procedimentosrapidos.repository.AssinaturaDigitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Serviço para gerenciar Assinaturas Digitais
 * Sistema de dupla senha para garantir autenticidade
 * 
 * Fluxo:
 * 1. Operador cria senha de assinatura (diferente da senha de login)
 * 2. Para assinar atividade: valida senha de login + senha de assinatura
 * 3. Cria registro imutável de assinatura
 */
@Service
@RequiredArgsConstructor
public class AssinaturaDigitalService {

    private final AssinaturaDigitalRepository assinaturaDigitalRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    /**
     * Cria senha de assinatura para um operador
     * @param operadorId ID do operador
     * @param senhaAssinatura Senha de assinatura (texto plano)
     * @param coren COREN do operador
     * @return AssinaturaDigital criada
     */
    @Transactional
    public AssinaturaDigital criarSenhaAssinatura(Long operadorId, String senhaAssinatura, String coren) {
        // Hash da senha com BCrypt
        String senhaHash = passwordEncoder.encode(senhaAssinatura);

        // Criar registro
        AssinaturaDigital assinatura = AssinaturaDigital.builder()
                .operadorId(operadorId)
                .senhaAssinaturaHash(senhaHash)
                .corenOperador(coren)
                .build();

        return assinaturaDigitalRepository.save(assinatura);
    }

    /**
     * Valida senha de assinatura de um operador
     * @param operadorId ID do operador
     * @param senhaAssinatura Senha de assinatura (texto plano)
     * @return true se válida, false caso contrário
     * @throws IllegalStateException se operador não tem senha cadastrada
     */
    public boolean validarSenhaAssinatura(Long operadorId, String senhaAssinatura) {
        AssinaturaDigital assinatura = assinaturaDigitalRepository.findByOperadorId(operadorId)
                .orElseThrow(() -> new IllegalStateException(
                        "Operador não possui senha de assinatura cadastrada"));

        return passwordEncoder.matches(senhaAssinatura, assinatura.getSenhaAssinaturaHash());
    }

    /**
     * Assina uma atividade de enfermagem
     * @param operadorId ID do operador
     * @param atividadeId ID da atividade
     * @param senhaAssinatura Senha de assinatura (texto plano)
     * @param ipAddress IP do operador
     * @param coren COREN do operador
     * @return AssinaturaDigital criada
     * @throws IllegalArgumentException se senha inválida
     */
    @Transactional
    public AssinaturaDigital assinarAtividade(Long operadorId, Long atividadeId, 
                                               String senhaAssinatura, String ipAddress, String coren) {
        // Validar senha de assinatura
        if (!validarSenhaAssinatura(operadorId, senhaAssinatura)) {
            throw new IllegalArgumentException("Senha de assinatura inválida");
        }

        // Buscar senha hash do operador
        AssinaturaDigital senhaOperador = assinaturaDigitalRepository.findByOperadorId(operadorId)
                .orElseThrow(() -> new IllegalStateException("Senha de assinatura não encontrada"));

        // Criar registro de assinatura
        AssinaturaDigital assinatura = AssinaturaDigital.builder()
                .operadorId(operadorId)
                .senhaAssinaturaHash(senhaOperador.getSenhaAssinaturaHash())
                .dataHoraAssinatura(LocalDateTime.now())
                .ipAddress(ipAddress)
                .atividadeEnfermagemId(atividadeId)
                .corenOperador(coren)
                .build();

        return assinaturaDigitalRepository.save(assinatura);
    }

    /**
     * Verifica se operador tem senha de assinatura cadastrada
     * @param operadorId ID do operador
     * @return true se tem, false caso contrário
     */
    public boolean temSenhaAssinaturaCadastrada(Long operadorId) {
        return assinaturaDigitalRepository.findByOperadorId(operadorId).isPresent();
    }

    /**
     * Busca assinatura por atividade
     * @param atividadeId ID da atividade
     * @return Optional com a assinatura
     */
    public Optional<AssinaturaDigital> buscarPorAtividade(Long atividadeId) {
        return assinaturaDigitalRepository.findByAtividadeEnfermagemId(atividadeId);
    }

    /**
     * Busca senha de assinatura por operador
     * @param operadorId ID do operador
     * @return Optional com a assinatura
     */
    public Optional<AssinaturaDigital> buscarPorOperador(Long operadorId) {
        return assinaturaDigitalRepository.findByOperadorId(operadorId);
    }

    /**
     * Atualiza senha de assinatura de um operador
     * @param operadorId ID do operador
     * @param novaSenha Nova senha (texto plano)
     * @return AssinaturaDigital atualizada
     */
    @Transactional
    public AssinaturaDigital atualizarSenhaAssinatura(Long operadorId, String novaSenha) {
        AssinaturaDigital assinatura = assinaturaDigitalRepository.findByOperadorId(operadorId)
                .orElseThrow(() -> new IllegalStateException(
                        "Operador não possui senha de assinatura cadastrada"));

        // Hash da nova senha
        String novaSenhaHash = passwordEncoder.encode(novaSenha);
        assinatura.setSenhaAssinaturaHash(novaSenhaHash);

        return assinaturaDigitalRepository.save(assinatura);
    }
}