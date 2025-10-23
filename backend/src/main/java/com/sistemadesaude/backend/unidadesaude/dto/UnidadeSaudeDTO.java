package com.sistemadesaude.backend.unidadesaude.dto;

import com.sistemadesaude.backend.unidadesaude.entity.TipoUnidadeSaude;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO para transferência de dados de Unidade de Saúde
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnidadeSaudeDTO {

    private Long id;

    @Size(max = 30)
    private String codigo;

    @Size(max = 200)
    private String razaoSocial;

    @Size(max = 200)
    private String nomeFantasia;

    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 200, message = "Nome deve ter no máximo 200 caracteres")
    private String nome;

    @Pattern(regexp = "\\d{14}", message = "CNPJ deve conter 14 dígitos numéricos")
    private String cnpj;

    @NotBlank(message = "Código CNES é obrigatório")
    @Pattern(regexp = "\\d{7}", message = "Código CNES deve ter 7 dígitos")
    private String codigoCnes;

    @NotNull(message = "Tipo da unidade é obrigatório")
    private TipoUnidadeSaude tipo;

    // Classificações
    @Size(max = 100)
    private String tipoEstabelecimento;
    @Size(max = 100)
    private String esferaAdministrativa;
    @Size(max = 100)
    private String atividadeGestao;
    @Size(max = 100)
    private String fluxoClientela;
    @Size(max = 100)
    private String turnosAtendimento;
    @Size(max = 100)
    private String naturezaOrganizacao;

    // Endereço detalhado
    @Size(max = 200)
    private String logradouro;
    @Size(max = 20)
    private String numero;
    @Size(max = 100)
    private String complemento;
    @Size(max = 100)
    private String bairro;
    @Size(max = 100)
    private String municipio;
    @Pattern(regexp = "^[A-Za-z]{2}$", message = "UF deve ter 2 letras")
    private String uf;

    @Size(max = 500, message = "Endereço deve ter no máximo 500 caracteres")
    private String endereco;

    @Pattern(regexp = "\\d{8}", message = "CEP deve ter 8 dígitos")
    private String cep;

    @Size(max = 100, message = "Cidade deve ter no máximo 100 caracteres")
    private String cidade;

    @Size(min = 2, max = 2, message = "Estado deve ter 2 caracteres")
    private String estado;

    @Size(max = 20, message = "Telefone deve ter no máximo 20 caracteres")
    private String telefone;

    @Email(message = "Email deve ser válido")
    @Size(max = 100, message = "Email deve ter no máximo 100 caracteres")
    private String email;

    private Boolean ativa;

    @Size(max = 200, message = "Horário de funcionamento deve ter no máximo 200 caracteres")
    private String horarioFuncionamento;

    @Size(max = 100, message = "Gestor responsável deve ter no máximo 100 caracteres")
    private String gestorResponsavel;

    // Documentos vinculados
    private List<DocumentoUnidadeDTO> documentos;

    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;
    private String criadoPor;
    private String atualizadoPor;

    // Campos calculados
    private String tipoDescricao;
    private String enderecoCompleto;

    // Métodos de conveniência
    public String getTipoDescricao() {
        return tipo != null ? tipo.getDescricao() : null;
    }

    public String getEnderecoCompleto() {
        StringBuilder sb = new StringBuilder();
        if (endereco != null) sb.append(endereco);
        if (cidade != null) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(cidade);
        }
        if (estado != null) {
            if (sb.length() > 0) sb.append(" - ");
            sb.append(estado);
        }
        if (cep != null) {
            if (sb.length() > 0) sb.append(" - ");
            sb.append(cep);
        }
        return sb.toString();
    }
}
