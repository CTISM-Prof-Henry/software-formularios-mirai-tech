import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { getSetorLabel } from '../../utils/unidades';
import './styles.css';

const Cadastro = () => {
  const [formData, setFormData] = useState({
    siape: '',
    senha: '',
    nome: '',
    email: '',
    id_setores: []
  });
  const [setoresDisponiveis, setSetoresDisponiveis] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSetores, setLoadingSetores] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [buscaSetor, setBuscaSetor] = useState('');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadSetores() {
      try {
        const response = await api.get('/usuarios/setores/');
        setSetoresDisponiveis(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Erro ao carregar setores:', err);
        setSetoresDisponiveis([]);
      } finally {
        setLoadingSetores(false);
      }
    }
    loadSetores();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setBuscaSetor('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const toggleSetor = (setorId) => {
    setFormData((prev) => {
      const currentIds = Array.isArray(prev.id_setores) ? prev.id_setores : [];
      const jaSelecionado = currentIds.includes(setorId);
      if (jaSelecionado) {
        return { ...prev, id_setores: currentIds.filter((id) => id !== setorId) };
      }
      return { ...prev, id_setores: [...currentIds, setorId] };
    });
  };

  const getSetoresSelecionadosTexto = () => {
    const currentIds = Array.isArray(formData.id_setores) ? formData.id_setores : [];
    if (currentIds.length === 0) return 'Selecione um ou mais setores';
    if (!Array.isArray(setoresDisponiveis) || setoresDisponiveis.length === 0) return 'Carregando setores...';
    if (currentIds.length === 1) {
      const setor = setoresDisponiveis.find((item) => item.id === currentIds[0]);
      return setor ? getSetorLabel(setor) : '1 setor selecionado';
    }
    return `${currentIds.length} setores selecionados`;
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
    setIsDropdownOpen((prev) => {
      const nextValue = !prev;
      if (!nextValue) {
        setBuscaSetor('');
      }
      return nextValue;
    });
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.id_setores.length === 0) {
      setError('Selecione pelo menos um setor.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/usuarios/registro/', formData);
      alert('Cadastro realizado com sucesso! Faça login para continuar.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.erro || 'Erro ao realizar cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cadastro-container">
      <main className="cadastro-card">
        <header className="cadastro-header">
          <p className="cadastro-title-small">Crie sua conta para acessar o sistema</p>
          <h1 className="cadastro-title-large">Sistema de Gestão de Riscos</h1>
        </header>

        <form onSubmit={handleCadastro}>
          <div className="input-group">
            <label htmlFor="nome">Nome Completo</label>
            <input
              type="text"
              id="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Como você gostaria de ser chamado"
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
                placeholder="Matrícula"
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
                placeholder="Mín. 8 caracteres"
                required
              />
            </div>
          </div>

          <div className="input-group" ref={dropdownRef}>
            <label>Setores Vinculados</label>
            <div
              className={`custom-select-trigger ${isDropdownOpen ? 'open' : ''}`}
              onClick={toggleDropdown}
            >
              <span>{getSetoresSelecionadosTexto()}</span>
              <i className="arrow-icon"></i>
            </div>

            {isDropdownOpen && (
              <div className="custom-select-options">
                <div className="custom-select-search">
                  <input
                    type="text"
                    value={buscaSetor}
                    onChange={(e) => setBuscaSetor(e.target.value)}
                    placeholder="Buscar unidade por sigla, nome ou centro"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <div className="custom-select-list">
                  {setoresFiltrados.map((setor) => (
                    <div
                      key={setor.id}
                      className={`custom-option ${formData.id_setores.includes(setor.id) ? 'selected' : ''}`}
                      onClick={() => toggleSetor(setor.id)}
                    >
                      <input
                        type="checkbox"
                        checked={formData.id_setores.includes(setor.id)}
                        readOnly
                      />
                      <span>{getSetorLabel(setor)}</span>
                    </div>
                  ))}

                  {loadingSetores && (
                    <div className="custom-option-loading">Carregando setores...</div>
                  )}
                  {!loadingSetores && setoresDisponiveis.length === 0 && (
                    <div className="custom-option-loading">Nenhum setor cadastrado.</div>
                  )}
                  {!loadingSetores && setoresDisponiveis.length > 0 && setoresFiltrados.length === 0 && (
                    <div className="custom-option-loading">Nenhum setor encontrado.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="cadastro-button" disabled={loading}>
            {loading ? 'Processando...' : 'Concluir Cadastro'}
          </button>
        </form>

        <footer className="cadastro-footer">
          <p>Já possui uma conta? <Link to="/login" className="login-link">Fazer Login</Link></p>
        </footer>
      </main>
    </div>
  );
};

export default Cadastro;
