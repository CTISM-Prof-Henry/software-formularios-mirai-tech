import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';
import { useFeedback } from '../../context/FeedbackContext';
import api from '../../services/api';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';
import { getSetorLabel } from '../../utils/unidades';
import './styles.css';

const Cadastro = () => {
  const [formData, setFormData] = useState({
    siape: '',
    senha: '',
    nome: '',
    email: '',
    id_setores: [],
  });
  const [setoresDisponiveis, setSetoresDisponiveis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSetores, setLoadingSetores] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [buscaSetor, setBuscaSetor] = useState('');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { showFeedback } = useFeedback();

  useEffect(() => {
    async function loadSetores() {
      try {
        const response = await api.get('/usuarios/setores/');
        setSetoresDisponiveis(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Erro ao carregar setores:', error);
        setSetoresDisponiveis([]);
        showFeedback({
          type: 'warning',
          title: 'Unidades indisponiveis',
          message: 'Nao foi possivel carregar as unidades agora. Atualize a pagina para tentar novamente.',
        });
      } finally {
        setLoadingSetores(false);
      }
    }

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setBuscaSetor('');
      }
    }

    loadSetores();
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFeedback]);

  const handleChange = (event) => {
    const { id, value } = event.target;
    setFormData((previous) => ({ ...previous, [id]: value }));
  };

  const toggleSetor = (setorId) => {
    setFormData((previous) => {
      const currentIds = Array.isArray(previous.id_setores) ? previous.id_setores : [];
      const jaSelecionado = currentIds.includes(setorId);

      if (jaSelecionado) {
        return { ...previous, id_setores: currentIds.filter((id) => id !== setorId) };
      }

      return { ...previous, id_setores: [...currentIds, setorId] };
    });
  };

  const getSetoresSelecionadosTexto = () => {
    const currentIds = Array.isArray(formData.id_setores) ? formData.id_setores : [];

    if (currentIds.length === 0) return 'Selecione uma ou mais unidades';
    if (!Array.isArray(setoresDisponiveis) || setoresDisponiveis.length === 0) return 'Carregando unidades...';

    if (currentIds.length === 1) {
      const setor = setoresDisponiveis.find((item) => item.id === currentIds[0]);
      return setor ? getSetorLabel(setor) : '1 unidade selecionada';
    }

    return `${currentIds.length} unidades selecionadas`;
  };

  const setoresFiltrados = setoresDisponiveis.filter((setor) => {
    const termo = buscaSetor.trim().toLowerCase();
    if (!termo) return true;

    const label = getSetorLabel(setor).toLowerCase();
    return (
      label.includes(termo) ||
      (setor.nome_centro || '').toLowerCase().includes(termo) ||
      (setor.tipo_unidade || '').toLowerCase().includes(termo)
    );
  });

  const toggleDropdown = () => {
    setIsDropdownOpen((previous) => {
      const nextValue = !previous;
      if (!nextValue) {
        setBuscaSetor('');
      }
      return nextValue;
    });
  };

  const handleCadastro = async (event) => {
    event.preventDefault();

    if (formData.id_setores.length === 0) {
      showFeedback({
        type: 'warning',
        title: 'Selecao obrigatoria',
        message: 'Selecione pelo menos uma unidade para concluir o cadastro.',
      });
      return;
    }

    setLoading(true);

    try {
      await api.post('/usuarios/registro/', formData);
      showFeedback({
        type: 'success',
        title: 'Cadastro concluido',
        message: 'Sua conta foi criada com sucesso. Voce sera redirecionado para o login.',
      });
      setTimeout(() => navigate('/login'), 1200);
    } catch (error) {
      showFeedback({
        type: 'error',
        title: 'Cadastro nao concluido',
        message: getApiErrorMessage(error, 'cadastro'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cadastro-container">
      <div className="public-theme-toggle">
        <ThemeToggle />
      </div>

      <main className="cadastro-card">
        <header className="cadastro-header">
          <p className="cadastro-title-small">Crie sua conta para acessar o sistema</p>
          <h1 className="cadastro-title-large">Sistema de Gestao de Riscos</h1>
        </header>

        <form onSubmit={handleCadastro}>
          <div className="input-group">
            <label htmlFor="nome">Nome Completo</label>
            <input
              type="text"
              id="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Como voce gostaria de ser chamado"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email Institucional</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="exemplo@ufsm.br"
              required
            />
          </div>

          <div className="input-row">
            <div className="input-group">
              <label htmlFor="siape">SIAPE</label>
              <input
                type="text"
                id="siape"
                value={formData.siape}
                onChange={handleChange}
                placeholder="Matricula"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="senha">Senha</label>
              <input
                type="password"
                id="senha"
                value={formData.senha}
                onChange={handleChange}
                placeholder="Min. 8 caracteres"
                required
              />
            </div>
          </div>

          <div className="input-group" ref={dropdownRef}>
            <label>Unidades Vinculadas</label>
            <div className={`custom-select-trigger ${isDropdownOpen ? 'open' : ''}`} onClick={toggleDropdown}>
              <span>{getSetoresSelecionadosTexto()}</span>
              <i className="arrow-icon"></i>
            </div>

            {isDropdownOpen && (
              <div className="custom-select-options">
                <div className="custom-select-search">
                  <input
                    type="text"
                    value={buscaSetor}
                    onChange={(event) => setBuscaSetor(event.target.value)}
                    placeholder="Buscar unidade por sigla, nome ou centro"
                    onClick={(event) => event.stopPropagation()}
                  />
                </div>

                <div className="custom-select-list">
                  {setoresFiltrados.map((setor) => (
                    <div
                      key={setor.id}
                      className={`custom-option ${formData.id_setores.includes(setor.id) ? 'selected' : ''}`}
                      onClick={() => toggleSetor(setor.id)}
                    >
                      <input type="checkbox" checked={formData.id_setores.includes(setor.id)} readOnly />
                      <span>{getSetorLabel(setor)}</span>
                    </div>
                  ))}

                  {loadingSetores && <div className="custom-option-loading">Carregando unidades...</div>}
                  {!loadingSetores && setoresDisponiveis.length === 0 && (
                    <div className="custom-option-loading">Nenhuma unidade cadastrada.</div>
                  )}
                  {!loadingSetores && setoresDisponiveis.length > 0 && setoresFiltrados.length === 0 && (
                    <div className="custom-option-loading">Nenhuma unidade encontrada.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="cadastro-button" disabled={loading}>
            {loading ? 'Processando...' : 'Concluir Cadastro'}
          </button>
        </form>

        <footer className="cadastro-footer">
          <p>
            Ja possui uma conta?{' '}
            <Link to="/login" className="login-link">
              Fazer Login
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Cadastro;
