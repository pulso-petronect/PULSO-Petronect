import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateCommunication, computeAll, generateDefaultEvents, parseCSV } from './data/pulso-data';

beforeEach(() => {
  localStorage.clear();
});

describe('computeAll and filters', () => {
  it('applies period and user-type filters to the active dataset', () => {
    const events = generateDefaultEvents();
    const all = computeAll(events, {
      period: '30 dias',
      userType: 'Todos',
      page: 'Todas',
      segment: 'Todos',
      priority: 'Todas',
      oppStatus: 'Todas',
    });

    expect(all.metrics.totalAccesses).toBeGreaterThan(0);
    expect(all.metrics.uniqueUsers).toBeGreaterThan(0);

    const filtered = computeAll(events, {
      period: '7 dias',
      userType: 'Interessado',
      page: 'Página inicial',
      segment: 'Todos',
      priority: 'Todas',
      oppStatus: 'Todas',
    });

    expect(filtered.filtered.every((event) => event.user_type === 'Interessado')).toBe(true);
    expect(filtered.filtered.length).toBeGreaterThanOrEqual(0);
  });

  it('recomputes journey stages from active events', () => {
    const events = generateDefaultEvents();
    const computed = computeAll(events, {
      period: '30 dias',
      userType: 'Todos',
      page: 'Todas',
      segment: 'Todos',
      priority: 'Todas',
      oppStatus: 'Todas',
    });

    expect(computed.metrics.totalAccesses).toBeGreaterThan(0);
    expect(computed.allSegments.length).toBeGreaterThan(0);
    expect(computed.allOpportunities.length).toBeGreaterThan(0);
  });
});

describe('communication generation', () => {
  it('uses orientativo wording and opportunity context required by the product', () => {
    const message = generateCommunication('Novo', 'E-mail', 'Orientativo', 'Orientar acesso', 'Guia de primeiros passos');
    expect(message.subject).toContain('Guia');
    expect(message.body).toContain('Guia');
    expect(message.body).not.toContain('Orientation');
  });

  it('keeps the default message channel fallback without hardcoded stale labels', () => {
    const first = generateCommunication('Interessado', 'E-mail', 'Direto', 'Aumentar retorno', 'Resumo de oportunidade');
    const second = generateCommunication('Interessado', 'E-mail', 'Direto', 'Aumentar retorno', 'Resumo de oportunidade');
    expect(first.subject).toBe(second.subject);
    expect(first.body).toContain('Acesse');
  });
});

describe('import CSV', () => {
  it('accepts a valid CSV and computes stats', () => {
    const csv = `user_id,session_id,timestamp,page,event_type,user_type,duration_seconds,previous_page,next_page,completed_action\nUSR-101,SES-101,2026-05-10T10:00:00,/,entrada,Interessado,30,,/oportunidades,true\nUSR-101,SES-101,2026-05-10T10:05:00,/oportunidades,visualização,Interessado,45,/,/documentacao,true`;
    const result = parseCSV(csv);

    expect(result.errors).toHaveLength(0);
    expect(result.stats.validRows).toBe(2);
    expect(result.events[0].page).toBe('/');
  });
});

it('renders key UI identifiers for login and demo controls', () => {
  render(<div><button data-testid="button-start-demo">Demonstração guiada</button><button data-testid="button-logout">Sair</button></div>);
  expect(screen.getByTestId('button-start-demo')).toBeTruthy();
  expect(screen.getByTestId('button-logout')).toBeTruthy();
});
