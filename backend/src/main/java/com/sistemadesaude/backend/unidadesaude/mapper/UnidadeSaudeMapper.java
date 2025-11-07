package com.sistemadesaude.backend.unidadesaude.mapper;

import com.sistemadesaude.backend.unidadesaude.dto.UnidadeSaudeDTO;
import com.sistemadesaude.backend.unidadesaude.entity.UnidadeSaude;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Mapper para conversão entre UnidadeSaude e UnidadeSaudeDTO
 * Utiliza MapStruct para geração automática das implementações
 */
@Mapper(componentModel = "spring")
public interface UnidadeSaudeMapper {

    /**
     * Converte entidade UnidadeSaude para DTO completo
     * Os campos calculados são mapeados através de expressões
     */
    @Named("toDTO")
    @Mapping(target = "tipoDescricao", expression = "java(getTipoDescricao(entity))")
    @Mapping(target = "enderecoCompleto", expression = "java(buildEnderecoCompleto(entity))")
    @Mapping(target = "perfisPermitidos", expression = "java(convertSetToStringList(entity.getPerfisPermitidos()))")
    UnidadeSaudeDTO toDTO(UnidadeSaude entity);
    
    /**
     * Método auxiliar para obter descrição do tipo de forma segura
     */
    default String getTipoDescricao(UnidadeSaude entity) {
        try {
            if (entity == null || entity.getTipo() == null) {
                return null;
            }
            return entity.getTipo().getDescricao();
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Converte lista de entidades para lista de DTOs completos
     */
    @Named("toDTOList")
    List<UnidadeSaudeDTO> toDTOList(List<UnidadeSaude> entities);

    /**
     * Converte DTO para entidade UnidadeSaude
     * Ignora campos de auditoria que são gerenciados automaticamente
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    @Mapping(target = "documentos", ignore = true)
    @Mapping(target = "perfisPermitidos", expression = "java(convertStringListToSet(dto.getPerfisPermitidos()))")
    @Mapping(target = "ativa", expression = "java(dto.getAtiva() != null ? dto.getAtiva() : true)")
    UnidadeSaude toEntity(UnidadeSaudeDTO dto);

    /**
     * Atualiza entidade existente com dados do DTO
     * Preserva ID e dados de auditoria da criação
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    @Mapping(target = "criadoPor", ignore = true)
    @Mapping(target = "documentos", ignore = true)
    @Mapping(target = "perfisPermitidos", expression = "java(dto.getPerfisPermitidos() != null ? convertStringListToSet(dto.getPerfisPermitidos()) : entity.getPerfisPermitidos())")
    @Mapping(target = "ativa", expression = "java(dto.getAtiva() != null ? dto.getAtiva() : entity.getAtiva())")
    void updateEntityFromDTO(@MappingTarget UnidadeSaude entity, UnidadeSaudeDTO dto);

    /**
     * Converte entidade para DTO resumido (apenas campos essenciais)
     * Útil para listagens ou seleções
     */
    @Named("toDTOResumido")
    @Mapping(target = "endereco", ignore = true)
    @Mapping(target = "cep", ignore = true)
    @Mapping(target = "telefone", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "horarioFuncionamento", ignore = true)
    @Mapping(target = "gestorResponsavel", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    @Mapping(target = "criadoPor", ignore = true)
    @Mapping(target = "atualizadoPor", ignore = true)
    @Mapping(target = "documentos", ignore = true)
    @Mapping(target = "tipoDescricao", expression = "java(getTipoDescricao(entity))")
    @Mapping(target = "enderecoCompleto", expression = "java(buildEnderecoResumido(entity))")
    UnidadeSaudeDTO toDTOResumido(UnidadeSaude entity);

    /**
     * Converte lista de entidades para lista de DTOs resumidos
     */
    @Named("toDTOResumidoList")
    List<UnidadeSaudeDTO> toDTOResumidoList(List<UnidadeSaude> entities);

    /**
     * Método auxiliar para construir endereço completo
     * Utilizado nas expressões de mapeamento
     */
    default String buildEnderecoCompleto(UnidadeSaude entity) {
        try {
            if (entity == null) return null;

            StringBuilder sb = new StringBuilder();

            if (entity.getEndereco() != null && !entity.getEndereco().trim().isEmpty()) {
                sb.append(entity.getEndereco());
            }

            if (entity.getCidade() != null && !entity.getCidade().trim().isEmpty()) {
                if (sb.length() > 0) sb.append(", ");
                sb.append(entity.getCidade());
            }

            if (entity.getEstado() != null && !entity.getEstado().trim().isEmpty()) {
                if (sb.length() > 0) sb.append(" - ");
                String estado = entity.getEstado().trim();
                sb.append(estado.length() == 2 ? estado.toUpperCase() : estado);
            }

            if (entity.getCep() != null && !entity.getCep().trim().isEmpty()) {
                if (sb.length() > 0) sb.append(" - CEP: ");
                String cepRaw = entity.getCep();
                StringBuilder digits = new StringBuilder();
                for (int i = 0; i < cepRaw.length(); i++) {
                    char c = cepRaw.charAt(i);
                    if (Character.isDigit(c)) digits.append(c);
                }
                String cep = digits.toString();
                if (cep.length() == 8) {
                    sb.append(cep.substring(0, 5)).append("-").append(cep.substring(5));
                } else {
                    sb.append(cep);
                }
            }

            return sb.length() > 0 ? sb.toString() : null;
        } catch (Exception e) {
            // Em caso de erro, retorna null para não quebrar o mapeamento
            return null;
        }
    }

    /**
     * Método auxiliar para construir endereço resumido (apenas cidade e estado)
     */
    default String buildEnderecoResumido(UnidadeSaude entity) {
        if (entity == null) return null;

        StringBuilder sb = new StringBuilder();

        if (entity.getCidade() != null && !entity.getCidade().trim().isEmpty()) {
            sb.append(entity.getCidade());
        }

        if (entity.getEstado() != null && !entity.getEstado().trim().isEmpty()) {
            if (sb.length() > 0) sb.append(" - ");
            String estado = entity.getEstado().trim();
            sb.append(estado.length() == 2 ? estado.toUpperCase() : estado);
        }

        return sb.length() > 0 ? sb.toString() : null;
    }

    /**
     * Converte Set<String> para List<String>
     */
    @Named("setToStringList")
    default List<String> convertSetToStringList(Set<String> set) {
        try {
            if (set == null || set.isEmpty()) {
                return new ArrayList<>();
            }
            return new ArrayList<>(set);
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    /**
     * Converte List<String> para Set<String>
     */
    @Named("stringListToSet")
    default Set<String> convertStringListToSet(List<String> list) {
        if (list == null || list.isEmpty()) {
            return new HashSet<>();
        }
        return new HashSet<>(list);
    }
}
