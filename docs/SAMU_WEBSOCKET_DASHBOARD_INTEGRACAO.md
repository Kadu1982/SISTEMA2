# SAMU - WebSocket e Dashboard - Guia de Integração Frontend

## Data: 02/10/2025

## 📋 RESUMO EXECUTIVO

Implementação completa de WebSocket e Dashboard para o módulo SAMU com:

✅ **WebSocket** - Notificações em tempo real
✅ **Dashboard API** - Estatísticas e métricas
✅ **Notificações Integradas** - Services atualizam frontend automaticamente
✅ **Compilação 100%** - Zero erros

---

## 🔌 WEBSOCKET - CONFIGURAÇÃO FRONTEND

### 1. Endpoint WebSocket

```
ws://localhost:8080/ws
```

### 2. Conexão com SockJS + STOMP

```javascript
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

// Conectar ao WebSocket
const socket = new SockJS('http://localhost:8080/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({}, (frame) => {
  console.log('Conectado ao WebSocket SAMU:', frame);

  // Inscrever-se nos tópicos
  subscribeToTopics();
});
```

### 3. Tópicos Disponíveis

#### 3.1. `/topic/samu/viaturas` - Status de Viaturas

**Quando é disparado:**
- Quando o status de uma viatura é atualizado

**Estrutura da mensagem:**
```json
{
  "tipo": "VIATURA_STATUS_ATUALIZADO",
  "viaturaId": 1,
  "novoStatus": "A_CAMINHO",
  "dados": {
    "identificacao": "USA-01",
    "tipo": "USA",
    "status": "A_CAMINHO",
    "nivelProntidao": 85
  },
  "timestamp": 1696262400000
}
```

**Como se inscrever:**
```javascript
stompClient.subscribe('/topic/samu/viaturas', (message) => {
  const data = JSON.parse(message.body);
  console.log('Viatura atualizada:', data);

  // Atualizar UI
  updateViaturaStatus(data.viaturaId, data.novoStatus);
});
```

#### 3.2. `/topic/samu/ocorrencias` - Novas Ocorrências

**Quando é disparado:**
- Quando uma nova ocorrência é registrada

**Estrutura da mensagem:**
```json
{
  "tipo": "NOVA_OCORRENCIA",
  "ocorrenciaId": 123,
  "prioridade": "EMERGENCIA",
  "dados": {
    "numeroOcorrencia": "20251002-00001",
    "prioridade": "EMERGENCIA",
    "status": "ABERTA",
    "endereco": "Rua das Flores, 123 - Centro",
    "queixa": "Dor torácica intensa"
  },
  "timestamp": 1696262400000
}
```

**Como se inscrever:**
```javascript
stompClient.subscribe('/topic/samu/ocorrencias', (message) => {
  const data = JSON.parse(message.body);
  console.log('Nova ocorrência:', data);

  // Mostrar notificação
  if (data.prioridade === 'EMERGENCIA') {
    showUrgentAlert(data.dados);
  }

  // Atualizar lista de ocorrências
  refreshOcorrenciasList();
});
```

#### 3.3. `/topic/samu/regulacao` - Regulação Médica

**Quando é disparado:**
- Quando uma regulação médica é iniciada ou atualizada

**Estrutura da mensagem:**
```json
{
  "tipo": "REGULACAO_ATUALIZADA",
  "ocorrenciaId": 123,
  "status": "EM_REGULACAO",
  "dados": {
    "ocorrenciaId": 123,
    "numeroOcorrencia": "20251002-00001",
    "medico": "Dr. João Silva",
    "status": "EM_REGULACAO"
  },
  "timestamp": 1696262400000
}
```

**Como se inscrever:**
```javascript
stompClient.subscribe('/topic/samu/regulacao', (message) => {
  const data = JSON.parse(message.body);
  console.log('Regulação atualizada:', data);

  // Atualizar status na tela de regulação
  updateRegulacaoStatus(data.ocorrenciaId, data.status);
});
```

#### 3.4. `/topic/samu/localizacao` - Localização GPS

**Quando é disparado:**
- Quando a localização GPS de uma viatura é atualizada

**Estrutura da mensagem:**
```json
{
  "tipo": "LOCALIZACAO_ATUALIZADA",
  "viaturaId": 1,
  "latitude": -23.5505,
  "longitude": -46.6333,
  "timestamp": 1696262400000
}
```

