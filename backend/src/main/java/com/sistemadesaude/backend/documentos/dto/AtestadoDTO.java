package com.sistemadesaude.backend.documentos.dto;

import lombok.Data;

/**
 * DTO ENXUTO para geração do Atestado.
 * Observação: mantemos apenas o necessário para o PDF. Paciente/profissional/unidade
 * podem ser recuperados por ID no controller (evitando payloads grandes do front).
 */
@Data
public class AtestadoDTO {

    public enum TipoAtestado { AFASTAMENTO, COMPARECIMENTO }

    // IDs para preenchimento automático (opcional)
    private Long pacienteId;
    private Long profissionalId;
    private Long unidadeId;

    // Identificação “avulsa” caso queira sobrepor (opcional)
    private String estabelecimentoNome;
    private String estabelecimentoCnpj;
    private String estabelecimentoEndereco;

    private TipoAtestado tipo;         // AFASTAMENTO ou COMPARECIMENTO
    private String motivo;             // texto livre (ex.: doença X) – impresso no corpo
    private Integer diasAfastamento;   // obrigatório quando AFASTAMENTO
    private String horaInicio;         // obrigatório quando COMPARECIMENTO (HH:mm)
    private String horaFim;            // obrigatório quando COMPARECIMENTO (HH:mm)

    private String cid;                // OPCIONAL
    private Boolean consentimentoCid;  // se true, imprime o CID

    // Local de emissão (opcional). Data/hora são adicionadas no service.
    private String municipio;
    private String uf;
}
