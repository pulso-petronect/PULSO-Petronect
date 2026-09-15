# PULSO Petronect

## Problema

O Portal Petronect registra jornadas de navegação que podem conter sinais úteis, mas difíceis de transformar em leitura acionável sem contexto, explicabilidade e revisão humana.

## Solução e objetivo

O PULSO transforma registros anonimizados de navegação no Portal Petronect em indicadores, segmentos comportamentais, oportunidades explicáveis e rascunhos de comunicação para revisão humana. O protótipo ajuda a compreender jornadas de clientes e fornecedores e a priorizar possíveis ações.

## Funcionalidades

- Visão executiva com indicadores, tendências, ranking de páginas e segmentos.
- Filtros por período, tipo de usuário, página, segmento, prioridade e status.
- Importação de CSV, validação básica e restauração da base simulada.
- Jornada calculada a partir da base ativa, com sessões recentes e linha do tempo.
- Segmentos comportamentais e oportunidades com evidências e regras.
- Comunicação contextual editável, geração de versões, cópia e aprovação de simulação.
- Metodologia com etapas e princípios interativos.
- Página institucional do projeto, login demonstrativo e navegação responsiva.

## Arquitetura

A aplicação é um frontend React + TypeScript servido pelo Vite. Não há API nem banco de dados neste protótipo. O processamento ocorre localmente no navegador: os eventos ficam em estado React e, quando aplicável, no `localStorage`. A base simulada permanece disponível como fallback.

## Tecnologias

React, TypeScript, Vite, Wouter, Recharts, Tailwind CSS, Vitest e Testing Library.

## Instalação e execução

```bash
pnpm install
pnpm --filter @workspace/pulso-petronect dev
```

Para validação de produção:

```bash
pnpm --filter @workspace/pulso-petronect typecheck
pnpm --filter @workspace/pulso-petronect test -- --run
pnpm --filter @workspace/pulso-petronect build
```

## Credenciais demonstrativas

- Usuário: `analista@petronect.com.br`
- Senha: `123456`

A autenticação é demonstrativa e é mantida no navegador para permitir atualização da página durante a sessão.

## CSV esperado

As colunas obrigatórias são `user_id`, `timestamp`, `page` e `event_type`. A estrutura completa aceita também `session_id`, `user_type`, `duration_seconds`, `previous_page`, `next_page` e `completed_action`. O botão de importação disponibiliza um arquivo de exemplo.

## Base simulada

A base simulada é gerada deterministically no navegador e cobre acessos, sessões, páginas, tipos de usuário, conclusões e sinais usados pelos indicadores. Em Importar dados, “Restaurar base simulada” remove o CSV ativo e retorna a essa base.

## Privacidade e revisão humana

Os dados demonstrativos são simulados e anonimizados, usando identificadores como `USR-001`. O PULSO aplica minimização de dados e não envia eventos para servidores externos. Ele gera hipóteses, recomendações e rascunhos, mas não envia mensagens automaticamente; a decisão e aprovação final permanecem com uma pessoa responsável.

## Equipe 10

- Regine Barbosa Gama
- Mariah Aparecida Navarro Rodrigues da Silva
- Jasmine de Sá Araujo
- Juliana Freire de Oliveira
- Stefany Rodrigues da Silva

## Informações do projeto

- Realização: Petronect
- Execução: KODIE Academy
- Evento: Hackathon Conexão Ancestral 2026
- Natureza: Protótipo demonstrativo
- Processamento: local no navegador

## Aplicação

A aplicação publicada é configurada pelo projeto Vercel em `artifacts/pulso-petronect/vercel.json`. O endereço público deve ser informado pelo ambiente de deploy responsável pelo projeto.
