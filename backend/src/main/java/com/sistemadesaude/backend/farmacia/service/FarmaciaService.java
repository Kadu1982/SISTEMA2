
package com.sistemadesaude.backend.farmacia.service;

import com.sistemadesaude.backend.farmacia.dto.FarmaciaDTO;

import java.util.List;
import java.util.Optional;

/**
 * Interface de serviço para operações relacionadas à Farmácia.
 */
public interface FarmaciaService {

    /**
     * Lista todas as farmácias
     * @return Lista de FarmaciaDTO
     */
    List<FarmaciaDTO> listarTodas();

    /**
     * Busca farmácia por ID
     * @param id ID da farmácia
     * @return Optional com FarmaciaDTO se encontrada
     */
    Optional<FarmaciaDTO> buscarPorId(Long id);

    /**
     * Salva uma farmácia
     * @param dto Dados da farmácia
     * @return FarmaciaDTO salva
     */
    FarmaciaDTO salvar(FarmaciaDTO dto);

    /**
     * Deleta uma farmácia
     * @param id ID da farmácia
     */
    void deletar(Long id);
}
