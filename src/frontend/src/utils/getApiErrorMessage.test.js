import { describe, it, expect } from 'vitest';
import { getApiErrorMessage } from './getApiErrorMessage';

describe('getApiErrorMessage', () => {
  describe('mensagem do backend', () => {
    it('retorna mensagem string do campo erro', () => {
      const err = { response: { status: 400, data: { erro: 'SIAPE já cadastrado.' } } };
      expect(getApiErrorMessage(err)).toBe('SIAPE já cadastrado.');
    });

    it('retorna mensagem quando data é string diretamente', () => {
      const err = { response: { status: 400, data: 'Dado inválido.' } };
      expect(getApiErrorMessage(err)).toBe('Dado inválido.');
    });

    it('junta array de mensagens do backend', () => {
      const err = { response: { status: 400, data: { erro: ['Campo A.', 'Campo B.'] } } };
      expect(getApiErrorMessage(err)).toBe('Campo A. Campo B.');
    });

    it('junta valores de objeto aninhado', () => {
      const err = { response: { status: 400, data: { campo1: ['Erro 1.'], campo2: 'Erro 2.' } } };
      const result = getApiErrorMessage(err);
      expect(result).toContain('Erro 1.');
      expect(result).toContain('Erro 2.');
    });
  });

  describe('erros de rede', () => {
    it('retorna mensagem de timeout para ECONNABORTED', () => {
      const err = { code: 'ECONNABORTED' };
      const msg = getApiErrorMessage(err);
      expect(msg).toMatch(/demorou/i);
    });

    it('retorna mensagem de conexão quando não há response', () => {
      const err = {};
      const msg = getApiErrorMessage(err);
      expect(msg).toMatch(/servidor/i);
    });
  });

  describe('códigos HTTP', () => {
    it('retorna mensagem de sessão para 401', () => {
      const err = { response: { status: 401, data: {} } };
      expect(getApiErrorMessage(err)).toMatch(/sess/i);
    });

    it('retorna mensagem de permissão para 403', () => {
      const err = { response: { status: 403, data: {} } };
      expect(getApiErrorMessage(err)).toMatch(/permiss/i);
    });

    it('retorna mensagem de não encontrado para 404', () => {
      const err = { response: { status: 404, data: {} } };
      expect(getApiErrorMessage(err)).toMatch(/encontrado/i);
    });

    it('retorna mensagem de servidor para 500', () => {
      const err = { response: { status: 500, data: {} } };
      expect(getApiErrorMessage(err)).toMatch(/servidor/i);
    });

    it('retorna mensagem de servidor para 503', () => {
      const err = { response: { status: 503, data: {} } };
      expect(getApiErrorMessage(err)).toMatch(/servidor/i);
    });
  });

  describe('mensagens genéricas por contexto', () => {
    it('usa mensagem de contexto login quando sem backend message', () => {
      const err = { response: { status: 422, data: {} } };
      const msg = getApiErrorMessage(err, 'login');
      expect(msg).toMatch(/SIAPE/i);
    });

    it('usa mensagem de contexto cadastro', () => {
      const err = { response: { status: 422, data: {} } };
      const msg = getApiErrorMessage(err, 'cadastro');
      expect(msg).toMatch(/cadastro/i);
    });

    it('usa mensagem default para contexto desconhecido', () => {
      const err = { response: { status: 422, data: {} } };
      const msg = getApiErrorMessage(err, 'contexto_inexistente');
      expect(msg).toMatch(/acao/i);
    });
  });
});
