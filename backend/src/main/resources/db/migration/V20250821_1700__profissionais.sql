-- Criação das tabelas do módulo de Profissionais
-- Ajuste o horário/sufixo se houver outra migração com mesmo prefixo

CREATE TABLE IF NOT EXISTS profissionais (
                                             id BIGSERIAL PRIMARY KEY,
                                             nome VARCHAR(255) NOT NULL,
    tipo_cadastro VARCHAR(20) NOT NULL,
    sexo VARCHAR(20) NOT NULL,
    data_nascimento DATE,
    nome_mae VARCHAR(180),
    nome_pai VARCHAR(180),
    cns VARCHAR(20),
    nacionalidade VARCHAR(80),
    municipio_nascimento VARCHAR(120),
    data_chegada_pais DATE,
    naturalizado BOOLEAN,
    portaria_naturalizacao VARCHAR(60),
    raca_cor VARCHAR(20),
    etnia VARCHAR(80),
    permite_solicitar_insumos BOOLEAN,
    permite_solicitar_exames BOOLEAN,
    profissionalvisa BOOLEAN,
    telefone VARCHAR(30),
    email VARCHAR(120),
    data_atualizacao_cnes DATE,
    ativo BOOLEAN,

    -- Endereco (embeddable)
    logradouro VARCHAR(180),
    numero VARCHAR(20),
    complemento VARCHAR(60),
    bairro VARCHAR(120),
    municipio VARCHAR(120),
    uf VARCHAR(2),
    cep VARCHAR(12),

    -- Documentos (embeddable)
    cpf VARCHAR(14),
    rg_numero VARCHAR(30),
    rg_orgao_emissor VARCHAR(20),
    rg_uf VARCHAR(2),
    rg_data_emissao DATE,
    pis_pasep VARCHAR(20),
    ctps_numero VARCHAR(20),
    ctps_serie VARCHAR(20),
    ctps_uf VARCHAR(2),
    titulo_eleitor VARCHAR(20),

    criado_em TIMESTAMP,
    atualizado_em TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS profissional_registros_conselho (
                                                               id BIGSERIAL PRIMARY KEY,
                                                               conselho VARCHAR(20) NOT NULL,
    numero_registro VARCHAR(50) NOT NULL,
    uf VARCHAR(2),
    profissional_id BIGINT NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS profissional_especialidades (
                                                           id BIGSERIAL PRIMARY KEY,
                                                           codigo VARCHAR(30),
    nome VARCHAR(180),
    padrao BOOLEAN,
    profissional_id BIGINT NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS profissional_vinculos_unidade (
                                                             id BIGSERIAL PRIMARY KEY,
                                                             profissional_id BIGINT NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
    unidade_id BIGINT NOT NULL REFERENCES unidades_saude(id),
    setor VARCHAR(120),
    cargo VARCHAR(120),
    funcao VARCHAR(120),
    empregador_cnpj VARCHAR(18),
    telefone_comercial VARCHAR(30),
    ramal VARCHAR(10),
    turno VARCHAR(40),
    ativo BOOLEAN
    );

-- Índices úteis
-- Nota: A tabela já existe na baseline com a coluna 'nome' (não 'nome_completo')
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profissionais_nome') THEN
        CREATE INDEX idx_profissionais_nome ON profissionais (nome);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profissionais_cpf') THEN
        CREATE INDEX idx_profissionais_cpf ON profissionais (cpf);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profissionais_cns') THEN
        CREATE INDEX idx_profissionais_cns ON profissionais (cns);
    END IF;
END $$;
