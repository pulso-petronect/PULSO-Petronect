export type SegmentKey = 'Novo' | 'Explorador' | 'Interessado' | 'Recorrente' | 'Com dificuldade' | 'Em risco de abandono' | 'Reengajado';

export type EventRecord = {
  id: string;
  userId: string;
  page: string;
  at: string;
  action: 'entrada' | 'visualização' | 'download' | 'busca' | 'saída';
  duration: number;
};

const pages = ['/inicio', '/oportunidades', '/documentacao', '/fornecedores', '/suporte', '/noticias', '/login'];
const dayLabels = ['01 mai', '04 mai', '07 mai', '10 mai', '13 mai', '16 mai', '19 mai', '22 mai', '25 mai', '28 mai', '30 mai'];
const pageNames = ['Página inicial', 'Oportunidades', 'Documentação', 'Fornecedores', 'Suporte', 'Notícias'];

export const segmentData: Array<{
  key: SegmentKey;
  count: number;
  percentage: number;
  trend: number;
  behavior: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  color: string;
}> = [
  { key: 'Interessado', count: 164, percentage: 32.8, trend: 6.4, behavior: 'Explora oportunidades e retorna à documentação.', priority: 'Alta', color: '#1E5799' },
  { key: 'Recorrente', count: 112, percentage: 22.4, trend: 3.1, behavior: 'Acessa com frequência e conclui fluxos de compra.', priority: 'Baixa', color: '#62BD4D' },
  { key: 'Explorador', count: 88, percentage: 17.6, trend: -1.8, behavior: 'Navega por diferentes áreas sem uma ação definida.', priority: 'Média', color: '#4B87C5' },
  { key: 'Com dificuldade', count: 54, percentage: 10.8, trend: 2.6, behavior: 'Repete caminhos e abandona antes da documentação.', priority: 'Alta', color: '#FF6654' },
  { key: 'Em risco de abandono', count: 39, percentage: 7.8, trend: -4.2, behavior: 'Diminuiu a frequência após uma tentativa sem conclusão.', priority: 'Alta', color: '#D54C61' },
  { key: 'Reengajado', count: 31, percentage: 6.2, trend: 8.9, behavior: 'Retornou depois de uma pausa e retomou a jornada.', priority: 'Média', color: '#D89A3C' },
  { key: 'Novo', count: 12, percentage: 2.4, trend: 1.2, behavior: 'Primeiro acesso ao ecossistema Petronect.', priority: 'Baixa', color: '#92A5B8' },
];

export const accessTrend = dayLabels.map((day, index) => ({
  day,
  acessos: [68, 82, 77, 96, 91, 108, 126, 118, 139, 152, 144][index],
  unicos: [29, 38, 34, 43, 41, 49, 57, 53, 61, 64, 60][index],
}));

export const hourlyData = [
  { hora: '06h', acessos: 12 }, { hora: '08h', acessos: 46 }, { hora: '10h', acessos: 79 },
  { hora: '12h', acessos: 54 }, { hora: '14h', acessos: 83 }, { hora: '16h', acessos: 71 },
  { hora: '18h', acessos: 39 }, { hora: '20h', acessos: 18 },
];

export const rankingData = pageNames.map((pagina, index) => ({
  pagina,
  acessos: [482, 361, 296, 214, 178, 128][index],
  share: [28.4, 21.3, 17.5, 12.6, 10.5, 7.5][index],
}));

export const funnelData = [
  { etapa: 'Entrada', value: 500, percentage: 100 },
  { etapa: 'Página inicial', value: 438, percentage: 87.6 },
  { etapa: 'Oportunidade', value: 316, percentage: 63.2 },
  { etapa: 'Documentação', value: 204, percentage: 40.8 },
  { etapa: 'Próxima ação', value: 127, percentage: 25.4 },
];

