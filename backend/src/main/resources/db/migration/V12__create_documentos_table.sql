-- ========================================================
-- Migration V12: Create documentos table for PDF storage
-- ========================================================
-- CONFORME ISSUE: Criar migration para tabela documentos com campos:
-- id, tipo, paciente_id, caminho_arquivo, hash, created_at
--
-- Esta migration é IDEMPOTENTE e pode ser executada múltiplas vezes.
-- Estrutura alinhada com a entidade Documento.java

-- ========== CRIAR TABELA DOCUMENTOS ==========
CREATE TABLE IF NOT EXISTS documentos (
    -- Chave primária
    id BIGSERIAL PRIMARY KEY,
    
    -- Tipo do documento: ATESTADO, RECEITUARIO, COMPROVANTE
    tipo VARCHAR(20) NOT NULL,
    
    -- Referência ao paciente (FK)
    paciente_id BIGINT NOT NULL,
    
    -- Caminho do arquivo PDF no sistema de arquivos
    -- Ex: storage/documentos/atestado/2024/09/123.pdf
    caminho_arquivo VARCHAR(500) NOT NULL,
    
    -- Hash SHA-256 do conteúdo do PDF para integridade
    hash VARCHAR(64) NOT NULL,
    
    -- Nome original do arquivo sugerido para download
    nome_arquivo VARCHAR(200),
    
    -- Tamanho do arquivo em bytes
    tamanho_bytes BIGINT,
    
    -- Observações adicionais sobre o documento
    observacoes TEXT,
    
    -- Data de criação do documento (conforme issue)
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Flag de ativo (soft delete)
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- ========== CONSTRAINTS ==========
    
    -- FK para pacientes
    CONSTRAINT fk_documentos_paciente 
        FOREIGN KEY (paciente_id) REFERENCES pacientes (id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- Check constraint para tipo
    CONSTRAINT ck_documentos_tipo 
        CHECK (tipo IN ('ATESTADO', 'RECEITUARIO', 'COMPROVANTE')),
    
    -- Check constraint para hash (deve ter 64 caracteres hexadecimais)
    CONSTRAINT ck_documentos_hash 
        CHECK (hash ~ '^[a-fA-F0-9]{64}$'),
    
    -- Caminho do arquivo não pode estar vazio
    CONSTRAINT ck_documentos_caminho 
        CHECK (LENGTH(TRIM(caminho_arquivo)) > 0)
);

-- ========== ÍNDICES PARA PERFORMANCE ==========
-- Conforme especificado na entidade Documento.java

-- Índice para busca por paciente (mais usado)
CREATE INDEX IF NOT EXISTS idx_documentos_paciente 
    ON documentos (paciente_id);

-- Índice para busca por tipo
CREATE INDEX IF NOT EXISTS idx_documentos_tipo 
    ON documentos (tipo);

-- Índice para busca por data de criação
CREATE INDEX IF NOT EXISTS idx_documentos_created 
    ON documentos (created_at);

-- Índice composto para busca por paciente e tipo (otimização)
CREATE INDEX IF NOT EXISTS idx_documentos_paciente_tipo 
    ON documentos (paciente_id, tipo);

-- Índice para busca por hash (evitar duplicatas)
CREATE INDEX IF NOT EXISTS idx_documentos_hash 
    ON documentos (hash);

-- Índice para documentos ativos (soft delete)
CREATE INDEX IF NOT EXISTS idx_documentos_ativo 
    ON documentos (ativo);

-- Índice composto para busca eficiente de documentos ativos por paciente
CREATE INDEX IF NOT EXISTS idx_documentos_paciente_ativo_created 
    ON documentos (paciente_id, ativo, created_at DESC);

-- ========== COMENTÁRIOS NA TABELA ==========
COMMENT ON TABLE documentos IS 
'Tabela para armazenar metadados dos documentos PDF gerados no sistema. Conforme ISSUE: Persistir PDFs gerados para reimpressão com metadados completos.';

COMMENT ON COLUMN documentos.id IS 
'Chave primária autoincremental';

COMMENT ON COLUMN documentos.tipo IS 
'Tipo do documento: ATESTADO, RECEITUARIO, COMPROVANTE';

COMMENT ON COLUMN documentos.paciente_id IS 
'ID do paciente proprietário do documento';

COMMENT ON COLUMN documentos.caminho_arquivo IS 
'Caminho relativo do arquivo PDF: storage/documentos/{tipo}/{yyyy}/{MM}/{id}.pdf';

COMMENT ON COLUMN documentos.hash IS 
'Hash SHA-256 do conteúdo do PDF para verificação de integridade';

COMMENT ON COLUMN documentos.nome_arquivo IS 
'Nome sugerido para download do arquivo';

COMMENT ON COLUMN documentos.tamanho_bytes IS 
'Tamanho do arquivo PDF em bytes';

COMMENT ON COLUMN documentos.observacoes IS 
'Observações adicionais sobre o documento';

COMMENT ON COLUMN documentos.created_at IS 
'Data e hora de criação do documento (conforme especificado na issue)';

COMMENT ON COLUMN documentos.ativo IS 
'Flag para soft delete - TRUE = ativo, FALSE = inativo/removido';

-- ========== LOG DE EXECUÇÃO ==========
-- Inserir registro de execução da migration (opcional, para auditoria)
DO $$
BEGIN
    -- Log básico da execução
    RAISE NOTICE '✅ Migration V12 executada com sucesso: Tabela documentos criada';
    RAISE NOTICE '📊 Índices criados: paciente, tipo, created_at, hash, ativo';
    RAISE NOTICE '🔗 Foreign Key criada: fk_documentos_paciente';
    RAISE NOTICE '✅ Estrutura pronta para persistência de PDFs conforme issue';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Erro na migration V12: %', SQLERRM;
    RAISE;
END $$;