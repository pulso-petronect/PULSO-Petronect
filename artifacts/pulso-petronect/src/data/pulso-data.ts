export type SegmentKey = 'Novo' | 'Explorador' | 'Interessado' | 'Recorrente' | 'Com dificuldade' | 'Em risco de abandono' | 'Reengajado';

export type AccessEvent = {
  user_id: string;
  session_id: string;
  timestamp: string;
  page: string;
  event_type: string;
  user_type: string;
  duration_seconds: number;
  previous_page: string | null;
  next_page: string | null;
  completed_action: boolean;
};

const PAGE_LABELS: Record<string, string> = {
  '/': 'Página inicial',
  '/oportunidades': 'Oportunidades',
  '/documentacao': 'Documentação',
  '/fornecedores': 'Fornecedores',
  '/suporte': 'Suporte',
  '/noticias': 'Notícias',
  '/comunicacao': 'Comunicação',
  '/segmentos': 'Segmentos',
  '/jornada': 'Jornada',
  '/importar': 'Importar dados',
  '/metodologia': 'Metodologia',
  '/sobre': 'Sobre o projeto',
};

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateDefaultEvents(): AccessEvent[] {
  const rand = seededRandom(42);
  const events: AccessEvent[] = [];
  const userProfiles: Array<{
    type: string;
    startDay: number;
    avgSessions: number;
    pages: string[];
    completionRate: number;
    returnRate: number;
  }> = [
    { type: 'Novo', startDay: 22, avgSessions: 1.5, pages: ['/', '/oportunidades'], completionRate: 0.15, returnRate: 0.0 },
    { type: 'Novo', startDay: 25, avgSessions: 2, pages: ['/', '/documentacao', '/suporte'], completionRate: 0.2, returnRate: 0.0 },
    { type: 'Novo', startDay: 28, avgSessions: 1, pages: ['/'], completionRate: 0.1, returnRate: 0.0 },
    { type: 'Explorador', startDay: 1, avgSessions: 8, pages: ['/', '/oportunidades', '/fornecedores', '/noticias', '/suporte', '/metodologia'], completionRate: 0.3, returnRate: 0.5 },
    { type: 'Explorador', startDay: 5, avgSessions: 6, pages: ['/', '/noticias', '/fornecedores', '/metodologia'], completionRate: 0.25, returnRate: 0.45 },
    { type: 'Interessado', startDay: 3, avgSessions: 12, pages: ['/', '/oportunidades', '/documentacao', '/comunicacao'], completionRate: 0.6, returnRate: 0.7 },
    { type: 'Interessado', startDay: 7, avgSessions: 10, pages: ['/', '/oportunidades', '/documentacao'], completionRate: 0.55, returnRate: 0.65 },
    { type: 'Recorrente', startDay: 1, avgSessions: 18, pages: ['/', '/oportunidades', '/documentacao', '/comunicacao', '/segmentos'], completionRate: 0.8, returnRate: 0.85 },
    { type: 'Com dificuldade', startDay: 4, avgSessions: 14, pages: ['/', '/documentacao', '/suporte', '/documentacao', '/suporte'], completionRate: 0.2, returnRate: 0.6 },
    { type: 'Em risco de abandono', startDay: 2, avgSessions: 7, pages: ['/', '/oportunidades', '/documentacao', '/suporte'], completionRate: 0.3, returnRate: 0.15 },
    { type: 'Reengajado', startDay: 8, avgSessions: 9, pages: ['/', '/oportunidades', '/documentacao', '/comunicacao', '/segmentos'], completionRate: 0.65, returnRate: 0.75 },
  ];

  const userConfigs: Array<{ profileIndex: number; startDay: number }> = [];
  let profileIdx = 0;
  for (let u = 0; u < 60; u++) {
    const profile = userProfiles[profileIdx % userProfiles.length];
    const jitter = Math.floor(rand() * 5) - 2;
    const startDay = Math.max(1, Math.min(30, profile.startDay + jitter));
    userConfigs.push({ profileIndex: profileIdx % userProfiles.length, startDay });
    profileIdx++;
  }

  let eventCounter = 0;
  for (let u = 0; u < 60; u++) {
    const cfg = userConfigs[u];
    const profile = userProfiles[cfg.profileIndex];
    const userId = `USR-${String(u + 1).padStart(3, '0')}`;
    const numSessions = Math.max(1, Math.floor(profile.avgSessions + (rand() * 4 - 2)));
    const sessionPages = profile.pages;

    for (let s = 0; s < numSessions; s++) {
      const dayOffset = Math.floor(cfg.startDay + s * (rand() * 3 + 0.5));
      if (dayOffset > 30) continue;
      const day = Math.max(1, Math.min(30, dayOffset));
      const sessionId = `SES-${String(u + 1).padStart(3, '0')}-${String(s + 1).padStart(2, '0')}`;
      const hour = 8 + Math.floor(rand() * 10);
      const minute = Math.floor(rand() * 60);
      const numPages = Math.max(2, Math.floor(sessionPages.length * (0.4 + rand() * 0.6)));
      const shouldComplete = rand() < profile.completionRate;
      const shouldReturn = rand() < profile.returnRate;

      const sessionEventCount = Math.min(numPages + 2, sessionPages.length + 2);
      for (let p = 0; p < sessionEventCount; p++) {
        eventCounter++;
        const pageIdx = Math.min(p, sessionPages.length - 1);
        const page = sessionPages[pageIdx];
        const prevPage = p > 0 ? sessionPages[p - 1] : null;
        const isLast = p === sessionEventCount - 1;
        const nextPage = isLast ? null : (p + 1 < sessionEventCount ? sessionPages[Math.min(p + 1, sessionPages.length - 1)] : null);
        const minuteOffset = p * (2 + Math.floor(rand() * 8));
        const totalMinutes = hour * 60 + minute + minuteOffset;
        const finalHour = Math.floor(totalMinutes / 60);
        const finalMinute = totalMinutes % 60;
        const dayStr = String(day).padStart(2, '0');
        const hourStr = String(Math.min(23, finalHour)).padStart(2, '0');
        const minStr = String(Math.min(59, finalMinute)).padStart(2, '0');
        const timestamp = `2026-05-${dayStr}T${hourStr}:${minStr}:00`;
        const duration = 10 + Math.floor(rand() * 180);
        const eventType = p === 0 ? 'entrada' : isLast ? (shouldComplete ? 'download' : (rand() < 0.3 ? 'busca' : 'saída')) : (rand() < 0.2 ? 'busca' : 'visualização');
        events.push({
          user_id: userId,
          session_id: sessionId,
          timestamp,
          page,
          event_type: eventType,
          user_type: profile.type,
          duration_seconds: duration,
          previous_page: prevPage,
          next_page: nextPage,
          completed_action: isLast && shouldComplete,
        });
      }
      if (shouldReturn && rand() < 0.4) {
        eventCounter++;
        const returnDay = Math.min(30, day + 1 + Math.floor(rand() * 3));
        const returnHour = 8 + Math.floor(rand() * 10);
        events.push({
          user_id: userId,
          session_id: `SES-${String(u + 1).padStart(3, '0')}-R`,
          timestamp: `2026-05-${String(returnDay).padStart(2, '0')}T${String(returnHour).padStart(2, '0')}:${String(Math.floor(rand() * 60)).padStart(2, '0')}:00`,
          page: '/oportunidades',
          event_type: 'visualização',
          user_type: profile.type,
          duration_seconds: 30 + Math.floor(rand() * 120),
          previous_page: '/',
          next_page: '/documentacao',
          completed_action: false,
        });
      }
    }
  }
  return events.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export function parseCSV(text: string): { events: AccessEvent[]; errors: string[]; stats: { totalRows: number; validRows: number; users: number; dateRange: string } } {
  const lines = text.trim().split('\n');
  const errors: string[] = [];
  if (lines.length < 2) { errors.push('CSV deve conter pelo menos um cabeçalho e uma linha de dados.'); return { events: [], errors, stats: { totalRows: 0, validRows: 0, users: 0, dateRange: '' } }; }
  const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
  const required = ['user_id', 'timestamp', 'page', 'event_type'];
  const missing = required.filter(r => !header.includes(r));
  if (missing.length > 0) { errors.push(`Colunas obrigatórias ausentes: ${missing.join(', ')}`); return { events: [], errors, stats: { totalRows: 0, validRows: 0, users: 0, dateRange: '' } }; }
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));
  const events: AccessEvent[] = [];
  const users = new Set<string>();
  const dates: string[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''));
    if (cols.length < header.length) { errors.push(`Linha ${i + 1}: número de colunas insuficiente.`); continue; }
    const user_id = cols[idx['user_id']] || `USR-IMP-${i}`;
    const session_id = cols[idx['session_id']] || `SES-IMP-${i}`;
    const timestamp = cols[idx['timestamp']] || '';
    const page = cols[idx['page']] || '/';
    const event_type = cols[idx['event_type']] || 'visualização';
    const user_type = cols[idx['user_type']] || 'Explorador';
    const duration_seconds = parseInt(cols[idx['duration_seconds']] || '30', 10) || 30;
    const previous_page = cols[idx['previous_page']] || null;
    const next_page = cols[idx['next_page']] || null;
    const completed_action = cols[idx['completed_action']] === 'true' || cols[idx['completed_action']] === '1';
    if (!timestamp) { errors.push(`Linha ${i + 1}: timestamp ausente.`); continue; }
    users.add(user_id);
    dates.push(timestamp);
    events.push({ user_id, session_id, timestamp, page, event_type, user_type, duration_seconds, previous_page, next_page, completed_action });
  }
  const dateRange = dates.length > 0 ? `${dates[0].slice(0, 10)} a ${dates[dates.length - 1].slice(0, 10)}` : '';
  return { events, errors, stats: { totalRows: lines.length - 1, validRows: events.length, users: users.size, dateRange } };
}

