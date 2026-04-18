import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import './styles.css';

const GestaoEquipe = () => {
  const [setores, setSetores] = useState([]);
  const [setorSelecionado, setSetorSelecionado] = useState(null);
  const [membros, setMembros] = useState([]);
  const [buscaMembro, setBuscaMembro] = useState('');
  const [siapeNovoMembro, setSiapeNovoMembro] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMembros, setLoadingMembros] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const user = JSON.parse(localStorage.getItem('@SIGR:user') || '{}');

  useEffect(() => {
    // Carrega os setores do usuário logado
    if (user.setores && user.setores.length > 0) {
      setSetores(user.setores);
      setSetorSelecionado(user.setores[0]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (setorSelecionado) {
      carregarMembros(setorSelecionado.id);
    }
  }, [setorSelecionado]);

  async function carregarMembros(setorId) {
    setLoadingMembros(true);
    setError('');
    try {
      const response = await api.get(`/usuarios/setores/${setorId}/membros/`);
      setMembros(response.data);
    } catch (err) {
      console.error('Erro ao carregar membros:', err);
      setError('Não foi possível carregar os membros da equipe.');
    } finally {
      setLoadingMembros(false);
    }
  }

  async function handleAdicionarMembro(e) {
    e.preventDefault();
    if (!siapeNovoMembro) return;

    setError('');
    setSuccess('');

    try {
      const response = await api.post(`/usuarios/setores/${setorSelecionado.id}/adicionar_membro/`, {
        siape: siapeNovoMembro
      });
      
      setMembros([...membros, response.data.usuario]);
      setSiapeNovoMembro('');
      setSuccess('Membro adicionado com sucesso!');
      
      // Limpa mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const msg = err.response?.data?.erro || 'Erro ao adicionar membro.';
      setError(msg);
    }
  }

  async function handleRemoverMembro(usuarioId) {
    if (!window.confirm('Tem certeza que deseja remover este membro da equipe?')) return;

    setError('');
    setSuccess('');

    try {
      await api.post(`/usuarios/setores/${setorSelecionado.id}/remover_membro/`, {
        usuario_id: usuarioId
      });
      
      setMembros(membros.filter(m => m.id !== usuarioId));
      setSuccess('Membro removido com sucesso!');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const msg = err.response?.data?.erro || 'Erro ao remover membro.';
      setError(msg);
    }
  }

  // Filtra e ordena os membros: Usuário logado sempre no topo
  const membrosProcessados = membros
    .filter(m => 
      m.nome.toLowerCase().includes(buscaMembro.toLowerCase()) ||
      m.siape.toLowerCase().includes(buscaMembro.toLowerCase()) ||
      m.email.toLowerCase().includes(buscaMembro.toLowerCase())
    )
    .sort((a, b) => {
      if (a.id === user.id) return -1;
      if (b.id === user.id) return 1;
      return a.nome.localeCompare(b.nome);
    });

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-main">
          <p>Carregando...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-title">
            <div className="title-line"></div>
            <h1>Gestão de Equipe</h1>
          </div>
        </header>

        <section className="equipe-content">
          <div className="equipe-selector">
            <label>Selecione o Setor/Departamento:</label>
            <div className="selector-tabs">
              {setores.map(setor => (
                <button 
                  key={setor.id}
                  className={`tab-button ${setorSelecionado?.id === setor.id ? 'active' : ''}`}
                  onClick={() => setSetorSelecionado(setor)}
                >
                  {setor.sigla} - {setor.nome}
                </button>
              ))}
            </div>
          </div>

          <div className="equipe-actions">
            <form className="add-membro-form" onSubmit={handleAdicionarMembro}>
              <div className="input-group">
                <input 
                  type="text" 
                  placeholder="SIAPE do novo membro..." 
                  value={siapeNovoMembro}
                  onChange={(e) => setSiapeNovoMembro(e.target.value)}
                />
                <button type="submit" className="add-button">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Adicionar Membro
                </button>
              </div>
            </form>

            {error && <p className="message error">{error}</p>}
            {success && <p className="message success">{success}</p>}
          </div>

          <div className="membros-list-container">
            <div className="list-header-row">
              <h2>Membros do Setor: {setorSelecionado?.sigla}</h2>
              <div className="search-bar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input 
                  type="text" 
                  placeholder="Buscar por nome, SIAPE ou e-mail..." 
                  value={buscaMembro}
                  onChange={(e) => setBuscaMembro(e.target.value)}
                />
              </div>
            </div>
            
            <div className="membros-list">
              <div className="list-header">
                <span className="col-avatar"></span>
                <span className="col-nome">NOME</span>
                <span className="col-siape">SIAPE</span>
                <span className="col-email">E-MAIL</span>
                <span className="col-acoes">AÇÕES</span>
              </div>

              {loadingMembros ? (
                <p className="loading-text">Carregando membros...</p>
              ) : membrosProcessados.length > 0 ? (
                membrosProcessados.map(membro => (
                  <div key={membro.id} className="membro-row">
                    <div className="membro-avatar">
                      {membro.nome.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="membro-nome-cell">
                      <p className="membro-nome">{membro.nome}</p>
                    </div>
                    <div className="membro-siape-cell">
                      <p className="membro-siape">{membro.siape}</p>
                    </div>
                    <div className="membro-email-cell">
                      <p className="membro-email">{membro.email}</p>
                    </div>
                    <div className="membro-acoes-cell">
                      {membro.id !== user.id ? (
                        <button 
                          className="remove-membro-button"
                          onClick={() => handleRemoverMembro(membro.id)}
                          title="Remover membro"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      ) : (
                        <span className="current-user-tag">Você</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-text">Nenhum membro encontrado neste setor.</p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default GestaoEquipe;
