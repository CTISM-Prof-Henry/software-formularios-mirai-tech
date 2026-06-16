import { describe, it, expect } from 'vitest';
import { getSetorLabel } from './unidades';

describe('getSetorLabel', () => {
  it('retorna string vazia quando setor é null', () => {
    expect(getSetorLabel(null)).toBe('');
  });

  it('retorna string vazia quando setor é undefined', () => {
    expect(getSetorLabel(undefined)).toBe('');
  });

  it('retorna label_curto por padrão quando disponível', () => {
    const setor = { label_curto: 'CT - DCTA', label_completo: 'CT - DCTA - Centro de Tecnologia' };
    expect(getSetorLabel(setor)).toBe('CT - DCTA');
  });

  it('retorna label_completo quando opção completo=true', () => {
    const setor = { label_curto: 'CT - DCTA', label_completo: 'CT - DCTA - Centro de Tecnologia' };
    expect(getSetorLabel(setor, { completo: true })).toBe('CT - DCTA - Centro de Tecnologia');
  });

  it('retorna label_curto mesmo com completo=true quando label_completo não existe', () => {
    const setor = { label_curto: 'CT - DCTA' };
    expect(getSetorLabel(setor, { completo: true })).toBe('CT - DCTA');
  });

  it('monta "sigla - nome" quando não há label_curto', () => {
    const setor = { sigla: 'DCTA', nome: 'Departamento de Computação Aplicada' };
    expect(getSetorLabel(setor)).toBe('DCTA - Departamento de Computação Aplicada');
  });

  it('retorna apenas nome quando só nome está disponível', () => {
    const setor = { nome: 'Departamento de Computação Aplicada' };
    expect(getSetorLabel(setor)).toBe('Departamento de Computação Aplicada');
  });

  it('retorna apenas sigla quando só sigla está disponível', () => {
    const setor = { sigla: 'DCTA' };
    expect(getSetorLabel(setor)).toBe('DCTA');
  });

  it('retorna string vazia quando setor não tem campos identificáveis', () => {
    expect(getSetorLabel({})).toBe('');
  });
});