export function eventsToCSV(events: AccessEvent[]): string {
  const header = 'user_id,session_id,timestamp,page,event_type,user_type,duration_seconds,previous_page,next_page,completed_action';
  const rows = events.map(e => `${e.user_id},${e.session_id},${e.timestamp},${e.page},${e.event_type},${e.user_type},${e.duration_seconds},${e.previous_page || ''},${e.next_page || ''},${e.completed_action}`);
  return [header, ...rows].join('\n');
}

export type Filters = {
  period: string;
  userType: string;
  page: string;
  segment: string;
  priority: string;
  oppStatus: string;
};

export const DEFAULT_FILTERS: Filters = {
  period: '30 dias',
  userType: 'Todos',
  page: 'Todas',
  segment: 'Todos',
  priority: 'Todas',
  oppStatus: 'Todas',
};

export type BaseSource = {
  mode: 'simulada' | 'importada';
  file: string | null;
  processedAt: string;
};

export type BaseInfo = {
  eventos: number;
  usuarios: number;
  inicio: string;
  fim: string;
};

export function computeBaseInfo(events: AccessEvent[]): BaseInfo {
  const usuarios = new Set(events.map(e => e.user_id)).size;
  const timestamps = events.map(e => e.timestamp.slice(0, 10)).sort();
  const inicio = timestamps.length > 0 ? timestamps[0] : '—';
  const fim = timestamps.length > 0 ? timestamps[timestamps.length - 1] : '—';
  return { eventos: events.length, usuarios, inicio, fim };
}

export function formatProcessedAt(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value || '—';
  return parsed.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export type ComputedMetrics = {
  totalAccesses: number;
  uniqueUsers: number;
  returnRate: number;
  avgDuration: string;
  difficultyCount: number;
  opportunitiesCount: number;
  changeAccesses: number;
  changeUsers: number;
  changeReturn: number;
  changeDuration: number;
  changeDifficulty: number;
  changeOpportunities: number;
};

export type AccessTrendDay = { day: string; acessos: number; unicos: number };
export type HourlyAccess = { hora: string; acessos: number };
export type PageRanking = { pagina: string; acessos: number; share: number };
export type ComputedSegment = { key: SegmentKey; count: number; percentage: number; trend: number; behavior: string; priority: 'Alta' | 'Média' | 'Baixa'; color: string; rule: string; confidence: number; possibleAction: string };
export type ComputedOpportunity = { id: string; title: string; segment: SegmentKey; severity: string; confidence: number; impact: string; summary: string; evidence: string[]; hypothesis: string; recommendation: string; metric: string; status: string; affectedUsers: number; rule: string };

function filterEvents(events: AccessEvent[], filters: Filters, now?: Date): AccessEvent[] {
  const referenceDate = now || new Date('2026-05-31T23:59:59');
  let filtered = [...events];
  const periodDays: Record<string, number> = { '7 dias': 7, '14 dias': 14, '30 dias': 30 };
  const days = periodDays[filters.period] || 30;
  const startDate = new Date(referenceDate);
  startDate.setDate(startDate.getDate() - days);
  const startStr = startDate.toISOString().slice(0, 10);
  const endStr = referenceDate.toISOString().slice(0, 10);
  filtered = filtered.filter(e => e.timestamp.slice(0, 10) >= startStr && e.timestamp.slice(0, 10) <= endStr);
  if (filters.userType && filters.userType !== 'Todos') {
    filtered = filtered.filter(e => e.user_type === filters.userType);
  }
  if (filters.page && filters.page !== 'Todas') {
    const pageMap: Record<string, string> = { 'Página inicial': '/', 'Oportunidades': '/oportunidades', 'Documentação': '/documentacao', 'Fornecedores': '/fornecedores', 'Suporte': '/suporte', 'Notícias': '/noticias' };
    filtered = filtered.filter(e => e.page === pageMap[filters.page] || e.page === filters.page);
  }
  return filtered;
}

function computePreviousPeriod(events: AccessEvent[], filters: Filters, now?: Date): AccessEvent[] {
  const referenceDate = now || new Date('2026-05-31T23:59:59');
  const periodDays: Record<string, number> = { '7 dias': 7, '14 dias': 14, '30 dias': 30 };
  const days = periodDays[filters.period] || 30;
  const prevEnd = new Date(referenceDate);
  prevEnd.setDate(prevEnd.getDate() - days);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - days);
  return events.filter(e => {
    const d = e.timestamp.slice(0, 10);
    return d >= prevStart.toISOString().slice(0, 10) && d <= prevEnd.toISOString().slice(0, 10);
  });
}

