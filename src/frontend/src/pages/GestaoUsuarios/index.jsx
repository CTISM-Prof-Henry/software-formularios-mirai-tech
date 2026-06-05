import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import ThemeToggle from '../../components/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { useFeedback } from '../../context/FeedbackContext';
import api from '../../services/api';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';
import './styles.css';

const SENHA_PLACEHOLDER = 'Senha@12345';

const FORM_VAZIO = {
  siape: '',
  nome: '',
  email: '',
  senha: SENHA_PLACEHOLDER,
  cargo: 'gestor',
  id_setores: [],
};

const GestaoUsuarios = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const safeUser = user || {};
  const { showFeedback } = useFeedback();

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalResultados, setTotalResultados] = useState(0);
  const pageSize = 20;

  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [setoresDisponiveis, setSetoresDisponiveis] = useState([]);
  const [buscaSetor, setBuscaSetor] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState('');

  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formEditar, setFormEditar] = useState({ nome: '', email: '', cargo: 'gestor', id_setores: [] });
  const [buscaSetorEditar, setBuscaSetorEditar] = useState('');
  const [salvandoEditar, setSalvandoEditar] = useState(false);
  const [erroEditar, setErroEditar] = useState('');

  useEffect(() => {
    if (!safeUser.is_superuser) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, safeUser.is_superuser]);

  useEffect(() => {
    if (!safeUser.is_superuser) return;
    async function carregar() {
      setLoading(true);
      try {
        const [usuariosRes, setoresRes] = await Promise.all([
          api.get('/usuarios/gestores/', { params: { search: busca, page: paginaAtual, page_size: pageSize } }),
          api.get('/usuarios/setores/'),
        ]);
        setUsuarios(Array.isArray(usuariosRes.data.results) ? usuariosRes.data.results : []);
        setTotalResultados(usuariosRes.data.count || 0);
        setTotalPaginas(usuariosRes.data.total_pages || 1);
        const setoresData = setoresRes.data.results || setoresRes.data;
        setSetoresDisponiveis(Array.isArray(setoresData) ? setoresData : []);
      } catch (err) {
        showFeedback({ type: 'error', title: 'Erro ao carregar', message: getApiErrorMessage(err, 'usuarios_admin') });
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [busca, paginaAtual, safeUser.is_superuser]);

  useEffect(() => { setPaginaAtual(1); }, [busca]);

  const abrirModal = () => { setForm(FORM_VAZIO); setErroForm(''); setBuscaSetor(''); setModalAberto(true); };

  const abrirModalEditar = (u) => {
    setUsuarioEditando(u);
    setFormEditar({
      nome: u.nome || '',
      email: u.email || '',
      cargo: u.cargo || 'gestor',
      id_setores: u.setores?.map((s) => s.id) || [],
    });
    setBuscaSetorEditar('');
    setErroEditar('');
    setModalEditarAberto(true);
  };

  const handleFormEditarChange = (e) => {
    const { id, value } = e.target;
    setFormEditar((prev) => ({ ...prev, [id]: value }));
  };

  const toggleSetorEditar = (id) => {
    setFormEditar((prev) => {
      const atual = prev.id_setores.includes(id)
        ? prev.id_setores.filter((s) => s !== id)
        : [...prev.id_setores, id];
      return { ...prev, id_setores: atual };
    });
  };

  const handleSalvarEdicao = async (e) => {
    e.preventDefault();
    setSalvandoEditar(true);
    setErroEditar('');
    try {
      const res = await api.patch(`/usuarios/gestores/${usuarioEditando.id}/`, formEditar);
      setUsuarios((prev) => prev.map((u) => (u.id === usuarioEditando.id ? res.data.usuario : u)));
      showFeedback({ type: 'success', title: 'Usuário atualizado', message: `${formEditar.nome} foi atualizado com sucesso.` });
      setModalEditarAberto(false);
    } catch (err) {
      const msg = err.response?.data?.erro
        || Object.values(err.response?.data || {})[0]
        || getApiErrorMessage(err, 'usuarios_admin');
      setErroEditar(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSalvandoEditar(false);
    }
  };
  const fecharModal = () => setModalAberto(false);

  const handleFormChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const toggleSetor = (id) => {
    setForm((prev) => {
      const atual = prev.id_setores.includes(id)
        ? prev.id_setores.filter((s) => s !== id)
        : [...prev.id_setores, id];
      return { ...prev, id_setores: atual };
    });
  };

  const handleCriar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setErroForm('');
    try {
      await api.post('/usuarios/registro/', form);
      showFeedback({ type: 'success', title: 'Usuário criado', message: `Gestor ${form.nome} cadastrado com sucesso.` });
      fecharModal();
      setBusca((b) => b); // força re-render sem mudar busca
      setPaginaAtual(1);
    } catch (err) {
      const msg = err.response?.data?.erro
        || Object.values(err.response?.data || {})[0]
        || getApiErrorMessage(err, 'registro');
      setErroForm(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSalvando(false);
    }
  };

  const handleToggleAtivo = async (usuario) => {
    const acao = usuario.ativo ? 'desativar' : 'reativar';
    try {
      if (usuario.ativo) {
        await api.delete(`/usuarios/gestores/${usuario.id}/`);
        showFeedback({ type: 'success', title: 'Usuário desativado', message: `${usuario.nome} foi desativado.` });
      } else {
        await api.post(`/usuarios/gestores/${usuario.id}/reativar/`);
        showFeedback({ type: 'success', title: 'Usuário reativado', message: `${usuario.nome} foi reativado.` });
      }
      setUsuarios((prev) =>
        prev.map((u) => (u.id === usuario.id ? { ...u, ativo: !u.ativo } : u)),
      );
    } catch (err) {
      showFeedback({ type: 'error', title: `Falha ao ${acao}`, message: getApiErrorMessage(err, 'usuarios_admin') });
    }
  };

  const totalAtivos = usuarios.filter((u) => u.ativo).length;

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-title">
            <div className="title-line"></div>
            <h1>Gestão de Usuários</h1>
          </div>
          <div className="header-actions">
            <ThemeToggle compact />
            <button type="button" className="btn-primary" onClick={abrirModal}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Novo Usuário
            </button>
          </div>
        </header>

        <section className="unidades-summary-grid">
          <div className="unidades-summary-card">
            <span className="summary-kicker">USUÁRIOS ATIVOS</span>
            <strong>{String(totalAtivos).padStart(4, '0')}</strong>
            <span>nesta página</span>
          </div>
          <div className="unidades-summary-card">
            <span className="summary-kicker">TOTAL NO FILTRO</span>
            <strong>{String(totalResultados).padStart(4, '0')}</strong>
            <span>resultados encontrados</span>
          </div>
        </section>

        <section className="unidades-panel">
          <div className="unidades-panel-header">
            <div>
              <h2>Gestores cadastrados</h2>
              <p>Visualize, crie e gerencie o acesso dos gestores ao sistema.</p>
            </div>
            <div className="unidades-search">
              <input
                type="text"
                placeholder="Buscar por nome, SIAPE ou e-mail..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>

          <div className="unidades-table-wrapper">
            {loading ? (
              <div className="feedback-panel"><strong>Carregando usuários...</strong></div>
            ) : usuarios.length === 0 ? (
              <div className="feedback-panel"><strong>Nenhum usuário encontrado</strong><span>Refine a busca ou cadastre um novo gestor.</span></div>
            ) : (
              <>
                <table className="unidades-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>SIAPE</th>
                      <th>E-mail</th>
                      <th>Cargo</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((u) => (
                      <tr key={u.id} className={!u.ativo ? 'usuario-inativo' : ''}>
                        <td>{u.nome}</td>
                        <td>{u.siape}</td>
                        <td>{u.email || '—'}</td>
                        <td>
                          <span className={`badge-cargo ${u.cargo === 'gestor_adm' ? 'adm' : 'padrao'}`}>
                            {u.cargo === 'gestor_adm' ? 'Gestor Adm.' : 'Gestor'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge-status ${u.ativo ? 'ativo' : 'inativo'}`}>
                            {u.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="acoes-cell">
                          <button
                            type="button"
                            className="btn-acao-tabela editar"
                            onClick={() => abrirModalEditar(u)}
                            title="Editar usuário"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          {!u.is_superuser && u.id !== safeUser.id && (
                            <button
                              type="button"
                              className={`btn-toggle-usuario ${u.ativo ? 'desativar' : 'reativar'}`}
                              onClick={() => handleToggleAtivo(u)}
                            >
                              {u.ativo ? 'Desativar' : 'Reativar'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="unidades-pagination">
                  <span>Página {paginaAtual} de {totalPaginas}</span>
                  <div className="unidades-pagination-actions">
                    <button type="button" onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))} disabled={paginaAtual === 1}>Anterior</button>
                    <button type="button" onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))} disabled={paginaAtual >= totalPaginas}>Próxima</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      {modalEditarAberto && usuarioEditando && (
        <div className="modal-overlay" onClick={() => setModalEditarAberto(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Gestor</h2>
              <button type="button" className="modal-close" onClick={() => setModalEditarAberto(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSalvarEdicao}>
              {erroEditar && <div className="error-message-perfil">{erroEditar}</div>}

              <div className="form-group">
                <label htmlFor="nome">Nome Completo</label>
                <input id="nome" type="text" value={formEditar.nome} onChange={handleFormEditarChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="email">E-mail Corporativo</label>
                <input id="email" type="email" value={formEditar.email} onChange={handleFormEditarChange} />
              </div>
              <div className="form-group">
                <label htmlFor="cargo">Cargo</label>
                <select id="cargo" value={formEditar.cargo} onChange={handleFormEditarChange}>
                  <option value="gestor">Gestor</option>
                  <option value="gestor_adm">Gestor Administrador</option>
                </select>
              </div>

              <div className="form-group">
                <label>Setores / Unidades</label>
                <input
                  type="text"
                  className="modal-setor-busca"
                  placeholder="Buscar por sigla, nome ou centro..."
                  value={buscaSetorEditar}
                  onChange={(e) => setBuscaSetorEditar(e.target.value)}
                />
                <div className="modal-setores-lista">
                  {(() => {
                    const termo = buscaSetorEditar.trim().toLowerCase();
                    const filtrados = termo
                      ? setoresDisponiveis.filter((s) =>
                          (s.label_curto || s.nome || '').toLowerCase().includes(termo) ||
                          (s.sigla_centro || '').toLowerCase().includes(termo) ||
                          (s.nome_centro || '').toLowerCase().includes(termo),
                        )
                      : setoresDisponiveis;
                    if (filtrados.length === 0) return <span className="modal-setores-vazio">Nenhuma unidade encontrada.</span>;
                    return filtrados.map((s) => (
                      <label key={s.id} className="modal-setor-item">
                        <input type="checkbox" checked={formEditar.id_setores.includes(s.id)} onChange={() => toggleSetorEditar(s.id)} />
                        <span>{s.label_curto || s.nome}</span>
                      </label>
                    ));
                  })()}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancelar" onClick={() => setModalEditarAberto(false)}>Cancelar</button>
                <button type="submit" className="btn-salvar" disabled={salvandoEditar}>
                  {salvandoEditar ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalAberto && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Novo Gestor</h2>
              <button type="button" className="modal-close" onClick={fecharModal}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form className="modal-form" onSubmit={handleCriar}>
              {erroForm && <div className="error-message-perfil">{erroForm}</div>}

              <div className="form-group">
                <label htmlFor="siape">SIAPE</label>
                <input id="siape" type="text" value={form.siape} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="nome">Nome Completo</label>
                <input id="nome" type="text" value={form.nome} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="email">E-mail Corporativo</label>
                <input id="email" type="email" value={form.email} onChange={handleFormChange} />
              </div>
              <div className="form-group">
                <label htmlFor="senha">Senha Inicial</label>
                <input id="senha" type="text" value={form.senha} onChange={handleFormChange} required minLength={8} />
                <span className="input-caption">O gestor deve alterar a senha no primeiro acesso.</span>
              </div>

              <div className="form-group">
                <label htmlFor="cargo">Cargo</label>
                <select id="cargo" value={form.cargo} onChange={handleFormChange}>
                  <option value="gestor">Gestor</option>
                  <option value="gestor_adm">Gestor Administrador</option>
                </select>
                <span className="input-caption">Gestor Administrador pode adicionar e remover membros da equipe.</span>
              </div>

              <div className="form-group">
                <label>Setores / Unidades</label>
                <input
                  type="text"
                  className="modal-setor-busca"
                  placeholder="Buscar por sigla, nome ou centro..."
                  value={buscaSetor}
                  onChange={(e) => setBuscaSetor(e.target.value)}
                />
                <div className="modal-setores-lista">
                  {(() => {
                    const termo = buscaSetor.trim().toLowerCase();
                    const filtrados = termo
                      ? setoresDisponiveis.filter((s) =>
                          (s.label_curto || s.nome || '').toLowerCase().includes(termo) ||
                          (s.sigla_centro || '').toLowerCase().includes(termo) ||
                          (s.nome_centro || '').toLowerCase().includes(termo),
                        )
                      : setoresDisponiveis;
                    if (filtrados.length === 0) {
                      return <span className="modal-setores-vazio">Nenhuma unidade encontrada.</span>;
                    }
                    return filtrados.map((s) => (
                      <label key={s.id} className="modal-setor-item">
                        <input
                          type="checkbox"
                          checked={form.id_setores.includes(s.id)}
                          onChange={() => toggleSetor(s.id)}
                        />
                        <span>{s.label_curto || s.nome}</span>
                      </label>
                    ));
                  })()}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancelar" onClick={fecharModal}>Cancelar</button>
                <button type="submit" className="btn-salvar" disabled={salvando}>
                  {salvando ? 'Salvando...' : 'Criar Gestor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestaoUsuarios;
