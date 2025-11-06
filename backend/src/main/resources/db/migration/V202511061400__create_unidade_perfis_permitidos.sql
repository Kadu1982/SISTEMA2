-- Migration para criar a tabela de perfis permitidos por unidade
-- Esta tabela armazena quais perfis podem ter acesso a cada unidade de saúde

CREATE TABLE IF NOT EXISTS unidade_perfis_permitidos (
    unidade_id BIGINT NOT NULL,
    perfil_tipo VARCHAR(255) NOT NULL,
    PRIMARY KEY (unidade_id, perfil_tipo),
    CONSTRAINT fk_unidade_perfis_unidade FOREIGN KEY (unidade_id) 
        REFERENCES unidades_saude(id) ON DELETE CASCADE
);

-- Índice para melhorar performance nas consultas
CREATE INDEX IF NOT EXISTS idx_unidade_perfis_unidade_id ON unidade_perfis_permitidos(unidade_id);
CREATE INDEX IF NOT EXISTS idx_unidade_perfis_perfil_tipo ON unidade_perfis_permitidos(perfil_tipo);

