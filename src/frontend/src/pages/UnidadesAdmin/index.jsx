import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import './styles.css';

const UnidadesAdmin = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('@SIGR:user') || '{}');
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    if (!user.is_superuser) {
      navigate('/dashboard', { replace: true });
      return;
    }

    async function carregarUnidades() {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/usuarios/setores/admin/');
        setUnidades(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err.response?.data?.erro || 'Nao foi possivel carregar as unidades da UFSM.');
      } finally {
        setLoading(false);
      }
    }

    carregarUnidades();
  }, [navigate, user.is_superuser]);

  const unidadesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return unidades;

    return unidades.filter((unidade) =>
      [
        unidade.label_completo,
        unidade.label_curto,
        unidade.nome,
        unidade.sigla_centro,
        unidade.nome_centro,
        unidade.tipo_unidade,
      ]
        .filter(Boolean)
        .some((valor) => valor.toLowerCase().includes(termo))
    );
  }, [busca, unidades]);

  const totalOficiais = unidades.filter((unidade) => unidade.fonte_oficial).length;

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-title">
            <div className="title-line"></div>
            <h1>Unidades UFSM</h1>
          </div>
        </header>

        <section className="unidades-summary-grid">
          <div className="unidades-summary-card">
            <span className="summary-kicker">BASE OFICIAL</span>
            <strong>{String(totalOficiais).padStart(4, '0')}</strong>
            <span>unidades ativas importadas</span>
          </div>
          <div className="unidades-summary-card">
            <span className="summary-kicker">VISUALIZACAO</span>
            <strong>{String(unidadesFiltradas.length).padStart(4, '0')}</strong>
            <span>resultados no filtro atual</span>
          </div>
        </section>

        <section className="unidades-panel">
          <div className="unidades-panel-header">
            <div>
              <h2>Estrutura institucional completa</h2>
              <p>Visao administrativa das unidades oficiais da UFSM com centro e tipo de unidade.</p>
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

          {error && <div className="unidades-error">{error}</div>}

          <div className="unidades-table-wrapper">
            {loading ? (
              <div className="unidades-empty">Carregando unidades...</div>
            ) : unidadesFiltradas.length === 0 ? (
              <div className="unidades-empty">Nenhuma unidade encontrada para o filtro informado.</div>
            ) : (
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
                  {unidadesFiltradas.map((unidade) => (
                    <tr key={unidade.id}>
                      <td>{unidade.label_curto}</td>
                      <td>{unidade.label_completo}</td>
                      <td>{unidade.nome_centro || 'Nao informado'}</td>
                      <td>{unidade.tipo_unidade || 'Nao informado'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default UnidadesAdmin;