export function computeAll(events: AccessEvent[], filters: Filters, now?: Date) {
  const filtered = filterEvents(events, filters, now);
  const prevEvents = computePreviousPeriod(events, filters, now);
  const users = new Set(filtered.map(e => e.user_id));
  const prevUsers = new Set(prevEvents.map(e => e.user_id));
  const sessions = new Map<string, AccessEvent[]>();
  filtered.forEach(e => { if (!sessions.has(e.session_id)) sessions.set(e.session_id, []); sessions.get(e.session_id)!.push(e); });
  const prevSessions = new Map<string, AccessEvent[]>();
  prevEvents.forEach(e => { if (!prevSessions.has(e.session_id)) prevSessions.set(e.session_id, []); prevSessions.get(e.session_id)!.push(e); });
  let totalReturnUsers = 0;
  const userSessionDates = new Map<string, Set<string>>();
  filtered.forEach(e => {
    if (!userSessionDates.has(e.user_id)) userSessionDates.set(e.user_id, new Set());
    userSessionDates.get(e.user_id)!.add(e.timestamp.slice(0, 10));
  });
  userSessionDates.forEach((dates) => {
    const sorted = Array.from(dates).sort();
    if (sorted.length > 1) totalReturnUsers++;
  });
  const prevUserDates = new Map<string, Set<string>>();
  prevEvents.forEach(e => {
    if (!prevUserDates.has(e.user_id)) prevUserDates.set(e.user_id, new Set());
    prevUserDates.get(e.user_id)!.add(e.timestamp.slice(0, 10));
  });
  let prevReturnUsers = 0;
  prevUserDates.forEach((dates) => { if (dates.size > 1) prevReturnUsers++; });
  const returnRate = users.size > 0 ? (totalReturnUsers / users.size) * 100 : 0;
  const prevReturnRate = prevUsers.size > 0 ? (prevReturnUsers / prevUsers.size) * 100 : 0;
  const totalDuration = filtered.reduce((sum, e) => sum + e.duration_seconds, 0);
  const avgDurationSecs = filtered.length > 0 ? totalDuration / filtered.length : 0;
  const prevAvgDuration = prevEvents.length > 0 ? prevEvents.reduce((sum, e) => sum + e.duration_seconds, 0) / prevEvents.length : avgDurationSecs;
  const prevDurationChange = prevAvgDuration > 0 ? ((avgDurationSecs - prevAvgDuration) / prevAvgDuration) * 100 : 0;
  const userSegments = computeUserSegments(filtered, filters, now);
  const previousSegments = computeUserSegments(prevEvents, filters, now);
  const difficultyUsers = userSegments.filter(s => s.key === 'Com dificuldade').reduce((sum, s) => sum + s.count, 0);
  const previousDifficultyUsers = previousSegments.filter(s => s.key === 'Com dificuldade').reduce((sum, s) => sum + s.count, 0);
  const opportunities = computeOpportunities(filtered, userSegments, filters);
  const prevOpps = computeOpportunities(prevEvents, computeUserSegments(prevEvents, filters, now), filters);
  const formatDuration = (s: number) => { const m = Math.floor(s / 60); const sec = Math.floor(s % 60); return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`; };
  const metrics: ComputedMetrics = {
    totalAccesses: filtered.length,
    uniqueUsers: users.size,
    returnRate: Math.round(returnRate * 10) / 10,
    avgDuration: formatDuration(avgDurationSecs),
    difficultyCount: difficultyUsers,
    opportunitiesCount: opportunities.length,
    changeAccesses: prevEvents.length > 0 ? Math.round(((filtered.length - prevEvents.length) / prevEvents.length) * 100 * 10) / 10 : 0,
    changeUsers: prevUsers.size > 0 ? Math.round(((users.size - prevUsers.size) / prevUsers.size) * 100 * 10) / 10 : 0,
    changeReturn: prevReturnRate > 0 ? Math.round((returnRate - prevReturnRate) * 10) / 10 : 0,
    changeDuration: Math.round(prevDurationChange * 10) / 10,
    changeDifficulty: previousDifficultyUsers > 0 ? Math.round(((difficultyUsers - previousDifficultyUsers) / previousDifficultyUsers) * 100 * 10) / 10 : 0,
    changeOpportunities: prevOpps.length > 0 ? Math.round(((opportunities.length - prevOpps.length) / prevOpps.length) * 100 * 10) / 10 : 0,
  };
  const accessTrend = computeAccessTrend(filtered);
  const hourlyData = computeHourlyData(filtered);
  const rankingData = computeRanking(filtered);
  const filteredSegments = filters.segment && filters.segment !== 'Todos' ? userSegments.filter(s => s.key === filters.segment) : userSegments;
  const filteredOpps = filters.oppStatus && filters.oppStatus !== 'Todas' ? opportunities.filter(o => o.status === filters.oppStatus) : opportunities;
  const priorityOpps = filters.priority && filters.priority !== 'Todas' ? filteredOpps.filter(o => o.severity === filters.priority) : filteredOpps;
  return { metrics, accessTrend, hourlyData, rankingData, segments: filteredSegments, opportunities: priorityOpps, allOpportunities: opportunities, allSegments: userSegments, filtered };
}

function computeAccessTrend(events: AccessEvent[]): AccessTrendDay[] {
  const dayMap = new Map<string, { acessos: number; unicos: Set<string> }>();
  events.forEach(e => {
    const day = e.timestamp.slice(8, 10);
    const label = `${day} mai`;
    if (!dayMap.has(label)) dayMap.set(label, { acessos: 0, unicos: new Set() });
    const d = dayMap.get(label)!;
    d.acessos++;
    d.unicos.add(e.user_id);
  });
  return Array.from(dayMap.entries()).map(([day, d]) => ({ day, acessos: d.acessos, unicos: d.unicos.size })).sort((a, b) => a.day.localeCompare(b.day));
}

function computeHourlyData(events: AccessEvent[]): HourlyAccess[] {
  const hours = ['06h', '07h', '08h', '09h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h', '19h', '20h', '21h', '22h'];
  const hourMap = new Map<string, number>();
  hours.forEach(h => hourMap.set(h, 0));
  events.forEach(e => {
    const h = parseInt(e.timestamp.slice(11, 13), 10);
    if (h >= 6 && h <= 22) {
      const label = `${h}h`;
      hourMap.set(label, (hourMap.get(label) || 0) + 1);
    }
  });
  return hours.map(h => ({ hora: h, acessos: hourMap.get(h) || 0 }));
}

function computeRanking(events: AccessEvent[]): PageRanking[] {
  const pageMap = new Map<string, number>();
  events.forEach(e => { pageMap.set(e.page, (pageMap.get(e.page) || 0) + 1); });
  const total = events.length;
  return Array.from(pageMap.entries())
    .map(([page, count]) => ({ pagina: PAGE_LABELS[page] || page, acessos: count, share: total > 0 ? Math.round((count / total) * 1000) / 10 : 0 }))
    .sort((a, b) => b.acessos - a.acessos);
}

const SEGMENT_META: Record<SegmentKey, { rule: string; confidence: number; possibleAction: string; behavior: string; priority: 'Alta' | 'Média' | 'Baixa'; color: string; trend: number }> = {
  'Novo': { rule: 'Primeiro acesso no período com até 2 sessões', confidence: 95, possibleAction: 'Enviar boas-vindas e guia introdutório', behavior: 'Primeiro acesso ao ecossistema Petronect.', priority: 'Baixa', color: '#92A5B8', trend: 1.2 },
  'Explorador': { rule: 'Navega por páginas variadas sem padrão de conclusão', confidence: 82, possibleAction: 'Sugerir caminhos recomendados baseados em interesses', behavior: 'Navega por diferentes áreas sem uma ação definida.', priority: 'Média', color: '#4B87C5', trend: -1.8 },
  'Interessado': { rule: 'Visita oportunidades e documentação com possível retorno em 48h', confidence: 88, possibleAction: 'Enviar resumo da oportunidade visitada', behavior: 'Explora oportunidades e retorna à documentação.', priority: 'Alta', color: '#1E5799', trend: 6.4 },
  'Recorrente': { rule: '5+ sessões com alta taxa de conclusão de ações', confidence: 91, possibleAction: 'Manter engajamento com novidades relevantes', behavior: 'Acessa com frequência e conclui fluxos de compra.', priority: 'Baixa', color: '#62BD4D', trend: 3.1 },
  'Com dificuldade': { rule: 'Repetição de busca ou navegação com abandono antes da documentação', confidence: 79, possibleAction: 'Oferecer atalho na documentação e orientação contextual', behavior: 'Repete caminhos e abandona antes da documentação.', priority: 'Alta', color: '#FF6654', trend: 2.6 },
  'Em risco de abandono': { rule: 'Queda de frequência após tentativa sem conclusão', confidence: 74, possibleAction: 'Enviar comunicação de reengajamento com orientação', behavior: 'Diminuiu a frequência após uma tentativa sem conclusão.', priority: 'Alta', color: '#D54C61', trend: -4.2 },
  'Reengajado': { rule: 'Retorno após pausa de 3+ dias com interação renovada', confidence: 85, possibleAction: 'Confirmar retorno e oferecer continuidade da jornada', behavior: 'Retornou depois de uma pausa e retomou a jornada.', priority: 'Média', color: '#D89A3C', trend: 8.9 },
};

function inferSegmentForUser(sessions: AccessEvent[]): SegmentKey {
  const order: SegmentKey[] = ['Novo', 'Reengajado', 'Em risco de abandono', 'Com dificuldade', 'Recorrente', 'Interessado', 'Explorador'];
  const counts: Partial<Record<SegmentKey, number>> = {};
  sessions.forEach(e => {
    const type = (e.user_type in SEGMENT_META ? e.user_type : 'Explorador') as SegmentKey;
    counts[type] = (counts[type] || 0) + 1;
  });
  let best: SegmentKey = 'Explorador';
  let bestCount = -1;
  order.forEach(key => {
    const count = counts[key] || 0;
    if (count > bestCount) { bestCount = count; best = key; }
  });
  const sorted = [...sessions].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const dates = new Set(sorted.map(e => e.timestamp.slice(0, 10)));
  const totalEvents = sessions.length;
  const completions = sessions.filter(e => e.completed_action).length;
  const searches = sessions.filter(e => e.event_type === 'busca').length;
  const hasAbandon = sessions.some(e => e.event_type === 'saída' && !e.completed_action);
  const hasOpportunity = sessions.some(e => e.page === '/oportunidades');
  const hasDocumentation = sessions.some(e => e.page === '/documentacao');
  const sortedDates = Array.from(dates).sort();
  if (totalEvents > 0 && sortedDates.length <= 2 && new Date('2026-06-01').getTime() - new Date(sortedDates[sortedDates.length - 1]).getTime() < 7 * 86400000) return 'Novo';
  if (!hasAbandon && best === ('Em risco de abandono' as SegmentKey)) best = 'Explorador';
  if (searches >= 3 && (hasAbandon || !hasDocumentation)) return 'Com dificuldade';
  if (hasOpportunity && hasDocumentation && totalEvents >= 3) return 'Interessado';
  if (dates.size >= 4 && completions >= 2) return 'Recorrente';
  return best;
}

function computeUserSegments(events: AccessEvent[], _filters: Filters, _now?: Date): ComputedSegment[] {
  const userSessions = new Map<string, AccessEvent[]>();
  events.forEach(e => {
    if (!userSessions.has(e.user_id)) userSessions.set(e.user_id, []);
    userSessions.get(e.user_id)!.push(e);
  });
  const segments: Map<SegmentKey, { count: number }> = new Map();
  Object.keys(SEGMENT_META).forEach(key => segments.set(key as SegmentKey, { count: 0 }));
  userSessions.forEach((sessions) => {
    const key = inferSegmentForUser(sessions);
    segments.get(key)!.count++;
  });
  const total = userSessions.size || 1;
  return (Object.keys(SEGMENT_META) as SegmentKey[]).map(key => {
    const meta = SEGMENT_META[key];
    const count = segments.get(key)!.count;
    return {
      key,
      count,
      percentage: Math.round((count / total) * 1000) / 10,
      trend: meta.trend,
      behavior: meta.behavior,
      priority: meta.priority,
      color: meta.color,
      rule: meta.rule,
      confidence: meta.confidence,
      possibleAction: meta.possibleAction,
    };
  });
}

function computeOpportunities(events: AccessEvent[], segments: ComputedSegment[], _filters: Filters): ComputedOpportunity[] {
  const opps: ComputedOpportunity[] = [];
  const userSessions = new Map<string, AccessEvent[]>();
  events.forEach(e => { if (!userSessions.has(e.user_id)) userSessions.set(e.user_id, []); userSessions.get(e.user_id)!.push(e); });
  let docRepeatedNoAction = 0;
  let docSearches = 0;
  let docAbandons = 0;
  let opportunityViews = 0;
  let opportunityNoDoc = 0;
  let supportContacts = 0;
  let repeatSearches = 0;
  let usersWithRepeatSearch = 0;
  let inactiveUsers = 0;
  userSessions.forEach((sessions) => {
    const sorted = sessions.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    const searches = sorted.filter(e => e.event_type === 'busca').length;
    const docAccesses = sorted.filter(e => e.page === '/documentacao').length;
    const hasDoc = sorted.some(e => e.page === '/documentacao');
    const hasOpp = sorted.some(e => e.page === '/oportunidades');
    const hasSupport = sorted.some(e => e.page === '/suporte');
    const completedAny = sorted.some(e => e.completed_action);
    const lastDate = sorted[sorted.length - 1]?.timestamp.slice(0, 10) || '2026-05-01';
    const daysSince = (new Date('2026-05-31').getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24);
    if (docAccesses >= 4 && !completedAny) docRepeatedNoAction++;
    if (searches >= 2) { repeatSearches += searches; usersWithRepeatSearch++; }
    if (!hasDoc && searches > 0) docSearches++;
    if (sorted.some(e => e.event_type === 'saída' && !e.completed_action)) docAbandons++;
    if (hasOpp) opportunityViews++;
    if (hasOpp && !hasDoc) opportunityNoDoc++;
    if (hasSupport) supportContacts++;
    if (daysSince > 10) inactiveUsers++;
  });
  const difficultySeg = segments.find(s => s.key === 'Com dificuldade');
  const abandonSeg = segments.find(s => s.key === 'Em risco de abandono');
  const interestedSeg = segments.find(s => s.key === 'Interessado');
  const reengagedSeg = segments.find(s => s.key === 'Reengajado');
  if (docRepeatedNoAction > 0) {
    opps.push({
      id: 'opp-01', title: 'Possível barreira documental',
      segment: 'Com dificuldade', severity: 'Alta', confidence: 86,
      impact: 'Conclusão de ações',
      summary: `Um grupo de ${docRepeatedNoAction} usuários acessou a área de documentação repetidamente e não concluiu a próxima etapa da jornada. Com base em ${difficultySeg?.count || docRepeatedNoAction} usuários classificados no segmento.`,
      evidence: [`Quatro ou mais acessos à área de documentação no período`, `Nenhuma ação concluída após esses acessos`],
      hypothesis: 'Possível barreira para localizar ou compreender os requisitos. Trata-se de uma hipótese, não de uma certeza.',
      recommendation: 'Enviar orientação segmentada com caminho direto para os materiais mais acessados da documentação.',
      metric: 'Taxa de conclusão de ações do segmento, comparando antes e depois da comunicação.',
      status: 'Nova', affectedUsers: docRepeatedNoAction, rule: 'Acesso repetido à documentação (4+) sem conclusão de ação',
    });
  }
  if (repeatSearches > 0) {
    opps.push({
      id: 'opp-02', title: 'Busca sem retorno na documentação',
      segment: 'Com dificuldade', severity: 'Alta', confidence: 87,
      impact: 'Conversão',
      summary: `${repeatSearches} instâncias de busca repetida detectadas. Usuários não encontram caminho direto para a documentação desejada.`,
      evidence: [`${repeatSearches} sessões com buscas repetidas`, `${Math.round((docAbandons / Math.max(1, userSessions.size)) * 100)}% abandonam antes de abrir um documento`, 'Pico concentrado entre 10h e 14h'],
      hypothesis: 'Hipótese: os termos utilizados ou a estrutura de apresentação dificultam a localização do documento.',
      recommendation: 'Criar atalho de busca na entrada da documentação e revisar os termos de busca mais frequentes.',
      metric: 'Taxa de busca sem download e o tempo para abrir um documento após a busca.',
      status: 'Nova', affectedUsers: usersWithRepeatSearch, rule: 'Repetição de busca com abandono subsequente',
    });
  }
  if (opportunityViews > 0) {
    opps.push({
      id: 'opp-03', title: 'Retorno de interessados após 48 horas',
      segment: 'Interessado', severity: 'Média', confidence: 81,
      impact: 'Engajamento',
      summary: `${interestedSeg?.count || 0} usuários classificados como interessados. Parte retorna em segunda sessão para avançar na decisão.`,
      evidence: [`${Math.round((opportunityViews / Math.max(1, userSessions.size)) * 100)}% visitaram oportunidades`, 'Documentação é a segunda página mais acessada', 'Maior concentração em horário comercial'],
      hypothesis: 'Hipótese: o interesse existe, mas falta um resumo contextual para avançar a decisão.',
      recommendation: 'Enviar comunicação contextual com resumo da oportunidade e documentação relacionada.',
      metric: 'Taxa de retorno em 48h e abertura de documentação após a comunicação.',
      status: 'Em análise', affectedUsers: opportunityViews, rule: 'Interesse com retorno em 48h',
    });
  }
  if (docAbandons > 2) {
    opps.push({
      id: 'opp-04', title: 'Risco de abandono após tentativa sem conclusão',
      segment: 'Em risco de abandono', severity: 'Alta', confidence: 76,
      impact: 'Retenção',
      summary: `${abandonSeg?.count || 0} usuários em risco. A taxa de abandono sugere barreiras na jornada de conclusão.`,
      evidence: [`${docAbandons} sessões com saída sem conclusão`, `Taxa de retorno cai em usuários que abandonaram`, 'Suporte recebe contato em minoria dos casos'],
      hypothesis: 'Hipótese: algum obstáculo na jornada de conclusão está levando ao abandono.',
      recommendation: 'Exibir orientação imediata em pontos de abandono e sugerir caminhos alternativos.',
      metric: 'Taxa de retorno e conclusão dos usuários em risco após a orientação imediata.',
      status: 'Nova', affectedUsers: docAbandons, rule: 'Abandono sem conclusão de ação',
    });
  }
  if (opportunityNoDoc > 0) {
    opps.push({
      id: 'opp-05', title: 'Repetição de navegação sem progressão documental',
      segment: 'Explorador', severity: 'Média', confidence: 72,
      impact: 'Eficiência',
      summary: `${opportunityNoDoc} usuários visitam oportunidades mas não avançam para documentação. Padrão de navegação circular detectado.`,
      evidence: [`${opportunityNoDoc} sessões com navegação oportunidade→início`, 'Padrão se repete em 3+ sessões', 'Maioria não acessa suporte'],
      hypothesis: 'Hipótese: falta um caminho direto entre oportunidades e documentação.',
      recommendation: 'Inserir link direto para documentação relevante dentro da página de oportunidades.',
      metric: 'Tempo entre visitar uma oportunidade e abrir a documentação correspondente.',
      status: 'Em análise', affectedUsers: opportunityNoDoc, rule: 'Navegação circular sem progressão',
    });
  }
  if ((reengagedSeg?.count || 0) > 0 || inactiveUsers > 0) {
    opps.push({
      id: 'opp-06', title: 'Oportunidade de reengajamento com base na inatividade',
      segment: 'Reengajado', severity: 'Média', confidence: 68,
      impact: 'Retenção',
      summary: `${inactiveUsers} usuários com inatividade prolongada. Hipótese de que comunicação direcionada pode retomar a jornada.`,
      evidence: [`${inactiveUsers} usuários sem atividade nos últimos 10 dias`, 'Reengajados mostram taxa de retorno de 75%', 'Momento ideal para intervenção contextual'],
      hypothesis: 'Hipótese: uma comunicação direcionada pode retomar a jornada de usuários inativos.',
      recommendation: 'Criar campanha de reengajamento segmentada com resumo de oportunidades disponíveis.',
      metric: 'Taxa de retorno de usuários inativos após a campanha.',
      status: 'Nova', affectedUsers: inactiveUsers, rule: 'Inatividade prolongada com histórico de interação',
    });
  }
  if (opps.length === 0) {
    opps.push({
      id: 'opp-07', title: 'Análise comportamental em andamento',
      segment: 'Explorador', severity: 'Baixa', confidence: 50,
      impact: 'Exploração',
      summary: 'Ainda não foram identificados sinais suficientes para oportunidades prioritárias. Continue monitorando.',
      evidence: ['Base de eventos em análise', 'Regras de segmentação ativas'],
      hypothesis: 'Sem hipótese ativa — ainda não há sinais suficientes para uma ação direcionada.',
      recommendation: 'Aguardar mais dados para gerar oportunidades mais precisas.',
      metric: 'Monitoramento da base em busca dos primeiros padrões consistentes.',
      status: 'Em análise', affectedUsers: 0, rule: 'Insuficiência de dados',
    });
  }
  return opps;
}

const COMMUNICATION_TEMPLATES: Record<string, Record<string, Record<string, { subject: string; body: string }>>> = {
  'Com dificuldade': {
    'Reduzir abandono': {
      'Orientativo': { subject: 'Encontre o caminho na documentação com mais facilidade', body: 'Olá! Identificamos que sua busca por informações na documentação pode ser otimizada.\n\nCriamos um atalho direto para os materiais mais procurados, facilitando seu acesso à documentação Petronect.\n\nAcesse a seção de documentação para consultar os materiais organizados por tema.' },
      'Direto': { subject: 'Sua busca na documentação — como melhorar', body: 'Identificamos padrões de busca que podem indicar dificuldade no acesso à documentação.\n\nNovo caminho recomendado disponível. Acesse a documentação pelo link direto.' },
      'Institucional': { subject: 'PULSO — Atualização sobre acesso à documentação', body: 'Prezado(a),\n\nCom base na análise comportamental do ecossistema Petronect, identificamos uma oportunidade de melhoria no acesso à documentação.\n\nAtalho recomendado disponível. Acesse pela página inicial.' },
    },
    'Aumentar retorno': {
      'Orientativo': { subject: 'Retorne à documentação com o caminho atualizado', body: 'Olá! Atualizamos a organização da documentação para facilitar seu retorno.\n\nO caminho recomendado foi simplificado baseado nos padrões de navegação observados.\n\nAcesse a documentação para verificar as melhorias.' },
      'Direto': { subject: 'Documentação atualizada — acesse agora', body: 'Atualizamos a organização da documentação. Novo caminho disponível na página inicial.' },
      'Institucional': { subject: 'PULSO — Melhoria na organização da documentação', body: 'Prezado(a),\n\nInformamos que a documentação foi reorganizada para melhor experiência de navegação.\n\nAcesse pela página inicial do ecossistema.' },
    },
    'Orientar acesso': {
      'Orientativo': { subject: 'Guia rápido: como encontrar o que precisa na documentação', body: 'Olá! Preparamos um guia para facilitar sua busca na documentação.\n\n1. Acesse a página de documentação\n2. Utilize os filtros por tema\n3. Consulte os materiais mais acessados\n\nPrecisando de ajuda, o suporte está disponível.' },
      'Direto': { subject: 'Guia de acesso à documentação', body: 'Guia rápido disponível:\n1. Acesse Documentação\n2. Filtre por tema\n3. Consulte materiais frequentes' },
      'Institucional': { subject: 'PULSO — Guia de navegação na documentação', body: 'Prezado(a),\n\nDisponibilizamos um guia para otimizar sua navegação na documentação do ecossistema Petronect.\n\nAcesse pela seção de documentação.' },
    },
    'Explicar documentação': {
      'Orientativo': { subject: 'Entenda a estrutura da documentação Petronect', body: 'Olá! A documentação do ecossistema Petronect foi organizada em categorias temáticas.\n\nCada seção contém materiais relevantes para sua jornada. Explore as categorias na página de documentação.' },
      'Direto': { subject: 'Estrutura da documentação explicada', body: 'Documentação organizada em categorias temáticas. Acesse a página de documentação para navegar.' },
      'Institucional': { subject: 'PULSO — Estrutura da documentação atualizada', body: 'Prezado(a),\n\nA documentação foi reorganizada em categorias para facilitar a localização de informações.\n\nConsulte a seção de documentação.' },
    },
    'Estimular conclusão': {
      'Orientativo': { subject: 'Complete sua jornada na documentação', body: 'Olá! Você está a um passo de concluir sua busca na documentação.\n\nO material que procura está disponível. Acesse e finalize sua consulta.' },
      'Direto': { subject: 'Finalize sua consulta na documentação', body: 'Seu material está pronto. Acesse a documentação e conclua sua consulta.' },
      'Institucional': { subject: 'PULSO — Conclusão da consulta documental', body: 'Prezado(a),\n\nSugerimos concluir sua consulta na documentação para avançar em sua jornada.\n\nMaterial disponível na seção correspondente.' },
    },
  },
  'Interessado': {
    'Reduzir abandono': {
      'Orientativo': { subject: 'Sua oportunidade de interesse — próximos passos', body: 'Olá! Identificamos que você demonstrou interesse em uma oportunidade específica.\n\nPara avançar, acesse a documentação relacionada. Estamos aqui para orientar seu próximo passo.' },
      'Direto': { subject: 'Próximo passo para sua oportunidade', body: 'Acesse a documentação da oportunidade que você visitou. Material de apoio disponível.' },
      'Institucional': { subject: 'PULSO — Continuidade da sua jornada de interesse', body: 'Prezado(a),\n\nDetectamos seu interesse em uma oportunidade do ecossistema. Material de apoio disponível na documentação.' },
    },
    'Aumentar retorno': {
      'Orientativo': { subject: 'Retornamos com novidades para você', body: 'Olá! Novidades relevantes para o seu perfil de interesse foram identificadas.\n\nAcesse a página de oportunidades para verificar atualizações.' },
      'Direto': { subject: 'Novidades para seu perfil', body: 'Atualizações disponíveis na página de oportunidades. Acesse para verificar.' },
      'Institucional': { subject: 'PULSO — Atualizações relevantes para seu perfil', body: 'Prezado(a),\n\nNovas oportunidades alinhadas ao seu padrão de interesse foram identificadas.\n\nAcesse a seção de oportunidades.' },
    },
    'Orientar acesso': {
      'Orientativo': { subject: 'Como acessar a oportunidade recomendada', body: 'Olá! Preparamos um guia para acessar a oportunidade que mais se alinha ao seu perfil.\n\nAcesse a página de oportunidades e utilize os filtros de segmentação.' },
      'Direto': { subject: 'Guia: acessar oportunidades relevantes', body: 'Guia disponível. Acesse Oportunidades > Filtre por segmento > Material de apoio.' },
      'Institucional': { subject: 'PULSO — Guia de acesso a oportunidades', body: 'Prezado(a),\n\nDisponibilizamos um guia para acessar oportunidades relevantes ao seu perfil de navegação.' },
    },
    'Explicar documentação': {
      'Orientativo': { subject: 'Documentação da oportunidade disponível', body: 'Olá! A documentação relacionada à oportunidade de seu interesse está disponível.\n\nAcesse a seção de documentação para consultar os materiais.' },
      'Direto': { subject: 'Documentação da oportunidade', body: 'Material documental disponível. Acesse Documentação > Oportunidade selecionada.' },
      'Institucional': { subject: 'PULSO — Documentação de apoio disponível', body: 'Prezado(a),\n\nDocumentação de apoio à oportunidade identificada está disponível na seção correspondente.' },
    },
    'Estimular conclusão': {
      'Orientativo': { subject: 'Avance na sua decisão — documentação pronta', body: 'Olá! A documentação para concluir sua avaliação está pronta.\n\nAcesse e finalize sua análise para avançar na decisão.' },
      'Direto': { subject: 'Documentação pronta para sua decisão', body: 'Material completo disponível. Acesse a documentação e finalize sua análise.' },
      'Institucional': { subject: 'PULSO — Conclusão da análise disponível', body: 'Prezado(a),\n\nDocumentação completa para análise disponível. Acesse para concluir sua avaliação.' },
    },
  },
  'Em risco de abandono': {
    'Reduzir abandono': {
      'Orientativo': { subject: 'Sentiu dificuldade? Podemos ajudar', body: 'Olá! Notamos que sua última experiência pode ter encontrado dificuldades.\n\nPreparamos um caminho simplificado para retomar sua jornada no ecossistema Petronect.\n\nAcesse a página inicial para ver o caminho recomendado.' },
      'Direto': { subject: 'Retome sua jornada com caminho simplificado', body: 'Caminho simplificado disponível para retomar sua jornada. Acesse a página inicial.' },
      'Institucional': { subject: 'PULSO — Caminho simplificado disponível', body: 'Prezado(a),\n\nIdentificamos oportunidade de melhorar sua experiência. Caminho simplificado disponível na página inicial.' },
    },
    'Aumentar retorno': {
      'Orientativo': { subject: 'Temos novidades para retomar sua jornada', body: 'Olá! Novidades foram adicionadas desde sua última visita.\n\nAcesse o ecossistema para verificar o que mudou e retomar sua jornada.' },
      'Direto': { subject: 'Novidades desde sua última visita', body: 'Atualizações disponíveis. Acesse o ecossistema para verificar.' },
      'Institucional': { subject: 'PULSO — Atualizações desde sua última visita', body: 'Prezado(a),\n\nNovas funcionalidades e oportunidades foram adicionadas ao ecossistema desde sua última visita.' },
    },
    'Orientar acesso': {
      'Orientativo': { subject: 'Guia para retomar sua jornada', body: 'Olá! Preparamos um guia para facilitar o retorno ao ecossistema.\n\n1. Acesse a página inicial\n2. Siga o caminho recomendado\n3. Consulte as oportunidades disponíveis' },
      'Direto': { subject: 'Guia de retorno ao ecossistema', body: 'Guia disponível:\n1. Página inicial\n2. Caminho recomendado\n3. Oportunidades disponíveis' },
      'Institucional': { subject: 'PULSO — Guia de retorno ao ecossistema', body: 'Prezado(a),\n\nGuia de retorno disponível com caminho simplificado para sua jornada no ecossistema.' },
    },
    'Explicar documentação': {
      'Orientativo': { subject: 'Documentação organizada para facilitar seu retorno', body: 'Olá! Reorganizamos a documentação para facilitar seu acesso.\n\nAcesse a seção de documentação para encontrar o material organizado por temas.' },
      'Direto': { subject: 'Documentação reorganizada', body: 'Documentação reorganizada por temas. Acesse a seção correspondente.' },
      'Institucional': { subject: 'PULSO — Documentação reorganizada para você', body: 'Prezado(a),\n\nA documentação foi reorganizada para facilitar seu acesso e retorno ao ecossistema.' },
    },
    'Estimular conclusão': {
      'Orientativo': { subject: 'Continue de onde parou', body: 'Olá! Você pode continuar sua jornada exatamente de onde parou.\n\nAcesse a página para retomar sua atividade.' },
      'Direto': { subject: 'Retome sua atividade', body: 'Continue de onde parou. Acesse o ecossistema para retomar.' },
      'Institucional': { subject: 'PULSO — Continuidade da sua jornada', body: 'Prezado(a),\n\nSua jornada pode ser retomada exatamente de onde você parou. Acesse o ecossistema.' },
    },
  },
  'Recorrente': {
    'Reduzir abandono': { 'Orientativo': { subject: 'Mantenha o ritmo — novidades para você', body: 'Olá! Como você é um usuário recorrente, separamos novidades relevantes para seu perfil.' }, 'Direto': { subject: 'Novidades para seu perfil recorrente', body: 'Atualizações relevantes disponíveis. Acesse a página de oportunidades.' }, 'Institucional': { subject: 'PULSO — Novidades para usuários recorrentes', body: 'Prezado(a),\n\nNovidades relevantes ao seu perfil foram identificadas.' } }, 'Aumentar retorno': { 'Orientativo': { subject: 'Bem-vindo de volta!', body: 'Olá! Novidades esperam por você no ecossistema Petronect.' }, 'Direto': { subject: 'Novidades disponíveis', body: 'Acesse o ecossistema para verificar novidades.' }, 'Institucional': { subject: 'PULSO — Novidades para seu retorno', body: 'Prezado(a),\n\nNovidades relevantes estão disponíveis para sua consulta.' } }, 'Orientar acesso': { 'Orientativo': { subject: 'Acesso rápido às suas áreas de interesse', body: 'Olá! Preparamos atalhos para suas áreas de maior interesse.' }, 'Direto': { subject: 'Atalhos para áreas de interesse', body: 'Atalhos disponíveis na página inicial para suas áreas frequentes.' }, 'Institucional': { subject: 'PULSO — Atalhos personalizados', body: 'Prezado(a),\n\nAtalhos para suas áreas de maior utilização disponíveis na página inicial.' } }, 'Explicar documentação': { 'Orientativo': { subject: 'Documentação atualizada para você', body: 'Olá! A documentação foi atualizada com novos materiais relevantes para seu perfil.' }, 'Direto': { subject: 'Documentação atualizada', body: 'Novos materiais disponíveis na seção de documentação.' }, 'Institucional': { subject: 'PULSO — Atualização documental', body: 'Prezado(a),\n\nNovos materiais documentais relevantes ao seu perfil foram adicionados.' } }, 'Estimular conclusão': { 'Orientativo': { subject: 'Aproveite ao máximo o ecossistema', body: 'Olá! Aproveite todas as funcionalidades disponíveis no ecossistema.' }, 'Direto': { subject: 'Explore todas as funcionalidades', body: 'Explore todas as funcionalidades disponíveis no ecossistema.' }, 'Institucional': { subject: 'PULSO — Maximizando sua experiência', body: 'Prezado(a),\n\nExplore todas as funcionalidades disponíveis para otimizar sua experiência.' } } },
  'Novo': { 'Reduzir abandono': { 'Orientativo': { subject: 'Bem-vindo ao PULSO — comece por aqui', body: 'Olá! Bem-vindo(a) ao ecossistema Petronect.\n\nSiga o caminho recomendado para começar sua jornada.' }, 'Direto': { subject: 'Primeiros passos no PULSO', body: 'Bem-vindo! Siga o caminho recomendado na página inicial.' }, 'Institucional': { subject: 'PULSO — Boas-vindas ao ecossistema', body: 'Prezado(a),\n\nBem-vindo(a) ao ecossistema Petronect. Siga o guia de início na página inicial.' } }, 'Aumentar retorno': { 'Orientativo': { subject: 'Continue explorando o PULSO', body: 'Olá! Que tal explorar mais do ecossistema na sua próxima visita?' }, 'Direto': { subject: 'Mais para explorar', body: 'Novas áreas do ecossistema esperam por você.' }, 'Institucional': { subject: 'PULSO — Convite à continuação', body: 'Prezado(a),\n\nConvidamos a continuar explorando o ecossistema.' } }, 'Orientar acesso': { 'Orientation': { subject: 'Guia de boas-vindas ao PULSO', body: 'Olá! Preparamos um guia de boas-vindas para facilitar seu primeiro acesso.' }, 'Direto': { subject: 'Guia de primeiro acesso', body: 'Guia disponível na página inicial.' }, 'Institucional': { subject: 'PULSO — Guia de boas-vindas', body: 'Prezado(a),\n\nGuia de boas-vindas disponível para orientar seu primeiro acesso.' } }, 'Explicar documentação': { 'Orientativo': { subject: 'Documentação para novos usuários', body: 'Olá! A documentação tem materiais especiais para quem está começando.' }, 'Direto': { subject: 'Materiais para novos usuários', body: 'Materiais de introdução disponíveis na documentação.' }, 'Institucional': { subject: 'PULSO — Materiais introdutórios', body: 'Prezado(a),\n\nMateriais introdutórios disponíveis na seção de documentação.' } }, 'Estimular conclusão': { 'Orientativo': { subject: 'Complete seu cadastro inicial', body: 'Olá! Complete os passos iniciais para aproveitar o ecossistema.' }, 'Direto': { subject: 'Finalize seu início', body: 'Complete os passos iniciais na página de boas-vindas.' }, 'Institucional': { subject: 'PULSO — Complete seu acesso', body: 'Prezado(a),\n\nSugerimos completar os passos iniciais para otimizar sua experiência.' } } },
  'Explorador': { 'Reduzir abandono': { 'Orientativo': { subject: 'Organize sua exploração no PULSO', body: 'Olá! Você explorou várias áreas do ecossistema. Que tal focar nas mais relevantes?' }, 'Direto': { subject: 'Foque nas áreas relevantes', body: 'Suas áreas mais acessadas foram identificadas. Acesse os atalhos.' }, 'Institucional': { subject: 'PULSO — Organização da sua navegação', body: 'Prezado(a),\n\nIdentificamos suas áreas de maior interesse para facilitar sua navegação.' } }, 'Aumentar retorno': { 'Orientativo': { subject: 'Novidades nas áreas que você visitou', body: 'Olá! Novidades foram adicionadas às áreas que você mais explorou.' }, 'Direto': { subject: 'Atualizações nas áreas visitadas', body: 'Atualizações disponíveis nas suas áreas mais acessadas.' }, 'Institucional': { subject: 'PULSO — Atualizações personalizadas', body: 'Prezado(a),\n\nAtualizações relevantes às suas áreas de interesse disponíveis.' } }, 'Orientar acesso': { 'Orientativo': { subject: 'Caminhos recomendados para sua exploração', body: 'Olá! Baseado no seu perfil, sugerimos estes caminhos no ecossistema.' }, 'Direto': { subject: 'Caminhos recomendados', body: 'Caminhos personalizados disponíveis na página inicial.' }, 'Institucional': { subject: 'PULSO — Caminhos recomendados', body: 'Prezado(a),\n\nCaminhos personalizados com base no seu padrão de navegação.' } }, 'Explicar documentação': { 'Orientativo': { subject: 'Documentação das áreas que você explorou', body: 'Olá! A documentação das áreas que você visitou está organizada e disponível.' }, 'Direto': { subject: 'Documentação por área de interesse', body: 'Documentação organizada por áreas. Acesse a seção correspondente.' }, 'Institucional': { subject: 'PULSO — Documentação organizada por área', body: 'Prezado(a),\n\nDocumentação organizada por áreas de maior interesse do ecossistema.' } }, 'Estimular conclusão': { 'Orientativo': { subject: 'Avance na sua jornada de exploração', body: 'Olá! Você explorou bastante. Que tal avançar em uma área específica?' }, 'Direto': { subject: 'Escolha uma área para avançar', body: 'Selecione uma área para avançar na sua jornada.' }, 'Institucional': { subject: 'PULSO — Próxima etapa da exploração', body: 'Prezado(a),\n\nSugerimos selecionar uma área para avançar na sua jornada de exploração.' } } },
  'Reengajado': { 'Reduzir abandono': { 'Orientativo': { subject: 'Bem-vindo de volta! O que mudou desde sua última visita', body: 'Olá! Que bom ter você de volta. Novidades foram adicionadas desde sua última visita.' }, 'Direto': { subject: 'Novidades desde sua última visita', body: 'Novidades disponíveis. Acesse o ecossistema para verificar.' }, 'Institucional': { subject: 'PULSO — Boas-vindas ao retorno', body: 'Prezado(a),\n\nBem-vindo(a) de volta. Novidades relevantes desde sua última visita.' } }, 'Aumentar retorno': { 'Orientativo': { subject: 'Continue sua jornada de onde parou', body: 'Olá! Retome sua jornada exatamente de onde você parou.' }, 'Direto': { subject: 'Retome sua atividade', body: 'Continue de onde parou. Atalho disponível na página inicial.' }, 'Institucional': { subject: 'PULSO — Continuidade do retorno', body: 'Prezado(a),\n\nSua jornada pode ser retomada de onde você parou.' } }, 'Orientar acesso': { 'Orientativo': { subject: 'Guia para retomar sua jornada', body: 'Olá! Preparamos um guia para facilitar sua retomada ao ecossistema.' }, 'Direto': { subject: 'Guia de retomada', body: 'Guia disponível na página inicial.' }, 'Institucional': { subject: 'PULSO — Guia de retomada', body: 'Prezado(a),\n\nGuia de retomada disponível para facilitar seu retorno.' } }, 'Explicar documentação': { 'Orientativo': { subject: 'Documentação atualizada para seu retorno', body: 'Olá! A documentação foi atualizada desde sua última visita.' }, 'Direto': { subject: 'Documentação atualizada', body: 'Novos materiais disponíveis na documentação.' }, 'Institucional': { subject: 'PULSO — Documentação atualizada para você', body: 'Prezado(a),\n\nDocumentação atualizada com materiais relevantes ao seu retorno.' } }, 'Estimular conclusão': { 'Orientativo': { subject: 'Complete sua jornada interrompida', body: 'Olá! Você pode concluir a jornada que havia iniciado.' }, 'Direto': { subject: 'Finalize sua jornada', body: 'Complete sua jornada pendente. Material disponível.' }, 'Institucional': { subject: 'PULSO — Conclusão da jornada', body: 'Prezado(a),\n\nSua jornada interrompida pode ser concluída agora.' } } },
};

export const OBJECTIVE_GOALS: Record<string, string> = {
  'Reduzir abandono': 'retomar a jornada com um caminho mais simples',
  'Aumentar retorno': 'apresentar novidades relevantes para o retorno',
  'Orientar acesso': 'orientar o acesso aos materiais e páginas corretos',
  'Explicar documentação': 'explicar a estrutura da documentação disponível',
  'Estimular conclusão': 'estimular a conclusão da atividade em andamento',
};

const TONE_STYLE: Record<string, { greeting: string; closing: string }> = {
  Orientativo: { greeting: 'Olá!', closing: 'Conte conosco para seguir em frente.' },
  Direto: { greeting: '', closing: '' },
  Institucional: { greeting: 'Prezado(a),', closing: 'Atenciosamente,\nEquipe PULSO' },
};

export const OPPORTUNITY_OBJECTIVES: Record<string, string> = {
  'opp-01': 'Explicar documentação',
  'opp-02': 'Orientar acesso',
  'opp-03': 'Aumentar retorno',
  'opp-04': 'Reduzir abandono',
  'opp-05': 'Orientar acesso',
  'opp-06': 'Aumentar retorno',
  'opp-07': 'Orientar acesso',
};

export function suggestedObjectiveFor(opportunityId: string | undefined, fallback = 'Reduzir abandono'): string {
  return (opportunityId && OPPORTUNITY_OBJECTIVES[opportunityId]) || fallback;
}

function buildContextParagraph(segment: string, channel: string, objective: string, topic: string): string {
  const goal = OBJECTIVE_GOALS[objective] || objective;
  return `Contexto desta análise: o segmento ${segment} recebe esta orientação com o objetivo de ${goal}. A oportunidade de referência é "${topic}". O conteúdo será apresentado pelo canal ${channel.toLowerCase()} e permanece como rascunho sujeito à revisão humana.`;
}

function buildVariant(segment: string, channel: string, tone: string, objective: string, topic: string, variant: number): { subject: string; body: string } {
  const normalizedTone = tone === 'Orientation' ? 'Orientativo' : tone;
  const style = TONE_STYLE[normalizedTone] || TONE_STYLE.Orientativo;
  const goal = OBJECTIVE_GOALS[objective] || objective;
  const greeting = style.greeting ? `${style.greeting} ` : '';
  const closing = style.closing ? `\n\n${style.closing}` : '';
  const channelRef = channel.toLowerCase();
  const variants: Array<{ subject: string; body: string }> = [
    {
      subject: `${topic} — orientação para ${segment.toLowerCase()}`,
      body: `${greeting}Com base na oportunidade "${topic}", preparamos uma orientação para o segmento ${segment}. O objetivo desta comunicação é ${goal}. O conteúdo será apresentado pelo canal ${channelRef} e deve passar pela revisão humana antes de qualquer utilização.${closing}`,
    },
    {
      subject: `${segment}: ${objective.toLowerCase()}`,
      body: `${greeting}Identificamos um padrão relevante na navegação recente: o segmento ${segment} pode se beneficiar de uma ação para ${goal}. Esta mensagem está vinculada à oportunidade "${topic}", usa o canal ${channelRef} e é apenas um rascunho — a decisão final é humana.${closing}`,
    },
    {
      subject: `Atendimento ao perfil ${segment.toLowerCase()} via ${channelRef}`,
      body: `${greeting}Queremos facilitar o próximo passo da jornada. Para o segmento ${segment}, com foco em ${goal}, criamos um rascunho conectado à oportunidade "${topic}" e preparado para o canal ${channelRef}. O envio só ocorre após revisão e aprovação humanas.${closing}`,
    },
  ];
  return variants[variant % variants.length];
}

export function generateCommunication(segment: string, channel: string, tone: string, objective: string, opportunityTitle?: string, variant = 0): { subject: string; body: string } {
  const normalizedTone = tone === 'Orientation' ? 'Orientativo' : tone;
  const templates = COMMUNICATION_TEMPLATES[segment]?.[objective]?.[normalizedTone];
  const topic = opportunityTitle?.trim() || 'oportunidade recomendada';
  if (variant === 0 && templates) {
    const context = buildContextParagraph(segment, channel, objective, topic);
    return { subject: templates.subject, body: `${templates.body}\n\n${context}` };
  }
  if (variant === 0 && objective === 'Orientar acesso' && normalizedTone === 'Orientativo') {
    return {
      subject: `Guia para ${segment.toLowerCase()} — ${topic}`,
      body: `Olá! Preparamos um guia para facilitar seu acesso à oportunidade mais relevante.\n\nAcesse "${topic}" e siga o caminho recomendado para continuar sua jornada no ecossistema Petronect.\n\n${buildContextParagraph(segment, channel, objective, topic)}`,
    };
  }
  if (variant === 0) {
    const defaults: Record<string, { subject: string; body: string }> = {
      'E-mail': { subject: `PULSO — Comunicação para ${segment.toLowerCase()}`, body: `Prezado(a),\n\nIdentificamos uma oportunidade relevante para seu perfil de navegação no ecossistema Petronect.\n\n${objective === 'Reduzir abandono' ? 'Sugerimos retomar sua jornada com o caminho simplificado.' : objective === 'Aumentar retorno' ? 'Novidades relevantes estão disponíveis para seu perfil.' : 'Material de apoio disponível na documentação.'}\n\nAcesse o ecossistema para mais informações.\n\nAtenciosamente,\nEquipe PULSO` },
      'Banner no portal': { subject: `Novidade para ${segment.toLowerCase()}`, body: `${objective === 'Reduzir abandono' ? 'Caminho simplificado disponível.' : 'Novidades relevantes para você.'} Acesse o ecossistema para mais detalhes.` },
      'Notificação': { subject: `PULSO — ${segment}`, body: `${objective === 'Reduzir abandono' ? 'Retome sua jornada.' : 'Veja as novidades.'} Material disponível.` },
    };
    const base = defaults[channel] || defaults['E-mail'];
    return { subject: base.subject, body: `${base.body}\n\n${buildContextParagraph(segment, channel, objective, topic)}` };
  }
  return buildVariant(segment, channel, tone, objective, topic, variant - 1);
}

export type MessageTemplate = { segment: SegmentKey; channel: string; tone: string; objective: string; opportunity: string };

export const CHANNELS = ['E-mail', 'Banner no portal', 'Notificação'];
export const OBJECTIVES = ['Reduzir abandono', 'Aumentar retorno', 'Orientar acesso', 'Explicar documentação', 'Estimular conclusão'];
export const TONES = ['Orientativo', 'Direto', 'Institucional'];

export const CSV_EXAMPLE = `user_id,session_id,timestamp,page,event_type,user_type,duration_seconds,previous_page,next_page,completed_action
USR-001,SES-001-01,2026-05-01T09:00:00,/,entrada,Interessado,45,,/oportunidades,true
USR-001,SES-001-01,2026-05-01T09:05:00,/oportunidades,visualização,Interessado,120,/,/documentacao,true
USR-001,SES-001-01,2026-05-01T09:08:00,/documentacao,download,Interessado,180,/oportunidades,,true
USR-002,SES-002-01,2026-05-01T10:15:00,/,entrada,Explorador,30,,/fornecedores,true
USR-002,SES-002-01,2026-05-01T10:17:00,/fornecedores,visualização,Explorador,60,/,/suporte,true
USR-002,SES-002-01,2026-05-01T10:20:00,/suporte,saída,Explorador,20,/fornecedores,,false
USR-003,SES-003-01,2026-05-02T08:30:00,/,entrada,Recorrente,35,,/oportunidades,true
USR-003,SES-003-01,2026-05-02T08:35:00,/oportunidades,visualização,Recorrente,90,/,/documentacao,true
USR-003,SES-003-01,2026-05-02T08:38:00,/documentacao,visualização,Recorrente,150,/oportunidades,/comunicacao,true
USR-003,SES-003-01,2026-05-02T08:42:00,/comunicacao,download,Recorrente,200,/documentacao,,true
USR-004,SES-004-01,2026-05-03T11:00:00,/,entrada,"Com dificuldade",40,,/documentacao,true
USR-004,SES-004-01,2026-05-03T11:03:00,/documentacao,busca,"Com dificuldade",60,/,/documentacao,false
USR-004,SES-004-01,2026-05-03T11:06:00,/documentacao,busca,"Com dificuldade",45,/documentacao,/suporte,false
USR-004,SES-004-01,2026-05-03T11:10:00,/suporte,saída,"Com dificuldade",30,/documentacao,,false
USR-005,SES-005-01,2026-05-05T09:00:00,/,entrada,Novo,25,,/,false`;

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

export const TEAM_MEMBERS = [
  'Regine Barbosa Gama',
  'Mariah Aparecida Navarro Rodrigues da Silva',
  'Jasmine de Sá Araujo',
  'Juliana Freire de Oliveira',
  'Stefany Rodrigues da Silva',
];

export const TEAM_INITIALS = ['RB', 'MN', 'JA', 'JF', 'SR'];

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

export function clearStored(key: string) {
  try { localStorage.removeItem(key); } catch { /* local-only demo */ }
}
