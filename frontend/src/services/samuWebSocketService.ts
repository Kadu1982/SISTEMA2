import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';

export interface WebSocketMessage {
  tipo: string;
  timestamp: number;
  [key: string]: any;
}

export type MessageHandler = (data: WebSocketMessage) => void;

class SamuWebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, any> = new Map();
  private isConnecting: boolean = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private readonly RECONNECT_DELAY = 5000;
  private readonly BACKEND_URL = 'http://localhost:8080';

  /**
   * Conecta ao WebSocket do SAMU
   */
  connect(onConnect?: () => void, onError?: (error: any) => void): void {
    if (this.client?.connected || this.isConnecting) {
      console.log('[SAMU WS] Já conectado ou conectando...');
      return;
    }

    this.isConnecting = true;
    console.log('[SAMU WS] Conectando ao WebSocket...');

    // Criar cliente STOMP sobre SockJS
    this.client = new Client({
      webSocketFactory: () => new SockJS(`${this.BACKEND_URL}/ws`) as any,
      debug: (str) => {
        console.log('[SAMU WS Debug]', str);
      },
      reconnectDelay: this.RECONNECT_DELAY,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: (frame) => {
        this.isConnecting = false;
        console.log('[SAMU WS] ✅ Conectado com sucesso!', frame);
        if (onConnect) onConnect();
      },
      onStompError: (frame) => {
        this.isConnecting = false;
        console.error('[SAMU WS] ❌ Erro STOMP:', frame.headers['message']);
        console.error('[SAMU WS] Detalhes:', frame.body);
        if (onError) onError(frame);
      },
      onWebSocketClose: (event) => {
        this.isConnecting = false;
        console.warn('[SAMU WS] ⚠️ Conexão fechada:', event.reason);
        this.scheduleReconnect(onConnect, onError);
      },
      onWebSocketError: (event) => {
        this.isConnecting = false;
        console.error('[SAMU WS] ❌ Erro WebSocket:', event);
        if (onError) onError(event);
        this.scheduleReconnect(onConnect, onError);
      }
    });

    this.client.activate();
  }

  /**
   * Agenda reconexão automática
   */
  private scheduleReconnect(onConnect?: () => void, onError?: (error: any) => void): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    console.log(`[SAMU WS] Tentando reconectar em ${this.RECONNECT_DELAY / 1000}s...`);

    this.reconnectTimeout = setTimeout(() => {
      console.log('[SAMU WS] Reconectando...');
      this.connect(onConnect, onError);
    }, this.RECONNECT_DELAY);
  }

  /**
   * Inscreve-se em um tópico
   */
  subscribe(topic: string, callback: MessageHandler): void {
    if (!this.client?.connected) {
      console.warn('[SAMU WS] Não conectado. Aguarde a conexão antes de se inscrever.');
      return;
    }

    // Desinscrever se já existe
    this.unsubscribe(topic);

    console.log(`[SAMU WS] 📨 Inscrevendo no tópico: ${topic}`);

    const subscription = this.client.subscribe(topic, (message: IMessage) => {
      try {
        const data: WebSocketMessage = JSON.parse(message.body);
        console.log(`[SAMU WS] ✉️ Mensagem recebida de ${topic}:`, data);
        callback(data);
      } catch (error) {
        console.error(`[SAMU WS] Erro ao processar mensagem de ${topic}:`, error);
      }
    });

    this.subscriptions.set(topic, subscription);
  }

  /**
   * Cancela inscrição de um tópico
   */
  unsubscribe(topic: string): void {
    const subscription = this.subscriptions.get(topic);
    if (subscription) {
      console.log(`[SAMU WS] 🚫 Cancelando inscrição: ${topic}`);
      subscription.unsubscribe();
      this.subscriptions.delete(topic);
    }
  }

  /**
   * Desconecta do WebSocket
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.subscriptions.forEach((_, topic) => {
      this.unsubscribe(topic);
    });

    if (this.client) {
      console.log('[SAMU WS] 👋 Desconectando...');
      this.client.deactivate();
      this.client = null;
    }

    this.isConnecting = false;
  }

  /**
   * Verifica se está conectado
   */
  isConnected(): boolean {
    return this.client?.connected || false;
  }

  /**
   * Obtém status da conexão
   */
  getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' {
    if (this.client?.connected) return 'connected';
    if (this.isConnecting) return 'connecting';
    return 'disconnected';
  }
}

// Exporta instância singleton
export default new SamuWebSocketService();
