import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import ThemeToggle from '../../components/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { useFeedback } from '../../context/FeedbackContext';
import api from '../../services/api';
import { downloadBlob } from '../../utils/downloadFile';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';
import { getSetorLabel } from '../../utils/unidades';
import './styles.css';

const VisualizarPlano = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [plano, setPlano] = useState(null);
  const [planoAcao, setPlanoAcao] = useState(null);
  const [monitoramentos, setMonitoramentos] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState('');
  const [showMonitoramentoForm, setShowMonitoramentoForm] = useState(false);
  const [savingMonitoramento, setSavingMonitoramento] = useState(false);
  const [monitoramentoForm, setMonitoramentoForm] = useState({
    resultados: '',
    acoes_futuras: '',
    analise_critica: '',
  });
  const { showFeedback } = useFeedback();

  const { user } = useAuth();
  const safeUser = user || {};
  const userSetoresIds = safeUser.setores?.map(s => s.id) || [];

  useEffect(() => {
    async function loadData() {
      try {
        const [planoRes, acoesRes, monitoramentosRes, historicoRes] = await Promise.all([
          api.get(`/riscos/planos/${uuid}/`),
          api.get(`/riscos/acoes/?risco=${uuid}`),
          api.get(`/riscos/monitoramentos/?risco=${uuid}`),
          api.get(`/riscos/planos/${uuid}/historico/`),
        ]);

        setPlano(planoRes.data);
        const acoes = acoesRes.data.results || acoesRes.data;
        if (acoes.length > 0) setPlanoAcao(acoes[0]);
        setMonitoramentos(monitoramentosRes.data.results || monitoramentosRes.data);
        setHistorico(historicoRes.data);
      } catch (err) {
        console.error('Erro ao carregar plano:', err);
        setError('Não foi possível carregar as informações do plano de risco.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [uuid]);

  const canEdit = plano && userSetoresIds.includes(plano.setor);

  const getRiskColorClass = (nivel) => {
    if (nivel >= 20) return 'risk-extremo';
    if (nivel >= 12) return 'risk-alto';
    if (nivel >= 4) return 'risk-moderado';
    return 'risk-baixo';
  };

  const getRiskLabel = (nivel) => {
    if (nivel >= 20) return 'EXTREMO';
    if (nivel >= 12) return 'ALTO';
    if (nivel >= 4) return 'MODERADO';
    return 'BAIXO';
  };

  const getStatusClass = (s) => {
    const n = (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, '-');
    if (n === 'concluida') return 'concluida';
    if (n === 'em-andamento') return 'em-andamento';
    if (n === 'nao-iniciada') return 'nao-iniciada';
    if (n === 'atrasada') return 'atrasada';
    return 'status-default';
  };

  async function baixarArquivo(tipo) {
    setExporting(tipo);
    try {
      const extension = tipo === 'pdf' ? 'pdf' : 'xlsx';
      const response = await api.get(`/riscos/planos/${uuid}/exportar-${tipo}/`, { responseType: 'blob' });
      downloadBlob(response.data, `plano-risco-${uuid}.${extension}`);
      showFeedback({ type: 'success', title: 'Arquivo gerado', message: `O arquivo em ${tipo.toUpperCase()} foi preparado.` });
    } catch (err) {
      console.error(`Erro ao exportar ${tipo}:`, err);
      showFeedback({ type: 'error', title: 'Download nao concluido', message: getApiErrorMessage(err, 'exportacao') });
    } finally {
      setExporting('');
    }
  }

  async function salvarMonitoramento(e) {
    e.preventDefault();
    setSavingMonitoramento(true);
    try {
      const res = await api.post('/riscos/monitoramentos/', {
        ...monitoramentoForm,
        risco: plano.uuid,
      });
      setMonitoramentos(prev => [res.data, ...prev]);
      setMonitoramentoForm({ resultados: '', acoes_futuras: '', analise_critica: '' });
      setShowMonitoramentoForm(false);
      showFeedback({ type: 'success', title: 'Monitoramento registrado', message: 'O acompanhamento foi salvo com sucesso.' });
    } catch (err) {
      showFeedback({ type: 'error', title: 'Erro ao salvar', message: getApiErrorMessage(err, 'monitoramento') });
    } finally {
      setSavingMonitoramento(false);
    }
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-main">
          <div className="loading-state">Carregando detalhes do plano...</div>
        </main>
      </div>
    );
  }

  if (error || !plano) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-main">
          <div className="error-container">
            <h2>Ops!</h2>
            <p>{error || 'Plano não encontrado.'}</p>
            <button className="btn-primary" onClick={() => navigate('/planos')}>Voltar para Listagem</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="dashboard-main">
        <header className="dashboard-header view-header">
          <div className="header-title">
            <div className="title-line"></div>
            <h1>Plano de Risco</h1>
            <span className="setor-tag">{getSetorLabel(plano.setor_detalhes)}</span>
          </div>

          <div className="header-actions">
            <ThemeToggle compact />
            <button className="btn-export-file pdf" onClick={() => baixarArquivo('pdf')} disabled={exporting === 'pdf'}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
              {exporting === 'pdf' ? 'Gerando...' : 'PDF'}
            </button>
            <button className="btn-export-file excel" onClick={() => baixarArquivo('excel')} disabled={exporting === 'excel'}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
              {exporting === 'excel' ? 'Gerando...' : 'Excel'}
            </button>
            <button className="btn-back-outline" onClick={() => navigate('/planos')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              Voltar
            </button>
            {canEdit && (
              <button className="btn-edit-main" onClick={() => navigate(`/editar-plano/${uuid}`)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                Editar Plano
              </button>
            )}
          </div>
        </header>

        <div className="view-content">
          {/* Seção 1: Identificação */}
          <section className="view-section">
            <div className="section-header">
              <span className="section-number">01</span>
              <h3>Identificação e Análise</h3>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <label>CATEGORIA</label>
                <span>{plano.categoria}</span>
              </div>
              <div className="info-item full">
                <label>DESAFIO ESTRATÉGICO</label>
                <span>{`Desafio ${plano.objetivo_detalhes?.desafio_detalhes?.numero} - ${plano.objetivo_detalhes?.desafio_detalhes?.descricao}`}</span>
              </div>
              <div className="info-item full">
                <label>OBJETIVO ESTRATÉGICO (PDI)</label>
                <span>{plano.objetivo_detalhes?.codigo} - {plano.objetivo_detalhes?.descricao}</span>
              </div>
              <div className="info-item full">
                <label>MACROPROCESSO</label>
                <span>{plano.macroprocesso_detalhes?.nome}</span>
              </div>
              <div className="info-item full">
                <label>EVENTO DE RISCO</label>
                <div className="text-box">{plano.evento}</div>
              </div>
              <div className="info-item half">
                <label>CAUSA</label>
                <div className="text-box">{plano.causa}</div>
              </div>
              <div className="info-item half">
                <label>CONSEQUÊNCIA</label>
                <div className="text-box">{plano.consequencia}</div>
              </div>
            </div>
          </section>

          {/* Seção 2: Avaliação */}
          <section className="view-section">
            <div className="section-header">
              <span className="section-number">02</span>
              <h3>Avaliação e Controles</h3>
            </div>
            <div className="evaluation-summary">
              <div className="risk-score-card">
                <div className="score-header">RISCO INERENTE</div>
                <div className={`score-badge ${getRiskColorClass(plano.nivel_risco)}`}>
                  <span className="score-num">{plano.nivel_risco}</span>
                  <span className="score-label">{getRiskLabel(plano.nivel_risco)}</span>
                </div>
                <div className="score-details">Probabilidade: {plano.probabilidade} | Impacto: {plano.impacto}</div>
              </div>
              <div className="eficacia-display">
                <label>EFICÁCIA DOS CONTROLES</label>
                <div className="eficacia-tag">{plano.eficacia_controle}</div>
                <p className="controles-texto">{plano.controles_atuais}</p>
              </div>
              <div className="risk-score-card">
                <div className="score-header">RISCO RESIDUAL</div>
                <div className={`score-badge ${getRiskColorClass(plano.nivel_residual)}`}>
                  <span className="score-num">{plano.nivel_residual}</span>
                  <span className="score-label">{getRiskLabel(plano.nivel_residual)}</span>
                </div>
                <div className="score-details">Probabilidade: {plano.prob_residual} | Impacto: {plano.imp_residual}</div>
              </div>
            </div>
          </section>

          {/* Seção 3: Tratamento */}
          <section className="view-section">
            <div className="section-header">
              <span className="section-number">03</span>
              <h3>Plano de Ação (Tratamento)</h3>
            </div>
            {planoAcao ? (
              <div className="plano-acao-details">
                <div className="info-grid">
                  <div className="info-item">
                    <label>TIPO DE RESPOSTA</label>
                    <span className="tag-resposta">{planoAcao.tipo_resposta}</span>
                  </div>
                  <div className="info-item">
                    <label>STATUS</label>
                    <span className={`tag-status ${getStatusClass(planoAcao.status)}`}>{planoAcao.status}</span>
                  </div>
                  <div className="info-item">
                    <label>RESPONSÁVEL</label>
                    <span>{planoAcao.responsavel}</span>
                  </div>
                  <div className="info-item">
                    <label>PROGRESSO</label>
                    <div className="progresso-wrapper">
                      <div className="progresso-bar">
                        <div className="progresso-fill" style={{ width: `${planoAcao.progresso ?? 0}%` }} />
                      </div>
                      <span className="progresso-texto">{planoAcao.progresso ?? 0}%</span>
                    </div>
                  </div>
                  <div className="info-item full">
                    <label>DESCRIÇÃO DA AÇÃO</label>
                    <div className="text-box highlight">{planoAcao.descricao_acao}</div>
                  </div>
                  <div className="info-item half">
                    <label>PARCEIROS/APOIO</label>
                    <span>{planoAcao.parceiros || 'Não informado'}</span>
                  </div>
                  <div className="info-item half">
                    <label>PERÍODO</label>
                    <span>{new Date(planoAcao.data_inicio).toLocaleDateString()} até {new Date(planoAcao.data_fim).toLocaleDateString()}</span>
                  </div>
                  {planoAcao.observacoes && (
                    <div className="info-item full">
                      <label>OBSERVAÇÕES</label>
                      <p className="obs-text">{planoAcao.observacoes}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="empty-action-plan">
                <p>Nenhum plano de ação registrado para este risco.</p>
                {canEdit && (
                  <button className="btn-add-action" onClick={() => navigate(`/editar-plano/${uuid}?step=3`)}>
                    Criar Plano de Ação
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Seção 4: Monitoramento */}
          <section className="view-section">
            <div className="section-header">
              <span className="section-number">04</span>
              <h3>Acompanhamento (Monitoramento)</h3>
              {canEdit && (
                <button
                  className="btn-add-monitoramento"
                  onClick={() => setShowMonitoramentoForm(v => !v)}
                >
                  {showMonitoramentoForm ? 'Cancelar' : '+ Registrar'}
                </button>
              )}
            </div>

            {showMonitoramentoForm && (
              <form className="monitoramento-form" onSubmit={salvarMonitoramento}>
                <div className="monitor-field">
                  <label>Resultados observados</label>
                  <textarea
                    required
                    rows={3}
                    value={monitoramentoForm.resultados}
                    onChange={e => setMonitoramentoForm(p => ({ ...p, resultados: e.target.value }))}
                    placeholder="Descreva os resultados verificados até agora..."
                  />
                </div>
                <div className="monitor-field">
                  <label>Ações futuras</label>
                  <textarea
                    required
                    rows={3}
                    value={monitoramentoForm.acoes_futuras}
                    onChange={e => setMonitoramentoForm(p => ({ ...p, acoes_futuras: e.target.value }))}
                    placeholder="O que ainda precisa ser feito..."
                  />
                </div>
                <div className="monitor-field">
                  <label>Análise crítica</label>
                  <textarea
                    required
                    rows={3}
                    value={monitoramentoForm.analise_critica}
                    onChange={e => setMonitoramentoForm(p => ({ ...p, analise_critica: e.target.value }))}
                    placeholder="Avaliação do andamento do tratamento..."
                  />
                </div>
                <button type="submit" className="btn-edit-main" disabled={savingMonitoramento}>
                  {savingMonitoramento ? 'Salvando...' : 'Salvar monitoramento'}
                </button>
              </form>
            )}

            {monitoramentos.length === 0 && !showMonitoramentoForm ? (
              <div className="empty-action-plan">
                <p>Nenhum monitoramento registrado para este risco.</p>
              </div>
            ) : (
              <div className="monitoramento-lista">
                {monitoramentos.map((m) => (
                  <div key={m.id} className="monitoramento-item">
                    <div className="monitor-data">{new Date(m.data_verificacao).toLocaleDateString('pt-BR')}</div>
                    <div className="monitor-campos">
                      <div className="monitor-campo">
                        <strong>Resultados</strong>
                        <p>{m.resultados}</p>
                      </div>
                      <div className="monitor-campo">
                        <strong>Ações futuras</strong>
                        <p>{m.acoes_futuras}</p>
                      </div>
                      <div className="monitor-campo">
                        <strong>Análise crítica</strong>
                        <p>{m.analise_critica}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Seção 5: Histórico */}
          {historico.length > 0 && (
            <section className="view-section">
              <div className="section-header">
                <span className="section-number">05</span>
                <h3>Histórico de Alterações</h3>
              </div>
              <div className="historico-lista">
                {historico.map((h) => (
                  <div key={h.id} className="historico-item">
                    <div className="historico-dot" />
                    <div className="historico-info">
                      <span className="historico-descricao">{h.descricao}</span>
                      <span className="historico-meta">
                        {h.usuario_nome} · {new Date(h.data_hora).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default VisualizarPlano;
