import React from 'react';
import { Card, Table, Tag, Tooltip } from 'antd';
import { WarningOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { OcorrenciaCritica } from '../../services/samuDashboardService';
import type { ColumnsType } from 'antd/es/table';

interface Props {
  ocorrencias: OcorrenciaCritica[];
}

const OcorrenciasCriticas: React.FC<Props> = ({ ocorrencias }) => {
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

  const formatarTempo = (minutos: number): string => {
    if (minutos < 60) {
      return `${Math.round(minutos)} min`;
    }
    const horas = Math.floor(minutos / 60);
    const mins = Math.round(minutos % 60);
    return `${horas}h ${mins}m`;
  };

  const columns: ColumnsType<OcorrenciaCritica> = [
    {
      title: 'Número',
      dataIndex: 'numero',
      key: 'numero',
      width: 120,
      render: (numero: string) => <strong>{numero}</strong>,
    },
    {
      title: 'Prioridade',
      dataIndex: 'prioridade',
      key: 'prioridade',
      width: 120,
      render: (prioridade: string, record: OcorrenciaCritica) => (
        <Tag color={getCorPrioridade(prioridade)} icon={<WarningOutlined />}>
          {record.prioridadeDescricao || prioridade}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => <Tag color="blue">{status}</Tag>,
    },
    {
      title: 'Endereço',
      dataIndex: 'endereco',
      key: 'endereco',
      ellipsis: true,
      render: (endereco: string) => (
        <Tooltip title={endereco}>
          <span>{endereco}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Queixa',
      dataIndex: 'queixa',
      key: 'queixa',
      ellipsis: true,
      render: (queixa: string) => (
        <Tooltip title={queixa}>
          <span>{queixa}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Tempo Decorrido',
      dataIndex: 'tempoDecorrido',
      key: 'tempoDecorrido',
      width: 150,
      render: (tempo: number) => (
        <span style={{ color: tempo > 30 ? '#f5222d' : tempo > 15 ? '#faad14' : '#52c41a' }}>
          <ClockCircleOutlined /> {formatarTempo(tempo)}
        </span>
      ),
      sorter: (a, b) => a.tempoDecorrido - b.tempoDecorrido,
      defaultSortOrder: 'descend',
    },
  ];

  return (
    <Card
      title={
        <span>
          <WarningOutlined /> Ocorrências Críticas ({ocorrencias.length})
        </span>
      }
      bordered={false}
    >
      <Table
        columns={columns}
        dataSource={ocorrencias}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} ocorrências`,
        }}
        size="small"
        scroll={{ x: 'max-content' }}
      />
    </Card>
  );
};

export default OcorrenciasCriticas;
