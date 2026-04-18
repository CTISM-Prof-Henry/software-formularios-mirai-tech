import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Dashboard from './pages/Dashboard'
import RecuperarSenha from './pages/RecuperarSenha'
import Perfil from './pages/Perfil'
import GestaoEquipe from './pages/GestaoEquipe'
import PlanosRisco from './pages/PlanosRisco'
import NovoPlano from './pages/NovoPlano'
import EditarPlano from './pages/EditarPlano'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/planos" element={<PlanosRisco />} />
        <Route path="/novo-plano" element={<NovoPlano />} />
        <Route path="/editar-plano/:id" element={<EditarPlano />} />
        <Route path="/mapa" element={<Dashboard />} /> {/* Placeholder */}
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/equipe" element={<GestaoEquipe />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
