import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import './styles.css';

const Login = () => {
  const [siape, setSiape] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/usuarios/login/', { siape, senha });
      const { token, usuario } = response.data;

      localStorage.setItem('@SIGR:token', token);
      localStorage.setItem('@SIGR:user', JSON.stringify(usuario));

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.erro || 'Erro ao realizar login. Verifique seus dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <main className="login-card">
        <header className="login-header">
          <h1 className="login-title-large">Sistema de Gestão de Riscos</h1>
        </header>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="siape">SIAPE</label>
            <input
              type="text"
              id="siape"
              value={siape}
              onChange={(e) => setSiape(e.target.value)}
              placeholder="Ex: 1234567"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Sua senha de acesso"
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar no Sistema'}
          </button>
        </form>

        <footer className="login-footer">
          <p>Ainda não tem acesso? <Link to="/cadastro" className="register-link">Cadastrar Gestor</Link></p>
          <Link to="/recuperar-senha" className="forgot-password">Esqueceu a senha?</Link>
        </footer>
      </main>
    </div>
  );
};

export default Login;
