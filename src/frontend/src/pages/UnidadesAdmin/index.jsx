import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import ThemeToggle from '../../components/ThemeToggle';
import api from '../../services/api';
import './styles.css';

const UnidadesAdmin = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('@SIGR:user') || '{}');
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busca, setBusca] = useState('');
  const [centroSelecionado, setCentroSelecionado] = useState('');
  const [tipoSelecionado, setTipoSelecionado] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalResultados, setTotalResultados] = useState(0);
  const [centrosDisponiveis, setCentrosDisponiveis] = useState([]);
  const [tiposDisponiveis, setTiposDisponiveis] = useState([]);
  const pageSize = 20;

  useEffect(() => {
    if (!user.is_superuser) {
      navigate('/dashboard', { replace: true });
      return;
    }
  }, [navigate, user.is_superuser]);

  useEffect(() => {
    if (!user.is_superuser) {
      return;
    }

    async function carregarUnidades() {
      setLoading(true);
      setError('');
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
        setError(err.response?.data?.erro || 'Nao foi possivel carregar as unidades da UFSM.');
      } finally {
        setLoading(false);
      }
    }

    carregarUnidades();
  }, [busca, centroSelecionado, navigate, paginaAtual, tipoSelecionado, user.is_superuser]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca, centroSelecionado, tipoSelecionado]);

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

          {error && <div className="feedback-banner error">{error}</div>}

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
                      <th>Exibicao completa</th>
                      <th>Centro</th>
                      <th>Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unidades.map((unidade) => (
                      <tr key={unidade.id}>
                        <td>{unidade.label_curto}</td>
                        <td>{unidade.label_completo}</td>
                        <td>{unidade.nome_centro || 'Nao informado'}</td>
                        <td>{unidade.tipo_unidade || 'Nao informado'}</td>
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
    </div>
  );
};

export default UnidadesAdmin;
