import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import './styles.css';

const MapaRisco = () => {
  const navigate = useNavigate();
  const [riscos, setRiscos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSetor, setFilterSetor] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  
  const user = JSON.parse(localStorage.getItem('@SIGR:user') || '{}');

  useEffect(() => {
    carregarRiscos();
  }, [filterSetor, filterCategoria]);

  async function carregarRiscos() {
    setLoading(true);
    try {
      let url = '/riscos/planos/?limit=1000'; // Pega todos para o mapa
      if (filterSetor) url += `&setor=${filterSetor}`;
      if (filterCategoria) url += `&categoria=${filterCategoria}`;

      const response = await api.get(url);
      setRiscos(response.data.results || response.data);
    } catch (err) {
      console.error('Erro ao carregar riscos para o mapa:', err);
    } finally {
      setLoading(false);
    }
  }

  const getStatsByCategory = () => {
    const categories = ['Operacional', 'Estratégico', 'Integridade', 'Imagem', 'Financeiro'];
    return categories.map(cat => ({
      name: cat,
      count: riscos.filter(r => r.categoria === cat).length
    }));
  };

  const getRiskLevelInfo = (score) => {
    if (score >= 20) return { label: 'RE', class: 'cell-extremo' };
    if (score >= 12) return { label: 'RA', class: 'cell-alto' };
    if (score >= 4) return { label: 'RM', class: 'cell-moderado' };
    return { label: 'RB', class: 'cell-baixo' };
  };

  const renderCell = (prob, imp) => {
    const count = riscos.filter(r => r.prob_residual === prob && r.imp_residual === imp).length;
    const score = prob * imp;
    const { label, class: className } = getRiskLevelInfo(score);

    return (
      <div className={`map-cell ${className}`}>
        {count > 0 && <span className="cell-content">{count} {label}</span>}
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-title">
            <div className="title-line"></div>
            <h1>Mapa de Riscos</h1>
          </div>
          <div className="header-actions">
            <button className="new-plan-button" onClick={() => navigate('/novo-plano')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Novo Plano
            </button>
          </div>
        </header>

        <div className="mapa-dashboard-grid">
          <div className="mapa-column-main">
            <section className="plans-filters mapa-filters">
              <div className="filters-row">
                <div className="filter-group">
                  <label>Setor/Departamento:</label>
                  <select value={filterSetor} onChange={(e) => setFilterSetor(e.target.value)}>
                    <option value="">Todos os Setores</option>
                    {user.setores?.map(s => (
                      <option key={s.id} value={s.id}>{s.sigla} - {s.nome}</option>
                    ))}
                  </select>
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
              </div>
            </section>

            <div className="map-wrapper">
              <h2 className="map-title">MATRIZ DE RISCO RESIDUAL</h2>
              
              <div className="map-container">
                {/* Eixo Y: Impacto */}
                <div className="axis-y">
                  <div className="axis-label-vertical">I M P A C T O</div>
                  <div className="axis-values-y">
                    <span>5 - Catastrófico</span>
                    <span>4 - Grande</span>
                    <span>3 - Moderado</span>
                    <span>2 - Pequeno</span>
                    <span>1 - Insignificante</span>
                  </div>
                </div>

                {/* Matrix */}
                <div className="matrix-grid">
                  {[5, 4, 3, 2, 1].map(imp => (
                    <div key={imp} className="matrix-row">
                      {[1, 2, 3, 4, 5].map(prob => (
                        <React.Fragment key={`${imp}-${prob}`}>
                          {renderCell(prob, imp)}
                        </React.Fragment>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Espaçador para o canto inferior esquerdo */}
                <div className="axis-spacer"></div>

                {/* Eixo X: Probabilidade */}
                <div className="axis-x">
                  <div className="axis-values-x">
                    <span>1 - Raro</span>
                    <span>2 - Improvável</span>
                    <span>3 - Possível</span>
                    <span>4 - Provável</span>
                    <span>5 - Quase Certo</span>
                  </div>
                  <div className="axis-label-horizontal">P R O B A B I L I D A D E</div>
                </div>
              </div>

              <div className="map-legend">
                <div className="legend-title">NÍVEL DE RISCO</div>
                <div className="legend-grid">
                  <div className="legend-item">
                    <div className="legend-color cell-extremo"></div>
                    <div className="legend-info">
                      <span className="legend-label">Extremo (RE)</span>
                      <span className="legend-rule">20 ≤ Risco ≤ 25</span>
                    </div>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color cell-alto"></div>
                    <div className="legend-info">
                      <span className="legend-label">Alto (RA)</span>
                      <span className="legend-rule">12 ≤ Risco &lt; 20</span>
                    </div>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color cell-moderado"></div>
                    <div className="legend-info">
                      <span className="legend-label">Moderado (RM)</span>
                      <span className="legend-rule">4 ≤ Risco &lt; 12</span>
                    </div>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color cell-baixo"></div>
                    <div className="legend-info">
                      <span className="legend-label">Baixo (RB)</span>
                      <span className="legend-rule">Risco &lt; 4</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mapa-column-side">
            <div className="dashboard-card distribution-card">
              <h3>Distribuição por Categoria</h3>
              
              <div className="chart-container">
                <div className="donut-chart-placeholder">
                  <div className="donut-center">
                    <span className="donut-total">{riscos.length}</span>
                    <span className="donut-label">TOTAL</span>
                  </div>
                </div>
              </div>

              <div className="distribution-legend">
                {getStatsByCategory().map((stat, idx) => (
                  <div key={stat.name} className="dist-item">
                    <div className="dist-info">
                      <span className={`dist-dot color-${idx}`}></span>
                      <span className="dist-name">{stat.name}</span>
                    </div>
                    <span className="dist-value">{stat.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-card info-summary-card">
              <h3>Resumo do Mapa</h3>
              <div className="summary-list">
                <div className="summary-item">
                  <span>Riscos Críticos (RE)</span>
                  <span className="summary-badge count-re">{riscos.filter(r => (r.prob_residual * r.imp_residual) >= 20).length}</span>
                </div>
                <div className="summary-item">
                  <span>Riscos em Atenção (RA)</span>
                  <span className="summary-badge count-ra">{riscos.filter(r => {
                    const s = r.prob_residual * r.imp_residual;
                    return s >= 12 && s < 20;
                  }).length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MapaRisco;
