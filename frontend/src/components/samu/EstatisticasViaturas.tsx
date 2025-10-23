import React from 'react';
import { Card, Statistic, Row, Col, Progress, Tag } from 'antd';
import { CarOutlined, CheckCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { EstatisticasViaturas as EstatisticasViaturasType } from '../../services/samuDashboardService';

interface Props {
  dados: EstatisticasViaturasType;
}

const EstatisticasViaturas: React.FC<Props> = ({ dados }) => {
  const getCorDisponibilidade = (percentual: number) => {
    if (percentual >= 70) return '#52c41a';
    if (percentual >= 40) return '#faad14';
    return '#f5222d';
  };

  return (
    <Card
      title={
        <span>
          <CarOutlined /> Viaturas
        </span>
      }
      bordered={false}
      style={{ height: '100%' }}
    >
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Statistic
            title="Total"
            value={dados.total}
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Ativas"
            value={dados.ativas}
            valueStyle={{ color: '#52c41a' }}
            prefix={<CheckCircleOutlined />}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Disponíveis"
            value={dados.disponiveis}
            valueStyle={{ color: '#52c41a' }}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Em Operação"
            value={dados.emOperacao}
            valueStyle={{ color: '#faad14' }}
            prefix={<SyncOutlined spin />}
          />
        </Col>
      </Row>

      <div style={{ marginTop: '24px' }}>
        <div style={{ marginBottom: '8px' }}>
          <strong>Disponibilidade</strong>
        </div>
        <Progress
          percent={Math.round(dados.percentualDisponibilidade)}
          strokeColor={getCorDisponibilidade(dados.percentualDisponibilidade)}
          status="active"
        />
      </div>

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

export default EstatisticasViaturas;
