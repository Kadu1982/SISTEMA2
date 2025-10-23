package com.sistemadesaude.backend.upa.config;

import jakarta.persistence.*;
import lombok.*;

/** Configurações do módulo UPA (estrutura mínima conforme manual). */
@Entity
@Table(name = "upa_config")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UpaConfiguracao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Exibir CID com descrição completa (true) ou reduzida (false)
    @Builder.Default
    private Boolean exibirCidCompleta = false;

    // Sugerir complemento/endereço no módulo UPA
    @Builder.Default
    private Boolean sugerirEnderecoUPA = true;

    // Habilitar uso de Classificação de Risco na triagem
    @Builder.Default
    private Boolean usarClassifRisco = true;

    // Protocolo de risco padrão (texto livre)
    private String protocoloRiscoPadrao;
}
