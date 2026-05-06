import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import ThemeToggle from '../../components/ThemeToggle';
import api from '../../services/api';
import { getSetorLabel } from '../../utils/unidades';
import './styles.css';

const CATEGORY_ORDER = ['Operacional', 'Estratégico', 'Integridade', 'Imagem', 'Financeiro'];

const MapaRisco = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState({
    total_riscos: 0,
    distribuicao_categorias: [],
    unidades_maior_pontuacao: [],
    taxa_mitigacao: 0,
    riscos_melhorados: 0,
    riscos_sem_acao: 0,
    riscos_monitorados: 0,
    cobertura_monitoramento: 0,
    objetivos_cobertos: 0,
    desafios_cobertos: 0,
    acoes_atrasadas: 0,
    resumo_niveis: {
      extremo: 0,
      alto: 0,
      moderado: 0,
      baixo: 0,
    },
    matriz_residual: [],
    riscos_prioritarios: [],
    status_tratamentos: {
      em_andamento: 0,
      concluidas: 0,
      atrasadas: 0,
      nao_iniciadas: 0,
    },
  });
  const [filterSetor, setFilterSetor] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');

  const user = JSON.parse(localStorage.getItem('@SIGR:user') || '{}');

  useEffect(() => {
    carregarAnalytics();
  }, [filterSetor, filterCategoria]);

  async function carregarAnalytics() {
    try {
      const params = new URLSearchParams();
      if (filterSetor) params.append('setor', filterSetor);
      if (filterCategoria) params.append('categoria', filterCategoria);

      const response = await api.get(`/riscos/planos/mapa-analytics/?${params.toString()}`);
      setAnalytics({
        total_riscos: response.data.total_riscos || 0,
        distribuicao_categorias: response.data.distribuicao_categorias || [],
        unidades_maior_pontuacao: response.data.unidades_maior_pontuacao || [],
        taxa_mitigacao: response.data.taxa_mitigacao || 0,
        riscos_melhorados: response.data.riscos_melhorados || 0,
        riscos_sem_acao: response.data.riscos_sem_acao || 0,
        riscos_monitorados: response.data.riscos_monitorados || 0,
        cobertura_monitoramento: response.data.cobertura_monitoramento || 0,
        objetivos_cobertos: response.data.objetivos_cobertos || 0,
        desafios_cobertos: response.data.desafios_cobertos || 0,
        acoes_atrasadas: response.data.acoes_atrasadas || 0,
        resumo_niveis: response.data.resumo_niveis || {
          extremo: 0,
          alto: 0,
          moderado: 0,
          baixo: 0,
        },
        matriz_residual: response.data.matriz_residual || [],
        riscos_prioritarios: response.data.riscos_prioritarios || [],
        status_tratamentos: response.data.status_tratamentos || {
          em_andamento: 0,
          concluidas: 0,
          atrasadas: 0,
          nao_iniciadas: 0,
        },
      });
    } catch (err) {
      console.error('Erro ao carregar riscos para o mapa:', err);
    }
  }

  const categoryStats = useMemo(() => {
    const known = new Map(
      analytics.distribuicao_categorias.map((item) => [item.nome, item.quantidade]),
    );
    return CATEGORY_ORDER.map((categoria) => ({
      name: categoria,
      count: known.get(categoria) || 0,
    }));
  }, [analytics.distribuicao_categorias]);

  const matrixCountMap = useMemo(() => {
    const map = new Map();
    analytics.matriz_residual.forEach((item) => {
      map.set(`${item.probabilidade}-${item.impacto}`, item.quantidade);
    });
    return map;
  }, [analytics.matriz_residual]);

  const getRankingLabel = (index) => `${index + 1}º`;

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
    const count = matrixCountMap.get(`${prob}-${imp}`) || 0;
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
            <ThemeToggle compact />
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
                    {user.setores?.map((setor) => (
                      <option key={setor.id} value={setor.id}>{getSetorLabel(setor)}</option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label>Categoria:</label>
                  <select value={filterCategoria} onChange={(e) => setFilterCategoria(e.target.value)}>
                    <option value="">Todas as Categorias</option>
                    {CATEGORY_ORDER.map((categoria) => (
                      <option key={categoria} value={categoria}>{categoria}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <div className="map-wrapper">
              <div className="map-header">
                <h2 className="map-title">Matriz de Probabilidade x Impacto</h2>
                <div className="map-active-indicator">
                  <span className="map-active-dot"></span>
                  <span>{analytics.total_riscos} riscos ativos</span>
                </div>
              </div>

              <div className="map-container">
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

                <div className="matrix-grid">
                  {[5, 4, 3, 2, 1].map((imp) => (
                    <div key={imp} className="matrix-row">
                      {[1, 2, 3, 4, 5].map((prob) => (
                        <React.Fragment key={`${imp}-${prob}`}>
                          {renderCell(prob, imp)}
                        </React.Fragment>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="axis-spacer"></div>

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
                      <span className="legend-rule">20 ≤ risco ≤ 25</span>
                    </div>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color cell-alto"></div>
                    <div className="legend-info">
                      <span className="legend-label">Alto (RA)</span>
                      <span className="legend-rule">12 ≤ risco &lt; 20</span>
                    </div>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color cell-moderado"></div>
                    <div className="legend-info">
                      <span className="legend-label">Moderado (RM)</span>
                      <span className="legend-rule">4 ≤ risco &lt; 12</span>
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
                    <span className="donut-total">{analytics.total_riscos}</span>
                    <span className="donut-label">TOTAL</span>
                  </div>
                </div>
              </div>

              <div className="distribution-legend">
                {categoryStats.map((stat, idx) => (
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
                {analytics.unidades_maior_pontuacao.length > 0 ? (
                  analytics.unidades_maior_pontuacao.map((setor, index) => (
                    <div key={setor.id} className="ranking-item">
                      <div className="ranking-position">{getRankingLabel(index)}</div>
                      <div className="ranking-info">
                        <span className="ranking-name">{setor.nome}</span>
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
              <div className="strategic-metric-label">Taxa de mitigação</div>
              <div className="strategic-metric-row">
                <span className="strategic-metric-value">{analytics.taxa_mitigacao.toFixed(1)}%</span>
                <span className="strategic-metric-trend">↗ +{analytics.riscos_melhorados}</span>
              </div>

              <div className="strategic-stats">
                <div className="strategic-stat-box">
                  <span className="strategic-stat-label">Riscos críticos</span>
                  <span className="strategic-stat-value">
                    {analytics.resumo_niveis.extremo + analytics.resumo_niveis.alto}
                  </span>
                </div>
                <div className="strategic-stat-box">
                  <span className="strategic-stat-label">Em revisão</span>
                  <span className="strategic-stat-value">
                    {analytics.status_tratamentos.em_andamento}
                  </span>
                </div>
              </div>
            </div>

            <div className="dashboard-card info-summary-card">
              <h3>Resumo do Mapa</h3>
              <div className="summary-list">
                <div className="summary-item">
                  <span>Riscos extremos</span>
                  <span className="summary-badge count-re">{analytics.resumo_niveis.extremo}</span>
                </div>
                <div className="summary-item">
                  <span>Riscos altos</span>
                  <span className="summary-badge count-ra">{analytics.resumo_niveis.alto}</span>
                </div>
                <div className="summary-item">
                  <span>Riscos sem ação</span>
                  <span className="summary-badge count-ra">{analytics.riscos_sem_acao}</span>
                </div>
                <div className="summary-item">
                  <span>Monitorados</span>
                  <span className="summary-badge count-ra">{analytics.riscos_monitorados}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="priority-footer-card">
          <div className="priority-footer-header">
            <h3>Riscos de Maior Prioridade</h3>
            <button className="priority-footer-link" onClick={() => navigate('/planos')}>
              Ver inventário completo →
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
              {analytics.riscos_prioritarios.length > 0 ? (
                analytics.riscos_prioritarios.map((risco) => {
                  const suggestedAction = risco.tipo_resposta || 'Plano de Mitigação';
                  const owner =
                    risco.responsavel ||
                    risco.setor_detalhes?.sigla_centro ||
                    risco.setor_detalhes?.sigla ||
                    'Não definido';

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
                      <div className="priority-cell priority-owner">{owner}</div>
                      <div className="priority-cell">
                        <span className="priority-action-tag">{suggestedAction}</span>
                      </div>

                      <div className="priority-mobile-card">
                        <div className="priority-mobile-top">
                          <span className="priority-id">{formatRiskIdentifier(risco.id)}</span>
                          <span className={`priority-badge ${getRiskPriorityClass(Number(risco.nivel_residual))}`}>
                            {getRiskPriorityLabel(Number(risco.nivel_residual))}
                          </span>
                        </div>
                        <div className="priority-mobile-body">
                          <strong>{risco.evento}</strong>
                          <span className="priority-mobile-unit">
                            {getSetorLabel(risco.setor_detalhes) || 'Unidade não informada'}
                          </span>
                        </div>
                        <div className="priority-mobile-meta">
                          <div className="priority-mobile-meta-item">
                            <span>Responsável</span>
                            <strong>{owner}</strong>
                          </div>
                          <div className="priority-mobile-meta-item">
                            <span>Ação sugerida</span>
                            <strong>{suggestedAction}</strong>
                          </div>
                        </div>
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
