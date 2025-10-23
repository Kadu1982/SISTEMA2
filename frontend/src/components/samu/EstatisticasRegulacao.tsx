import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { ClockCircleOutlined, SyncOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { EstatisticasRegulacao as EstatisticasRegulacaoType } from '../../services/samuDashboardService';

interface Props {
  dados: EstatisticasRegulacaoType;
}

const EstatisticasRegulacao: React.FC<Props> = ({ dados }) => {
  const formatarTempo = (minutos: number): string => {
    if (minutos < 60) {
      return `${Math.round(minutos)} min`;
    }
    const horas = Math.floor(minutos / 60);
    const mins = Math.round(minutos % 60);
    return `${horas}h ${mins}m`;
  };

  return (
    <Card
      title={
        <span>
          <ClockCircleOutlined /> Regulação Médica
        </span>
      }
      bordered={false}
      style={{ height: '100%' }}
    >
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Statistic
            title="Aguardando"
            value={dados.aguardandoRegulacao}
            valueStyle={{ color: dados.aguardandoRegulacao > 0 ? '#faad14' : '#52c41a' }}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Em Regulação"
            value={dados.emRegulacao}
            valueStyle={{ color: '#1890ff' }}
            prefix={dados.emRegulacao > 0 ? <SyncOutlined spin /> : undefined}
          />
        </Col>
        <Col span={24}>
          <Statistic
            title="Reguladas Hoje"
            value={dados.reguladasHoje}
            valueStyle={{ color: '#52c41a' }}
            prefix={<CheckCircleOutlined />}
          />
        </Col>
        <Col span={24}>
          <Statistic
            title="Tempo Médio"
            value={formatarTempo(dados.tempoMedioRegulacao)}
            valueStyle={{
              color: dados.tempoMedioRegulacao > 30 ? '#faad14' : '#52c41a',
              fontSize: '20px',
            }}
          />
        </Col>
      </Row>

      {dados.aguardandoRegulacao > 5 && (
        <div
          style={{
            marginTop: '16px',
            padding: '8px',
            backgroundColor: '#fff7e6',
            border: '1px solid #ffd666',
            borderRadius: '4px',
          }}
        >
          <small style={{ color: '#d48806' }}>
            ⚠️ Atenção: {dados.aguardandoRegulacao} ocorrências aguardando regulação
          </small>
        </div>
      )}
    </Card>
  );
};

export default EstatisticasRegulacao;
