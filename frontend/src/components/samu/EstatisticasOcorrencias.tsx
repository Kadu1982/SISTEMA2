import React from 'react';
import { Card, Statistic, Row, Col, Tag } from 'antd';
import { PhoneOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { EstatisticasOcorrencias as EstatisticasOcorrenciasType } from '../../services/samuDashboardService';

interface Props {
  dados: EstatisticasOcorrenciasType;
}

const EstatisticasOcorrencias: React.FC<Props> = ({ dados }) => {
  const getCorPrioridade = (prioridade: string) => {
    switch (prioridade.toUpperCase()) {
      case 'EMERGENCIA':
      case 'VERMELHO':
        return 'red';
      case 'URGENTE':
      case 'AMARELO':
        return 'orange';
      case 'POUCO_URGENTE':
      case 'VERDE':
        return 'green';
      default:
        return 'blue';
    }
  };

  return (
    <Card
      title={
        <span>
          <PhoneOutlined /> Ocorrências
        </span>
      }
      bordered={false}
      style={{ height: '100%' }}
    >
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Statistic
            title="Hoje"
            value={dados.hoje}
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Este Mês"
            value={dados.mes}
            valueStyle={{ color: '#722ed1' }}
          />
        </Col>
        <Col span={24}>
          <Statistic
            title="Abertas"
            value={dados.abertas}
            valueStyle={{ color: dados.abertas > 0 ? '#faad14' : '#52c41a' }}
            prefix={dados.abertas > 0 ? <WarningOutlined /> : <CheckCircleOutlined />}
          />
        </Col>
      </Row>

      {dados.porPrioridade && Object.keys(dados.porPrioridade).length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <div style={{ marginBottom: '8px' }}>
            <strong>Por Prioridade</strong>
          </div>
          <div>
            {Object.entries(dados.porPrioridade).map(([prioridade, quantidade]) => (
              <Tag
                key={prioridade}
                color={getCorPrioridade(prioridade)}
                style={{ marginBottom: '4px' }}
              >
                {prioridade}: {quantidade}
              </Tag>
            ))}
          </div>
        </div>
      )}

      {dados.porStatus && Object.keys(dados.porStatus).length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ marginBottom: '8px' }}>
            <strong>Por Status</strong>
          </div>
          <div>
            {Object.entries(dados.porStatus).map(([status, quantidade]) => (
              <Tag key={status} color="blue" style={{ marginBottom: '4px' }}>
                {status}: {quantidade}
              </Tag>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default EstatisticasOcorrencias;
