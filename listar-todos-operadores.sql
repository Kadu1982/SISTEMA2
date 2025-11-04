-- Listar TODOS os operadores no banco
SELECT
    id,
    login,
    nome,
    cargo,
    ativo,
    is_master,
    unidade_saude_id,
    data_criacao
FROM operador
ORDER BY id;

-- Buscar especificamente por Ana Paula
SELECT
    id,
    login,
    nome,
    cargo,
    ativo
FROM operador
WHERE nome ILIKE '%Ana%' OR nome ILIKE '%Paula%';

-- Buscar por teste
SELECT
    id,
    login,
    nome,
    cargo,
    ativo
FROM operador
WHERE login ILIKE '%teste%';
