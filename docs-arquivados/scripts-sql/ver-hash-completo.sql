-- Ver hash completo e comparar
SELECT
    id,
    login,
    nome,
    senha as hash_completo,
    LENGTH(senha) as tamanho,
    CASE
        WHEN senha = '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG'
        THEN 'HASH ESPERADO - CORRETO'
        ELSE 'HASH DIFERENTE - ERRADO'
    END as status
FROM operador
WHERE login = 'admin.master';