**Como se inscrever:**
```javascript
stompClient.subscribe('/topic/samu/localizacao', (message) => {
  const data = JSON.parse(message.body);

  // Atualizar posição no mapa
  updateMapMarker(data.viaturaId, data.latitude, data.longitude);
});
```

#### 3.5. `/topic/samu/estatisticas` - Estatísticas Atualizadas

**Quando é disparado:**
- Quando as estatísticas do dashboard são atualizadas

**Estrutura da mensagem:**
```json
{
  "tipo": "ESTATISTICAS_ATUALIZADAS",
  "dados": {
    "viaturas": { "total": 10, "disponiveis": 7 },
    "ocorrencias": { "hoje": 25, "abertas": 5 }
  },
  "timestamp": 1696262400000
}
```

#### 3.6. `/topic/samu/alertas` - Alertas Urgentes

**Quando é disparado:**
- Quando um alerta urgente é emitido pelo sistema

**Estrutura da mensagem:**
```json
{
  "tipo": "ALERTA_URGENTE",
  "mensagem": "Baixa disponibilidade de viaturas!",
  "nivel": "ERROR",
  "dados": {
    "disponiveis": 2,
    "total": 10
  },
  "timestamp": 1696262400000
}
```

---

## 📊 DASHBOARD API - ENDPOINTS

### 1. Estatísticas Gerais

**Endpoint:** `GET /api/samu/dashboard/estatisticas`

**Resposta:**
```json
{
  "success": true,
  "message": "Estatísticas obtidas com sucesso",
  "data": {
    "viaturas": {
      "total": 10,
      "ativas": 8,
      "inativas": 2,
      "disponiveis": 5,
      "emOperacao": 3,
      "percentualDisponibilidade": 62.5,
      "porStatus": {
        "DISPONIVEL": 5,
        "A_CAMINHO": 2,
        "EM_ATENDIMENTO": 1
      }
    },
    "ocorrencias": {
      "hoje": 25,
      "mes": 120,
      "abertas": 5,
      "porPrioridade": {
        "EMERGENCIA": 2,
        "URGENCIA": 8,
        "POUCO_URGENTE": 10,
        "NAO_URGENTE": 5
      },
      "porStatus": {
        "ABERTA": 3,
        "AGUARDANDO_REGULACAO": 2
      }
    },
    "regulacao": {
      "aguardandoRegulacao": 2,
      "emRegulacao": 1,
      "reguladasHoje": 18,
      "tempoMedioRegulacao": 0.0
    },
    "timestamp": "2025-10-02T10:30:00",
    "atualizadoEm": 1696262400000
  }
}
```

**Uso no frontend:**
```javascript
async function loadDashboardStats() {
  const response = await fetch('/api/samu/dashboard/estatisticas');
  const result = await response.json();

  if (result.success) {
    const stats = result.data;

    // Atualizar cards
    updateCard('viaturas-disponiveis', stats.viaturas.disponiveis);
    updateCard('ocorrencias-hoje', stats.ocorrencias.hoje);
    updateCard('aguardando-regulacao', stats.regulacao.aguardandoRegulacao);
  }
}
```

### 2. Mapa de Viaturas

**Endpoint:** `GET /api/samu/dashboard/mapa-viaturas`

**Resposta:**
```json
{
  "success": true,
  "message": "Mapa de viaturas obtido com sucesso",
  "data": [
    {
      "id": 1,
      "identificacao": "USA-01",
      "tipo": "USA",
      "tipoDescricao": "Unidade de Suporte Avançado",
      "status": "DISPONIVEL",
      "statusDescricao": "Disponível",
      "cor": "#28a745",
      "nivelProntidao": 85,
      "latitude": null,
      "longitude": null
    }
  ]
}
```

**Uso no frontend:**
```javascript
async function loadViaturaMap() {
  const response = await fetch('/api/samu/dashboard/mapa-viaturas');
  const result = await response.json();

  if (result.success) {
    result.data.forEach(viatura => {
      addMapMarker(
        viatura.id,
        viatura.latitude,
        viatura.longitude,
        viatura.identificacao,
        viatura.cor
      );
    });
  }
}
```

### 3. Ocorrências Críticas

