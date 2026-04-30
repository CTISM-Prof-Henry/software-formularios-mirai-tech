import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { getSetorLabel } from '../../utils/unidades';
import './styles.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('@SIGR:user') || '{}');

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

  useEffect(() => {
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
  }

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

  const setoresResumo = filterSetor ? stats.setores_filtrados : (user.setores?.length || 0);

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-title">
            <div className="title-line"></div>
            <h1>Visão Geral</h1>
          </div>
          <button className="new-plan-button" onClick={() => navigate('/novo-plano')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Novo Plano
          </button>
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
              <select value={filterSetor} onChange={(e) => setFilterSetor(e.target.value)}>
                <option value="">Todos</option>
                {user.setores?.map((setor) => (
                  <option key={setor.id} value={setor.id}>{getSetorLabel(setor)}</option>
                ))}
              </select>
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

        <h2 className="content-title">Planos cadastrados</h2>

        <section className="plans-container">
          <div className="plans-list">
            {loading ? (
              <div className="dashboard-empty-state">Carregando planos...</div>
            ) : planos.length > 0 ? (
              planos.map((plano) => (
                <button key={plano.id} className="plan-item" onClick={() => navigate(`/planos/${plano.id}`)}>
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
                        Unidade: {getSetorLabel(plano.setor_detalhes) || 'Não informado'} • ID: #{plano.id}
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
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
