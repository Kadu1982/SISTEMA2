-- Corrige perfis com valores de 'tipo' inválidos no enum Perfil
-- Esses valores causam IllegalArgumentException no mapper e os perfis são ignorados

-- Perfis UPA que devem ser mapeados para os tipos base do enum
UPDATE perfis SET tipo = 'RECEPCIONISTA' WHERE tipo = 'UPA_RECEPCIONISTA';
UPDATE perfis SET tipo = 'ENFERMEIRO' WHERE tipo = 'UPA_ENFERMEIRO';
UPDATE perfis SET tipo = 'MEDICO' WHERE tipo = 'UPA_MEDICO';
UPDATE perfis SET tipo = 'TECNICO_ENFERMAGEM' WHERE tipo = 'UPA_TECNICO_ENFERMAGEM';

-- Perfis com nomes customizados que devem ser mapeados para os tipos base
UPDATE perfis SET tipo = 'ENFERMEIRO' WHERE tipo = 'Enfermeiro UPA';
UPDATE perfis SET tipo = 'DENTISTA' WHERE tipo = 'Dentista';
UPDATE perfis SET tipo = 'MEDICO' WHERE tipo = 'Médico UPA';
UPDATE perfis SET tipo = 'RECEPCIONISTA' WHERE tipo = 'Recepcionista UPA';

-- Perfil "UPA" genérico → mapeia para RECEPCIONISTA (pode ser ajustado se necessário)
UPDATE perfis SET tipo = 'RECEPCIONISTA' WHERE tipo = 'UPA';

-- Verifica se há outros valores inválidos e mapeia para tipos válidos baseado no nome
-- Usa apenas a coluna 'nome' pois 'nome_customizado' pode não existir em bancos antigos
UPDATE perfis 
SET tipo = 'ENFERMEIRO' 
WHERE tipo NOT IN ('ADMINISTRADOR_DO_SISTEMA', 'GESTOR', 'MEDICO', 'ENFERMEIRO', 'TRIAGEM', 
                   'DENTISTA', 'FARMACEUTICO', 'TECNICO_ENFERMAGEM', 'TECNICO_HIGIENE_DENTAL', 
                   'RECEPCIONISTA', 'USUARIO_SISTEMA', 'SAMU_OPERADOR', 'SAMU_REGULADOR')
  AND nome ILIKE '%ENFERMEIRO%';

UPDATE perfis 
SET tipo = 'MEDICO' 
WHERE tipo NOT IN ('ADMINISTRADOR_DO_SISTEMA', 'GESTOR', 'MEDICO', 'ENFERMEIRO', 'TRIAGEM', 
                   'DENTISTA', 'FARMACEUTICO', 'TECNICO_ENFERMAGEM', 'TECNICO_HIGIENE_DENTAL', 
                   'RECEPCIONISTA', 'USUARIO_SISTEMA', 'SAMU_OPERADOR', 'SAMU_REGULADOR')
  AND (nome ILIKE '%MÉDICO%' OR nome ILIKE '%MEDICO%');

UPDATE perfis 
SET tipo = 'DENTISTA' 
WHERE tipo NOT IN ('ADMINISTRADOR_DO_SISTEMA', 'GESTOR', 'MEDICO', 'ENFERMEIRO', 'TRIAGEM', 
                   'DENTISTA', 'FARMACEUTICO', 'TECNICO_ENFERMAGEM', 'TECNICO_HIGIENE_DENTAL', 
                   'RECEPCIONISTA', 'USUARIO_SISTEMA', 'SAMU_OPERADOR', 'SAMU_REGULADOR')
  AND nome ILIKE '%DENTISTA%';

UPDATE perfis 
SET tipo = 'RECEPCIONISTA' 
WHERE tipo NOT IN ('ADMINISTRADOR_DO_SISTEMA', 'GESTOR', 'MEDICO', 'ENFERMEIRO', 'TRIAGEM', 
                   'DENTISTA', 'FARMACEUTICO', 'TECNICO_ENFERMAGEM', 'TECNICO_HIGIENE_DENTAL', 
                   'RECEPCIONISTA', 'USUARIO_SISTEMA', 'SAMU_OPERADOR', 'SAMU_REGULADOR')
  AND nome ILIKE '%RECEPCIONISTA%';

-- Para qualquer perfil restante com tipo inválido, mapeia para USUARIO_SISTEMA
UPDATE perfis 
SET tipo = 'USUARIO_SISTEMA' 
WHERE tipo NOT IN ('ADMINISTRADOR_DO_SISTEMA', 'GESTOR', 'MEDICO', 'ENFERMEIRO', 'TRIAGEM', 
                   'DENTISTA', 'FARMACEUTICO', 'TECNICO_ENFERMAGEM', 'TECNICO_HIGIENE_DENTAL', 
                   'RECEPCIONISTA', 'USUARIO_SISTEMA', 'SAMU_OPERADOR', 'SAMU_REGULADOR');

