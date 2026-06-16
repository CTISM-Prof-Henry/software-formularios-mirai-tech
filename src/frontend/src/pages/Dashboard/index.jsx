import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import ThemeToggle from '../../components/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { useFeedback } from '../../context/FeedbackContext';
import api from '../../services/api';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';
import { getSetorLabel } from '../../utils/unidades';
import './styles.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const safeUser = user || {};
  const [stats, setStats] = useState({ total_planos: 0, riscos_altos: 0, total_usuarios: 0, total_unidades: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarStats() {
      try {
        const [estatisticasRes, gestoresRes, unidadesRes] = await Promise.all([
          api.get('/riscos/planos/estatisticas/'),
          api.get('/usuarios/gestores/', { params: { page_size: 1 } }),
          api.get('/usuarios/setores/admin/', { params: { page_size: 1 } }),
        ]);
        setStats({
          total_planos: estatisticasRes.data.total_planos || 0,
          riscos_altos: estatisticasRes.data.riscos_altos || 0,
          total_usuarios: gestoresRes.data.count || 0,
          total_unidades: unidadesRes.data.count || 0,
        });
      } catch {
        // stats ficam zerados em caso de erro
      } finally {
        setLoading(false);
      }
    }
    carregarStats();
  }, []);

  const atalhos = [
    {
      label: 'Gestão de Usuários',
      descricao: 'Cadastre gestores e gerencie o acesso ao sistema.',
      path: '/usuarios',
      cor: 'blue',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          <line x1="19" y1="8" x2="23" y2="8"></line>
          <line x1="21" y1="6" x2="21" y2="10"></line>
        </svg>
      ),
    },
    {
      label: 'Unidades UFSM',
      descricao: 'Consulte a estrutura organizacional completa da UFSM.',
      path: '/unidades',
      cor: 'green',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18"></path>
          <path d="M5 21V7l8-4v18"></path>
          <path d="M19 21V11l-6-4"></path>
          <path d="M9 9v.01"></path>
          <path d="M9 13v.01"></path>
          <path d="M9 17v.01"></path>
        </svg>
      ),
    },
    {
      label: 'Planos de Risco',
      descricao: 'Visualize todos os planos de risco cadastrados no sistema.',
      path: '/planos',
      cor: 'yellow',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
      ),
    },
    {
      label: 'Mapa de Riscos',
      descricao: 'Analise a distribuição e prioridade dos riscos institucionais.',
      path: '/mapa',
      cor: 'red',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
          <path d="M7 10v4M17 10v4M10 7h4M10 17h4"></path>
        </svg>
      ),
    },
  ];

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-title">
            <div className="title-line"></div>
            <h1>Painel Administrativo</h1>
          </div>
          <div className="header-actions">
            <ThemeToggle compact />
          </div>
        </header>

        <div className="admin-boas-vindas">
          <div className="admin-boas-vindas-texto">
            <h2>Bem-vindo, {safeUser.nome?.split(' ')[0] || 'Administrador'}</h2>
            <p>Você está logado como administrador do sistema. Use os atalhos abaixo para gerenciar o SIGR.</p>
          </div>
        </div>

        <section className="stats-grid dashboard-stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
              <span className="stat-badge positive">TOTAL</span>
            </div>
            <div className="stat-info">
              <span className="stat-value">{loading ? '—' : String(stats.total_usuarios).padStart(2, '0')}</span>
              <span className="stat-label">GESTORES CADASTRADOS</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper yellow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <span className="stat-badge queue">TOTAL</span>
            </div>
            <div className="stat-info">
              <span className="stat-value">{loading ? '—' : String(stats.total_planos).padStart(2, '0')}</span>
              <span className="stat-label">PLANOS DE RISCO</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper red">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span className="stat-badge critical">CRÍTICO</span>
            </div>
            <div className="stat-info">
              <span className="stat-value">{loading ? '—' : String(stats.riscos_altos).padStart(2, '0')}</span>
              <span className="stat-label">RISCOS CRÍTICOS</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper green">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18"></path>
                <path d="M5 21V7l8-4v18"></path>
                <path d="M19 21V11l-6-4"></path>
                <path d="M9 9v.01"></path>
                <path d="M9 13v.01"></path>
                <path d="M9 17v.01"></path>
              </svg>
              <span className="stat-badge target">ATIVAS</span>
            </div>
            <div className="stat-info">
              <span className="stat-value">{loading ? '—' : String(stats.total_unidades).padStart(2, '0')}</span>
              <span className="stat-label">UNIDADES UFSM</span>
            </div>
          </div>
        </section>

        <h2 className="content-title">Atalhos administrativos</h2>

        <section className="admin-atalhos-grid">
          {atalhos.map((atalho) => (
            <button
              key={atalho.path}
              type="button"
              className={`admin-atalho-card admin-atalho-${atalho.cor}`}
              onClick={() => navigate(atalho.path)}
            >
              <div className={`admin-atalho-icon admin-icon-${atalho.cor}`}>{atalho.icon}</div>
              <div className="admin-atalho-texto">
                <strong>{atalho.label}</strong>
                <span>{atalho.descricao}</span>
              </div>
              <svg className="admin-atalho-seta" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          ))}
        </section>
      </main>
    </div>
  );
};

