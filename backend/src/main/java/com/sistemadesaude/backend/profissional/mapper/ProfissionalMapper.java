package com.sistemadesaude.backend.profissional.mapper;

import com.sistemadesaude.backend.profissional.dto.*;
import com.sistemadesaude.backend.profissional.entity.*;
import org.mapstruct.*;
import java.util.List;

/**
 * Mapper MapStruct para conversão entre entidades e DTOs.
 * Observação: os relacionamentos @ManyToOne para UnidadeSaude serão resolvidos no Service.
 */
@Mapper(componentModel = "spring")
public interface ProfissionalMapper {

    // --------- Profissional <-> DTO ---------
    @Mapping(target = "registrosConselho", source = "registrosConselho")
    @Mapping(target = "especialidades", source = "especialidades")
    @Mapping(target = "vinculos", source = "vinculos")
    ProfissionalDTO toDTO(Profissional entity);

    @InheritInverseConfiguration
    Profissional toEntity(ProfissionalDTO dto);

    // --------- Embeddables ---------
    EnderecoDTO toDTO(EnderecoProfissional e);
    EnderecoProfissional toEntity(EnderecoDTO e);

    DocumentosDTO toDTO(DocumentosProfissional d);
    DocumentosProfissional toEntity(DocumentosDTO d);

    // --------- Filhos ---------
    RegistroConselhoDTO toDTO(RegistroConselho e);
    RegistroConselho toEntity(RegistroConselhoDTO d);

    ProfissionalEspecialidadeDTO toDTO(ProfissionalEspecialidade e);
    ProfissionalEspecialidade toEntity(ProfissionalEspecialidadeDTO d);

    @Mapping(target = "unidadeNome", source = "unidade.nome")
    @Mapping(target = "unidadeId", source = "unidade.id")
    VinculoProfissionalUnidadeDTO toDTO(VinculoProfissionalUnidade e);

    // IMPORTANTE: unidade (ManyToOne) será resolvida no service
    @Mapping(target = "unidade", ignore = true)
    VinculoProfissionalUnidade toEntity(VinculoProfissionalUnidadeDTO d);

    // Listas
    List<RegistroConselhoDTO> toDTORegistros(List<RegistroConselho> list);
    List<RegistroConselho> toEntityRegistros(List<RegistroConselhoDTO> list);

    List<ProfissionalEspecialidadeDTO> toDTOEspecialidades(List<ProfissionalEspecialidade> list);
    List<ProfissionalEspecialidade> toEntityEspecialidades(List<ProfissionalEspecialidadeDTO> list);

    List<VinculoProfissionalUnidadeDTO> toDTOVinculos(List<VinculoProfissionalUnidade> list);
    List<VinculoProfissionalUnidade> toEntityVinculos(List<VinculoProfissionalUnidadeDTO> list);
}
