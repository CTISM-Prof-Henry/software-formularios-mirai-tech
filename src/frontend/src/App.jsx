import React from 'react'
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import FeedbackToast from './components/FeedbackToast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { FeedbackProvider } from './context/FeedbackContext'
import { ThemeProvider } from './context/ThemeContext'
import Dashboard from './pages/Dashboard'
import EditarPlano from './pages/EditarPlano'
import GestaoEquipe from './pages/GestaoEquipe'
import Login from './pages/Login'
import MapaRisco from './pages/MapaRisco'
import NovoPlano from './pages/NovoPlano'
import Perfil from './pages/Perfil'
import PlanosRisco from './pages/PlanosRisco'
import RecuperarSenha from './pages/RecuperarSenha'
import GestaoUsuarios from './pages/GestaoUsuarios'
import UnidadesAdmin from './pages/UnidadesAdmin'
import VisualizarPlano from './pages/VisualizarPlano'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <ThemeProvider>
      <FeedbackProvider>
        <AuthProvider>
          <Router>
            <FeedbackToast />
            <Routes>
              {/* Rotas públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/recuperar-senha" element={<RecuperarSenha />} />

              {/* Rotas autenticadas */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/planos" element={<ProtectedRoute><PlanosRisco /></ProtectedRoute>} />
              <Route path="/planos/:uuid" element={<ProtectedRoute><VisualizarPlano /></ProtectedRoute>} />
              <Route path="/novo-plano" element={<ProtectedRoute><NovoPlano /></ProtectedRoute>} />
              <Route path="/editar-plano/:uuid" element={<ProtectedRoute><EditarPlano /></ProtectedRoute>} />
              <Route path="/mapa" element={<ProtectedRoute><MapaRisco /></ProtectedRoute>} />
              <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
              <Route path="/equipe" element={<ProtectedRoute><GestaoEquipe /></ProtectedRoute>} />
              <Route path="/usuarios" element={<ProtectedRoute><GestaoUsuarios /></ProtectedRoute>} />
              <Route path="/unidades" element={<ProtectedRoute><UnidadesAdmin /></ProtectedRoute>} />

              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </FeedbackProvider>
    </ThemeProvider>
  )
}

export default App
