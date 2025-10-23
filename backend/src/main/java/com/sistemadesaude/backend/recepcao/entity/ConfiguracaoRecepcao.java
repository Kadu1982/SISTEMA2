package com.sistemadesaude.backend.recepcao.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class ConfiguracaoRecepcao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private boolean modoTotem = false;
    private boolean biometriaObrigatoria = true;
    private boolean validacaoDuplicatas = true;
    private boolean alertaRecemNascidos = true;
    private int tempoSessao = 30;
    private boolean identificacaoEmergencia = true;
}
