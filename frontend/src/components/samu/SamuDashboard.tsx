import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Spin, Alert, Badge } from 'antd';
import {
  CarOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import samuDashboardService, {
  EstatisticasGerais,
  OcorrenciaCritica,
  Alerta,
} from '../../services/samuDashboardService';
import {
  useSamuWebSocket,
  useViaturaNotifications,
  useOcorrenciaNotifications,
  useAlertasNotifications,
} from '../../hooks/useSamuWebSocket';
import { WebSocketMessage } from '../../services/samuWebSocketService';
import EstatisticasViaturas from './EstatisticasViaturas';
import EstatisticasOcorrencias from './EstatisticasOcorrencias';
import EstatisticasRegulacao from './EstatisticasRegulacao';
import OcorrenciasCriticas from './OcorrenciasCriticas';
import AlertasAtivos from './AlertasAtivos';
import GraficoOcorrencias from './GraficoOcorrencias';

const SamuDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estatisticas, setEstatisticas] = useState<EstatisticasGerais | null>(null);
  const [ocorrenciasCriticas, setOcorrenciasCriticas] = useState<OcorrenciaCritica[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date>(new Date());

  const { connectionStatus, isConnected } = useSamuWebSocket();

  // Handler para notificações de viaturas
  const handleViaturaUpdate = useCallback((message: WebSocketMessage) => {
    console.log('[Dashboard] Atualização de viatura:', message);
    // Recarrega estatísticas de viaturas
    recarregarEstatisticas();
  }, []);

  // Handler para notificações de ocorrências
  const handleOcorrenciaUpdate = useCallback((message: WebSocketMessage) => {
    console.log('[Dashboard] Nova ocorrência:', message);
    // Recarrega estatísticas de ocorrências e lista de críticas
    recarregarEstatisticas();
    recarregarOcorrenciasCriticas();
  }, []);

  // Handler para alertas
  const handleAlerta = useCallback((message: WebSocketMessage) => {
    console.log('[Dashboard] Novo alerta:', message);
    // Recarrega alertas
    recarregarAlertas();
  }, []);

  // Subscrever aos tópicos WebSocket
  useViaturaNotifications(handleViaturaUpdate);
  useOcorrenciaNotifications(handleOcorrenciaUpdate);
  useAlertasNotifications(handleAlerta);

  // Carregar dados iniciais
  const carregarDadosIniciais = async () => {
    try {
      setLoading(true);
      setError(null);

      const [stats, criticas, alertasAtivos] = await Promise.all([
        samuDashboardService.obterEstatisticasGerais(),
        samuDashboardService.obterOcorrenciasCriticas(),
        samuDashboardService.obterAlertasAtivos(),
      ]);

      setEstatisticas(stats);
      setOcorrenciasCriticas(criticas);
      setAlertas(alertasAtivos);
      setUltimaAtualizacao(new Date());
    } catch (err: any) {
      console.error('[Dashboard] Erro ao carregar dados:', err);
      setError(err.message || 'Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Recarregar estatísticas
  const recarregarEstatisticas = async () => {
    try {
      const stats = await samuDashboardService.obterEstatisticasGerais();
      setEstatisticas(stats);
      setUltimaAtualizacao(new Date());
    } catch (err) {
      console.error('[Dashboard] Erro ao recarregar estatísticas:', err);
    }
  };

  // Recarregar ocorrências críticas
  const recarregarOcorrenciasCriticas = async () => {
    try {
      const criticas = await samuDashboardService.obterOcorrenciasCriticas();
      setOcorrenciasCriticas(criticas);
    } catch (err) {
      console.error('[Dashboard] Erro ao recarregar ocorrências críticas:', err);
    }
  };

  // Recarregar alertas
  const recarregarAlertas = async () => {
    try {
      const alertasAtivos = await samuDashboardService.obterAlertasAtivos();
      setAlertas(alertasAtivos);
    } catch (err) {
      console.error('[Dashboard] Erro ao recarregar alertas:', err);
    }
  };

  // Carregar dados ao montar componente
  useEffect(() => {
    carregarDadosIniciais();

    // Recarregar dados a cada 30 segundos
    const intervalId = setInterval(() => {
      recarregarEstatisticas();
      recarregarOcorrenciasCriticas();
      recarregarAlertas();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  // Status da conexão WebSocket
  const getConnectionStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge status="success" text="Conectado" />;
      case 'connecting':
        return <Badge status="processing" text="Conectando..." />;
      case 'disconnected':
        return <Badge status="error" text="Desconectado" />;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Carregando dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Erro ao carregar dashboard"
        description={error}
        type="error"
        showIcon
        style={{ margin: '20px' }}
      />
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      {/* Cabeçalho */}
      <div style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <h1 style={{ margin: 0 }}>
              <CarOutlined /> Dashboard SAMU 192
            </h1>
          </Col>
          <Col>
            {getConnectionStatusBadge()}
            <span style={{ marginLeft: '16px', color: '#666' }}>
              <ClockCircleOutlined /> Atualizado em: {ultimaAtualizacao.toLocaleTimeString()}
            </span>
          </Col>
        </Row>
      </div>

      {/* Alertas Ativos */}
      {alertas.length > 0 && (
        <AlertasAtivos alertas={alertas} style={{ marginBottom: '24px' }} />
      )}

      {/* Estatísticas Principais */}
      {estatisticas && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={24} md={8}>
              <EstatisticasViaturas dados={estatisticas.viaturas} />
            </Col>
            <Col xs={24} sm={24} md={8}>
              <EstatisticasOcorrencias dados={estatisticas.ocorrencias} />
            </Col>
            <Col xs={24} sm={24} md={8}>
              <EstatisticasRegulacao dados={estatisticas.regulacao} />
            </Col>
          </Row>

          {/* Gráfico de Ocorrências */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24}>
              <GraficoOcorrencias />
            </Col>
          </Row>

          {/* Ocorrências Críticas */}
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <OcorrenciasCriticas ocorrencias={ocorrenciasCriticas} />
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default SamuDashboard;
