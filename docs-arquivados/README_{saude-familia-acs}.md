# Módulo "Saúde da Família – ACS" (saude-familia-acs)

Este módulo adiciona recursos para gestão das Áreas de EACS/ESF, Microáreas, Vínculos com profissionais (ACS), Metas mensais, Visitas domiciliares, Rastreabilidade (TrackPoints) e Painel de acompanhamento.

Back-end: Java 17, Spring Boot (web, validation, data-jpa, security), PostgreSQL, Flyway, MapStruct. Base package: `com.sistemadesaude.backend`. API base path: `/api/saude-familia`.

Front-end: React + Vite + TypeScript + Tailwind + React Router + Zustand + axios (apiService). Gráficos (Recharts) e mapa (Leaflet) planejados — com placeholders iniciais.

Autenticação/Autorização: JWT já existente (OperadorContext). Perfis esperados:
- ADMIN_SISTEMA, GESTOR_AB, ENFERMEIRO, MEDICO, ACS, ADMIN_PUBLICO.
- Regras: rota “/painel/**” visível a GESTOR_AB e ACS; cadastros (Áreas e Metas) a ADMIN_SISTEMA e GESTOR_AB.

---

## Endpoints (API)
Base: `/api/saude-familia`

CADASTROS
- `GET /areas` — lista paginada de áreas (perfis: ADMIN_SISTEMA, GESTOR_AB, ACS)
- `GET /areas/{id}` — detalhe (perfis: ADMIN_SISTEMA, GESTOR_AB, ACS)
- `POST /areas` — cria área (perfis: ADMIN_SISTEMA, GESTOR_AB)
- `PUT /areas/{id}` — atualiza área (perfis: ADMIN_SISTEMA, GESTOR_AB)
- `DELETE /areas/{id}` — exclui ou inativa conforme histórico (perfis: ADMIN_SISTEMA, GESTOR_AB)
- `GET /areas/{id}/profissionais` — lista vínculos (perfis: ADMIN_SISTEMA, GESTOR_AB, ACS)
- `POST /areas/{id}/profissionais` — vincula profissional (perfis: ADMIN_SISTEMA, GESTOR_AB)
- `GET /areas/{id}/microareas` — lista microáreas (perfis: ADMIN_SISTEMA, GESTOR_AB, ACS)
- `POST /areas/{id}/microareas` — cria microárea (perfis: ADMIN_SISTEMA, GESTOR_AB)
- `DELETE /areas/{id}/microareas/{microId}` — remove microárea (perfis: ADMIN_SISTEMA, GESTOR_AB)

- `GET /metas` — lista paginada de metas (perfis: ADMIN_SISTEMA, GESTOR_AB, ACS)
- `GET /metas/{id}` — detalhe (perfis: ADMIN_SISTEMA, GESTOR_AB, ACS)
- `POST /metas` — cria meta (perfis: ADMIN_SISTEMA, GESTOR_AB)
- `PUT /metas/{id}` — atualiza meta (perfis: ADMIN_SISTEMA, GESTOR_AB)
- `DELETE /metas/{id}` — remove meta (perfis: ADMIN_SISTEMA, GESTOR_AB)

PAINEL (dados agregados — inicialmente mocks)
- `GET /painel/mapa/areas` — polígonos/pontos básicos das áreas (por ora centroid)
- `GET /painel/rastreabilidade?profissionalId&inicio&fim` — rota + pontos
- `GET /painel/visao-geral` — usuários por área/microárea + visitas últimos 12 meses
- `GET /painel/metas` — metas x realizado (famílias, integrantes, geral)
- `GET /painel/info-gerais` — integrantes visitados, motivos da visita, busca ativa, desfechos, evolução GESTANTE/HIPERTENSO/DIABETICO
- `GET /painel/detalhamento?areaId&microareaId&profissionalId&inicio&fim` — lista + pontos
- `GET /painel/acompanhamento?tipo` — pontos por tipo
- `GET /painel/condicoes?condicao` — pontos por condição
- `GET /painel/dispositivos` — grid de dispositivos e último sync

Obs.: Segurança aplicada com `@PreAuthorize` conforme perfis.

---

## Exemplos cURL
Assuma `BASE=http://localhost:5011/api/saude-familia` e `TOKEN=...`.

Listar áreas:
```
curl -H "Authorization: Bearer $TOKEN" "$BASE/areas"
```
Criar área:
```
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"descricao":"Área 01","ine":"0000001","situacao":"ATIVA"}' \
  "$BASE/areas"
```
Vincular profissional:
```
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"profissionalId": 123, "especialidade":"ACS","situacao":"ATIVO"}' \
  "$BASE/areas/1/profissionais"
```
Listar metas:
```
curl -H "Authorization: Bearer $TOKEN" "$BASE/metas"
```
Criar meta:
```
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"competencia":"202508","tipo":"FAMILIAS","valorMeta":300, "area":{"id":1}}' \
  "$BASE/metas"
```
Painel – visão geral:
```
curl -H "Authorization: Bearer $TOKEN" "$BASE/painel/visao-geral"
```

---

## Rotas (Front-end)
- `/saude-familia/areas` — CRUD de Áreas (tabs simples: Área | Profissionais | Microáreas)
- `/saude-familia/metas` — CRUD de Metas
- `/saude-familia/painel` — Tabs: Mapa | Rastreabilidade | Visão Geral | Metas | Informações Gerais | Detalhamento | Acompanhamento | Condições de Saúde | Dispositivos

As entradas de menu exigem perfis:
- Painel ACS: `GESTOR_AB` e `ACS`
- Áreas ACS: `ADMIN_SISTEMA` e `GESTOR_AB`
- Metas ACS: `ADMIN_SISTEMA` e `GESTOR_AB`

---

## Seeds & Profile de Desenvolvimento
O runner `AcsDemoDataRunner` (profile `dev`) popula dados de demonstração:
- 2 Áreas, 4 Microáreas, 5 vínculos ACS
- 12 meses de Metas
- 30 dias de Visitas + TrackPoints
- 2 Dispositivos

Para ativar: executar a aplicação com profile `dev` (ex.: `SPRING_PROFILES_ACTIVE=dev`). Em produção, o runner não executa.

---

## Notas Técnicas
- Migrations Flyway:
  - `V2__areas_e_micros.sql`, `V4__metas.sql`, `V5__visitas_trackpoints.sql`, `V6__condicoes_acompanhamentos.sql`, `V7__dispositivos.sql` (e variações com prefixos de data adicionadas nesta base)
- Indíces: `sf_area(ine)`, `sf_microarea(area_id,codigo)`, `sf_visita_domiciliar(data_hora)`, `sf_track_point(profissional_id,data_hora)`, `sf_visita_domiciliar(latitude, longitude)`
- TODO PostGIS: considerar tipos `geometry(Point, 4326)` e índices GIST. Mantido como comentário nos scripts.
- LGPD: mascarar dados sensíveis nos logs; não expor IMEI em logs de erro.

---

## Próximos Passos (Front)
- Recharts: implantar gráficos em Visão Geral, Metas e Informações Gerais
- Leaflet: implantar mapa real em Mapa e Rastreabilidade (rota + pontos)
- Filtros (área/microárea/período/profissional) conforme baseline do manual do Painel de ACS

## Próximos Passos (Back)
- Endpoints de agregação reais (substituir mocks), integrando contagens por repositórios
- Testes unitários (serviços) e de integração (controladores) com cobertura ≥70% para domínio/painel

---

## Build & Execução
- Backend: `mvn clean package` (ou usar o build do projeto principal). Flyway valida ao iniciar.
- Frontend: `npm install && npm run dev` (ou `npm run build`). As rotas já estão adicionadas ao menu conforme perfis.

Observação: gráficos/mapas serão ativados quando as dependências (Recharts, react-leaflet/leaflet) estiverem presentes. Até lá, placeholders são exibidos.
