import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import './styles.css';

const Dashboard = () => {
  const [planos, setPlanos] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('@SIGR:user') || '{}');

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const response = await api.get('/riscos/planos/');
        // Agora a resposta é paginada, então os dados estão em .results
        setPlanos(response.data.results || []);
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const planosFiltrados = planos.filter(plano => 
    plano.evento.toLowerCase().includes(busca.toLowerCase()) ||
    plano.setor_detalhes?.sigla.toLowerCase().includes(busca.toLowerCase())
  );

  const getRiskColorClass = (nivel) => {
    if (nivel >= 15) return 'risk-alto';
    if (nivel >= 8) return 'risk-moderado';
    return 'risk-baixo';
  };

  const getRiskLabel = (nivel) => {
    if (nivel >= 15) return 'RISCO ALTO';
    if (nivel >= 8) return 'RISCO MODERADO';
    return 'RISCO BAIXO';
  };

  // KPIs
  const totalPlanos = planos.length;
  const riscosCriticos = planos.filter(p => p.nivel_residual >= 15).length;
  const tratamentosAtivos = 0; // Seria necessário buscar de /api/riscos/acoes/
  const meusSetores = user.setores?.length || 0;

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-title">
            <div className="title-line"></div>
            <h1>Visão Geral</h1>
          </div>
          <button className="new-plan-button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Novo Plano
          </button>
        </header>

        <section className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            </div>
            <span className="kpi-value">{totalPlanos}</span>
            <span className="kpi-label">Total de Planos</span>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            {riscosCriticos > 0 && <span className="attention-badge">ATENÇÃO</span>}
            <span className="kpi-value">{riscosCriticos}</span>
            <span className="kpi-label">Riscos Críticos (Residuais)</span>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            </div>
            <span className="kpi-value">{tratamentosAtivos}</span>
            <span className="kpi-label">Tratamentos Ativos</span>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"></path><path d="M3 7v1a3 3 0 0 0 6 0V7m0 0V5a3 3 0 0 0-6 0v2m6 0V7a3 3 0 0 1 6 0v0m0 0V7a3 3 0 0 1 6 0v1a3 3 0 0 1-6 0V7m0 0V5a3 3 0 0 1 6 0v2"></path></svg>
            </div>
            <span className="kpi-value">{meusSetores}</span>
            <span className="kpi-label">Meus Setores</span>
          </div>
        </section>

        <h2 className="content-title">Planos cadastrados</h2>

        <section className="plans-container">
          <div className="filter-bar">
            <div className="search-input-wrapper">
              <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                placeholder="Buscar por risco ou departamento..." 
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <button className="filter-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              Filtrar por dept/data
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>

          <div className="plans-list">
            {loading ? (
              <div style={{padding: '40px', textAlign: 'center', color: '#888'}}>Carregando planos...</div>
            ) : planosFiltrados.length > 0 ? (
              planosFiltrados.map(plano => (
                <div key={plano.id} className="plan-item">
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
                      <p className="plan-meta">Setor: {plano.setor_detalhes?.nome} • ID: #{plano.id}</p>
                    </div>
                  </div>
                  <div className={`risk-badge ${getRiskColorClass(plano.nivel_residual)}`}>
                    {getRiskLabel(plano.nivel_residual)}
                  </div>
                </div>
              ))
            ) : (
              <div style={{padding: '40px', textAlign: 'center', color: '#888'}}>Nenhum plano encontrado.</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
