import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import ThemeToggle from '../../components/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { useFeedback } from '../../context/FeedbackContext';
import api from '../../services/api';
import { downloadBlob } from '../../utils/downloadFile';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';
import { getSetorLabel } from '../../utils/unidades';
import { getAlertaPrazo, getRiskColorClass, getRiskLabel } from '../../utils/risco';
import './styles.css';

const PlanosRisco = () => {
  const navigate = useNavigate();
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownUp, setDropdownUp] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingRelatorio, setExportingRelatorio] = useState(false);
  const [duplicandoId, setDuplicandoId] = useState(null);
  const [todosSetores, setTodosSetores] = useState([]);
  const [setorDropdownOpen, setSetorDropdownOpen] = useState(false);
  const [setorSearch, setSetorSearch] = useState('');
  const dropdownRef = useRef(null);
  const setorDropdownRef = useRef(null);

  const [stats, setStats] = useState({
    total_planos: 0,
    riscos_altos: 0,
    em_revisao: 0,
    concluidos: 0
  });

  const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const { user } = useAuth();
  const safeUser = user || {};
  const userSetoresIds = safeUser.setores?.map(s => s.id) || [];
  const primeiroSetor = safeUser.setores?.[0]?.id || '';

  const [search, setSearch] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterSetor, setFilterSetor] = useState(primeiroSetor);
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterDataInicio, setFilterDataInicio] = useState('');
  const [filterDataFim, setFilterDataFim] = useState('');
  const [ordenacao, setOrdenacao] = useState('desc');
  const { showFeedback } = useFeedback();

  useEffect(() => {
    carregarPlanos();
    carregarEstatisticas();
  }, [currentPage, filterSetor, filterCategoria, filterDataInicio, filterDataFim, ordenacao]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (setorDropdownRef.current && !setorDropdownRef.current.contains(event.target)) {
        setSetorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    api.get('/usuarios/setores/').then(r => setTodosSetores(r.data)).catch(() => {});
  }, []);

  async function carregarEstatisticas() {
    try {
      const response = await api.get('/riscos/planos/estatisticas/');
      setStats(response.data);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      showFeedback({
        type: 'warning',
        title: 'Indicadores indisponiveis',
        message: 'Nao foi possivel atualizar os indicadores de planos agora. Tente novamente em instantes.',
      });
    }
  }

  async function carregarPlanos() {
    setLoading(true);
    try {
      let url = `/riscos/planos/?page=${currentPage}&ordenacao=${ordenacao}`;
      if (filterSetor) url += `&setor=${filterSetor}`;
      if (filterCategoria) url += `&categoria=${filterCategoria}`;
      if (filterDataInicio) url += `&data_inicio=${filterDataInicio}`;
      if (filterDataFim) url += `&data_fim=${filterDataFim}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const response = await api.get(url);
      setPlanos(response.data.results);
      setCount(response.data.count);
    } catch (err) {
      console.error('Erro ao carregar planos:', err);
      showFeedback({
        type: 'error',
        title: 'Listagem indisponivel',
        message: getApiErrorMessage(err, 'planos_risco'),
      });
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    carregarPlanos();
  };

  async function exportarExcel() {
    setExportingExcel(true);
    try {
      const params = new URLSearchParams({ ordenacao });
      if (filterSetor) params.append('setor', filterSetor);
      if (filterCategoria) params.append('categoria', filterCategoria);
      if (filterDataInicio) params.append('data_inicio', filterDataInicio);
      if (filterDataFim) params.append('data_fim', filterDataFim);
      if (search) params.append('search', search);

      const response = await api.get(`/riscos/planos/exportar-excel/?${params.toString()}`, {
        responseType: 'blob',
      });
      downloadBlob(response.data, 'planos-risco.xlsx');
      showFeedback({ type: 'success', title: 'Excel gerado', message: 'O arquivo com os planos filtrados foi preparado.' });
    } catch (err) {
      showFeedback({ type: 'error', title: 'Exportacao nao concluida', message: getApiErrorMessage(err, 'exportacao') });
    } finally {
      setExportingExcel(false);
    }
  }

  async function exportarRelatorio() {
    setExportingRelatorio(true);
    try {
      const params = new URLSearchParams({ ordenacao });
      if (filterSetor) params.append('setor', filterSetor);
      if (filterCategoria) params.append('categoria', filterCategoria);
      if (filterDataInicio) params.append('data_inicio', filterDataInicio);
      if (filterDataFim) params.append('data_fim', filterDataFim);
      if (search) params.append('search', search);

      const response = await api.get(`/riscos/planos/exportar-relatorio/?${params.toString()}`, {
        responseType: 'blob',
      });
      downloadBlob(response.data, 'relatorio-gerencial.pdf');
      showFeedback({ type: 'success', title: 'Relatorio gerado', message: 'O relatorio gerencial em PDF foi preparado.' });
    } catch (err) {
      showFeedback({ type: 'error', title: 'Relatorio nao concluido', message: getApiErrorMessage(err, 'exportacao') });
    } finally {
      setExportingRelatorio(false);
    }
  }

  async function duplicarPlano(plano) {
    setDuplicandoId(plano.uuid);
    try {
      const response = await api.post(`/riscos/planos/${plano.uuid}/duplicar/`);
      showFeedback({
        type: 'success',
        title: 'Plano duplicado',
        message: 'O plano foi copiado. Voce pode edita-lo agora.',
      });
      navigate(`/editar-plano/${response.data.uuid}?step=1`);
    } catch (err) {
      showFeedback({ type: 'error', title: 'Duplicacao falhou', message: getApiErrorMessage(err, 'planos_risco') });
    } finally {
      setDuplicandoId(null);
    }
  }

  const totalPages = Math.ceil(count / pageSize);

  const setoresFiltrados = todosSetores.filter(s =>
    getSetorLabel(s).toLowerCase().includes(setorSearch.toLowerCase())
  );
  const setorSelecionadoLabel = filterSetor
    ? (getSetorLabel(todosSetores.find(s => s.id === filterSetor) || {}) || 'Unidade selecionada')
    : 'Todos os Setores';

  const canEdit = (plano) => userSetoresIds.includes(plano.setor);

  function CompletudeIndicador({ plano }) {
    const temAcao = plano.possui_plano_acao;
    const temMonitoramento = plano.possui_monitoramento;
    return (
      <span className="completude-indicator" title={`Tratamento: ${temAcao ? 'sim' : 'não'} | Monitoramento: ${temMonitoramento ? 'sim' : 'não'}`}>
        <span className={`completude-dot ${temAcao ? 'ok' : 'vazio'}`} />
        <span className={`completude-dot ${temMonitoramento ? 'ok' : 'vazio'}`} />
      </span>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-title">
            <div className="title-line"></div>
            <h1>Planos de Risco</h1>
          </div>

          <div className="header-actions">
            <button
              className="export-button"
              title="Relatorio gerencial em PDF"
              onClick={exportarRelatorio}
              disabled={exportingRelatorio}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              {exportingRelatorio ? 'Gerando...' : 'Relatório'}
            </button>
            <button
              className="export-button excel"
              title="Exportar planos filtrados para Excel"
              onClick={exportarExcel}
              disabled={exportingExcel}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
              {exportingExcel ? 'Exportando...' : 'Excel'}
            </button>
            <button className="new-plan-button" onClick={() => navigate('/novo-plano')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Novo Plano
            </button>
            <ThemeToggle compact />
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              <span className="stat-badge positive">+12%</span>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.total_planos.toString().padStart(2, '0')}</span>
              <span className="stat-label">TOTAL DE PLANOS</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper red">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              <span className="stat-badge critical">CRÍTICO</span>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.riscos_altos.toString().padStart(2, '0')}</span>
              <span className="stat-label">RISCOS ALTOS</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper yellow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
              <span className="stat-badge queue">EM FILA</span>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.em_revisao.toString().padStart(2, '0')}</span>
              <span className="stat-label">EM REVISÃO</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper green">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <span className="stat-badge target">META</span>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.concluidos.toString().padStart(2, '0')}</span>
              <span className="stat-label">CONCLUÍDOS</span>
            </div>
          </div>
        </section>

        <section className="plans-filters">
          <form className="search-box" onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Buscar por evento, causa, macroprocesso, responsável..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-search">Filtrar</button>
            <button
              type="button"
              className={`btn-advanced ${showAdvancedFilters ? 'active' : ''}`}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              Filtros Avançados
            </button>
          </form>

          {showAdvancedFilters && (
            <div className="advanced-filters-panel">
              <div className="filters-row">
                <div className="filter-group">
                  <label>Unidade/Departamento:</label>
                  <div className="setor-dropdown" ref={setorDropdownRef}>
                    <button
                      type="button"
                      className={`setor-dropdown-trigger ${setorDropdownOpen ? 'open' : ''}`}
                      onClick={() => { setSetorDropdownOpen(o => !o); setSetorSearch(''); }}
                    >
                      <span className="setor-dropdown-label">{setorSelecionadoLabel}</span>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points={setorDropdownOpen ? '18 15 12 9 6 15' : '6 9 12 15 18 9'}></polyline>
                      </svg>
                    </button>
                    {setorDropdownOpen && (
                      <div className="setor-dropdown-panel">
                        <div className="setor-dropdown-search">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                          </svg>
                          <input
                            type="text"
                            placeholder="Buscar unidade..."
                            value={setorSearch}
                            onChange={e => setSetorSearch(e.target.value)}
                            autoFocus
                          />
                        </div>
                        <div className="setor-dropdown-list">
                          <button
                            type="button"
                            className={`setor-option ${!filterSetor ? 'selected' : ''}`}
                            onClick={() => { setFilterSetor(''); setSetorDropdownOpen(false); setCurrentPage(1); }}
                          >
                            Todos os Setores
                          </button>
                          {setoresFiltrados.map(s => (
                            <button
                              key={s.id}
                              type="button"
                              className={`setor-option ${filterSetor === s.id ? 'selected' : ''}`}
                              onClick={() => { setFilterSetor(s.id); setSetorDropdownOpen(false); setCurrentPage(1); }}
                            >
                              {getSetorLabel(s)}
                            </button>
                          ))}
                          {setoresFiltrados.length === 0 && (
                            <div className="setor-option-empty">Nenhuma unidade encontrada</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="filter-group">
                  <label>Categoria:</label>
                  <select value={filterCategoria} onChange={(e) => setFilterCategoria(e.target.value)}>
                    <option value="">Todas as Categorias</option>
                    <option value="Operacional">Operacional</option>
                    <option value="Estratégico">Estratégico</option>
                    <option value="Integridade">Integridade</option>
                    <option value="Imagem">Imagem</option>
                    <option value="Financeiro">Financeiro</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Ordenação:</label>
                  <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)}>
                    <option value="desc">Mais recentes</option>
                    <option value="asc">Mais antigos</option>
                    <option value="nivel_desc">Nível (maior primeiro)</option>
                    <option value="nivel_asc">Nível (menor primeiro)</option>
                    <option value="prazo_asc">Prazo (mais urgente)</option>
                    <option value="prazo_desc">Prazo (mais distante)</option>
                  </select>
                </div>
              </div>

              <div className="filters-row">
                <div className="filter-group">
                  <label>A partir de:</label>
                  <input type="date" value={filterDataInicio} onChange={(e) => setFilterDataInicio(e.target.value)} />
                </div>
                <div className="filter-group">
                  <label>Até:</label>
                  <input type="date" value={filterDataFim} onChange={(e) => setFilterDataFim(e.target.value)} />
                </div>
                <button className="btn-clear-filters" onClick={() => {
                  setFilterSetor(primeiroSetor);
                  setFilterCategoria('');
                  setFilterDataInicio('');
                  setFilterDataFim('');
                  setOrdenacao('desc');
                  setSearch('');
                }}>Limpar Filtros</button>
              </div>
            </div>
          )}
        </section>

        <section className="plans-list-container">
          {loading ? (
            <div className="loading-state">Carregando planos de risco...</div>
          ) : planos.length > 0 ? (
            <>
              <div className="plans-table-wrapper">
                <table className="plans-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>EVENTO DE RISCO</th>
                      <th>UNIDADE</th>
                      <th>CATEGORIA</th>
                      <th>NÍVEL (RESIDUAL)</th>
                      <th title="Tratamento definido | Monitoramento registrado">STATUS</th>
                      <th>AÇÕES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planos.map((plano, index) => {
                      const alerta = getAlertaPrazo(plano);
                      return (
                        <tr key={plano.uuid}>
                          <td>#{(currentPage - 1) * pageSize + index + 1}</td>
                          <td className="col-evento" title={plano.evento}>
                            {plano.evento}
                            {alerta && (
                              <span className={`prazo-badge ${alerta.tipo}`}>{alerta.texto}</span>
                            )}
                          </td>
                          <td>{getSetorLabel(plano.setor_detalhes)}</td>
                          <td>{plano.categoria}</td>
                          <td>
                            <span className={`risk-badge ${getRiskColorClass(plano.nivel_residual)}`}>
                              {plano.nivel_residual}
                            </span>
                          </td>
                          <td><CompletudeIndicador plano={plano} /></td>
                          <td className="col-acoes">
                            <button className="btn-action view" title="Visualizar" onClick={() => navigate(`/planos/${plano.uuid}`)}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                            </button>
                            <button
                              className="btn-action duplicate"
                              title="Duplicar plano (copia identificação e avaliação)"
                              onClick={() => duplicarPlano(plano)}
                              disabled={duplicandoId === plano.uuid}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                              </svg>
                            </button>
                            {canEdit(plano) && (
                              <div className="edit-dropdown-container" ref={openDropdownId === plano.uuid ? dropdownRef : null}>
                                <button
                                  className={`btn-action edit ${openDropdownId === plano.uuid ? 'active' : ''}`}
                                  title="Editar"
                                  onClick={(e) => {
                                    if (openDropdownId === plano.uuid) {
                                      setOpenDropdownId(null);
                                    } else {
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      setDropdownUp(rect.bottom + 160 > window.innerHeight);
                                      setOpenDropdownId(plano.uuid);
                                    }
                                  }}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                  </svg>
                                </button>
                                <div className={`edit-dropdown-content ${openDropdownId === plano.uuid ? 'show' : ''} ${openDropdownId === plano.uuid && dropdownUp ? 'up' : ''}`}>
                                  <div className="dropdown-title">Editar Seção:</div>
                                  <button onClick={() => navigate(`/editar-plano/${plano.uuid}?step=1`)}>1. Identificação</button>
                                  <button onClick={() => navigate(`/editar-plano/${plano.uuid}?step=2`)}>2. Avaliação</button>
                                  <button onClick={() => navigate(`/editar-plano/${plano.uuid}?step=3`)}>3. Tratamento</button>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="plans-mobile-list">
                {planos.map((plano, index) => {
                  const alerta = getAlertaPrazo(plano);
                  return (
                    <article key={`mobile-${plano.uuid}`} className="plan-mobile-card">
                      <div className="plan-mobile-top">
                        <span className="plan-mobile-id">#{(currentPage - 1) * pageSize + index + 1}</span>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          {alerta && <span className={`prazo-badge ${alerta.tipo}`}>{alerta.texto}</span>}
                          <span className={`risk-badge ${getRiskColorClass(plano.nivel_residual)}`}>
                            {getRiskLabel(plano.nivel_residual)}
                          </span>
                        </div>
                      </div>

                      <h3>{plano.evento}</h3>

                      <div className="plan-mobile-meta">
                        <span><strong>Unidade:</strong> {getSetorLabel(plano.setor_detalhes)}</span>
                        <span><strong>Categoria:</strong> {plano.categoria}</span>
                        <span><strong>Nivel residual:</strong> {plano.nivel_residual}</span>
                        <span><CompletudeIndicador plano={plano} /> <em style={{ fontSize: 12, color: '#64748b' }}>tratamento · monitoramento</em></span>
                      </div>

                      <div className="plan-mobile-actions">
                        <button className="btn-action view mobile-action-button" title="Visualizar" onClick={() => navigate(`/planos/${plano.uuid}`)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                          Visualizar
                        </button>

                        <button
                          className="btn-action duplicate mobile-action-button"
                          onClick={() => duplicarPlano(plano)}
                          disabled={duplicandoId === plano.uuid}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                          Duplicar
                        </button>

                        {canEdit(plano) && (
                          <div className="edit-dropdown-container" ref={openDropdownId === `mobile-${plano.uuid}` ? dropdownRef : null}>
                            <button
                              className={`btn-action edit mobile-action-button ${openDropdownId === `mobile-${plano.uuid}` ? 'active' : ''}`}
                              title="Editar"
                              onClick={() => setOpenDropdownId(openDropdownId === `mobile-${plano.uuid}` ? null : `mobile-${plano.uuid}`)}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                              Editar
                            </button>
                            <div className={`edit-dropdown-content ${openDropdownId === `mobile-${plano.uuid}` ? 'show' : ''}`}>
                              <div className="dropdown-title">Editar Seção:</div>
                              <button onClick={() => navigate(`/editar-plano/${plano.uuid}?step=1`)}>1. Identificação</button>
                              <button onClick={() => navigate(`/editar-plano/${plano.uuid}?step=2`)}>2. Avaliação</button>
                              <button onClick={() => navigate(`/editar-plano/${plano.uuid}?step=3`)}>3. Tratamento</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="page-btn"
                >
                  Anterior
                </button>
                <span className="page-info">Página {currentPage} de {totalPages || 1}</span>
                <button
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="page-btn"
                >
                  Próxima
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">Nenhum plano de risco encontrado.</div>
          )}
        </section>
      </main>
    </div>
  );
};

export default PlanosRisco;
