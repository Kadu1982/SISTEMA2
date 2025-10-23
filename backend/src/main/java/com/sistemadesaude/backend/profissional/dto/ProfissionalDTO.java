package com.sistemadesaude.backend.profissional.dto;

import com.sistemadesaude.backend.profissional.enums.RacaCor;
import com.sistemadesaude.backend.profissional.enums.Sexo;
import com.sistemadesaude.backend.profissional.enums.TipoCadastroProfissional;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO principal trocado com o frontend.
 */
@Getter @Setter @Builder
@AllArgsConstructor @NoArgsConstructor
public class ProfissionalDTO {
    public Long id;

    // Aba "Profissional"
    public String nomeCompleto;
    public TipoCadastroProfissional tipoCadastro;
    public Sexo sexo;
    public LocalDate dataNascimento;
    public String nomeMae;
    public String nomePai;
    public String cns;
    public String nacionalidade;
    public String municipioNascimento;
    public LocalDate dataChegadaPais;
    public Boolean naturalizado;
    public String portariaNaturalizacao;
    public RacaCor racaCor;
    public String etnia;
    public Boolean permiteSolicitarInsumos;
    public Boolean permiteSolicitarExames;
    public Boolean profissionalVISA;
    public String telefone;
    public String email;
    public Boolean ativo;
    public LocalDate dataAtualizacaoCNES;

    // Subestruturas
    public EnderecoDTO endereco;
    public DocumentosDTO documentos;
    public List<RegistroConselhoDTO> registrosConselho;
    public List<ProfissionalEspecialidadeDTO> especialidades;
    public List<VinculoProfissionalUnidadeDTO> vinculos;
}