**Endpoint:** `GET /api/samu/dashboard/ocorrencias-criticas`

**Resposta:**
```json
{
  "success": true,
  "message": "Ocorrências críticas obtidas com sucesso",
  "data": [
    {
      "id": 123,
      "numero": "20251002-00001",
      "prioridade": "EMERGENCIA",
      "prioridadeDescricao": "Emergência",
      "status": "AGUARDANDO_REGULACAO",
      "endereco": "Rua das Flores, 123 - Centro",
      "queixa": "Dor torácica intensa",
      "dataAbertura": "2025-10-02T09:15:00",
      "tempoDecorrido": 75
    }
  ]
}
```

**Uso no frontend:**
```javascript
async function loadCriticalOccurrences() {
  const response = await fetch('/api/samu/dashboard/ocorrencias-criticas');
  const result = await response.json();

  if (result.success) {
    const list = result.data.map(occ => `
      <div class="critical-occurrence priority-${occ.prioridade}">
        <strong>${occ.numero}</strong>
        <span>${occ.queixa}</span>
        <span>${occ.tempoDecorrido} minutos</span>
      </div>
    `).join('');

    document.getElementById('critical-list').innerHTML = list;
  }
}
```

### 4. Gráfico de Ocorrências por Hora

**Endpoint:** `GET /api/samu/dashboard/grafico-por-hora`

**Resposta:**
```json
{
  "success": true,
  "message": "Gráfico obtido com sucesso",
  "data": {
    "dados": [
      {
        "hora": 0,
        "quantidade": 2,
        "timestamp": "2025-10-02T00:00:00"
      },
      {
        "hora": 1,
        "quantidade": 1,
        "timestamp": "2025-10-02T01:00:00"
      }
    ],
    "periodo": "Últimas 24 horas"
  }
}
```

**Uso no frontend (Chart.js):**
```javascript
async function loadHourlyChart() {
  const response = await fetch('/api/samu/dashboard/grafico-por-hora');
  const result = await response.json();

  if (result.success) {
    const chartData = {
      labels: result.data.dados.map(d => `${d.hora}h`),
      datasets: [{
        label: 'Ocorrências',
        data: result.data.dados.map(d => d.quantidade),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    };

    new Chart(ctx, {
      type: 'line',
      data: chartData
    });
  }
}
```

### 5. Alertas Ativos

**Endpoint:** `GET /api/samu/dashboard/alertas`

**Resposta:**
```json
{
  "success": true,
  "message": "2 alerta(s) ativo(s)",
  "data": [
    {
      "tipo": "REGULACAO_PENDENTE",
      "nivel": "WARNING",
      "mensagem": "3 ocorrência(s) aguardando regulação há mais de 30 minutos",
      "quantidade": 3
    },
    {
      "tipo": "BAIXA_DISPONIBILIDADE_VIATURAS",
      "nivel": "ERROR",
      "mensagem": "Apenas 2 de 10 viaturas disponíveis (20%)",
      "disponiveis": 2,
      "total": 10
    }
  ]
}
```

**Uso no frontend:**
```javascript
async function loadAlerts() {
  const response = await fetch('/api/samu/dashboard/alertas');
  const result = await response.json();

  if (result.success && result.data.length > 0) {
    result.data.forEach(alert => {
      showAlert(alert.nivel, alert.mensagem);
    });
  }
}
```

---

## 🔄 FLUXO COMPLETO - EXEMPLO REAL

### Cenário: Nova Ocorrência Registrada

**1. Backend registra ocorrência:**
```java
// RegistroOcorrenciaService.java
Ocorrencia ocorrencia = ocorrenciaRepository.save(ocorrencia);

// Envia notificação WebSocket automaticamente
webSocketService.notificarNovaOcorrencia(
    ocorrencia.getId(),
    ocorrencia.getPrioridade().name(),
    dados
);
```

**2. Frontend recebe notificação:**
```javascript
stompClient.subscribe('/topic/samu/ocorrencias', (message) => {
  const data = JSON.parse(message.body);

  // 1. Mostrar notificação visual
  showToast('Nova ocorrência registrada: ' + data.dados.numeroOcorrencia);

  // 2. Atualizar contador
  incrementCounter('ocorrencias-hoje');

  // 3. Atualizar lista
  addOcorrenciaToList(data.dados);

  // 4. Se for emergência, tocar alerta sonoro
  if (data.prioridade === 'EMERGENCIA') {
    playAlertSound();
    highlightCriticalPanel();
  }
});
```

