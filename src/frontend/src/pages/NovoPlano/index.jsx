import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import './styles.css';

const NovoPlano = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('@SIGR:user') || '{}');
  const [etapa, setEtapa] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Dados auxiliares
  const [objetivos, setObjetivos] = useState([]);
  const [macroprocessos, setMacroprocessos] = useState([]);
  
  // Step 1 & 2: Risco
  const [riscoData, setRiscoData] = useState({
    setor: user.setores?.[0]?.id || '',
    objetivo: '',
    macroprocesso: '',
    categoria: 'Operacional',
    evento: '',
    causa: '',
    consequencia: '',
    controles_atuais: '',
    eficacia_controle: 'Médio',
    probabilidade: 3,
    impacto: 3,
    prob_residual: 1,
    imp_residual: 1
  });

  // Step 3: Plano de Ação
  const [planoAcaoData, setPlanoAcaoData] = useState({
    tipo_resposta: 'Mitigar',
    descricao_acao: '',
    responsavel: user.nome || '',
    parceiros: '',
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: '',
    status: 'Não iniciada',
    observacoes: ''
  });

  const [riscoCriadoId, setRiscoCriadoId] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [objRes, macroRes] = await Promise.all([
          api.get('/riscos/objetivos/'),
          api.get('/riscos/macroprocessos/')
        ]);
        setObjetivos(objRes.data.results || objRes.data);
        setMacroprocessos(macroRes.data.results || macroRes.data);
      } catch (err) {
        console.error('Erro ao carregar dados auxiliares:', err);
      }
    }
    loadData();
  }, []);

  const handleRiscoChange = (e) => {
    const { name, value } = e.target;
    setRiscoData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlanoAcaoChange = (e) => {
    const { name, value } = e.target;
    setPlanoAcaoData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (etapa < 3) setEtapa(etapa + 1);
  };

  const handleBack = () => {
    if (etapa > 1) setEtapa(etapa - 1);
  };

  const handleSubmitRisco = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/riscos/planos/', riscoData);
      setRiscoCriadoId(response.data.id);
      setEtapa(3);
    } catch (err) {
      setError(err.response?.data?.erro || 'Erro ao salvar identificação e análise.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFinal = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Salva o Plano de Ação vinculado ao risco recém criado
      await api.post('/riscos/acoes/', {
        ...planoAcaoData,
        risco: riscoCriadoId
      });
      alert('Plano de Risco completo salvo com sucesso!');
      navigate('/planos');
    } catch (err) {
      setError('Erro ao salvar o tratamento. O risco foi salvo, mas o plano de ação não.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-title">
            <div className="title-line"></div>
            <h1>Novo Plano de Risco</h1>
          </div>
        </header>

        <section className="stepper-container">
          <div className={`step-item ${etapa >= 1 ? 'active' : ''} ${etapa > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <span className="step-label">Identificação e Análise</span>
          </div>
          <div className="step-divider"></div>
          <div className={`step-item ${etapa >= 2 ? 'active' : ''} ${etapa > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <span className="step-label">Avaliação</span>
          </div>
          <div className="step-divider"></div>
          <div className={`step-item ${etapa >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span className="step-label">Tratamento</span>
          </div>
        </section>

        <div className="form-container">
          {error && <div className="error-message">{error}</div>}

          {etapa === 1 && (
            <div className="step-content">
              <div className="input-row">
                <div className="form-group">
                  <label>Setor/Departamento:</label>
                  <select name="setor" value={riscoData.setor} onChange={handleRiscoChange}>
                    {user.setores?.map(s => (
                      <option key={s.id} value={s.id}>{s.sigla} - {s.nome}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Categoria:</label>
                  <select name="categoria" value={riscoData.categoria} onChange={handleRiscoChange}>
                    <option value="Operacional">Operacional</option>
                    <option value="Estratégico">Estratégico</option>
                    <option value="Integridade">Integridade</option>
                    <option value="Imagem">Imagem</option>
                    <option value="Financeiro">Financeiro</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Objetivo Estratégico (PDI):</label>
                <select name="objetivo" value={riscoData.objetivo} onChange={handleRiscoChange}>
                  <option value="">Selecione um objetivo...</option>
                  {objetivos.map(obj => (
                    <option key={obj.id} value={obj.id}>{obj.codigo} - {obj.descricao}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Macroprocesso:</label>
                <select name="macroprocesso" value={riscoData.macroprocesso} onChange={handleRiscoChange}>
                  <option value="">Selecione um processo...</option>
                  {macroprocessos.map(m => (
                    <option key={m.id} value={m.id}>{m.nome}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Evento de Risco (O que pode acontecer?):</label>
                <textarea name="evento" value={riscoData.evento} onChange={handleRiscoChange} placeholder="Descreva o evento..."></textarea>
              </div>

              <div className="input-row">
                <div className="form-group">
                  <label>Causa:</label>
                  <textarea name="causa" value={riscoData.causa} onChange={handleRiscoChange} placeholder="Por que pode acontecer?"></textarea>
                </div>
                <div className="form-group">
                  <label>Consequência:</label>
                  <textarea name="consequencia" value={riscoData.consequencia} onChange={handleRiscoChange} placeholder="Impacto do evento..."></textarea>
                </div>
              </div>

              <div className="form-actions">
                <button className="btn-cancel" onClick={() => navigate('/planos')}>Cancelar</button>
                <button className="btn-primary" onClick={handleNext}>Próximo: Avaliação</button>
              </div>
            </div>
          )}

          {etapa === 2 && (
            <div className="step-content">
              <h3>Matriz de Risco</h3>
              <p className="step-desc">Identifique os controles e avalie a probabilidade e o impacto.</p>
              
              <div className="form-group">
                <label>Controles Atuais:</label>
                <textarea name="controles_atuais" value={riscoData.controles_atuais} onChange={handleRiscoChange}></textarea>
              </div>

              <div className="form-group">
                <label>Eficácia do Controle:</label>
                <select name="eficacia_controle" value={riscoData.eficacia_controle} onChange={handleRiscoChange}>
                  <option value="Forte">Forte</option>
                  <option value="Médio">Médio</option>
                  <option value="Fraco">Fraco</option>
                </select>
              </div>

              <div className="matrix-grid">
                <div className="matrix-section">
                  <h4>Risco Inerente</h4>
                  <div className="input-row">
                    <div className="form-group">
                      <label>Probabilidade (1-5):</label>
                      <input type="number" min="1" max="5" name="probabilidade" value={riscoData.probabilidade} onChange={handleRiscoChange} />
                    </div>
                    <div className="form-group">
                      <label>Impacto (1-5):</label>
                      <input type="number" min="1" max="5" name="impacto" value={riscoData.impacto} onChange={handleRiscoChange} />
                    </div>
                  </div>
                </div>

                <div className="matrix-section">
                  <h4>Risco Residual</h4>
                  <div className="input-row">
                    <div className="form-group">
                      <label>Probabilidade (1-5):</label>
                      <input type="number" min="1" max="5" name="prob_residual" value={riscoData.prob_residual} onChange={handleRiscoChange} />
                    </div>
                    <div className="form-group">
                      <label>Impacto (1-5):</label>
                      <input type="number" min="1" max="5" name="imp_residual" value={riscoData.imp_residual} onChange={handleRiscoChange} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button className="btn-back" onClick={handleBack}>Voltar</button>
                <button className="btn-primary" onClick={handleSubmitRisco} disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar e Ir para Tratamento'}
                </button>
              </div>
            </div>
          )}

          {etapa === 3 && (
            <div className="step-content">
              <h3>Plano de Ação</h3>
              <p className="step-desc">Defina as ações de mitigação para o risco identificado.</p>

              <form onSubmit={handleSubmitFinal}>
                <div className="input-row">
                  <div className="form-group">
                    <label>Tipo de Resposta:</label>
                    <select name="tipo_resposta" value={planoAcaoData.tipo_resposta} onChange={handlePlanoAcaoChange}>
                      <option value="Mitigar">Mitigar</option>
                      <option value="Evitar">Evitar</option>
                      <option value="Transferir">Transferir</option>
                      <option value="Aceitar">Aceitar</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Responsável:</label>
                    <input type="text" name="responsavel" value={planoAcaoData.responsavel} onChange={handlePlanoAcaoChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Descrição da Ação:</label>
                  <textarea name="descricao_acao" value={planoAcaoData.descricao_acao} onChange={handlePlanoAcaoChange}></textarea>
                </div>

                <div className="form-group">
                  <label>Parceiros/Apoio:</label>
                  <input type="text" name="parceiros" value={planoAcaoData.parceiros} onChange={handlePlanoAcaoChange} />
                </div>

                <div className="input-row">
                  <div className="form-group">
                    <label>Data Início:</label>
                    <input type="date" name="data_inicio" value={planoAcaoData.data_inicio} onChange={handlePlanoAcaoChange} />
                  </div>
                  <div className="form-group">
                    <label>Data Fim (Previsão):</label>
                    <input type="date" name="data_fim" value={planoAcaoData.data_fim} onChange={handlePlanoAcaoChange} />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-back" onClick={() => navigate('/planos')}>Pular Tratamento</button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Finalizando...' : 'Finalizar Plano de Risco'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default NovoPlano;
