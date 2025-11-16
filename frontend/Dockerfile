# ============================================
# STAGE 1: Instalar dependências
# ============================================
FROM node:20-alpine AS deps
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json ./

# Instalar todas as dependências (dev + prod) para build
RUN npm ci && \
    npm cache clean --force

# ============================================
# STAGE 2: Build da aplicação
# ============================================
FROM node:20-alpine AS build
WORKDIR /app

# Copiar dependências do stage anterior
COPY package.json package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fonte
COPY . .

# Variáveis de build
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

# Build da aplicação
RUN npm run build

# ============================================
# STAGE 3: Runtime (produção)
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app

# Instalar wget para healthcheck
RUN apk add --no-cache wget

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=4173

# Copiar arquivos necessários
COPY --from=build --chown=nextjs:nodejs /app/dist ./dist
COPY --chown=nextjs:nodejs serve-build.js ./serve-build.js

# Mudar para usuário não-root
USER nextjs

EXPOSE 4173

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4173 || exit 1

CMD ["node", "serve-build.js"]
