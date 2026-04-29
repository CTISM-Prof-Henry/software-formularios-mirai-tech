import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { getSetorLabel } from '../../utils/unidades';
import './styles.css';

const MapaRisco = () => {
  const navigate = useNavigate();
  const [riscos, setRiscos] = useState([]);
  const [acoes, setAcoes] = useState([]);
  const [filterSetor, setFilterSetor] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  
  const user = JSON.parse(localStorage.getItem('@SIGR:user') || '{}');

  useEffect(() => {
    carregarRiscos();
  }, [filterSetor, filterCategoria]);

  async function carregarRiscos() {
    try {
      let url = '/riscos/planos/?limit=1000'; // Pega todos para o mapa
      if (filterSetor) url += `&setor=${filterSetor}`;
      if (filterCategoria) url += `&categoria=${filterCategoria}`;

      const [riscosResponse, acoesResponse] = await Promise.all([
        api.get(url),
        api.get('/riscos/acoes/?limit=1000'),
      ]);

      setRiscos(riscosResponse.data.results || riscosResponse.data);
      setAcoes(acoesResponse.data.results || acoesResponse.data);
    } catch (err) {
      console.error('Erro ao carregar riscos para o mapa:', err);
    }
  }

  const getStatsByCategory = () => {
    const categories = ['Operacional', 'Estratégico', 'Integridade', 'Imagem', 'Financeiro'];
    return categories.map(cat => ({
      name: cat,
      count: riscos.filter(r => r.categoria === cat).length
    }));
  };

  const getTopSetoresByScore = () => {
    const ranking = riscos.reduce((acc, risco) => {
      const setorId = risco.setor_detalhes?.id || risco.setor;
      const setorNome = getSetorLabel(risco.setor_detalhes) || 'Unidade não informada';

      if (!acc[setorId]) {
        acc[setorId] = {
          id: setorId,
          nome: setorNome,
          pontos: 0,
        };
      }

      acc[setorId].pontos += Number(risco.nivel_residual || 0);
      return acc;
    }, {});

    return Object.values(ranking)
      .sort((a, b) => b.pontos - a.pontos || a.nome.localeCompare(b.nome))
      .slice(0, 5);
  };

  const getRankingLabel = (index) => `${index + 1}º`;

  const getMitigationRate = () => {
    if (!riscos.length) return 0;
    const mitigados = riscos.filter(r => Number(r.nivel_residual) < Number(r.nivel_risco)).length;
    return ((mitigados / riscos.length) * 100).toFixed(1);
  };

  const getImprovedRiskCount = () =>
    riscos.filter(r => Number(r.nivel_residual) < Number(r.nivel_risco)).length;

  const getPlanoAcaoPorRisco = (riscoId) =>
    acoes.find(acao => String(acao.risco) === String(riscoId));

  const getTopPriorityRisks = () => {
    return [...riscos]
      .sort((a, b) => {
        const diffResidual = Number(b.nivel_residual) - Number(a.nivel_residual);
        if (diffResidual !== 0) return diffResidual;
        const diffInerente = Number(b.nivel_risco) - Number(a.nivel_risco);
        if (diffInerente !== 0) return diffInerente;
        return Number(a.id) - Number(b.id);
      })
      .slice(0, 5);
  };

  const getRiskPriorityLabel = (score) => {
    if (score >= 20) return 'EXTREMO';
    if (score >= 12) return 'ALTO';
    if (score >= 4) return 'MODERADO';
    return 'BAIXO';
  };

  const getRiskPriorityClass = (score) => {
    if (score >= 20) return 'priority-extremo';
    if (score >= 12) return 'priority-alto';
    if (score >= 4) return 'priority-moderado';
    return 'priority-baixo';
  };

  const formatRiskIdentifier = (id) => `R-${String(id).padStart(4, '0')}`;

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
                  <label>Unidade/Departamento:</label>
                  <select value={filterSetor} onChange={(e) => setFilterSetor(e.target.value)}>
                    <option value="">Todas as Unidades</option>
                    {user.setores?.map(s => (
                      <option key={s.id} value={s.id}>{getSetorLabel(s)}</option>
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
              <div className="map-header">
                <h2 className="map-title">Matriz de Probabilidade x Impacto</h2>
                <div className="map-active-indicator">
                  <span className="map-active-dot"></span>
                  <span>Riscos Ativos</span>
                </div>
              </div>
              
              <div className="map-container">
                {/* Eixo Y: Probabilidade */}
                <div className="axis-y">
                  <div className="axis-label-vertical">PROBABILIDADE</div>
                  <div className="axis-values-y">
                    <span>5 - Muito Alta</span>
                    <span>4 - Alta</span>
                    <span>3 - Média</span>
                    <span>2 - Baixa</span>
                    <span>1 - Muito Baixa</span>
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

                {/* Eixo X: Impacto */}
                <div className="axis-x">
                  <div className="axis-values-x">
                    <span>1 - Insignificante</span>
                    <span>2 - Pequeno</span>
                    <span>3 - Moderado</span>
                    <span>4 - Grande</span>
                    <span>5 - Catastrófico</span>
                  </div>
                  <div className="axis-label-horizontal">IMPACTO</div>
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

            <div className="dashboard-card ranking-card">
              <h3>Unidades com Maior Pontuação</h3>
              <div className="ranking-list">
                {getTopSetoresByScore().length > 0 ? (
                  getTopSetoresByScore().map((setor, index) => (
                    <div key={setor.id} className="ranking-item">
                      <div className="ranking-position">{getRankingLabel(index)}</div>
                      <div className="ranking-info">
                        <span className="ranking-name">
                          {setor.nome}
                        </span>
                      </div>
                      <div className={`ranking-score ${index < 3 ? 'highlight' : ''}`}>
                        {setor.pontos} pontos
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="ranking-empty">Nenhum risco encontrado para calcular a pontuação.</div>
                )}
              </div>
            </div>

            <div className="dashboard-card strategic-card">
              <h3>Gestão Estratégica</h3>
              <div className="strategic-metric-label">Taxa de Mitigação</div>
              <div className="strategic-metric-row">
                <span className="strategic-metric-value">{getMitigationRate()}%</span>
                <span className="strategic-metric-trend">↗ +{getImprovedRiskCount()}</span>
              </div>

              <div className="strategic-stats">
                <div className="strategic-stat-box">
                  <span className="strategic-stat-label">Riscos críticos</span>
                  <span className="strategic-stat-value">
                    {riscos.filter(r => Number(r.nivel_residual) >= 20).length}
                  </span>
                </div>
                <div className="strategic-stat-box">
                  <span className="strategic-stat-label">Em revisão</span>
                  <span className="strategic-stat-value">
                    {acoes.filter(acao => acao.status === 'Em andamento').length}
                  </span>
                </div>
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

        <section className="priority-footer-card">
          <div className="priority-footer-header">
            <h3>Riscos de Maior Prioridade</h3>
            <button className="priority-footer-link" onClick={() => navigate('/planos')}>
              Ver Inventário Completo →
            </button>
          </div>

          <div className="priority-table">
            <div className="priority-table-head">
              <span>Identificador</span>
              <span>Descrição do Evento</span>
              <span>Nível</span>
              <span>Responsável</span>
              <span>Ação Sugerida</span>
            </div>

            <div className="priority-table-body">
              {getTopPriorityRisks().length > 0 ? (
                getTopPriorityRisks().map((risco) => {
                  const planoAcao = getPlanoAcaoPorRisco(risco.id);
                  return (
                    <div key={risco.id} className="priority-row">
                      <div className="priority-cell priority-id">
                        {formatRiskIdentifier(risco.id)}
                      </div>
                      <div className="priority-cell priority-event">
                        <strong>{risco.evento}</strong>
                        <span>
                          {getSetorLabel(risco.setor_detalhes) || 'Unidade não informada'}
                        </span>
                      </div>
                      <div className="priority-cell">
                        <span className={`priority-badge ${getRiskPriorityClass(Number(risco.nivel_residual))}`}>
                          {getRiskPriorityLabel(Number(risco.nivel_residual))}
                        </span>
                      </div>
                      <div className="priority-cell priority-owner">
                        {planoAcao?.responsavel || risco.setor_detalhes?.sigla_centro || risco.setor_detalhes?.sigla || 'Não definido'}
                      </div>
                      <div className="priority-cell">
                        <span className="priority-action-tag">
                          {planoAcao?.tipo_resposta || 'Plano de Mitigação'}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="priority-empty">Nenhum risco disponível para priorização.</div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MapaRisco;
