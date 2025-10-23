import React, { useState, useEffect } from 'react';
import { Card, Spin } from 'antd';
import { LineChartOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/charts';
import samuDashboardService, { GraficoOcorrencias as GraficoOcorrenciasType } from '../../services/samuDashboardService';

const GraficoOcorrencias: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState<GraficoOcorrenciasType | null>(null);

  useEffect(() => {
    carregarDados();

    // Recarrega a cada 5 minutos
    const intervalId = setInterval(carregarDados, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const grafico = await samuDashboardService.obterGraficoPorHora();
      setDados(grafico);
    } catch (error) {
      console.error('[GraficoOcorrencias] Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const config = {
    data: dados?.dados || [],
    xField: 'hora',
    yField: 'quantidade',
    point: {
      size: 5,
      shape: 'circle',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
    xAxis: {
      label: {
        formatter: (v: string) => `${v}h`,
      },
    },
    yAxis: {
      label: {
        formatter: (v: string) => Math.round(Number(v)).toString(),
      },
    },
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    tooltip: {
      customContent: (title: string, items: any[]) => {
        if (!items || items.length === 0) return '';
        const data = items[0]?.data;
        return `
          <div style="padding: 8px">
            <div style="margin-bottom: 4px; font-weight: bold;">${title}:00</div>
            <div>Ocorrências: ${data?.quantidade || 0}</div>
          </div>
        `;
      },
    },
  };

  return (
    <Card
      title={
        <span>
          <LineChartOutlined /> Ocorrências por Hora (Últimas 24h)
        </span>
      }
      bordered={false}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin tip="Carregando gráfico..." />
        </div>
      ) : dados && dados.dados.length > 0 ? (
        <Line {...config} />
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
          Nenhum dado disponível
        </div>
      )}
    </Card>
  );
};

export default GraficoOcorrencias;
