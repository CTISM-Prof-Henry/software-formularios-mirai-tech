import { describe, it, expect } from 'vitest';
import { getAlertaPrazo, getRiskColorClass, getRiskLabel } from './risco';

const HOJE = new Date('2025-06-16');

function planoComPrazo(dataFim, dataInicio = '2025-01-01') {
  return { periodo_acao: { data_fim: dataFim, data_inicio: dataInicio } };
}

describe('getAlertaPrazo', () => {
  it('retorna null quando periodo_acao não existe', () => {
    expect(getAlertaPrazo({}, HOJE)).toBeNull();
  });

  it('retorna null quando data_fim é nula', () => {
    expect(getAlertaPrazo({ periodo_acao: { data_fim: null, data_inicio: '2025-01-01' } }, HOJE)).toBeNull();
  });

  it('retorna null quando data_inicio é null (plano sem ação de tratamento)', () => {
    expect(getAlertaPrazo({ periodo_acao: { data_fim: '2025-06-20', data_inicio: null } }, HOJE)).toBeNull();
  });

  it('retorna tipo "atrasada" quando prazo já venceu', () => {
    const resultado = getAlertaPrazo(planoComPrazo('2025-06-10'), HOJE);
    expect(resultado).toEqual({ tipo: 'atrasada', texto: 'Atrasada' });
  });

  it('retorna tipo "vence-breve" quando vence hoje', () => {
    const resultado = getAlertaPrazo(planoComPrazo('2025-06-16'), HOJE);
    expect(resultado?.tipo).toBe('vence-breve');
    expect(resultado?.texto).toBe('Vence em 0d');
  });

  it('retorna tipo "vence-breve" quando vence em 7 dias', () => {
    const resultado = getAlertaPrazo(planoComPrazo('2025-06-23'), HOJE);
    expect(resultado?.tipo).toBe('vence-breve');
    expect(resultado?.texto).toBe('Vence em 7d');
  });

  it('retorna null quando prazo está além de 7 dias', () => {
    expect(getAlertaPrazo(planoComPrazo('2025-06-24'), HOJE)).toBeNull();
  });

  it('retorna null quando prazo está muito distante', () => {
    expect(getAlertaPrazo(planoComPrazo('2026-01-01'), HOJE)).toBeNull();
  });
});

describe('getRiskColorClass', () => {
  it('retorna risk-extremo para nível >= 20', () => {
    expect(getRiskColorClass(20)).toBe('risk-extremo');
    expect(getRiskColorClass(25)).toBe('risk-extremo');
  });

  it('retorna risk-alto para nível entre 12 e 19', () => {
    expect(getRiskColorClass(12)).toBe('risk-alto');
    expect(getRiskColorClass(19)).toBe('risk-alto');
  });

  it('retorna risk-moderado para nível entre 4 e 11', () => {
    expect(getRiskColorClass(4)).toBe('risk-moderado');
    expect(getRiskColorClass(11)).toBe('risk-moderado');
  });

  it('retorna risk-baixo para nível abaixo de 4', () => {
    expect(getRiskColorClass(1)).toBe('risk-baixo');
    expect(getRiskColorClass(3)).toBe('risk-baixo');
  });
});

describe('getRiskLabel', () => {
  it('retorna Extremo para nível >= 20', () => {
    expect(getRiskLabel(20)).toBe('Extremo');
    expect(getRiskLabel(25)).toBe('Extremo');
  });

  it('retorna Alto para nível entre 12 e 19', () => {
    expect(getRiskLabel(12)).toBe('Alto');
    expect(getRiskLabel(15)).toBe('Alto');
  });

  it('retorna Moderado para nível entre 4 e 11', () => {
    expect(getRiskLabel(4)).toBe('Moderado');
    expect(getRiskLabel(9)).toBe('Moderado');
  });

  it('retorna Baixo para nível abaixo de 4', () => {
    expect(getRiskLabel(1)).toBe('Baixo');
    expect(getRiskLabel(3)).toBe('Baixo');
  });

  it('getRiskColorClass e getRiskLabel são consistentes entre si', () => {
    const niveis = [1, 3, 4, 11, 12, 19, 20, 25];
    const pares = {
      'risk-extremo': 'Extremo',
      'risk-alto': 'Alto',
      'risk-moderado': 'Moderado',
      'risk-baixo': 'Baixo',
    };
    niveis.forEach(n => {
      expect(pares[getRiskColorClass(n)]).toBe(getRiskLabel(n));
    });
  });
});
