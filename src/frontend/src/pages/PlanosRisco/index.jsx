import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import './styles.css';

const PlanosRisco = () => {
  const navigate = useNavigate();
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);
  
  const [stats, setStats] = useState({
    total_planos: 0,
    riscos_altos: 0,
    em_revisao: 0,
    concluidos: 0
  });
  
  // Paginação
  const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Filtros
  const [search, setSearch] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterSetor, setFilterSetor] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterDataInicio, setFilterDataInicio] = useState('');
  const [filterDataFim, setFilterDataFim] = useState('');
  const [ordenacao, setOrdenacao] = useState('desc');

  const user = JSON.parse(localStorage.getItem('@SIGR:user') || '{}');
  const userSetoresIds = user.setores?.map(s => s.id) || [];

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

  async function carregarEstatisticas() {
    try {
      const response = await api.get('/riscos/planos/estatisticas/');
      setStats(response.data);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
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
      if (search) url += `&search=${search}`;

      const response = await api.get(url);
      setPlanos(response.data.results);
      setCount(response.data.count);
    } catch (err) {
      console.error('Erro ao carregar planos:', err);
      setError('Não foi possível carregar os planos de risco.');
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    carregarPlanos();
  };

  const totalPages = Math.ceil(count / pageSize);

  const canEdit = (plano) => {
    return userSetoresIds.includes(plano.setor);
  };

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
            <button className="export-button pdf" title="Exportar para PDF">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              PDF
            </button>
            <button className="export-button excel" title="Exportar para Excel">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
              Excel
            </button>
            <button className="new-plan-button" onClick={() => navigate('/novo-plano')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Novo Plano
            </button>
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M12 11h4"></path><path d="M12 16h4"></path><path d="M8 11h.01"></path><path d="M8 16h.01"></path></svg>
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
                placeholder="Buscar por evento, causa ou consequência..." 
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
                <div className="filter-group">
                  <label>Ordenação:</label>
                  <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)}>
                    <option value="desc">Mais recentes</option>
                    <option value="asc">Mais antigos</option>
                  </select>
                </div>
              </div>

              <div className="filters-row">
                <div className="filter-group">
                  <label>A partir de:</label>
                  <input 
                    type="date" 
                    value={filterDataInicio} 
                    onChange={(e) => setFilterDataInicio(e.target.value)} 
                  />
                </div>
                <div className="filter-group">
                  <label>Até:</label>
                  <input 
                    type="date" 
                    value={filterDataFim} 
                    onChange={(e) => setFilterDataFim(e.target.value)} 
                  />
                </div>
                <button className="btn-clear-filters" onClick={() => {
                  setFilterSetor('');
                  setFilterCategoria('');
                  setFilterDataInicio('');
                  setFilterDataFim('');
                  setOrdenacao('desc');
                  setSearch('');
                }}>Limpar Todos os Filtros</button>
              </div>
            </div>
          )}
        </section>

        <section className="plans-list-container">
          {loading ? (
            <div className="loading-state">Carregando planos de risco...</div>
          ) : planos.length > 0 ? (
            <>
              <table className="plans-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>EVENTO DE RISCO</th>
                    <th>DEPARTAMENTO</th>
                    <th>CATEGORIA</th>
                    <th>NÍVEL (RESIDUAL)</th>
                    <th>AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {planos.map((plano, index) => (
                    <tr key={plano.id}>
                      <td>#{plano.id}</td>
                      <td className="col-evento" title={plano.evento}>{plano.evento}</td>
                      <td>{plano.setor_detalhes?.sigla}</td>
                      <td>{plano.categoria}</td>
                      <td>
                        <span className={`risk-badge ${getRiskColorClass(plano.nivel_residual)}`}>
                          {plano.nivel_residual}
                        </span>
                      </td>
                      <td className="col-acoes">
                        <button className="btn-action view" title="Visualizar">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button>
                        {canEdit(plano) && (
                          <div className="edit-dropdown-container" ref={openDropdownId === plano.id ? dropdownRef : null}>
                            <button 
                              className={`btn-action edit ${openDropdownId === plano.id ? 'active' : ''}`} 
                              title="Editar"
                              onClick={() => setOpenDropdownId(openDropdownId === plano.id ? null : plano.id)}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button>
                            <div className={`edit-dropdown-content ${openDropdownId === plano.id ? 'show' : ''} ${index >= planos.length - 2 ? 'up' : ''}`}>
                              <div className="dropdown-title">Editar Seção:</div>
                              <button onClick={() => navigate(`/editar-plano/${plano.id}?step=1`)}>1. Identificação</button>
                              <button onClick={() => navigate(`/editar-plano/${plano.id}?step=2`)}>2. Avaliação</button>
                              <button onClick={() => navigate(`/editar-plano/${plano.id}?step=3`)}>3. Tratamento</button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

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
