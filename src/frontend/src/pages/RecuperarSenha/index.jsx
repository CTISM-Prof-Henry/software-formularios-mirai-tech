import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';
import { useFeedback } from '../../context/FeedbackContext';
import api from '../../services/api';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';
import './styles.css';

const RecuperarSenha = () => {
  const [etapa, setEtapa] = useState(1);
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { showFeedback } = useFeedback();
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (etapa === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((previous) => previous - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [etapa, timer]);

  const handleEnviarEmail = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await api.post('/usuarios/recuperar-senha/enviar/', { email });
      setEtapa(2);
      setTimer(60);
      showFeedback({
        type: 'success',
        title: 'Codigo enviado',
        message: 'Verifique seu e-mail institucional e siga para a validacao do codigo.',
      });
    } catch (error) {
      showFeedback({
        type: 'error',
        title: 'Envio nao concluido',
        message: getApiErrorMessage(error, 'recuperar_enviar'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleValidarCodigo = async (event) => {
    event.preventDefault();
    const codigoCompleto = codigo.join('');

    if (codigoCompleto.length < 6) {
      showFeedback({
        type: 'warning',
        title: 'Codigo incompleto',
        message: 'Insira os 6 digitos do codigo para continuar.',
      });
      return;
    }

    setLoading(true);
    try {
      await api.post('/usuarios/recuperar-senha/validar/', { email, codigo: codigoCompleto });
      setEtapa(3);
      showFeedback({
        type: 'success',
        title: 'Codigo validado',
        message: 'Agora voce ja pode definir sua nova senha.',
      });
    } catch (error) {
      showFeedback({
        type: 'error',
        title: 'Validacao nao concluida',
        message: getApiErrorMessage(error, 'recuperar_validar'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRedefinirSenha = async (event) => {
    event.preventDefault();

    if (novaSenha !== confirmacaoSenha) {
      showFeedback({
        type: 'warning',
        title: 'Senha divergente',
        message: 'A confirmacao precisa ser igual a nova senha para continuar.',
      });
      return;
    }

    setLoading(true);
    try {
      await api.post('/usuarios/recuperar-senha/redefinir/', {
        email,
        codigo: codigo.join(''),
        nova_senha: novaSenha,
        confirmacao_senha: confirmacaoSenha,
      });
      showFeedback({
        type: 'success',
        title: 'Senha atualizada',
        message: 'Sua senha foi redefinida com sucesso. Voce sera redirecionado para o login.',
      });
      setTimeout(() => navigate('/login'), 1200);
    } catch (error) {
      showFeedback({
        type: 'error',
        title: 'Redefinicao nao concluida',
        message: getApiErrorMessage(error, 'recuperar_redefinir'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCodigoChange = (index, value) => {
    if (Number.isNaN(Number(value))) return;

    const novoCodigo = [...codigo];
    novoCodigo[index] = value.slice(-1);
    setCodigo(novoCodigo);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !codigo[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleReenviar = async () => {
    if (timer > 0) return;

    setLoading(true);
    try {
      await api.post('/usuarios/recuperar-senha/enviar/', { email });
      setTimer(60);
      setCodigo(['', '', '', '', '', '']);
      showFeedback({
        type: 'success',
        title: 'Novo codigo enviado',
        message: 'Um novo codigo foi encaminhado para o seu e-mail institucional.',
      });
    } catch (error) {
      showFeedback({
        type: 'error',
        title: 'Reenvio nao concluido',
        message: getApiErrorMessage(error, 'recuperar_enviar'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recuperar-container">
      <div className="public-theme-toggle">
        <ThemeToggle />
      </div>

      <main className={`recuperar-card ${etapa === 3 ? 'redefinir-layout' : ''}`}>
        <div className="recuperar-form-section">
          <header className="recuperar-header">
            <h1 className="recuperar-title-main">Sistema de Gestao de Riscos</h1>
          </header>

          {etapa === 1 && (
            <>
              <h2 className="recuperar-subtitle-section">Recuperar Acesso</h2>
              <p className="recuperar-description">
                Insira seu e-mail institucional para receber as instrucoes de recuperacao de senha.
              </p>
              <form onSubmit={handleEnviarEmail}>
                <div className="input-group">
                  <label htmlFor="email">E-mail cadastrado</label>
                  <div className="input-with-icon">
                    <span className="input-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </span>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="ex: nome.sobrenome@ufsm.br"
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="recuperar-button" disabled={loading}>
                  {loading ? 'Enviando...' : <>Enviar <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></>}
                </button>
              </form>
            </>
          )}

          {etapa === 2 && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div className="security-icon-circle">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#003470" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 11 11 13 15 9"></polyline></svg>
                </div>
              </div>
              <h2 className="recuperar-subtitle-section" style={{ textAlign: 'center', marginTop: 0 }}>Verificar Identidade</h2>
              <p className="recuperar-description" style={{ textAlign: 'center' }}>
                Insira o codigo de 6 digitos enviado para o seu e-mail institucional.
              </p>
              <form onSubmit={handleValidarCodigo}>
                <div className="code-inputs-container">
                  {codigo.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => {
                        inputRefs.current[index] = element;
                      }}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(event) => handleCodigoChange(index, event.target.value)}
                      onKeyDown={(event) => handleKeyDown(index, event)}
                      className="code-input-box"
                    />
                  ))}
                </div>
                <div className="resend-container">
                  <span className={`resend-link ${timer > 0 ? 'disabled' : ''}`} onClick={handleReenviar}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 19 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                    {timer > 0 ? `Reenviar codigo em 00:${timer.toString().padStart(2, '0')}` : 'Reenviar codigo agora'}
                  </span>
                </div>
                <button type="submit" className="recuperar-button" disabled={loading}>
                  {loading ? 'Validando...' : <>Validar Codigo <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></>}
                </button>
              </form>
            </>
          )}

          {etapa === 3 && (
            <>
              <p className="recuperar-title-small" style={{ textAlign: 'left', marginBottom: '8px' }}>SEGURANCA DA CONTA</p>
              <h2 className="recuperar-subtitle-section" style={{ marginTop: 0, fontSize: '24px' }}>Escolha sua nova senha</h2>
              <p className="recuperar-description">
                Para garantir a protecao dos seus dados, crie uma senha forte e unica para o sistema institucional.
              </p>

              <form onSubmit={handleRedefinirSenha}>
                <div className="input-group">
                  <label htmlFor="novaSenha">Nova Senha</label>
                  <div className="input-with-icon">
                    <span className="input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="novaSenha"
                      value={novaSenha}
                      onChange={(event) => setNovaSenha(event.target.value)}
                      placeholder="********"
                      required
                    />
                    <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </span>
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="confirmarSenha">Confirmar Nova Senha</label>
                  <div className="input-with-icon">
                    <span className="input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="confirmarSenha"
                      value={confirmacaoSenha}
                      onChange={(event) => setConfirmacaoSenha(event.target.value)}
                      placeholder="********"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="recuperar-button" disabled={loading}>
                  {loading ? 'Processando...' : <>Concluir e Acessar <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></>}
                </button>
              </form>
            </>
          )}

          <div className="back-to-login" onClick={() => navigate('/login')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Voltar para o login
          </div>
        </div>

        {etapa === 3 && (
          <div className="recuperar-sidebar-info">
            <h3 className="sidebar-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> Requisitos de Senha</h3>
            <ul className="requirements-list">
              <li className={novaSenha.length >= 8 ? 'met' : ''}>Minimo de 8 caracteres</li>
              <li className={/[A-Z]/.test(novaSenha) ? 'met' : ''}>Pelo menos um caractere maiusculo</li>
              <li className={/[0-9!@#$%^&*]/.test(novaSenha) ? 'met' : ''}>Um numero ou simbolo (@#$...)</li>
              <li className={novaSenha && novaSenha !== '12345678' ? 'met' : ''}>Diferente das ultimas senhas</li>
            </ul>

            <div className="tips-box">
              <div className="tips-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2a7 7 0 0 0-7 7c0 2.38 3.05 6.65 4.64 8.74a.75.75 0 0 0 1.22 0C12.95 15.65 16 11.38 16 9a7 7 0 0 0-7-7z"></path></svg>
              </div>
              <div>
                <strong>DICAS</strong>
                <p>Evite datas de nascimento ou nomes obvios. Use uma senha forte.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="recuperar-footer-text">
        Sistema institucional de gestao de riscos
      </footer>
    </div>
  );
};

export default RecuperarSenha;
