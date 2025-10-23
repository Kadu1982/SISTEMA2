// Tipos do cadastro de profissionais (alinhados ao DTO do backend)

export type Sexo = 'MASCULINO' | 'FEMININO' | 'NAO_INFORMADO';
export type RacaCor = 'BRANCA' | 'PRETA' | 'PARDA' | 'AMARELA' | 'INDIGENA' | 'NAO_INFORMADA';
export type TipoCadastroProfissional = 'COMPLETO' | 'SIMPLIFICADO' | 'EXTERNO';

export interface EnderecoDTO {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    municipio?: string;
    uf?: string;
    cep?: string;
}

export interface DocumentosDTO {
    cpf?: string;
    rgNumero?: string;
    rgOrgaoEmissor?: string;
    rgUf?: string;
    rgDataEmissao?: string; // ISO
    pisPasep?: string;
    ctpsNumero?: string;
    ctpsSerie?: string;
    ctpsUf?: string;
    tituloEleitor?: string;
}

export interface RegistroConselhoDTO {
    id?: number;
    conselho?: 'CRM' | 'COREN' | 'CRO' | 'CRP' | 'CRF' | 'CREFITO' | 'CREFONO' | 'CRBM' | 'CRN' | 'OUTRO';
    numeroRegistro?: string;
    uf?: string;
}

export interface ProfissionalEspecialidadeDTO {
    id?: number;
    codigo?: string;
    nome?: string;
    padrao?: boolean;
}

export interface VinculoProfissionalUnidadeDTO {
    id?: number;
    unidadeId?: number;
    unidadeNome?: string; // preenchido no GET
    setor?: string;
    cargo?: string;
    funcao?: string;
    empregadorCnpj?: string;
    telefoneComercial?: string;
    ramal?: string;
    turno?: string;
    ativo?: boolean;
}

export interface ProfissionalDTO {
    id?: number;

    // Aba Profissional
    nomeCompleto: string;
    tipoCadastro: TipoCadastroProfissional;
    sexo: Sexo;
    dataNascimento?: string; // ISO
    nomeMae?: string;
    nomePai?: string;
    cns?: string;
    nacionalidade?: string;
    municipioNascimento?: string;
    dataChegadaPais?: string; // ISO
    naturalizado?: boolean;
    portariaNaturalizacao?: string;
    racaCor?: RacaCor;
    etnia?: string;
    permiteSolicitarInsumos?: boolean;
    permiteSolicitarExames?: boolean;
    profissionalVISA?: boolean;
    telefone?: string;
    email?: string;
    ativo?: boolean;
    dataAtualizacaoCNES?: string; // ISO

    // Subestruturas
    endereco?: EnderecoDTO;
    documentos?: DocumentosDTO;
    registrosConselho?: RegistroConselhoDTO[];
    especialidades?: ProfissionalEspecialidadeDTO[];
    vinculos?: VinculoProfissionalUnidadeDTO[];
}
