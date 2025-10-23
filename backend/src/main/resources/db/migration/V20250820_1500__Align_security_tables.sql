-- Garante que a tabela de perfis tenha a coluna 'ativo', que estava faltando e causando erros.
-- A cláusula 'IF NOT EXISTS' garante que o script não falhará se a coluna já tiver sido adicionada manualmente.
ALTER TABLE public.perfis
    ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT true;

-- Garante que a tabela de junção entre operadores e perfis use um ID de perfil (BIGINT),
-- que é a prática padrão para chaves estrangeiras, em vez de uma string.
-- Esta seção assume que a tabela pode precisar de recriação para corrigir o tipo de dado.
-- Se você já tem dados nesta tabela, um script de migração de dados seria necessário.
DROP TABLE IF EXISTS public.operador_perfis;
CREATE TABLE public.operador_perfis (
                                        operador_id BIGINT NOT NULL,
                                        perfil_id BIGINT NOT NULL,
                                        PRIMARY KEY (operador_id, perfil_id),
                                        CONSTRAINT fk_operador_to_perfis FOREIGN KEY (operador_id) REFERENCES public.operadores(id) ON DELETE CASCADE,
                                        CONSTRAINT fk_perfil_to_operadores FOREIGN KEY (perfil_id) REFERENCES public.perfis(id) ON DELETE CASCADE
);

-- Adiciona a coluna 'is_master' na tabela de operadores, caso ela não exista.
ALTER TABLE public.operadores
    ADD COLUMN IF NOT EXISTS is_master BOOLEAN NOT NULL DEFAULT false;
