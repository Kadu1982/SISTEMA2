import React from 'react';
import { Alert } from 'antd';
import { WarningOutlined, InfoCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Alerta } from '../../services/samuDashboardService';

interface Props {
  alertas: Alerta[];
  style?: React.CSSProperties;
}

const AlertasAtivos: React.FC<Props> = ({ alertas, style }) => {
  const getAlertType = (nivel: string): 'error' | 'warning' | 'info' => {
    switch (nivel.toLowerCase()) {
      case 'critico':
      case 'erro':
        return 'error';
      case 'alerta':
      case 'atencao':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getAlertIcon = (nivel: string) => {
    switch (nivel.toLowerCase()) {
      case 'critico':
      case 'erro':
        return <CloseCircleOutlined />;
      case 'alerta':
      case 'atencao':
        return <WarningOutlined />;
      default:
        return <InfoCircleOutlined />;
    }
  };

  if (alertas.length === 0) {
    return null;
  }

  return (
    <div style={style}>
      {alertas.map((alerta, index) => (
        <Alert
          key={index}
          message={alerta.tipo}
          description={alerta.mensagem}
          type={getAlertType(alerta.nivel)}
          showIcon
          icon={getAlertIcon(alerta.nivel)}
          closable
          style={{ marginBottom: alertas.length > 1 ? '8px' : 0 }}
        />
      ))}
    </div>
  );
};

export default AlertasAtivos;
