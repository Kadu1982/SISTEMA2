-- Adiciona campos que estavam faltando na tabela atendimentos
ALTER TABLE atendimentos
    ADD COLUMN IF NOT EXISTS diagnostico TEXT,
    ADD COLUMN IF NOT EXISTS medicamentos_prescritos TEXT,
    ADD COLUMN IF NOT EXISTS orientacoes TEXT,
    ADD COLUMN IF NOT EXISTS retorno TEXT,
    ADD COLUMN IF NOT EXISTS observacoes_internas TEXT;

-- Comentário para os campos que foram adicionados
COMMENT ON COLUMN atendimentos.diagnostico IS 'Hipótese diagnóstica do atendimento';
COMMENT ON COLUMN atendimentos.medicamentos_prescritos IS 'Medicamentos prescritos no atendimento';
COMMENT ON COLUMN atendimentos.orientacoes IS 'Orientações dadas ao paciente';
COMMENT ON COLUMN atendimentos.retorno IS 'Orientações sobre retorno';
COMMENT ON COLUMN atendimentos.observacoes_internas IS 'Observações internas do profissional';