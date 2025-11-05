INSERT INTO perfis (tipo, nome, ativo, sistema_perfil, nome_customizado)
VALUES ('Médico ESF', 'Médico ESF', TRUE, FALSE, 'Médico ESF')
ON CONFLICT DO NOTHING;

SELECT * FROM perfis WHERE tipo = 'Médico ESF';
