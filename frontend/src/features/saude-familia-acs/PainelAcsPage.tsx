import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import apiService from '@/services/apiService';

// Tipos básicos para evitar problemas de TypeScript
type AnyObj = Record<string, any>;

const PainelAcsPage: React.FC = () => {
    // Estados de dados
    const [mapa, setMapa] = useState<AnyObj | null>(null);
    const [rastreab, setRastreab] = useState<AnyObj | null>(null);
    const [visaoGeral, setVisaoGeral] = useState<AnyObj | null>(null);
    const [metas, setMetas] = useState<AnyObj | null>(null);
    const [infoGerais, setInfoGerais] = useState<AnyObj | null>(null);
    const [detalhamento, setDetalhamento] = useState<AnyObj | null>(null);
    const [acomp, setAcomp] = useState<AnyObj | null>(null);
    const [condicoes, setCondicoes] = useState<AnyObj | null>(null);
    const [dispositivos, setDispositivos] = useState<AnyObj | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Estados de filtros
    const [profissionalId, setProfissionalId] = useState('201');
    const [inicio, setInicio] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().slice(0, 10);
    });
    const [fim, setFim] = useState(() => new Date().toISOString().slice(0, 10));

    // Estados para detalhamento
    const [detAreaId, setDetAreaId] = useState('');
    const [detMicroId, setDetMicroId] = useState('');
    const [detProfId, setDetProfId] = useState('');
    const [detInicio, setDetInicio] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().slice(0, 10);
    });
    const [detFim, setDetFim] = useState(() => new Date().toISOString().slice(0, 10));

    const [acompTipo, setAcompTipo] = useState('GERAL');
    const [condicaoTipo, setCondicaoTipo] = useState('GESTANTE');

    // Carregamento inicial dos dados
    useEffect(() => {
        const carregarDadosIniciais = async () => {
            setLoading(true);
            setError(null);

            try {
                console.log('🔄 Carregando dados do painel...');

                // Primeiro teste se os endpoints estão funcionando
                const testResponse = await apiService.get('/saude-familia/painel/test');
                console.log('✅ Teste do painel:', testResponse.data);

                // Carrega dados básicos
                const [mapaRes, visaoRes, metasRes, infoRes, dispRes] = await Promise.allSettled([
                    apiService.get('/saude-familia/painel/mapa/areas'),
                    apiService.get('/saude-familia/painel/visao-geral'),
                    apiService.get('/saude-familia/painel/metas'),
                    apiService.get('/saude-familia/painel/info-gerais'),
                    apiService.get('/saude-familia/painel/dispositivos')
                ]);

                if (mapaRes.status === 'fulfilled') setMapa(mapaRes.value.data);
                if (visaoRes.status === 'fulfilled') setVisaoGeral(visaoRes.value.data);
                if (metasRes.status === 'fulfilled') setMetas(metasRes.value.data);
                if (infoRes.status === 'fulfilled') setInfoGerais(infoRes.value.data);
                if (dispRes.status === 'fulfilled') setDispositivos(dispRes.value.data);

                console.log('✅ Dados carregados com sucesso!');
            } catch (err) {
                console.error('❌ Erro ao carregar dados do painel:', err);
                setError('Erro ao carregar dados do painel. Verifique sua conexão.');
            } finally {
                setLoading(false);
            }
        };

        carregarDadosIniciais();
    }, []);

    // Função para carregar rastreabilidade
    const carregarRastreabilidade = async () => {
        try {
            setLoading(true);
            const resp = await apiService.get('/saude-familia/painel/rastreabilidade', {
                params: { profissionalId, inicio, fim }
            });
            setRastreab(resp.data);
        } catch (err) {
            setError('Erro ao carregar rastreabilidade');
            setRastreab(null);
        } finally {
            setLoading(false);
        }
    };

    // Função para carregar detalhamento
    const carregarDetalhamento = async () => {
        try {
            setLoading(true);
            const params: AnyObj = { inicio: detInicio, fim: detFim };
            if (detAreaId) params.areaId = detAreaId;
            if (detMicroId) params.microareaId = detMicroId;
            if (detProfId) params.profissionalId = detProfId;

            const resp = await apiService.get('/saude-familia/painel/detalhamento', { params });
            setDetalhamento(resp.data);
        } catch (err) {
            setError('Erro ao carregar detalhamento');
            setDetalhamento(null);
        } finally {
            setLoading(false);
        }
    };

    // Função para carregar acompanhamento
    const carregarAcompanhamento = async () => {
        try {
            setLoading(true);
            const resp = await apiService.get('/saude-familia/painel/acompanhamento', {
                params: { tipo: acompTipo }
            });
            setAcomp(resp.data);
        } catch (err) {
            setError('Erro ao carregar acompanhamento');
            setAcomp(null);
        } finally {
            setLoading(false);
        }
    };

    // Função para carregar condições
    const carregarCondicoes = async () => {
        try {
            setLoading(true);
            const resp = await apiService.get('/saude-familia/painel/condicoes', {
                params: { condicao: condicaoTipo }
            });
            setCondicoes(resp.data);
        } catch (err) {
            setError('Erro ao carregar condições');
            setCondicoes(null);
        } finally {
            setLoading(false);
        }
    };

    // Dados processados para exibição
    const dadosUsuariosPorArea = useMemo(() => {
        const arr = visaoGeral?.usuariosPorArea || [];
        return arr.map((x: AnyObj) => ({ name: x.area, total: x.total }));
    }, [visaoGeral]);

    const dadosMetas = useMemo(() => {
        if (!metas) return [] as AnyObj[];
        const itens: AnyObj[] = [];
        if (metas.familias) itens.push({
            tipo: 'Famílias',
            meta: metas.familias.meta,
            realizado: metas.familias.realizado,
            percentual: ((metas.familias.realizado / metas.familias.meta) * 100).toFixed(1)
        });
        if (metas.integrantes) itens.push({
            tipo: 'Integrantes',
            meta: metas.integrantes.meta,
            realizado: metas.integrantes.realizado,
            percentual: ((metas.integrantes.realizado / metas.integrantes.meta) * 100).toFixed(1)
        });
        if (metas.acompanhamento) itens.push({
            tipo: 'Acompanhamento',
            meta: metas.acompanhamento.meta,
            realizado: metas.acompanhamento.realizado,
            percentual: ((metas.acompanhamento.realizado / metas.acompanhamento.meta) * 100).toFixed(1)
        });
        return itens;
    }, [metas]);

    const dadosMotivos = useMemo(() => {
        const m = infoGerais?.motivosVisita || {};
        return Object.keys(m).map(k => ({ motivo: k, total: m[k] }));
    }, [infoGerais]);

    if (loading && !mapa) {
        return (
            <div className="container mx-auto py-6">
                <Card>
                    <CardContent className="flex items-center justify-center p-8">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p>Carregando dados do painel...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6">
            <Card className="mb-4">
                <CardHeader>
                    <CardTitle>🏥 Painel - Saúde da Família (ACS)</CardTitle>
                </CardHeader>
            </Card>

            {error && (
                <Alert className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Tabs defaultValue="mapa" className="w-full">
                <TabsList className="mb-4 flex flex-wrap">
                    <TabsTrigger value="mapa">📍 Mapa</TabsTrigger>
                    <TabsTrigger value="rastreabilidade">🔍 Rastreabilidade</TabsTrigger>
                    <TabsTrigger value="visao">📊 Visão Geral</TabsTrigger>
                    <TabsTrigger value="metas">🎯 Metas</TabsTrigger>
                    <TabsTrigger value="info">📋 Informações</TabsTrigger>
                    <TabsTrigger value="detalhamento">🔎 Detalhamento</TabsTrigger>
                    <TabsTrigger value="acompanhamento">👥 Acompanhamento</TabsTrigger>
                    <TabsTrigger value="condicoes">🏥 Condições</TabsTrigger>
                    <TabsTrigger value="dispositivos">📱 Dispositivos</TabsTrigger>
                </TabsList>

                {/* Tab Mapa */}
                <TabsContent value="mapa">
                    <Card>
                        <CardHeader>
                            <CardTitle>📍 Mapa de Áreas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600">
                                    Visualização das áreas cadastradas no sistema
                                </p>
                                <div className="grid gap-4">
                                    {(mapa?.areas || []).map((area: AnyObj) => (
                                        <Card key={area.id} className="p-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h3 className="font-semibold">{area.descricao}</h3>
                                                    <p className="text-sm text-gray-600">INE: {area.ine}</p>
                                                </div>
                                                <Badge variant="outline">
                                                    Lat: {area.centroid?.lat}, Lng: {area.centroid?.lng}
                                                </Badge>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab Rastreabilidade */}
                <TabsContent value="rastreabilidade">
                    <Card>
                        <CardHeader>
                            <CardTitle>🔍 Rastreabilidade</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                <Input
                                    placeholder="ID Profissional"
                                    value={profissionalId}
                                    onChange={e => setProfissionalId(e.target.value)}
                                />
                                <Input
                                    type="date"
                                    value={inicio}
                                    onChange={e => setInicio(e.target.value)}
                                />
                                <Input
                                    type="date"
                                    value={fim}
                                    onChange={e => setFim(e.target.value)}
                                />
                                <Button onClick={carregarRastreabilidade} disabled={loading}>
                                    {loading ? '...' : 'Carregar'}
                                </Button>
                            </div>

                            {rastreab && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold">Rota do Profissional ID: {rastreab.profissionalId}</h3>
                                    <div className="grid gap-2">
                                        {(rastreab.visitas || []).map((visita: AnyObj) => (
                                            <Card key={visita.id} className="p-3">
                                                <div className="flex justify-between items-center">
                                                    <span>Visita #{visita.id}</span>
                                                    <Badge variant={visita.desfecho === 'REALIZADA' ? 'default' : 'destructive'}>
                                                        {visita.desfecho}
                                                    </Badge>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab Visão Geral */}
                <TabsContent value="visao">
                    <Card>
                        <CardHeader>
                            <CardTitle>📊 Visão Geral</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold mb-3">Usuários por Área</h3>
                                    <div className="space-y-2">
                                        {dadosUsuariosPorArea.map((item: AnyObj) => (
                                            <div key={item.name} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                <span>{item.name}</span>
                                                <Badge>{item.total}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3">Microáreas</h3>
                                    <div className="space-y-2">
                                        {(visaoGeral?.usuariosPorMicroarea || []).map((item: AnyObj) => (
                                            <div key={item.microarea} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                                                <span>Microárea {item.microarea}</span>
                                                <Badge variant="outline">{item.total}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab Metas */}
                <TabsContent value="metas">
                    <Card>
                        <CardHeader>
                            <CardTitle>🎯 Metas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {dadosMetas.map((meta: AnyObj) => (
                                    <Card key={meta.tipo} className="p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-semibold">{meta.tipo}</h3>
                                            <Badge variant={Number(meta.percentual) >= 80 ? 'default' : 'secondary'}>
                                                {meta.percentual}%
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Realizado: {meta.realizado}</span>
                                            <span>Meta: {meta.meta}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${Math.min(Number(meta.percentual), 100)}%` }}
                                            />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab Informações */}
                <TabsContent value="info">
                    <Card>
                        <CardHeader>
                            <CardTitle>📋 Informações Gerais</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold mb-3">Estatísticas</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between p-3 bg-green-50 rounded">
                                            <span>Integrantes Visitados</span>
                                            <Badge variant="outline">{infoGerais?.integrantesVisitados || 0}</Badge>
                                        </div>
                                        <div className="flex justify-between p-3 bg-blue-50 rounded">
                                            <span>Busca Ativa</span>
                                            <Badge variant="outline">{infoGerais?.buscaAtiva || 0}</Badge>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3">Motivos de Visita</h3>
                                    <div className="space-y-2">
                                        {dadosMotivos.map((item: AnyObj) => (
                                            <div key={item.motivo} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                <span>{item.motivo}</span>
                                                <Badge>{item.total}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab Detalhamento */}
                <TabsContent value="detalhamento">
                    <Card>
                        <CardHeader>
                            <CardTitle>🔎 Detalhamento</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <Input
                                    placeholder="ID Área"
                                    value={detAreaId}
                                    onChange={e => setDetAreaId(e.target.value)}
                                />
                                <Input
                                    placeholder="ID Microárea"
                                    value={detMicroId}
                                    onChange={e => setDetMicroId(e.target.value)}
                                />
                                <Input
                                    placeholder="ID Profissional"
                                    value={detProfId}
                                    onChange={e => setDetProfId(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <Input
                                    type="date"
                                    value={detInicio}
                                    onChange={e => setDetInicio(e.target.value)}
                                />
                                <Input
                                    type="date"
                                    value={detFim}
                                    onChange={e => setDetFim(e.target.value)}
                                />
                                <Button onClick={carregarDetalhamento} disabled={loading}>
                                    {loading ? '...' : 'Filtrar'}
                                </Button>
                            </div>

                            {detalhamento && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold">Resultados da Busca</h3>
                                    <div className="grid gap-2">
                                        {(detalhamento.lista || []).map((item: AnyObj) => (
                                            <Card key={item.id} className="p-3">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <span className="font-medium">Visita #{item.id}</span>
                                                        <p className="text-sm text-gray-600">{item.dataHora}</p>
                                                    </div>
                                                    <Badge variant={item.desfecho === 'REALIZADA' ? 'default' : 'destructive'}>
                                                        {item.desfecho}
                                                    </Badge>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab Acompanhamento */}
                <TabsContent value="acompanhamento">
                    <Card>
                        <CardHeader>
                            <CardTitle>👥 Acompanhamento</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <select
                                    value={acompTipo}
                                    onChange={e => setAcompTipo(e.target.value)}
                                    className="p-2 border rounded"
                                >
                                    <option value="GERAL">Geral</option>
                                    <option value="GESTANTE">Gestantes</option>
                                    <option value="HIPERTENSO">Hipertensos</option>
                                    <option value="DIABETICO">Diabéticos</option>
                                </select>
                                <Button onClick={carregarAcompanhamento} disabled={loading}>
                                    {loading ? '...' : 'Carregar'}
                                </Button>
                            </div>

                            {acomp && (
                                <div>
                                    <h3 className="font-semibold mb-3">Acompanhamento - {acomp.tipo}</h3>
                                    <div className="grid gap-2">
                                        {(acomp.pontos || []).map((ponto: AnyObj, idx: number) => (
                                            <Card key={idx} className="p-3">
                                                <div className="flex justify-between items-center">
                                                    <span>Família #{ponto.familia}</span>
                                                    <Badge variant="outline">
                                                        {ponto.lat}, {ponto.lng}
                                                    </Badge>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab Condições */}
                <TabsContent value="condicoes">
                    <Card>
                        <CardHeader>
                            <CardTitle>🏥 Condições de Saúde</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <select
                                    value={condicaoTipo}
                                    onChange={e => setCondicaoTipo(e.target.value)}
                                    className="p-2 border rounded"
                                >
                                    <option value="GESTANTE">Gestante</option>
                                    <option value="HIPERTENSAO">Hipertensão</option>
                                    <option value="DIABETES">Diabetes</option>
                                    <option value="OUTROS">Outros</option>
                                </select>
                                <Button onClick={carregarCondicoes} disabled={loading}>
                                    {loading ? '...' : 'Carregar'}
                                </Button>
                            </div>

                            {condicoes && (
                                <div>
                                    <h3 className="font-semibold mb-3">Condição - {condicoes.condicao}</h3>
                                    <div className="grid gap-2">
                                        {(condicoes.pontos || []).map((ponto: AnyObj, idx: number) => (
                                            <Card key={idx} className="p-3">
                                                <div className="flex justify-between items-center">
                                                    <span>Paciente #{ponto.pacienteId}</span>
                                                    <Badge variant="outline">
                                                        {ponto.lat}, {ponto.lng}
                                                    </Badge>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab Dispositivos */}
                <TabsContent value="dispositivos">
                    <Card>
                        <CardHeader>
                            <CardTitle>📱 Dispositivos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600">
                                    Dispositivos móveis conectados ao sistema
                                </p>
                                <div className="grid gap-4">
                                    {(dispositivos?.dispositivos || []).map((disp: AnyObj) => (
                                        <Card key={disp.id} className="p-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h3 className="font-semibold">{disp.app} v{disp.versao}</h3>
                                                    <p className="text-sm text-gray-600">
                                                        Operador ID: {disp.operadorId}
                                                    </p>
                                                </div>
                                                <div className="text-right text-sm">
                                                    {disp.ultimaImportacao && (
                                                        <div>Última importação: {disp.ultimaImportacao}</div>
                                                    )}
                                                    {disp.ultimaExportacao && (
                                                        <div>Última exportação: {disp.ultimaExportacao}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default PainelAcsPage;