---

## 📦 PACOTE NPM RECOMENDADO

### Instalação

```bash
npm install sockjs-client @stomp/stompjs
```

### Service WebSocket Completo

```javascript
// samuWebSocketService.js
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

class SamuWebSocketService {
  constructor() {
    this.stompClient = null;
    this.subscriptions = {};
  }

  connect(onConnect) {
    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect({}, (frame) => {
      console.log('Conectado ao SAMU WebSocket:', frame);
      if (onConnect) onConnect();
    }, (error) => {
      console.error('Erro na conexão WebSocket:', error);
      // Tentar reconectar após 5 segundos
      setTimeout(() => this.connect(onConnect), 5000);
    });
  }

  subscribe(topic, callback) {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error('WebSocket não conectado');
      return;
    }

    this.subscriptions[topic] = this.stompClient.subscribe(topic, (message) => {
      const data = JSON.parse(message.body);
      callback(data);
    });
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.disconnect(() => {
        console.log('Desconectado do WebSocket SAMU');
      });
    }
  }
}

export default new SamuWebSocketService();
```

### Uso no Componente React

```jsx
import { useEffect } from 'react';
import samuWS from './services/samuWebSocketService';

function SamuDashboard() {
  useEffect(() => {
    // Conectar ao WebSocket
    samuWS.connect(() => {
      // Inscrever-se nos tópicos
      samuWS.subscribe('/topic/samu/viaturas', handleViaturaUpdate);
      samuWS.subscribe('/topic/samu/ocorrencias', handleNovaOcorrencia);
      samuWS.subscribe('/topic/samu/alertas', handleAlerta);
    });

    // Cleanup ao desmontar
    return () => samuWS.disconnect();
  }, []);

  const handleViaturaUpdate = (data) => {
    console.log('Viatura atualizada:', data);
    // Atualizar estado
  };

  const handleNovaOcorrencia = (data) => {
    console.log('Nova ocorrência:', data);
    // Mostrar notificação
  };

  const handleAlerta = (data) => {
    console.log('Alerta:', data);
    // Exibir alerta
  };

  return <div>Dashboard SAMU</div>;
}
```

---

## ✅ CHECKLIST DE INTEGRAÇÃO

### Backend
- [x] WebSocket configurado (WebSocketConfig.java)
- [x] SamuWebSocketService criado
- [x] Notificações integradas em ViaturaService
- [x] Notificações integradas em RegistroOcorrenciaService
- [x] Notificações integradas em RegulacaoMedicaService
- [x] SamuDashboardController criado
- [x] 8 endpoints de dashboard implementados
- [x] Compilação 100% bem-sucedida
- [x] Dependência spring-boot-starter-websocket adicionada

### Frontend (A fazer)
- [ ] Instalar sockjs-client e @stomp/stompjs
- [ ] Criar SamuWebSocketService
- [ ] Conectar ao WebSocket ao carregar dashboard
- [ ] Inscrever-se nos 6 tópicos
- [ ] Implementar handlers para cada tipo de mensagem
- [ ] Integrar com componentes de UI (cards, gráficos, tabelas)
- [ ] Testar notificações em tempo real
- [ ] Implementar reconexão automática
- [ ] Adicionar indicador visual de conexão WebSocket

---

## 🎯 PRÓXIMOS PASSOS

1. **Testar WebSocket**
   - Conectar frontend ao WebSocket
   - Verificar recepção de mensagens
   - Testar reconexão automática

2. **Implementar Dashboard**
   - Criar componentes de visualização
   - Integrar gráficos (Chart.js ou similar)
   - Adicionar auto-refresh de estatísticas

3. **Notificações Visuais**
   - Toast/Snackbar para novas ocorrências
   - Badge de contador para alertas
   - Ícone piscante para emergências

4. **Mapa em Tempo Real**
   - Integrar Google Maps ou Leaflet
   - Exibir viaturas com marcadores coloridos
   - Atualizar posição em tempo real

---

**Desenvolvido em:** 02/10/2025
**Status:** ✅ BACKEND COMPLETO - Pronto para integração frontend
