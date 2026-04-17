import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('@SIGR:user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('@SIGR:token');
    localStorage.removeItem('@SIGR:user');
    navigate('/login');
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundColor: '#f4f7f9',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.05)',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#003470', marginBottom: '16px' }}>Deu certo login 👍</h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>Bem-vindo, <strong>{user.nome || 'Gestor'}</strong>!</p>
        
        <button 
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Sair do Sistema
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
