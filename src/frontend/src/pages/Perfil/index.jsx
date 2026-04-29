import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { getSetorLabel } from '../../utils/unidades';
import './styles.css';

const Perfil = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Inicialização segura do estado do usuário
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('@SIGR:user');
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  });

  const [setoresDisponiveis, setSetoresDisponiveis] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [formData, setFormData] = useState({
    email: user?.email || '',
    id_setores: Array.isArray(user?.setores) ? user.setores.map(s => s.id) : [],
    senha_atual: '',
    nova_senha: '',
    confirmacao_senha: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [setoresRes, profileRes] = await Promise.all([
          api.get('/usuarios/setores/'),
          api.get('/usuarios/me/')
        ]);
        
        const userData = profileRes.data;
        // Ajuste para lidar com paginação do DRF
        const setoresData = setoresRes.data.results || setoresRes.data;
        setSetoresDisponiveis(Array.isArray(setoresData) ? setoresData : []);
        setUser(userData);
        localStorage.setItem('@SIGR:user', JSON.stringify(userData));
        
        setFormData(prev => ({
          ...prev,
          email: userData.email || '',
          id_setores: Array.isArray(userData.setores) ? userData.setores.map(s => s.id) : []
        }));
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      }
    }
    loadInitialData();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const toggleSetor = (setorId) => {
    setFormData(prev => {
      const currentIds = Array.isArray(prev.id_setores) ? prev.id_setores : [];
      const jaSelecionado = currentIds.includes(setorId);
      if (jaSelecionado) {
        return { ...prev, id_setores: currentIds.filter(id => id !== setorId) };
      } else {
        return { ...prev, id_setores: [...currentIds, setorId] };
      }
    });
  };

  const getSetoresSelecionadosTexto = () => {
    const currentIds = Array.isArray(formData.id_setores) ? formData.id_setores : [];
    if (currentIds.length === 0) return 'Selecione seus setores';
    if (!Array.isArray(setoresDisponiveis) || setoresDisponiveis.length === 0) return 'Carregando setores...';

    const selecionados = setoresDisponiveis
      .filter(s => currentIds.includes(s.id))
      .map(s => getSetorLabel(s));
      
    return selecionados.length > 0 ? selecionados.join(', ') : 'Selecione seus setores';
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    // Prepara payload apenas com campos preenchidos
    const payload = {
      email: formData.email,
      id_setores: formData.id_setores
    };

    if (formData.senha_atual) {
      payload.senha_atual = formData.senha_atual;
      payload.nova_senha = formData.nova_senha;
      payload.confirmacao_senha = formData.confirmacao_senha;
    }

    try {
      const response = await api.patch('/usuarios/me/', payload);
      setSuccess('Perfil atualizado com sucesso!');
      setUser(response.data.usuario);
      localStorage.setItem('@SIGR:user', JSON.stringify(response.data.usuario));
      
      // Limpa campos de senha
      setFormData(prev => ({
        ...prev,
        senha_atual: '',
        nova_senha: '',
        confirmacao_senha: ''
      }));
    } catch (err) {
      const msg = err.response?.data?.erro || 
                  Object.values(err.response?.data || {})[0] || 
                  'Erro ao atualizar perfil.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="perfil-container">
      <Sidebar />
      <main className="perfil-main">
        <header className="perfil-header">
          <h1>Editar Perfil</h1>
          <p>Gerencie suas informações pessoais e configurações de segurança da conta.</p>
        </header>

        <div className="perfil-card">
          <div className="perfil-tabs">
            <div className="tab-item">Informações Pessoais</div>
          </div>

          <form className="perfil-content" onSubmit={handleSalvar}>
            {success && <div className="success-message">{success}</div>}
            {error && <div className="error-message-perfil">{error}</div>}

            <div className="perfil-section-title">
              Informações Pessoais
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Nome Completo</label>
                <input type="text" value={user.nome || ''} disabled />
                <span className="input-caption">O nome deve ser alterado via RH central.</span>
              </div>

              <div className="form-group">
                <label>SIAPE</label>
                <input type="text" value={user.siape || ''} disabled />
              </div>

              <div className="form-group">
                <label htmlFor="email">E-mail Corporativo</label>
                <input 
                  type="email" 
                  id="email" 
                  value={formData.email} 
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="form-group" ref={dropdownRef}>
                <label>Departamento/Setor</label>
                <div 
                  className={`custom-select-trigger ${isDropdownOpen ? 'open' : ''}`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{ cursor: 'pointer', background: 'white' }}
                >
                  <span style={{ 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    display: 'block',
                    width: '100%'
                  }}>
                    {getSetoresSelecionadosTexto()}
                  </span>
                </div>
                
                {isDropdownOpen && (
                  <div className="custom-select-options" style={{ borderTop: '1.5px solid #003470' }}>
                    {setoresDisponiveis.map(setor => (
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
                        <span>{getSetorLabel(setor, { completo: user.is_superuser })}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="perfil-section-title mt">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              Segurança e Senha
            </div>

            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="senha_atual">Senha Atual</label>
                <input 
                  type="password" 
                  id="senha_atual" 
                  value={formData.senha_atual}
                  onChange={handleChange}
                  placeholder="••••••••" 
                />
              </div>

              <div className="form-group">
                <label htmlFor="nova_senha">Nova Senha</label>
                <input 
                  type="password" 
                  id="nova_senha" 
                  value={formData.nova_senha}
                  onChange={handleChange}
                  placeholder="Mínimo 8 caracteres" 
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmacao_senha">Confirmar Nova Senha</label>
                <input 
                  type="password" 
                  id="confirmacao_senha" 
                  value={formData.confirmacao_senha}
                  onChange={handleChange}
                  placeholder="Mínimo 8 caracteres" 
                />
              </div>
            </div>

            <div className="perfil-actions">
              <button type="button" className="btn-cancelar" onClick={() => navigate('/dashboard')}>Cancelar</button>
              <button type="submit" className="btn-salvar" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Perfil;
