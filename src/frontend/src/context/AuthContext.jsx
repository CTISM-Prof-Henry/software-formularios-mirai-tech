import React, { createContext, useCallback, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => {
    try {
      const stored = localStorage.getItem('@SIGR:user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const updateUser = useCallback((novoUsuario) => {
    setUserState(novoUsuario);
    localStorage.setItem('@SIGR:user', JSON.stringify(novoUsuario));
  }, []);

  const logout = useCallback(() => {
    setUserState(null);
    localStorage.removeItem('@SIGR:token');
    localStorage.removeItem('@SIGR:user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
