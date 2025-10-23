package com.sistemadesaude.backend.configuracoes.mapper;

import com.sistemadesaude.backend.configuracoes.dto.ConfiguracaoDTO;
import com.sistemadesaude.backend.configuracoes.entity.Configuracao;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Classe responsável por mapear entre entidade Configuracao e DTO ConfiguracaoDTO
 */
@Component
public class ConfiguracaoMapper {

    /**
     * Converte entidade para DTO
     * @param configuracao Entidade a ser convertida
     * @return DTO resultante
     */
    public ConfiguracaoDTO toDTO(Configuracao configuracao) {
        if (configuracao == null) {
            return null;
        }

        return ConfiguracaoDTO.builder()
                .chave(configuracao.getChave())
                .valor(configuracao.getValor())
                .descricao(configuracao.getDescricao())
                .grupo(configuracao.getGrupo())
                .tipo(configuracao.getTipo())
                .editavel(configuracao.isEditavel()) // CORREÇÃO: Usar isEditavel() para o tipo boolean
                .valoresPossiveis(configuracao.getValoresPossiveis())
                .dataCriacao(configuracao.getDataCriacao())
                .dataAtualizacao(configuracao.getDataAtualizacao())
                .criadoPor(configuracao.getCriadoPor())
                .atualizadoPor(configuracao.getAtualizadoPor())
                .build();
    }

    /**
     * Converte DTO para entidade
     * @param dto DTO a ser convertido
     * @return Entidade resultante
     */
    public Configuracao toEntity(ConfiguracaoDTO dto) {
        if (dto == null) {
            return null;
        }

        return Configuracao.builder()
                .chave(dto.getChave())
                .valor(dto.getValor())
                .descricao(dto.getDescricao())
                .grupo(dto.getGrupo())
                .tipo(dto.getTipo())
                .editavel(dto.getEditavel())
                .valoresPossiveis(dto.getValoresPossiveis())
                .criadoPor(dto.getCriadoPor())
                .atualizadoPor(dto.getAtualizadoPor())
                .build();
    }

    /**
     * Atualiza entidade existente com dados do DTO
     * @param entidade Entidade a ser atualizada
     * @param dto DTO com novos dados
     * @return Entidade atualizada
     */
    public Configuracao updateEntityFromDTO(Configuracao entidade, ConfiguracaoDTO dto) {
        if (dto == null) {
            return entidade;
        }

        // Não atualizamos a chave, pois é o identificador
        entidade.setValor(dto.getValor());

        // Atualizamos outros campos apenas se não forem nulos
        if (dto.getDescricao() != null) {
            entidade.setDescricao(dto.getDescricao());
        }

        if (dto.getGrupo() != null) {
            entidade.setGrupo(dto.getGrupo());
        }

        if (dto.getTipo() != null) {
            entidade.setTipo(dto.getTipo());
        }

        if (dto.getEditavel() != null) {
            entidade.setEditavel(dto.getEditavel());
        }

        if (dto.getValoresPossiveis() != null) {
            entidade.setValoresPossiveis(dto.getValoresPossiveis());
        }

        if (dto.getAtualizadoPor() != null) {
            entidade.setAtualizadoPor(dto.getAtualizadoPor());
        }

        return entidade;
    }

    /**
     * Converte lista de entidades para lista de DTOs
     * @param configuracoes Lista de entidades
     * @return Lista de DTOs
     */
    public List<ConfiguracaoDTO> toDTOList(List<Configuracao> configuracoes) {
        if (configuracoes == null) {
            return List.of();
        }

        return configuracoes.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Converte lista de DTOs para lista de entidades
     * @param dtos Lista de DTOs
     * @return Lista de entidades
     */
    public List<Configuracao> toEntityList(List<ConfiguracaoDTO> dtos) {
        if (dtos == null) {
            return List.of();
        }

        return dtos.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());
    }
}
