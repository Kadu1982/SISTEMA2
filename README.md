# Cidade Saúde Digital

Projeto unificado de gestão em saúde pública com backend em **Spring Boot** e frontend em **Vite/React**.

## 📦 Estrutura do Projeto

```
cidade-saude-digital/
├── backend/         → Aplicação Spring Boot
├── frontend/        → Aplicação Vite/React
├── docker-compose.yml
├── .gitignore
├── .env.example
└── README.md
```

---

## 🚀 Como rodar o projeto

### ▶️ Usando Docker (recomendado)

> Certifique-se de ter Docker e Docker Compose instalados.

```bash
docker-compose up --build
```

- Backend: http://localhost:8080
- Frontend: http://localhost:5173
- Banco de dados PostgreSQL: porta 5432

---

### 💻 Rodar manualmente (modo desenvolvedor)

#### Backend (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run
```

#### Frontend (Vite)

```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Compartilhar aplicação pela internet

Para compartilhar sua aplicação rodando localmente com outras pessoas via web:

### 1️⃣ Instalar Cloudflared (apenas uma vez)

```bash
winget install --id Cloudflare.cloudflared
```

### 2️⃣ Executar o script de compartilhamento

```bash
compartilhar-aplicacao.bat
```

Este script irá:
- Criar túneis seguros para backend e frontend
- Gerar URLs públicas temporárias (ex: `https://abc-def.trycloudflare.com`)
- Manter as conexões ativas enquanto o script estiver rodando

### 3️⃣ Compartilhar a URL do frontend

Copie a URL gerada para o **Frontend (porta 5173)** e compartilhe com quem deseja testar.

**Observações:**
- As URLs mudam a cada execução
- Os túneis são gratuitos e seguros
- Não precisa configurar firewall ou roteador
- Mantenha o backend e frontend rodando enquanto compartilha

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz baseado em `.env.example`.

## 📄 Licença

Projeto desenvolvido para fins públicos e educacionais.
---

## Guia Docker e backups

Consulte `docs/DOCKER_GUIDE.md` para instrucoes completas de conteinerizacao, deploy e procedures de backup/restauracao do banco PostgreSQL.
