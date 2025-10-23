# Guia Docker

Este documento descreve como empacotar e executar o sistema usando Docker, bem como realizar backup e restauracao do banco PostgreSQL.

## Requisitos

- Docker Engine 24 ou superior
- Docker Compose plugin (disponivel no docker CLI moderno)
- Acesso a um terminal com permissao para executar docker

## Primeira execucao local

1. Crie uma copia do codigo neste servidor.
2. Ajuste variaveis sensiveis no arquivo `.env` ou exporte via terminal antes de subir os servicos.
3. Execute `docker compose build` para gerar as imagens do backend e frontend.
4. Suba todo o conjunto com `docker compose up -d`.

Servicos padrao:
- Backend: http://localhost:8080
- Frontend: http://localhost:4173
- PostgreSQL: porta 5432

Use `docker compose logs -f backend` (ou frontend/postgres) para acompanhar os logs.

## Atualizar codigo e imagens

Sempre que houver mudancas no codigo:

1. Atualize o repositorio (`git pull`).
2. Execute `docker compose build --no-cache` se houver mudancas relevantes em dependencias.
3. Reinicie os servicos com `docker compose up -d`.

## Publicar imagens para outro servidor

Para enviar as imagens para um registry privado ou publico:

```bash
docker compose build
docker tag sistema2_backend:latest registry.exemplo.com/sistema/backend:latest
docker push registry.exemplo.com/sistema/backend:latest
```

Repita para o frontend. No servidor de destino bastara usar `docker pull` e atualizar a definicao do Compose para apontar para as imagens publicadas.

Caso prefira transportar via arquivo:

```bash
docker save sistema2_backend:latest -o backend.tar
docker save sistema2_frontend:latest -o frontend.tar
```

Copie os arquivos `.tar` para o servidor e execute `docker load -i backend.tar` para importar.

## Backup do PostgreSQL

Os scripts ficam em `scripts/postgres`.

### Linux ou macOS

- Com Docker (padrao):

  ```bash
  DB_PASS=123456 ./scripts/postgres/backup.sh
  ```

  O arquivo sera gravado em `backups/` com timestamp.

- Sem Docker (acesso direto ao servidor de banco):

  ```bash
  USE_DOCKER=0 DB_HOST=servidor DB_USER=usuario DB_PASS=senha ./scripts/postgres/backup.sh
  ```

### Windows PowerShell

```powershell
# Backup usando o container Postgres do Compose
powershell -ExecutionPolicy Bypass -File scripts\postgres\backup.ps1

# Backup conectando direto ao host
powershell -ExecutionPolicy Bypass -File scripts\postgres\backup.ps1 -Local -OutputDir backups -FileName minha_copia.dump
```

## Restaurar o PostgreSQL

- Linux/macOS:

  ```bash
  ./scripts/postgres/restore.sh backups/20250101_120000_saude_db.dump
  ```

- Windows:

  ```powershell
  powershell -ExecutionPolicy Bypass -File scripts\postgres\restore.ps1 -DumpFile backups\20250101_120000_saude_db.dump
  ```

Altere `DB_NAME`, `DB_USER` e `DB_PASS` via variaveis de ambiente quando precisar restaurar para uma base diferente.

## Migrar para outro servidor rapidamente

1. Execute `./scripts/postgres/backup.sh` e garanta que o arquivo `.dump` foi criado.
2. Rode `docker compose down` e `docker compose save` (ou `docker save` manual) para gerar os arquivos `.tar` das imagens se nao quiser rebuildar.
3. Copie o diretorio do projeto, a pasta `backups/` e os arquivos `.tar` para o novo servidor.
4. No novo host, importe as imagens (`docker load`), restaure o banco (`restore.sh` ou `restore.ps1`) e suba os servicos com `docker compose up -d`.

Com isso o ambiente fica pronto para atuar como servidor temporario com os mesmos dados e configuracoes.
