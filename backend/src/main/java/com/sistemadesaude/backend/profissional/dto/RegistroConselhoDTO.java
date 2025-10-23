package com.sistemadesaude.backend.profissional.dto;

import com.sistemadesaude.backend.profissional.enums.ConselhoProfissional;
import lombok.*;

@Getter @Setter @Builder
@AllArgsConstructor @NoArgsConstructor
public class RegistroConselhoDTO {
    public Long id;
    public ConselhoProfissional conselho;
    public String numeroRegistro;
    public String uf;
}