const PAGE_SIZE = 5;

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const safeUser = user || {};

  if (safeUser.is_superuser) return <AdminDashboard />;

  const [planos, setPlanos] = useState([]);
  const [stats, setStats] = useState({
    total_planos: 0,
    riscos_criticos: 0,
    tratamentos_ativos: 0,
    setores_filtrados: 0,
  });
  const [busca, setBusca] = useState('');
  const [buscaAplicada, setBuscaAplicada] = useState('');
  const [filterSetor, setFilterSetor] = useState('');
  const [filterDataInicio, setFilterDataInicio] = useState('');
  const [filterDataFim, setFilterDataFim] = useState('');
  const [loading, setLoading] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [todosSetores, setTodosSetores] = useState([]);
  const [setorDropdownOpen, setSetorDropdownOpen] = useState(false);
  const [setorSearch, setSetorSearch] = useState('');
  const setorDropdownRef = useRef(null);
  const { showFeedback } = useFeedback();

  useEffect(() => {
    api.get('/usuarios/setores/').then((r) => setTodosSetores(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!setorDropdownOpen) return;
    function handleClickOutside(e) {
      if (setorDropdownRef.current && !setorDropdownRef.current.contains(e.target)) {
        setSetorDropdownOpen(false);
        setSetorSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setorDropdownOpen]);

  useEffect(() => {
    setPaginaAtual(1);
    carregarDashboard();
  }, [buscaAplicada, filterSetor, filterDataInicio, filterDataFim]);

  async function carregarDashboard() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ ordenacao: 'desc' });
      if (buscaAplicada) params.append('search', buscaAplicada);
      if (filterSetor) params.append('setor', filterSetor);
      if (filterDataInicio) params.append('data_inicio', filterDataInicio);
      if (filterDataFim) params.append('data_fim', filterDataFim);

      const response = await api.get(`/riscos/planos/dashboard/?${params.toString()}`);
      setPlanos(response.data.planos || []);
      setStats({
        total_planos: response.data.total_planos || 0,
        riscos_criticos: response.data.riscos_criticos || 0,
        tratamentos_ativos: response.data.tratamentos_ativos || 0,
        setores_filtrados: response.data.setores_filtrados || 0,
      });
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
      showFeedback({
        type: 'error',
        title: 'Dashboard indisponivel',
        message: getApiErrorMessage(err, 'dashboard'),
      });
    } finally {
      setLoading(false);
    }
  }

  function aplicarBusca(e) {
    e.preventDefault();
    setBuscaAplicada(busca.trim());
  }

  function limparFiltros() {
    setBusca('');
    setBuscaAplicada('');
    setFilterSetor('');
    setFilterDataInicio('');
    setFilterDataFim('');
    setPaginaAtual(1);
    setSetorDropdownOpen(false);
    setSetorSearch('');
  }

  const totalPaginas = Math.max(1, Math.ceil(planos.length / PAGE_SIZE));
  const planosPaginados = planos.slice((paginaAtual - 1) * PAGE_SIZE, paginaAtual * PAGE_SIZE);

  const getRiskColorClass = (nivel) => {
    if (nivel >= 20) return 'risk-extremo';
    if (nivel >= 12) return 'risk-alto';
    if (nivel >= 4) return 'risk-moderado';
    return 'risk-baixo';
  };

  const getRiskLabel = (nivel) => {
    if (nivel >= 20) return 'RISCO EXTREMO';
    if (nivel >= 12) return 'RISCO ALTO';
    if (nivel >= 4) return 'RISCO MODERADO';
    return 'RISCO BAIXO';
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR');
  };

  const getPlanPeriodLabel = (plano) => {
    const inicio = formatDate(plano.periodo_acao?.data_inicio);
    const fim = formatDate(plano.periodo_acao?.data_fim);
    if (inicio && fim) return `${inicio} até ${fim}`;
    if (inicio) return `Início em ${inicio}`;
    if (fim) return `Fim em ${fim}`;
    return 'Sem período definido';
  };

  const setoresResumo = filterSetor ? stats.setores_filtrados : (safeUser.setores?.length || 0);

  const setoresFiltradosDropdown = todosSetores.filter((s) =>
    getSetorLabel(s).toLowerCase().includes(setorSearch.toLowerCase())
  );
  const setorSelecionadoLabel = filterSetor
    ? (getSetorLabel(todosSetores.find((s) => s.id === filterSetor) || {}) || 'Unidade selecionada')
    : 'Todas as Unidades';

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-title">
            <div className="title-line"></div>
            <h1>Visão Geral</h1>
          </div>
          <div className="header-actions">
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

        <section className="stats-grid dashboard-stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              <span className="stat-badge positive">FILTRO</span>
            </div>
            <div className="stat-info">
              <span className="stat-value">{String(stats.total_planos).padStart(2, '0')}</span>
              <span className="stat-label">TOTAL DE PLANOS</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper red">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              <span className="stat-badge critical">CRÍTICO</span>
            </div>
            <div className="stat-info">
              <span className="stat-value">{String(stats.riscos_criticos).padStart(2, '0')}</span>
              <span className="stat-label">RISCOS CRÍTICOS</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper yellow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M12 11h4"></path><path d="M12 16h4"></path><path d="M8 11h.01"></path><path d="M8 16h.01"></path></svg>
              <span className="stat-badge queue">ATIVOS</span>
            </div>
            <div className="stat-info">
              <span className="stat-value">{String(stats.tratamentos_ativos).padStart(2, '0')}</span>
              <span className="stat-label">TRATAMENTOS ATIVOS</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper green">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"></path><path d="M5 21V7l8-4v18"></path><path d="M19 21V11l-6-4"></path><path d="M9 9v.01"></path><path d="M9 13v.01"></path><path d="M9 17v.01"></path></svg>
              <span className="stat-badge target">UNIDADE</span>
            </div>
            <div className="stat-info">
              <span className="stat-value">{String(setoresResumo).padStart(2, '0')}</span>
              <span className="stat-label">{filterSetor ? 'UNIDADE FILTRADA' : 'MINHAS UNIDADES'}</span>
            </div>
          </div>
        </section>

        <section className="dashboard-filter-panel">
          <form className="filter-bar" onSubmit={aplicarBusca}>
            <div className="search-input-wrapper">
              <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Buscar por risco, causa ou consequência..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            <div className="dashboard-filter-group">
              <label>Unidade/Departamento</label>
              <div className="dash-setor-dropdown" ref={setorDropdownRef}>
                <button
                  type="button"
                  className={`dash-setor-trigger${setorDropdownOpen ? ' open' : ''}`}
                  onClick={() => { setSetorDropdownOpen((o) => !o); setSetorSearch(''); }}
                >
                  <span className="dash-setor-label" title={setorSelecionadoLabel}>
                    {setorSelecionadoLabel}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                {setorDropdownOpen && (
                  <div className="dash-setor-panel">
                    <input
                      className="dash-setor-search"
                      type="text"
                      placeholder="Buscar unidade..."
                      value={setorSearch}
                      onChange={(e) => setSetorSearch(e.target.value)}
                      autoFocus
                    />
                    <ul className="dash-setor-list">
                      <li
                        className={`dash-setor-option${filterSetor === '' ? ' selected' : ''}`}
                        onClick={() => { setFilterSetor(''); setSetorDropdownOpen(false); setSetorSearch(''); }}
                      >
                        Todas as Unidades
                      </li>
                      {setoresFiltradosDropdown.map((s) => (
                        <li
                          key={s.id}
                          className={`dash-setor-option${filterSetor === s.id ? ' selected' : ''}`}
                          onClick={() => { setFilterSetor(s.id); setSetorDropdownOpen(false); setSetorSearch(''); }}
                        >
                          {getSetorLabel(s)}
                        </li>
                      ))}
                      {setoresFiltradosDropdown.length === 0 && (
                        <li className="dash-setor-option-empty">Nenhuma unidade encontrada</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="dashboard-filter-group date">
              <label>Início</label>
              <input type="date" value={filterDataInicio} onChange={(e) => setFilterDataInicio(e.target.value)} />
            </div>

            <div className="dashboard-filter-group date">
              <label>Fim</label>
              <input type="date" value={filterDataFim} onChange={(e) => setFilterDataFim(e.target.value)} />
            </div>

            <button type="submit" className="filter-button">Filtrar</button>
            <button type="button" className="clear-filter-button" onClick={limparFiltros}>Limpar</button>
          </form>
        </section>

        <div className="content-title-row">
          <h2 className="content-title">Planos cadastrados</h2>
          {!loading && planos.length > 0 && (
            <span className="plans-count">{planos.length} plano{planos.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        <section className="plans-container">
          <div className="plans-list">
            {loading ? (
              <div className="dashboard-empty-state">Carregando planos...</div>
            ) : planos.length > 0 ? (
              planosPaginados.map((plano) => (
                <button key={plano.id} className="plan-item" onClick={() => navigate(`/planos/${plano.uuid}`)}>
                  <div className="plan-info">
                    <div className="plan-icon-box">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                        <polyline points="10 17 15 12 10 7"></polyline>
                        <line x1="15" y1="12" x2="3" y2="12"></line>
                      </svg>
                    </div>
                    <div className="plan-details">
                      <h3>{plano.evento}</h3>
                      <p className="plan-meta">
                        Unidade: {getSetorLabel(plano.setor_detalhes) || 'Não informado'}
                      </p>
                      <p className="plan-date">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        {getPlanPeriodLabel(plano)}
                      </p>
                    </div>
                  </div>
                  <div className={`risk-badge ${getRiskColorClass(plano.nivel_residual)}`}>
                    {getRiskLabel(plano.nivel_residual)}
                  </div>
                </button>
              ))
            ) : (
              <div className="dashboard-empty-state">Nenhum plano encontrado para os filtros selecionados.</div>
            )}
          </div>

          {!loading && totalPaginas > 1 && (
            <div className="dashboard-pagination">
              <button
                type="button"
                className="dash-page-btn"
                onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
                disabled={paginaAtual === 1}
              >
                ← Anterior
              </button>
              <span className="dash-page-info">
                Página {paginaAtual} de {totalPaginas}
              </span>
              <button
                type="button"
                className="dash-page-btn"
                onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
                disabled={paginaAtual === totalPaginas}
              >
                Próxima →
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
