package com.sistemadesaude.backend.biometria.service;

import com.sistemadesaude.backend.biometria.model.Biometria;                  // ✅ pacote novo
import com.sistemadesaude.backend.biometria.repository.BiometriaRepository;   // ✅ pacote novo
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Serviço de Biometrias.
 * Mantive a mesma assinatura dos métodos já usados no seu projeto.
 */
@Service
public class BiometriaService {

    @Autowired
    private BiometriaRepository biometriaRepository;

    /** Lista biometrias de um operador, ordenadas por data de captura (desc). */
    public List<Biometria> listarPorOperador(Long operadorId) {
        return biometriaRepository.findByOperadorIdOrderByDataCapturaDesc(operadorId);
    }

    /** Busca uma biometria por ID. */
    public Biometria buscarPorId(Long id) {
        return biometriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Biometria não encontrada"));
    }
}
