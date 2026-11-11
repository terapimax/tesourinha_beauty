import { Briefcase, CalendarDays, GraduationCap, LayoutDashboard, LogOut, Menu, Scissors, Sparkles, Users } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

import { today, useStore } from '../data/store'
import { Brand, ScissorsMark } from './ui'

export default function Layout() {
  const { db, session, logout } = useStore()
  const [open, setOpen] = useState(false)
  const todayCount = db.bookings.filter((b) => b.date === today() && b.status === 'confirmado').length
  const newApps = db.applications.filter((a) => a.status === 'nova').length

  const links = [
    { to: '/', label: 'Visão geral', icon: LayoutDashboard, end: true },
    { to: '/agendamentos', label: 'Agendamentos', icon: CalendarDays, count: todayCount },
    { section: 'Catálogo' },
    { to: '/profissionais', label: 'Profissionais', icon: Scissors },
    { to: '/servicos', label: 'Serviços', icon: Sparkles },
    { section: 'Associação' },
    { to: '/cursos', label: 'Cursos', icon: GraduationCap },
    { to: '/vagas', label: 'Vagas', icon: Briefcase, count: newApps },
    { section: 'Pessoas' },
    { to: '/usuarios', label: 'Usuários', icon: Users },
  ] as const

  return (
    <div className="app">
      <div className="mobile-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ScissorsMark size={26} />
          <strong>Tesourinha</strong>
        </div>
        <button className="btn icon dark" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          <Menu size={18} />
        </button>
      </div>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <Brand />
        <nav className="nav">
          {links.map((l, i) =>
            'section' in l ? (
              <div className="nav-label" key={i}>
                {l.section}
              </div>
            ) : (
              <NavLink key={l.to} to={l.to} end={'end' in l} onClick={() => setOpen(false)}>
                <l.icon size={18} />
                {l.label}
                {'count' in l && l.count > 0 && <span className="count">{l.count}</span>}
              </NavLink>
            ),
          )}
        </nav>
        <div className="sidebar-foot">
          <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
            {(session ?? 'A')[0]!.toUpperCase()}
          </div>
          <div className="who">
            <div>Administrador</div>
            <div>{session}</div>
          </div>
          <button className="btn icon ghost" style={{ color: 'rgba(255,255,255,0.6)' }} onClick={logout} aria-label="Sair" title="Sair">
            <LogOut size={16} />
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
