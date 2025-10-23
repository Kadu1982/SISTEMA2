-- V4: Condições de Saúde & Acompanhamentos por visita

CREATE TABLE IF NOT EXISTS sf_condicao_saude_visita (
    id BIGSERIAL PRIMARY KEY,
    visita_id BIGINT NOT NULL REFERENCES sf_visita_domiciliar(id) ON DELETE CASCADE,
    tipo VARCHAR(30) NOT NULL -- GESTANTE|HIPERTENSO|DIABETICO|HANSENIASE|TUBERCULOSE|DESNUTRICAO
);

-- Índices úteis para relatórios/consultas
CREATE INDEX IF NOT EXISTS idx_sf_csv_visita ON sf_condicao_saude_visita(visita_id);
CREATE INDEX IF NOT EXISTS idx_sf_csv_tipo ON sf_condicao_saude_visita(tipo);
