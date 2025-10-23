import { useEffect, useState, useCallback } from 'react';
import samuWS, { WebSocketMessage, MessageHandler } from '../services/samuWebSocketService';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

export interface UseSamuWebSocketReturn {
  connectionStatus: ConnectionStatus;
  isConnected: boolean;
  subscribe: (topic: string, handler: MessageHandler) => void;
  unsubscribe: (topic: string) => void;
}

/**
 * Hook para gerenciar conexão WebSocket do SAMU
 */
export function useSamuWebSocket(): UseSamuWebSocketReturn {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  useEffect(() => {
    // Conectar ao WebSocket
    samuWS.connect(
      () => {
        console.log('[useSamuWebSocket] Conectado!');
        setConnectionStatus('connected');
      },
      (error) => {
        console.error('[useSamuWebSocket] Erro:', error);
        setConnectionStatus('disconnected');
      }
    );

    // Atualizar status periodicamente
    const intervalId = setInterval(() => {
      setConnectionStatus(samuWS.getConnectionStatus());
    }, 1000);

    // Cleanup ao desmontar
    return () => {
      clearInterval(intervalId);
      samuWS.disconnect();
    };
  }, []);

  const subscribe = useCallback((topic: string, handler: MessageHandler) => {
    samuWS.subscribe(topic, handler);
  }, []);

  const unsubscribe = useCallback((topic: string) => {
    samuWS.unsubscribe(topic);
  }, []);

  return {
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    subscribe,
    unsubscribe,
  };
}

/**
 * Hook para se inscrever em um tópico específico
 */
export function useSamuTopic(topic: string, handler: MessageHandler, enabled: boolean = true) {
  const { isConnected, subscribe, unsubscribe } = useSamuWebSocket();

  useEffect(() => {
    if (isConnected && enabled) {
      subscribe(topic, handler);

      return () => {
        unsubscribe(topic);
      };
    }
  }, [isConnected, enabled, topic, handler, subscribe, unsubscribe]);
}

/**
 * Hook para notificações de viaturas
 */
export function useViaturaNotifications(handler: MessageHandler) {
  useSamuTopic('/topic/samu/viaturas', handler);
}

/**
 * Hook para notificações de ocorrências
 */
export function useOcorrenciaNotifications(handler: MessageHandler) {
  useSamuTopic('/topic/samu/ocorrencias', handler);
}

/**
 * Hook para notificações de regulação
 */
export function useRegulacaoNotifications(handler: MessageHandler) {
  useSamuTopic('/topic/samu/regulacao', handler);
}

/**
 * Hook para alertas urgentes
 */
export function useAlertasNotifications(handler: MessageHandler) {
  useSamuTopic('/topic/samu/alertas', handler);
}
