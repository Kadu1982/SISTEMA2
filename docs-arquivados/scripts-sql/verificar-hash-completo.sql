-- Ver o hash completo da senha atual no banco
SELECT
    id,
    login,
    nome,
    ativo,
    is_master,
    senha as hash_atual,
    LENGTH(senha) as tamanho_hash
FROM operador
WHERE login = 'admin.master';

-- Comparar com o hash esperado
SELECT
    CASE
        WHEN senha = '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG'
        THEN 'HASH CORRETO'
        ELSE 'HASH DIFERENTE'
    END as status_hash
FROM operador
WHERE login = 'admin.master';
