-- Dados básicos do operador
SELECT 'DADOS BASICOS DO OPERADOR' as secao;
SELECT id, login, nome, cargo, cpf, ativo, is_master, unidade_saude_id, data_criacao
FROM operador
WHERE login = 'operador.teste' OR nome ILIKE '%Ana Paula%';

-- Perfis associados
SELECT 'PERFIS ASSOCIADOS' as secao;
SELECT o.login, p.tipo AS perfil_tipo, p.nome AS perfil_nome
FROM operador o
LEFT JOIN operador_perfis op ON o.id = op.operador_id
LEFT JOIN perfis p ON op.perfil_id = p.id
WHERE o.login = 'operador.teste' OR o.nome ILIKE '%Ana Paula%';

-- Módulos disponíveis
SELECT 'MODULOS DISPONIVEIS' as secao;
SELECT o.login, p.tipo AS perfil_tipo, pam.modulo
FROM operador o
LEFT JOIN operador_perfis op ON o.id = op.operador_id
LEFT JOIN perfis p ON op.perfil_id = p.id
LEFT JOIN perfil_acesso_modulos pam ON p.id = pam.perfil_id
WHERE o.login = 'operador.teste' OR o.nome ILIKE '%Ana Paula%';

-- Verificar se perfil ENFERMEIRO tem UPA
SELECT 'PERFIL ENFERMEIRO TEM UPA?' as secao;
SELECT p.tipo, pam.modulo
FROM perfis p
LEFT JOIN perfil_acesso_modulos pam ON p.id = pam.perfil_id
WHERE p.tipo = 'ENFERMEIRO';
