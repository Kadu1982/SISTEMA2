package com.sistemadesaude.backend.documentos.dto;

import lombok.Data;

import java.util.List;

/**
 * DTO do Receituário conforme o seu modelo de exemplo:
 * - Cabeçalho com Prefeitura/Fundação + Unidade
 * - Paciente (nome, CNS, endereço)
 * - Lista de itens com: nome (princípio ativo preferencial), dose, via, posologia, duração
 */
@Data
public class ReceituarioDTO {

    @Data
    public static class ItemReceita {
        private String nome;        // PREDNISOLONA 3mg/mL
        private String dose;        // ex.: 10 mL 1x/dia
        private String via;         // VO, VN etc.
        private String posologia;   // ex.: de 8/8h
        private String duracao;     // ex.: por 5 dias
        private String observacoes; // opcional
        private String quantidade;  // opcional: “frasco”, “7 und” etc.
    }

    private Long pacienteId;
    private Long profissionalId;
    private Long unidadeId;

    // Identificação do estabelecimento (opcional para sobrepor)
    private String estabelecimentoNome;
    private String estabelecimentoCnpj;
    private String unidadeNome;

    // Dados mínimos do paciente (caso não queira buscar por ID)
    private String pacienteNome;
    private String pacienteCns;
    private String pacienteEndereco;
    private String pacienteMunicipio;

    private List<ItemReceita> itens;
}