export const opportunities = [
  {
    id: 'opp-01',
    title: 'Busca sem retorno na documentação',
    segment: 'Com dificuldade' as SegmentKey,
    severity: 'Alta',
    confidence: 87,
    impact: 'Conversão',
    summary: 'Usuários repetem a busca por “cadastro de fornecedor” e deixam a página em menos de 40 segundos.',
    evidence: ['42 sessões com 2 ou mais buscas iguais', '68% abandonam antes de abrir um documento', 'Pico concentrado entre 10h e 14h'],
    recommendation: 'Criar atalho de cadastro na entrada da documentação e revisar os termos de busca.',
    status: 'Nova',
  },
  {
    id: 'opp-02',
    title: 'Retorno de interessados após 48 horas',
    segment: 'Interessado' as SegmentKey,
    severity: 'Média',
    confidence: 81,
    impact: 'Engajamento',
    summary: 'Parte relevante dos usuários visita uma oportunidade, mas precisa de uma segunda sessão para avançar.',
    evidence: ['31% retornam em até 48 horas', 'Documentação é a segunda página mais acessada', 'Maior concentração em empresas médias'],
    recommendation: 'Enviar uma comunicação contextual com resumo da oportunidade e documentação relacionada.',
    status: 'Em análise',
  },
  {
    id: 'opp-03',
    title: 'Queda de retorno após falha de acesso',
    segment: 'Em risco de abandono' as SegmentKey,
    severity: 'Alta',
    confidence: 76,
    impact: 'Retenção',
    summary: 'Usuários que encontram erro de acesso raramente retomam a jornada sem orientação.',
    evidence: ['19 sessões com erro na primeira tentativa', 'Retorno cai 34% após o erro', 'Suporte recebe contato apenas em 1 de 5 casos'],
    recommendation: 'Exibir orientação imediata e oferecer contato de suporte no mesmo contexto.',
    status: 'Nova',
  },
];

export const demoEvents: EventRecord[] = Array.from({ length: 360 }, (_, index) => {
  const userNumber = (index % 60) + 1;
  const day = (index % 30) + 1;
  const pageIndex = (index * 3 + Math.floor(index / 7)) % pages.length;
  return {
    id: `evt-${String(index + 1).padStart(4, '0')}`,
    userId: `USR-${String(userNumber).padStart(3, '0')}`,
    page: pages[pageIndex],
    at: `2026-05-${String(day).padStart(2, '0')}T${String(8 + (index % 11)).padStart(2, '0')}:00:00`,
    action: (['entrada', 'visualização', 'download', 'busca', 'saída'] as EventRecord['action'][])[index % 5],
    duration: 18 + ((index * 11) % 148),
  };
});

export const metricData = [
  { label: 'Total de acessos', value: '1.694', change: 12.8, detail: 'sessões no período', icon: 'activity', accent: 'blue' },
  { label: 'Usuários únicos', value: '500', change: 8.6, detail: 'identificadores anonimizados', icon: 'users', accent: 'green' },
  { label: 'Taxa de retorno', value: '38,4%', change: 4.7, detail: 'voltaram em até 7 dias', icon: 'repeat', accent: 'blue' },
  { label: 'Tempo médio', value: '04:18', change: -2.1, detail: 'minutos por sessão', icon: 'clock', accent: 'coral' },
  { label: 'Possível dificuldade', value: '54', change: -6.3, detail: 'usuários para observar', icon: 'triangle', accent: 'coral' },
  { label: 'Oportunidades', value: '07', change: 16.7, detail: 'sinais priorizados', icon: 'sparkles', accent: 'green' },
];

export const navItems = [
  { href: '/', label: 'Visão geral', icon: 'layout-dashboard' },
  { href: '/jornada', label: 'Jornada', icon: 'route' },
  { href: '/segmentos', label: 'Segmentos', icon: 'users-round' },
  { href: '/oportunidades', label: 'Oportunidades', icon: 'lightbulb' },
  { href: '/comunicacao', label: 'Comunicação', icon: 'send' },
  { href: '/importar', label: 'Importar dados', icon: 'upload-cloud' },
];

export const supportItems = [
  { href: '/metodologia', label: 'Metodologia', icon: 'book-open' },
  { href: '/sobre', label: 'Sobre o projeto', icon: 'info' },
];

export const formatNumber = (value: number) => new Intl.NumberFormat('pt-BR').format(value);

export function getStored<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

export function setStored<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* local-only demo */ }
}