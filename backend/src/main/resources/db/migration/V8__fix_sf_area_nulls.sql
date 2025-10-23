-- Correção: Atualiza todos os valores NULL para FALSE antes de aplicar NOT NULL
UPDATE sf_area
SET atende_pop_geral = TRUE
WHERE atende_pop_geral IS NULL;

UPDATE sf_area
SET atende_assentados = FALSE
WHERE atende_assentados IS NULL;

UPDATE sf_area
SET atende_quilombolas = FALSE
WHERE atende_quilombolas IS NULL;

UPDATE sf_area
SET importacao_cnes = FALSE
WHERE importacao_cnes IS NULL;

-- Aplica as constraints NOT NULL
ALTER TABLE sf_area ALTER COLUMN atende_pop_geral SET NOT NULL;
ALTER TABLE sf_area ALTER COLUMN atende_assentados SET NOT NULL;
ALTER TABLE sf_area ALTER COLUMN atende_quilombolas SET NOT NULL;
ALTER TABLE sf_area ALTER COLUMN importacao_cnes SET NOT NULL;