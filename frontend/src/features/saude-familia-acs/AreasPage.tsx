import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import apiService from '@/services/apiService';

interface AreaDTO {
  id: number;
  descricao: string;
  ine: string;
  segmento?: string;
  unidadeId?: number;
  tipoEquipe?: string;
  atendePopGeral?: boolean;
  atendeAssentados?: boolean;
  atendeQuilombolas?: boolean;
  situacao: string;
  importacaoCnes?: boolean;
}

interface Vinculo {
  id?: number;
  profissionalId: number;
  especialidade?: string;
  situacao?: string;
  treinamentoIntrodutorio?: boolean;
  avaliacaoColetiva?: boolean;
  assistenciaMulher?: boolean;
  assistenciaCrianca?: boolean;
  capacitacaoPedagogica?: boolean;
}

interface Microarea {
  id?: number;
  areaId?: number;
  codigo: number;
  profissionalResponsavelId?: number;
  situacao?: string;
}

const AreasPage: React.FC = () => {
  const [areas, setAreas] = useState<AreaDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [descricao, setDescricao] = useState('');
  const [ine, setIne] = useState('');
  const [situacao, setSituacao] = useState<'ATIVA' | 'INATIVA'>('ATIVA');
  const [selectedArea, setSelectedArea] = useState<AreaDTO | null>(null);

  // Sub-tabs
  const [profissionais, setProfissionais] = useState<Vinculo[]>([]);
  const [microareas, setMicroareas] = useState<Microarea[]>([]);

  const canSave = useMemo(() => descricao.trim() !== '' && ine.trim() !== '', [descricao, ine]);

  const carregarAreas = async () => {
    setLoading(true);
    try {
      const { data } = await apiService.get('/saude-familia/areas');
      // Spring Page: data.content
      setAreas(data?.content ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarAreas();
  }, []);

  const salvarArea = async () => {
    if (!canSave) return;
    const payload = { descricao, ine, situacao };
    await apiService.post('/saude-familia/areas', payload);
    setDescricao('');
    setIne('');
    setSituacao('ATIVA');
    await carregarAreas();
  };

  const atualizarArea = async (area: AreaDTO) => {
    const payload = { descricao: area.descricao, ine: area.ine, situacao: area.situacao };
    await apiService.put(`/saude-familia/areas/${area.id}`, payload);
    await carregarAreas();
  };

  const excluirArea = async (id: number) => {
    await apiService.delete(`/saude-familia/areas/${id}`);
    if (selectedArea?.id === id) {
      setSelectedArea(null);
      setProfissionais([]);
      setMicroareas([]);
    }
    await carregarAreas();
  };

  const selecionarArea = async (area: AreaDTO) => {
    setSelectedArea(area);
    try {
      const { data: profs } = await apiService.get(`/saude-familia/areas/${area.id}/profissionais`);
      setProfissionais(profs ?? []);
    } catch { setProfissionais([]); }
    try {
      const { data: micros } = await apiService.get(`/saude-familia/areas/${area.id}/microareas`);
      setMicroareas(micros ?? []);
    } catch { setMicroareas([]); }
  };

  const adicionarProfissional = async (v: Vinculo) => {
    if (!selectedArea) return;
    await apiService.post(`/saude-familia/areas/${selectedArea.id}/profissionais`, v);
    await selecionarArea(selectedArea);
  };

  const adicionarMicroarea = async (m: Microarea) => {
    if (!selectedArea) return;
    await apiService.post(`/saude-familia/areas/${selectedArea.id}/microareas`, m);
    await selecionarArea(selectedArea);
  };

  const removerMicroarea = async (microId: number) => {
    if (!selectedArea) return;
    await apiService.delete(`/saude-familia/areas/${selectedArea.id}/microareas/${microId}`);
    await selecionarArea(selectedArea);
  };

  // Simple inline forms for sub-resources
  const [novoProfId, setNovoProfId] = useState('');
  const [novoProfEsp, setNovoProfEsp] = useState('');
  const [novaMicroCod, setNovaMicroCod] = useState('');
  const [novaMicroResp, setNovaMicroResp] = useState('');

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Áreas (EACS/ESF)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
            <Input placeholder="INE" value={ine} onChange={(e) => setIne(e.target.value)} />
            <Select value={situacao} onValueChange={(v) => setSituacao(v as 'ATIVA' | 'INATIVA')}>
              <SelectTrigger>
                <SelectValue placeholder="Situação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ATIVA">ATIVA</SelectItem>
                <SelectItem value="INATIVA">INATIVA</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button onClick={salvarArea} disabled={!canSave}>Adicionar</Button>
            <Button variant="outline" onClick={carregarAreas} disabled={loading}>{loading ? 'Atualizando...' : 'Atualizar'}</Button>
          </div>

          <div className="border rounded-md">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="p-2">Descrição</th>
                  <th className="p-2">INE</th>
                  <th className="p-2">Situação</th>
                  <th className="p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {areas.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="p-2">
                      <Input value={a.descricao} onChange={(e) => setAreas((prev) => prev.map(x => x.id === a.id ? { ...x, descricao: e.target.value } : x))} />
                    </td>
                    <td className="p-2">
                      <Input value={a.ine} onChange={(e) => setAreas((prev) => prev.map(x => x.id === a.id ? { ...x, ine: e.target.value } : x))} />
                    </td>
                    <td className="p-2">
                      <Select value={a.situacao} onValueChange={(v) => setAreas((prev) => prev.map(x => x.id === a.id ? { ...x, situacao: v } as any : x))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ATIVA">ATIVA</SelectItem>
                          <SelectItem value="INATIVA">INATIVA</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2 flex gap-2">
                      <Button size="sm" onClick={() => atualizarArea(a)}>Salvar</Button>
                      <Button size="sm" variant="outline" onClick={() => selecionarArea(a)}>Selecionar</Button>
                      <Button size="sm" variant="destructive" onClick={() => excluirArea(a.id)}>Excluir</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {selectedArea && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profissionais vinculados - {selectedArea.descricao}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input placeholder="Profissional ID" value={novoProfId} onChange={(e) => setNovoProfId(e.target.value)} />
                <Input placeholder="Especialidade" value={novoProfEsp} onChange={(e) => setNovoProfEsp(e.target.value)} />
                <Button onClick={() => adicionarProfissional({ profissionalId: Number(novoProfId), especialidade: novoProfEsp || undefined, situacao: 'ATIVO' })} disabled={!novoProfId}>Adicionar</Button>
              </div>
              <div className="border rounded-md">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="p-2">Profissional</th>
                      <th className="p-2">Especialidade</th>
                      <th className="p-2">Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profissionais.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="p-2">{p.profissionalId}</td>
                        <td className="p-2">{p.especialidade || '-'}</td>
                        <td className="p-2">{p.situacao || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Microáreas - {selectedArea.descricao}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Input placeholder="Código" value={novaMicroCod} onChange={(e) => setNovaMicroCod(e.target.value)} />
                <Input placeholder="Resp. ID" value={novaMicroResp} onChange={(e) => setNovaMicroResp(e.target.value)} />
                <Button onClick={() => adicionarMicroarea({ codigo: Number(novaMicroCod), profissionalResponsavelId: novaMicroResp ? Number(novaMicroResp) : undefined, situacao: 'ATIVA' })} disabled={!novaMicroCod}>Adicionar</Button>
              </div>
              <div className="border rounded-md">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="p-2">Código</th>
                      <th className="p-2">Resp.ID</th>
                      <th className="p-2">Situação</th>
                      <th className="p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {microareas.map((m) => (
                      <tr key={m.id} className="border-t">
                        <td className="p-2">{m.codigo}</td>
                        <td className="p-2">{m.profissionalResponsavelId || '-'}</td>
                        <td className="p-2">{m.situacao || '-'}</td>
                        <td className="p-2">
                          {m.id && <Button size="sm" variant="destructive" onClick={() => removerMicroarea(m.id!)}>Remover</Button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AreasPage;
