import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, UserPlus, FileText, MapPin, Settings, Building2, Stethoscope, Clock } from 'lucide-react';

import type { ProfissionalDTO, TipoCadastroProfissional, Sexo, RacaCor } from '@/types/Profissional';
import { salvarProfissional, atualizarProfissional, buscarProfissional } from '@/services/profissionalService';

// Listas simples (até ligarmos com lookups da API/tabelas de referência)
const TIPOS: TipoCadastroProfissional[] = ['COMPLETO', 'SIMPLIFICADO', 'EXTERNO'];
const SEXOS: Sexo[] = ['MASCULINO', 'FEMININO', 'NAO_INFORMADO'];
const RACA: RacaCor[] = ['BRANCA', 'PRETA', 'PARDA', 'AMARELA', 'INDIGENA', 'NAO_INFORMADA'];

type Props = {
    id?: number;          // se vier, carregamos para edição
    onSaved?: (p: ProfissionalDTO) => void;
};

const defaultProfissional: ProfissionalDTO = {
    nomeCompleto: '',
    tipoCadastro: 'COMPLETO',
    sexo: 'NAO_INFORMADO',
    ativo: true,
    endereco: {},
    documentos: {},
    registrosConselho: [],
    especialidades: [],
    vinculos: []
};

const CadastroProfissional: React.FC<Props> = ({ id, onSaved }) => {
    const [form, setForm] = useState<ProfissionalDTO>(defaultProfissional);
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        if (id) {
            buscarProfissional(id).then(setForm).catch(console.error);
        }
    }, [id]);

    const handleChange = (field: keyof ProfissionalDTO, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleEnderecoChange = (field: keyof NonNullable<ProfissionalDTO['endereco']>, value: string) => {
        setForm(prev => ({ ...prev, endereco: { ...(prev.endereco || {}), [field]: value } }));
    };

    const handleDocChange = (field: keyof NonNullable<ProfissionalDTO['documentos']>, value: string) => {
        setForm(prev => ({ ...prev, documentos: { ...(prev.documentos || {}), [field]: value } }));
    };

    const salvar = async () => {
        setSalvando(true);
        try {
            const payload = { ...form };
            const salvo = id ? await atualizarProfissional(id, payload) : await salvarProfissional(payload);
            setForm(salvo);
            onSaved?.(salvo);
        } catch (e) {
            console.error(e);
            alert('Erro ao salvar profissional. Verifique os campos obrigatórios e tente novamente.');
        } finally {
            setSalvando(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Cadastro de Profissional
                </CardTitle>
                <Button onClick={salvar} disabled={salvando} className="gap-2">
                    <Save className="w-4 h-4" />
                    {salvando ? 'Salvando...' : 'Salvar'}
                </Button>
            </CardHeader>

            <CardContent>
                <Tabs defaultValue="dados" className="w-full">
                    <TabsList className="grid grid-cols-4 md:grid-cols-8">
                        <TabsTrigger value="dados"><Stethoscope className="w-4 h-4 mr-1" />Profissional</TabsTrigger>
                        <TabsTrigger value="documentos"><FileText className="w-4 h-4 mr-1" />Documentos</TabsTrigger>
                        <TabsTrigger value="endereco"><MapPin className="w-4 h-4 mr-1" />Endereço</TabsTrigger>
                        <TabsTrigger value="complementares"><Settings className="w-4 h-4 mr-1" />Complementares</TabsTrigger>
                        <TabsTrigger value="especialidades"><Stethoscope className="w-4 h-4 mr-1" />Especialidades</TabsTrigger>
                        <TabsTrigger value="vinculos"><Building2 className="w-4 h-4 mr-1" />Vínculos</TabsTrigger>
                        <TabsTrigger value="faturamento" disabled>Faturamento</TabsTrigger>
                        <TabsTrigger value="horarios" disabled><Clock className="w-4 h-4 mr-1" />Horários</TabsTrigger>
                    </TabsList>

                    {/* Aba: Profissional */}
                    <TabsContent value="dados" className="pt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label>Nome completo *</Label>
                                <Input value={form.nomeCompleto} onChange={e => handleChange('nomeCompleto', e.target.value)} />
                            </div>

                            <div>
                                <Label>Tipo de Cadastro *</Label>
                                <select className="w-full border rounded p-2" value={form.tipoCadastro}
                                        onChange={e => handleChange('tipoCadastro', e.target.value as TipoCadastroProfissional)}>
                                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            <div>
                                <Label>Sexo *</Label>
                                <select className="w-full border rounded p-2" value={form.sexo}
                                        onChange={e => handleChange('sexo', e.target.value as Sexo)}>
                                    {SEXOS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div>
                                <Label>Data de Nascimento</Label>
                                <Input type="date" value={form.dataNascimento || ''} onChange={e => handleChange('dataNascimento', e.target.value)} />
                            </div>

                            <div>
                                <Label>Nome da mãe</Label>
                                <Input value={form.nomeMae || ''} onChange={e => handleChange('nomeMae', e.target.value)} />
                            </div>

                            <div>
                                <Label>Nome do pai</Label>
                                <Input value={form.nomePai || ''} onChange={e => handleChange('nomePai', e.target.value)} />
                            </div>

                            <div>
                                <Label>CNS</Label>
                                <Input value={form.cns || ''} onChange={e => handleChange('cns', e.target.value)} />
                            </div>

                            <div>
                                <Label>Nacionalidade</Label>
                                <Input value={form.nacionalidade || ''} onChange={e => handleChange('nacionalidade', e.target.value)} />
                            </div>

                            <div>
                                <Label>Município de nascimento</Label>
                                <Input value={form.municipioNascimento || ''} onChange={e => handleChange('municipioNascimento', e.target.value)} />
                            </div>

                            <div>
                                <Label>Chegada ao país</Label>
                                <Input type="date" value={form.dataChegadaPais || ''} onChange={e => handleChange('dataChegadaPais', e.target.value)} />
                            </div>

                            <div className="flex items-center gap-2 mt-6">
                                <Checkbox checked={!!form.naturalizado} onCheckedChange={c => handleChange('naturalizado', !!c)} />
                                <Label>Naturalizado</Label>
                            </div>

                            <div>
                                <Label>Portaria de naturalização</Label>
                                <Input value={form.portariaNaturalizacao || ''} onChange={e => handleChange('portariaNaturalizacao', e.target.value)} />
                            </div>

                            <div>
                                <Label>Raça/Cor</Label>
                                <select className="w-full border rounded p-2" value={form.racaCor || 'NAO_INFORMADA'}
                                        onChange={e => handleChange('racaCor', e.target.value as RacaCor)}>
                                    {RACA.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>

                            <div>
                                <Label>Etnia</Label>
                                <Input value={form.etnia || ''} onChange={e => handleChange('etnia', e.target.value)} />
                            </div>

                            <div className="flex items-center gap-2 mt-6">
                                <Checkbox checked={!!form.permiteSolicitarInsumos} onCheckedChange={c => handleChange('permiteSolicitarInsumos', !!c)} />
                                <Label>Permite solicitar insumos</Label>
                            </div>

                            <div className="flex items-center gap-2 mt-6">
                                <Checkbox checked={!!form.permiteSolicitarExames} onCheckedChange={c => handleChange('permiteSolicitarExames', !!c)} />
                                <Label>Permite solicitar exames</Label>
                            </div>

                            <div className="flex items-center gap-2 mt-6">
                                <Checkbox checked={!!form.profissionalVISA} onCheckedChange={c => handleChange('profissionalVISA', !!c)} />
                                <Label>Profissional da VISA</Label>
                            </div>

                            <div>
                                <Label>Telefone</Label>
                                <Input value={form.telefone || ''} onChange={e => handleChange('telefone', e.target.value)} />
                            </div>

                            <div>
                                <Label>E-mail</Label>
                                <Input type="email" value={form.email || ''} onChange={e => handleChange('email', e.target.value)} />
                            </div>

                            <div className="flex items-center gap-2 mt-6">
                                <Checkbox checked={!!form.ativo} onCheckedChange={c => handleChange('ativo', !!c)} />
                                <Label>Ativo</Label>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Aba: Documentos */}
                    <TabsContent value="documentos" className="pt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label>CPF</Label>
                                <Input value={form.documentos?.cpf || ''} onChange={e => handleDocChange('cpf', e.target.value)} />
                            </div>
                            <div>
                                <Label>RG - Número</Label>
                                <Input value={form.documentos?.rgNumero || ''} onChange={e => handleDocChange('rgNumero', e.target.value)} />
                            </div>
                            <div>
                                <Label>RG - Órgão Emissor</Label>
                                <Input value={form.documentos?.rgOrgaoEmissor || ''} onChange={e => handleDocChange('rgOrgaoEmissor', e.target.value)} />
                            </div>
                            <div>
                                <Label>RG - UF</Label>
                                <Input value={form.documentos?.rgUf || ''} onChange={e => handleDocChange('rgUf', e.target.value)} />
                            </div>
                            <div>
                                <Label>RG - Data Emissão</Label>
                                <Input type="date" value={form.documentos?.rgDataEmissao || ''} onChange={e => handleDocChange('rgDataEmissao', e.target.value)} />
                            </div>
                            <div>
                                <Label>PIS/PASEP</Label>
                                <Input value={form.documentos?.pisPasep || ''} onChange={e => handleDocChange('pisPasep', e.target.value)} />
                            </div>
                            <div>
                                <Label>CTPS - Número</Label>
                                <Input value={form.documentos?.ctpsNumero || ''} onChange={e => handleDocChange('ctpsNumero', e.target.value)} />
                            </div>
                            <div>
                                <Label>CTPS - Série</Label>
                                <Input value={form.documentos?.ctpsSerie || ''} onChange={e => handleDocChange('ctpsSerie', e.target.value)} />
                            </div>
                            <div>
                                <Label>CTPS - UF</Label>
                                <Input value={form.documentos?.ctpsUf || ''} onChange={e => handleDocChange('ctpsUf', e.target.value)} />
                            </div>
                            <div>
                                <Label>Título de Eleitor</Label>
                                <Input value={form.documentos?.tituloEleitor || ''} onChange={e => handleDocChange('tituloEleitor', e.target.value)} />
                            </div>
                        </div>
                    </TabsContent>

                    {/* Aba: Endereço */}
                    <TabsContent value="endereco" className="pt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label>Logradouro</Label>
                                <Input value={form.endereco?.logradouro || ''} onChange={e => handleEnderecoChange('logradouro', e.target.value)} />
                            </div>
                            <div>
                                <Label>Número</Label>
                                <Input value={form.endereco?.numero || ''} onChange={e => handleEnderecoChange('numero', e.target.value)} />
                            </div>
                            <div>
                                <Label>Complemento</Label>
                                <Input value={form.endereco?.complemento || ''} onChange={e => handleEnderecoChange('complemento', e.target.value)} />
                            </div>
                            <div>
                                <Label>Bairro</Label>
                                <Input value={form.endereco?.bairro || ''} onChange={e => handleEnderecoChange('bairro', e.target.value)} />
                            </div>
                            <div>
                                <Label>Município</Label>
                                <Input value={form.endereco?.municipio || ''} onChange={e => handleEnderecoChange('municipio', e.target.value)} />
                            </div>
                            <div>
                                <Label>UF</Label>
                                <Input value={form.endereco?.uf || ''} onChange={e => handleEnderecoChange('uf', e.target.value)} />
                            </div>
                            <div>
                                <Label>CEP</Label>
                                <Input value={form.endereco?.cep || ''} onChange={e => handleEnderecoChange('cep', e.target.value)} />
                            </div>
                        </div>
                    </TabsContent>

                    {/* Aba: Dados Complementares (placeholder inicial) */}
                    <TabsContent value="complementares" className="pt-4">
                        <p className="text-muted-foreground">
                            Nesta etapa futura adicionaremos: escolaridade, estado civil, dados bancários,
                            doador de órgãos, tipo sanguíneo/RH etc., conforme PDF. Estrutura de backend está preparada.
                        </p>
                    </TabsContent>

                    {/* Aba: Especialidades (placeholder inicial) */}
                    <TabsContent value="especialidades" className="pt-4">
                        <p className="text-muted-foreground">
                            Em breve: gestão de especialidades (N:N) com definição de "padrão"
                            e registros em conselho por especialidade. O backend já tem a coleção para gravar/ler.
                        </p>
                    </TabsContent>

                    {/* Aba: Vínculos (placeholder inicial) */}
                    <TabsContent value="vinculos" className="pt-4">
                        <p className="text-muted-foreground">
                            Em breve: vinculação do profissional às Unidades/Setores/Cargos/Turnos com seleção
                            de unidade (autocomplete pela sua API /unidades). Backend preparado.
                        </p>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

export default CadastroProfissional;
