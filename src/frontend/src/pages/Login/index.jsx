import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { useFeedback } from '../../context/FeedbackContext';
import api from '../../services/api';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';
import './styles.css';

const Login = () => {
  const [siape, setSiape] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const { showFeedback } = useFeedback();

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/usuarios/login/', { siape, senha });
      const { token, usuario } = response.data;

      localStorage.setItem('@SIGR:token', token);
      updateUser(usuario);

      showFeedback({
        type: 'success',
        title: 'Acesso liberado',
        message: 'Login realizado com sucesso. Voce sera redirecionado para a dashboard.',
      });

      navigate('/dashboard');
    } catch (error) {
      showFeedback({
        type: 'error',
        title: 'Falha no login',
        message: getApiErrorMessage(error, 'login'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="public-theme-toggle">
        <ThemeToggle />
      </div>

      <main className="login-card">
        <header className="login-header">
          <p className="login-title-small">Acesso institucional</p>
          <h1 className="login-title-large">Sistema de Gestao de Riscos</h1>
        </header>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="siape">SIAPE</label>
            <input
              type="text"
              id="siape"
              value={siape}
              onChange={(event) => setSiape(event.target.value)}
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
              onChange={(event) => setSenha(event.target.value)}
              placeholder="Sua senha de acesso"
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar no Sistema'}
          </button>
        </form>

        <footer className="login-footer">
          <Link to="/recuperar-senha" className="forgot-password">
            Esqueceu a senha?
          </Link>
        </footer>
      </main>
    </div>
  );
};

export default Login;
