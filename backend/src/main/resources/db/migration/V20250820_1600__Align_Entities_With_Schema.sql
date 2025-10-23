-- Adiciona colunas que faltam na tabela 'perfis' para corresponder a PerfilEntity.java
ALTER TABLE public.perfis
    ADD COLUMN IF NOT EXISTS tipo VARCHAR(255), -- Para o Enum Perfil
    ADD COLUMN IF NOT EXISTS nome_customizado VARCHAR(100),
    ADD COLUMN IF NOT EXISTS nivel_customizado INT;

-- Cria as tabelas de junção para os @ElementCollection se elas não existirem
-- Elas armazenam as listas de permissões e módulos de cada perfil.
CREATE TABLE IF NOT EXISTS public.perfil_acesso_permissoes (
                                                               perfil_id BIGINT NOT NULL,
                                                               permissao VARCHAR(255) NOT NULL,
    CONSTRAINT fk_perfil_permissoes FOREIGN KEY (perfil_id) REFERENCES public.perfis(id) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS public.perfil_acesso_modulos (
                                                            perfil_id BIGINT NOT NULL,
                                                            modulo VARCHAR(255) NOT NULL,
    CONSTRAINT fk_perfil_modulos FOREIGN KEY (perfil_id) REFERENCES public.perfis(id) ON DELETE CASCADE
    );