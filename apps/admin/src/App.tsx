import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import Layout from './components/Layout'
import { ToastProvider } from './components/ui'
import { StoreProvider, useStore } from './data/store'
import Bookings from './pages/Bookings'
import Courses from './pages/Courses'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import Login from './pages/Login'
import Professionals from './pages/Professionals'
import Services from './pages/Services'
import UsersPage from './pages/Users'

// BASE_URL vem como "/admin/"; sem a barra final, "/admin" também casa com o basename
// (com a barra, abrir /admin deixava a tela em branco).
const BASENAME = import.meta.env.BASE_URL.replace(/\/+$/, '') || '/'

function Routed() {
  const { session } = useStore()
  if (!session) return <Login />
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="agendamentos" element={<Bookings />} />
        <Route path="profissionais" element={<Professionals />} />
        <Route path="servicos" element={<Services />} />
        <Route path="cursos" element={<Courses />} />
        <Route path="vagas" element={<Jobs />} />
        <Route path="usuarios" element={<UsersPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <BrowserRouter basename={BASENAME}>
          <Routed />
        </BrowserRouter>
      </ToastProvider>
    </StoreProvider>
  )
}
