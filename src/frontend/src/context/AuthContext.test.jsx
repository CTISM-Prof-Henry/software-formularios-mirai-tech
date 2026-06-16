import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('AuthContext', () => {
  describe('inicialização', () => {
    it('começa com user null quando localStorage está vazio', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      expect(result.current.user).toBeNull();
    });

    it('recupera usuário salvo no localStorage', () => {
      const usuario = { id: 1, nome: 'Gestor Teste', siape: '1234567' };
      localStorage.setItem('@SIGR:user', JSON.stringify(usuario));

      const { result } = renderHook(() => useAuth(), { wrapper });
      expect(result.current.user).toEqual(usuario);
    });

    it('ignora JSON inválido no localStorage sem lançar erro', () => {
      localStorage.setItem('@SIGR:user', 'nao-eh-json');
      const { result } = renderHook(() => useAuth(), { wrapper });
      expect(result.current.user).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('atualiza o estado do usuário', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      const novoUsuario = { id: 2, nome: 'Novo Gestor', siape: '9999999' };

      act(() => {
        result.current.updateUser(novoUsuario);
      });

      expect(result.current.user).toEqual(novoUsuario);
    });

    it('persiste o usuário no localStorage', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      const novoUsuario = { id: 2, nome: 'Novo Gestor', siape: '9999999' };

      act(() => {
        result.current.updateUser(novoUsuario);
      });

      const salvo = JSON.parse(localStorage.getItem('@SIGR:user'));
      expect(salvo).toEqual(novoUsuario);
    });
  });

  describe('logout', () => {
    it('limpa o estado do usuário', () => {
      const usuario = { id: 1, nome: 'Gestor Teste', siape: '1234567' };
      localStorage.setItem('@SIGR:user', JSON.stringify(usuario));

      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
    });

    it('remove token e usuário do localStorage', () => {
      localStorage.setItem('@SIGR:token', 'abc123');
      localStorage.setItem('@SIGR:user', JSON.stringify({ id: 1 }));

      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.logout();
      });

      expect(localStorage.getItem('@SIGR:token')).toBeNull();
      expect(localStorage.getItem('@SIGR:user')).toBeNull();
    });
  });

  describe('useAuth fora do provider', () => {
    it('lança erro quando usado fora do AuthProvider', () => {
      expect(() => renderHook(() => useAuth())).toThrow(
        'useAuth deve ser usado dentro de um AuthProvider'
      );
    });
  });
});
