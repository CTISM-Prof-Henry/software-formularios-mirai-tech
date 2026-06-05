import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import ThemeToggle from '../../components/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { useFeedback } from '../../context/FeedbackContext';
import api from '../../services/api';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';
import './styles.css';

const UnidadesAdmin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const safeUser = user || {};
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [centroSelecionado, setCentroSelecionado] = useState('');
  const [tipoSelecionado, setTipoSelecionado] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalResultados, setTotalResultados] = useState(0);
  const [centrosDisponiveis, setCentrosDisponiveis] = useState([]);
  const [tiposDisponiveis, setTiposDisponiveis] = useState([]);
  const pageSize = 20;
  const { showFeedback } = useFeedback();

  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [unidadeEditando, setUnidadeEditando] = useState(null);
  const [formEditar, setFormEditar] = useState({ nome: '', sigla: '', sigla_centro: '', nome_centro: '', tipo_unidade: '' });
  const [salvandoEditar, setSalvandoEditar] = useState(false);
  const [erroEditar, setErroEditar] = useState('');

  useEffect(() => {
    if (!safeUser.is_superuser) {
      navigate('/dashboard', { replace: true });
      return;
    }
  }, [navigate, safeUser.is_superuser]);

  useEffect(() => {
    if (!safeUser.is_superuser) {
      return;
    }

    async function carregarUnidades() {
      setLoading(true);
      try {
        const response = await api.get('/usuarios/setores/admin/', {
          params: {
            search: busca,
            centro: centroSelecionado,
            tipo: tipoSelecionado,
            page: paginaAtual,
            page_size: pageSize,
          },
        });
        setUnidades(Array.isArray(response.data.results) ? response.data.results : []);
        setTotalResultados(response.data.count || 0);
        setTotalPaginas(response.data.total_pages || 1);
        setCentrosDisponiveis(Array.isArray(response.data.centros) ? response.data.centros : []);
        setTiposDisponiveis(Array.isArray(response.data.tipos) ? response.data.tipos : []);
      } catch (err) {
        const message = getApiErrorMessage(err, 'unidades_admin');
        showFeedback({
          type: 'error',
          title: 'Unidades indisponiveis',
          message,
        });
      } finally {
        setLoading(false);
      }
    }

    carregarUnidades();
  }, [busca, centroSelecionado, navigate, paginaAtual, tipoSelecionado, safeUser.is_superuser]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca, centroSelecionado, tipoSelecionado]);

  const abrirModalEditar = (unidade) => {
    setUnidadeEditando(unidade);
    setFormEditar({
      nome: unidade.nome || '',
      sigla: unidade.sigla || '',
      sigla_centro: unidade.sigla_centro || '',
      nome_centro: unidade.nome_centro || '',
      tipo_unidade: unidade.tipo_unidade || '',
    });
    setErroEditar('');
    setModalEditarAberto(true);
  };

  const handleFormEditarChange = (e) => {
    const { id, value } = e.target;
    setFormEditar((prev) => ({ ...prev, [id]: value }));
  };

  const handleSalvarEdicao = async (e) => {
    e.preventDefault();
    setSalvandoEditar(true);
    setErroEditar('');
    try {
      const res = await api.patch(`/usuarios/setores/${unidadeEditando.id}/`, formEditar);
      setUnidades((prev) => prev.map((u) => (u.id === unidadeEditando.id ? { ...u, ...res.data } : u)));
      showFeedback({ type: 'success', title: 'Unidade atualizada', message: 'Os dados da unidade foram salvos.' });
      setModalEditarAberto(false);
    } catch (err) {
      setErroEditar(getApiErrorMessage(err, 'unidades_admin'));
    } finally {
      setSalvandoEditar(false);
    }
  };

  const handleDesativar = async (unidade) => {
    if (!window.confirm(`Deseja desativar a unidade "${unidade.label_curto}"?`)) return;
    try {
      const res = await api.post(`/usuarios/setores/${unidade.id}/desativar/`);
      if (!res.data.ativo) {
        setUnidades((prev) => prev.filter((u) => u.id !== unidade.id));
      }
      showFeedback({ type: 'success', title: 'Unidade desativada', message: res.data.mensagem });
    } catch (err) {
      showFeedback({ type: 'error', title: 'Erro', message: getApiErrorMessage(err, 'unidades_admin') });
    }
  };

  const totalOficiais = unidades.filter((unidade) => unidade.fonte_oficial).length;
  const descricaoFiltros = useMemo(() => {
    if (!centroSelecionado && !tipoSelecionado && !busca.trim()) {
      return 'Mostrando a base completa com paginação administrativa.';
    }

    const partes = [];
    if (centroSelecionado) partes.push(`centro ${centroSelecionado}`);
    if (tipoSelecionado) partes.push(`tipo ${tipoSelecionado}`);
    if (busca.trim()) partes.push(`busca "${busca.trim()}"`);
    return `Filtro ativo por ${partes.join(', ')}.`;
  }, [busca, centroSelecionado, tipoSelecionado]);

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-title">
            <div className="title-line"></div>
            <h1>Unidades UFSM</h1>
          </div>
          <div className="header-actions">
            <ThemeToggle compact />
          </div>
        </header>

        <section className="unidades-summary-grid">
          <div className="unidades-summary-card">
            <span className="summary-kicker">BASE OFICIAL</span>
            <strong>{String(totalOficiais).padStart(4, '0')}</strong>
            <span>unidades nesta página atual</span>
          </div>
          <div className="unidades-summary-card">
            <span className="summary-kicker">VISUALIZACAO</span>
            <strong>{String(totalResultados).padStart(4, '0')}</strong>
            <span>resultados totais no filtro atual</span>
          </div>
        </section>

        <section className="unidades-panel">
          <div className="unidades-panel-header">
            <div>
              <h2>Estrutura institucional completa</h2>
              <p>Visao administrativa das unidades oficiais da UFSM com centro, tipo e exibicao completa.</p>
            </div>
            <div className="unidades-search">
              <input
                type="text"
                placeholder="Buscar por sigla, unidade, centro ou tipo..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>

          <div className="unidades-filters-row">
            <div className="unidades-filter-group">
              <label>Centro</label>
              <select value={centroSelecionado} onChange={(e) => setCentroSelecionado(e.target.value)}>
                <option value="">Todos</option>
                {centrosDisponiveis.map((centro) => (
                  <option key={centro} value={centro}>
                    {centro}
                  </option>
                ))}
              </select>
            </div>
            <div className="unidades-filter-group">
              <label>Tipo de unidade</label>
              <select value={tipoSelecionado} onChange={(e) => setTipoSelecionado(e.target.value)}>
                <option value="">Todos</option>
                {tiposDisponiveis.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="unidades-clear-button"
              onClick={() => {
                setBusca('');
                setCentroSelecionado('');
                setTipoSelecionado('');
              }}
            >
              Limpar filtros
            </button>
          </div>

          <p className="unidades-filter-description">{descricaoFiltros}</p>

          <div className="unidades-table-wrapper">
            {loading ? (
              <div className="feedback-panel">
                <strong>Carregando unidades oficiais</strong>
                <span>Buscando a estrutura institucional da UFSM para exibicao administrativa.</span>
              </div>
            ) : unidades.length === 0 ? (
              <div className="feedback-panel">
                <strong>Nenhuma unidade encontrada</strong>
                <span>Refine os filtros ou limpe a busca para visualizar outras unidades.</span>
              </div>
            ) : (
              <>
                <table className="unidades-table">
                  <thead>
                    <tr>
                      <th>Exibicao comum</th>
                      <th>Centro</th>
                      <th>Tipo</th>
                      <th>Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unidades.map((unidade) => (
                      <tr key={unidade.id}>
                        <td>{unidade.label_curto}</td>
                        <td>{unidade.nome_centro || 'Nao informado'}</td>
                        <td>{unidade.tipo_unidade || 'Nao informado'}</td>
                        <td className="acoes-cell-unidade">
                          <button
                            type="button"
                            className="btn-acao-unidade editar"
                            onClick={() => abrirModalEditar(unidade)}
                            title="Editar unidade"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="btn-acao-unidade desativar"
                            onClick={() => handleDesativar(unidade)}
                            title="Desativar unidade"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="unidades-pagination">
                  <span>
                    Pagina {paginaAtual} de {totalPaginas}
                  </span>
                  <div className="unidades-pagination-actions">
                    <button
                      type="button"
                      onClick={() => setPaginaAtual((pagina) => Math.max(1, pagina - 1))}
                      disabled={paginaAtual === 1}
                    >
                      Anterior
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaginaAtual((pagina) => Math.min(totalPaginas, pagina + 1))}
                      disabled={paginaAtual >= totalPaginas}
                    >
                      Proxima
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      {modalEditarAberto && unidadeEditando && (
        <div className="modal-overlay" onClick={() => setModalEditarAberto(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Unidade</h2>
              <button type="button" className="modal-close" onClick={() => setModalEditarAberto(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSalvarEdicao}>
              {erroEditar && <div className="error-message-perfil">{erroEditar}</div>}

              <div className="form-grid-modal">
                <div className="form-group">
                  <label htmlFor="nome">Nome da Unidade</label>
                  <input id="nome" type="text" value={formEditar.nome} onChange={handleFormEditarChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="sigla">Sigla</label>
                  <input id="sigla" type="text" value={formEditar.sigla} onChange={handleFormEditarChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="sigla_centro">Sigla do Centro</label>
                  <input id="sigla_centro" type="text" value={formEditar.sigla_centro} onChange={handleFormEditarChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="nome_centro">Nome do Centro</label>
                  <input id="nome_centro" type="text" value={formEditar.nome_centro} onChange={handleFormEditarChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="tipo_unidade">Tipo de Unidade</label>
                  <input id="tipo_unidade" type="text" value={formEditar.tipo_unidade} onChange={handleFormEditarChange} />
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
    </div>
  );
};

export default UnidadesAdmin;
