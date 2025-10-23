import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import apiService from '@/services/apiService';

interface Meta {
  id?: number;
  competencia: string; // YYYYMM
  tipo: 'FAMILIAS' | 'INTEGRANTES' | 'ACOMPANHAMENTO';
  area?: { id: number } | null;
  microarea?: { id: number } | null;
  valorMeta: number;
}

const MetasPage: React.FC = () => {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(false);

  const [competencia, setCompetencia] = useState('');
  const [tipo, setTipo] = useState<Meta['tipo']>('FAMILIAS');
  const [areaId, setAreaId] = useState('');
  const [microareaId, setMicroareaId] = useState('');
  const [valorMeta, setValorMeta] = useState('');

  const canSave = useMemo(() => competencia.length === 6 && valorMeta.trim() !== '', [competencia, valorMeta]);

  const carregarMetas = async () => {
    setLoading(true);
    try {
      const { data } = await apiService.get('/saude-familia/metas');
      setMetas(data?.content ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarMetas();
  }, []);

  const salvarMeta = async () => {
    if (!canSave) return;
    const payload: Meta = {
      competencia,
      tipo,
      valorMeta: Number(valorMeta),
      area: areaId ? { id: Number(areaId) } : undefined,
      microarea: microareaId ? { id: Number(microareaId) } : undefined,
    } as Meta;
    await apiService.post('/saude-familia/metas', payload);
    setCompetencia('');
    setValorMeta('');
    setAreaId('');
    setMicroareaId('');
    setTipo('FAMILIAS');
    await carregarMetas();
  };

  const atualizarMeta = async (m: Meta) => {
    const payload: Meta = {
      competencia: m.competencia,
      tipo: m.tipo,
      valorMeta: m.valorMeta,
      area: (m as any).area?.id ? { id: (m as any).area.id } : undefined,
      microarea: (m as any).microarea?.id ? { id: (m as any).microarea.id } : undefined,
    } as Meta;
    await apiService.put(`/saude-familia/metas/${m.id}`, payload);
    await carregarMetas();
  };

  const excluirMeta = async (id?: number) => {
    if (!id) return;
    await apiService.delete(`/saude-familia/metas/${id}`);
    await carregarMetas();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Metas (Mensais)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <Input placeholder="Competência YYYYMM" value={competencia} onChange={(e) => setCompetencia(e.target.value)} />
            <Select value={tipo} onValueChange={(v) => setTipo(v as Meta['tipo'])}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FAMILIAS">Famílias</SelectItem>
                <SelectItem value="INTEGRANTES">Integrantes</SelectItem>
                <SelectItem value="ACOMPANHAMENTO">Acompanhamento</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Área ID (opcional)" value={areaId} onChange={(e) => setAreaId(e.target.value)} />
            <Input placeholder="Microárea ID (opcional)" value={microareaId} onChange={(e) => setMicroareaId(e.target.value)} />
            <Input placeholder="Valor da meta" value={valorMeta} onChange={(e) => setValorMeta(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button onClick={salvarMeta} disabled={!canSave}>Adicionar</Button>
            <Button variant="outline" onClick={carregarMetas} disabled={loading}>{loading ? 'Atualizando...' : 'Atualizar'}</Button>
          </div>

          <div className="border rounded-md">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="p-2">Competência</th>
                  <th className="p-2">Tipo</th>
                  <th className="p-2">Área</th>
                  <th className="p-2">Microárea</th>
                  <th className="p-2">Meta</th>
                  <th className="p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {metas.map((m) => (
                  <tr key={m.id} className="border-t">
                    <td className="p-2"><Input value={m.competencia} onChange={(e) => setMetas(prev => prev.map(x => x.id === m.id ? { ...x, competencia: e.target.value } : x))} /></td>
                    <td className="p-2">
                      <Select value={m.tipo} onValueChange={(v) => setMetas(prev => prev.map(x => x.id === m.id ? { ...x, tipo: v as any } : x))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FAMILIAS">Famílias</SelectItem>
                          <SelectItem value="INTEGRANTES">Integrantes</SelectItem>
                          <SelectItem value="ACOMPANHAMENTO">Acompanhamento</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2"><Input value={(m as any).area?.id ?? ''} onChange={(e) => setMetas(prev => prev.map(x => x.id === m.id ? { ...x, area: e.target.value ? { id: Number(e.target.value) } : undefined } as any : x))} /></td>
                    <td className="p-2"><Input value={(m as any).microarea?.id ?? ''} onChange={(e) => setMetas(prev => prev.map(x => x.id === m.id ? { ...x, microarea: e.target.value ? { id: Number(e.target.value) } : undefined } as any : x))} /></td>
                    <td className="p-2"><Input value={String(m.valorMeta)} onChange={(e) => setMetas(prev => prev.map(x => x.id === m.id ? { ...x, valorMeta: Number(e.target.value) } : x))} /></td>
                    <td className="p-2 flex gap-2">
                      <Button size="sm" onClick={() => atualizarMeta(m)}>Salvar</Button>
                      <Button size="sm" variant="destructive" onClick={() => excluirMeta(m.id)}>Excluir</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetasPage;
