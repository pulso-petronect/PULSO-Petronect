# PULSO Petronect

> Do clique à ação, com contexto.

**PULSO** (Painel de Sinais e Oportunidades) transforma rastros de navegação anonimizados do ecossistema Petronect em indicadores, segmentos comportamentais, alertas explicáveis, oportunidades e recomendações gerenciais.

Projeto demonstrativo (MVP) desenvolvido pela **Equipe 10** no **Hackathon Conexão Ancestral 2026** — realização **Petronect**, execução **KODIE Academy**.

🔗 Produção: <https://pulso-petronect-equipe10.vercel.app/>

---

## Problema

A Petronect tem um volume crescente de eventos de navegação, mas:

- Os dados ficam dispersos e sem leitura estratégica em tempo real;
- Não existe uma visão unificada do comportamento dos usuários;
- Insights ficam limitados a exportações e análises manuais de consultas;
- A comunicação com o usuário é reativa e baseada em intuição, sem evidências.

## Solução

Um painel que converte registros de acesso anonimizados em uma linha de raciocínio completa:

**Comportamento observado → evidência → hipótese → prioridade → recomendação → comunicação.**

- **Visão geral executiva** — indicadores, tendência de acessos, horários de pico, páginas mais acessadas e mudanças de métricas com filtros por período (30/14/7 dias) e por tipo de usuário.
- **Jornada dos usuários** — fluxo de navegação, taxas de continuidade e principal ponto de queda.
- **Segmentos comportamentais** — 7 perfis (Novo, Explorador, Interessado, Recorrente, Com dificuldade, Em risco de abandono, Reengajado) com contagem de usuários e tendência.
- **Central de oportunidades** — sinais explicáveis com regra utilizada, evidências, hipótese, prioridade, confiança, impacto e recomendação de próxima ação.
- **Comunicação inteligente** — geração assistida de mensagens por segmento, objetivo, canal e tom, com versões, edição, cópia e fluxo de aprovação.
- **Importação de dados (CSV)** — upload anônimo, validação de colunas obrigatórias e aplicação ao dashboard, com opção de restaurar a base simulada.
- **Metodologia transparente** — regras, premissas e limitações documentadas.
- **Guia demonstrativo** — tour passo a passo dentro do produto e botão de "Restaurar demonstração".

## Acesso demonstrativo

| Campo    | Valor                         |
| -------- | ----------------------------- |
| E-mail   | `analista@petronect.com.br`   |
| Senha    | `123456`                      |

> Credenciais fictícias para fins de demonstração. Não há contas nem servidor de autenticação real.

## Como funciona

- **Base simulada**: eventos gerados deterministicamente no navegador (sem rede) para explorar todas as funcionalidades.
- **Importação CSV**: o arquivo deve conter as colunas esperadas (`event`, `usuario`, `pagina`, `data` e demais). Erros de colunas obrigatórias são reportados na tela. Os dados são processados localmente e podem ser revertidos a qualquer momento.
- **Persistência**: autenticação, filtros, eventos importados e aprovações de comunicação são guardados em `localStorage` (chaves `pulso-auth`, `pulso-filters`, `pulso-events`, etc.).

## Privacidade e responsabilidade

- Nenhum dado pessoal identificável é exibido — os eventos usam usuários mascarados (`usuário_01`, ...).
- O processamento é **local** (no navegador) e a base é **anônima e demonstrativa**.
- O PULSO **propõe** hipóteses e recomendações — decisões finais ficam sempre nas mãos da equipe de negócio.

## Arquitetura e tecnologia

Monorepo `pnpm` (workspace) com aplicação **React 19 + TypeScript + Vite 7**, roteamento com **wouter**, estilização **Tailwind CSS**, gráficos **Recharts**, UI com Radix/lucide e testes E2E com **Playwright**.

```
PULSO-Petronect/
├── artifacts/
│   ├── pulso-petronect/        # Aplicação principal (MVP)
│   │   ├── src/App.tsx          # UI e fluxos (painel completo)
│   │   ├── src/data/pulso-data.ts  # Motor de dados (simulação, métricas, segmentos, comunicação)
│   │   ├── e2e/pulso.spec.ts    # 15 testes de ponta a ponta
│   │   ├── public/              # logo e favicon
│   │   └── vercel.json          # deploy SPA (Vercel)
│   ├── mockup-sandbox/          # Experimentos de layout
│   └── api-server/              # Referência opcional de API
└── scripts/                     # Utilidades do workspace
```

## Como rodar

Pré-requisito: **Node.js ≥ 22** e **pnpm** (`corepack enable`).

```bash
# instalar dependências
pnpm install

# validar tipos
pnpm run typecheck

# desenvolvimento
pnpm --filter @workspace/pulso-petronect dev

# produção (preview local)
pnpm --filter @workspace/pulso-petronect build
pnpm --filter @workspace/pulso-petronect serve
```

### Testes E2E (Playwright, 15 cenários)

Usa o Chrome instalado e um servidor de preview (porta 4173) gerenciado pelo próprio Playwright.

```bash
pnpm --filter @workspace/pulso-petronect test:e2e
```

Cobertura: login (sucesso, erro, persistência), logout, navegação entre as 8 rotas, filtros de período e tipo de usuário, importação CSV (válida, inválida e aplicação ao dashboard), regeneração/aprovação/cópia de comunicação e acesso direto a rotas sem 404.

### Deploy

```bash
vercel --prod   # ou via integração do repositório GitHub
```

- Build: `pnpm build` · Output: `dist/public` · Rewrites SPA incluídos em `vercel.json`.

## Limitações do MVP

- Base **simulada e anônima** — não consome dados reais nem uma API de produção.
- Autenticação **demonstrativa** — a senha é fixa e armazenada localmente.
- Segmentação e recomendações são **heurísticas explicáveis**, não modelos de ML.
- **Supervisão humana obrigatória** antes de qualquer comunicação com usuários reais.

## Próximos passos

- API real de eventos com ingestão em streaming e anonimização no servidor.
- Autenticação gerencial (SSO) e painel de equipe.
- Modelos preditivos com explicações auditáveis.
- Campanhas com aprovação em fluxo e medição de resultado no próprio produto.

## Equipe 10

- Regine Barbosa Gama
- Mariah Aparecida Navarro Rodrigues da Silva
- Jasmine de Sá Araujo
- Juliana Freire de Oliveira
- Stefany Rodrigues da Silva