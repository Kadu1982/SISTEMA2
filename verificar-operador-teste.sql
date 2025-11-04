-- Verificar se operador existe
SELECT
    'OPERADOR EXISTE?' as verificacao,
    id,
    login,
    nome,
    ativo,
    unidade_saude_id
FROM operador
WHERE login = 'operador.teste' OR nome ILIKE '%Ana Paula%';

-- Se não existir, mostrar isso
SELECT CASE
    WHEN (SELECT COUNT(*) FROM operador WHERE login = 'operador.teste' OR nome ILIKE '%Ana Paula%') = 0
    THEN '❌ OPERADOR NÃO EXISTE - Precisa executar o script de configuração!'
    ELSE '✅ OPERADOR EXISTE'
END as status;
