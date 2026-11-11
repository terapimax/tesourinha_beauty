import { Briefcase, CalendarCheck, GraduationCap, Wallet } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { Avatar, Badge, PageHeader } from '../components/ui'
import { fmtDate, money, offsetDay, today, useStore } from '../data/store'

export default function Dashboard() {
  const { db } = useStore()
  const t = today()

  const stats = useMemo(() => {
    const in7 = offsetDay(-6)
    const prev7 = offsetDay(-13)
    const done = db.bookings.filter((b) => b.status !== 'cancelado')
    const week = done.filter((b) => b.date >= in7 && b.date <= t)
    const prevWeek = done.filter((b) => b.date >= prev7 && b.date < in7)
    const revenue = week.reduce((s, b) => s + b.price, 0)
    const prevRevenue = prevWeek.reduce((s, b) => s + b.price, 0)
    const pct = (a: number, b: number) => (b ? Math.round(((a - b) / b) * 100) : 0)
    return {
      todayCount: db.bookings.filter((b) => b.date === t && b.status === 'confirmado').length,
      week: week.length,
      weekDelta: pct(week.length, prevWeek.length),
      revenue,
      revenueDelta: pct(revenue, prevRevenue),
      enrollments: db.enrollments.length,
      newApps: db.applications.filter((a) => a.status === 'nova').length,
      openJobs: db.jobs.filter((j) => j.open).length,
    }
  }, [db, t])

  const chart = useMemo(() => {
    const days = Array.from({ length: 21 }, (_, i) => offsetDay(i - 14))
    const counts = days.map((d) => db.bookings.filter((b) => b.date === d && b.status !== 'cancelado').length)
    const max = Math.max(1, ...counts)
    return days.map((d, i) => ({ d, n: counts[i]!, h: (counts[i]! / max) * 100 }))
  }, [db])

  const upcoming = db.bookings
    .filter((b) => b.status === 'confirmado' && b.date >= t)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, 6)

  const topPros = db.professionals
    .map((p) => ({ p, n: db.bookings.filter((b) => b.professionalId === p.id && b.status !== 'cancelado').length }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 5)
  const topMax = Math.max(1, ...topPros.map((x) => x.n))

  const pro = (id: string) => db.professionals.find((p) => p.id === id)
  const svc = (id: string) => db.services.find((s) => s.id === id)
  const user = (id: string) => db.users.find((u) => u.id === id)

  const hello = new Date().getHours() < 12 ? 'Bom dia' : new Date().getHours() < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <>
      <PageHeader title={`${hello} 👋`} subtitle={`Resumo de ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}`}>
        <Link className="btn" to="/agendamentos">Ver agenda</Link>
        <Link className="btn primary" to="/cursos">Nova turma</Link>
      </PageHeader>

      <div className="grid kpis">
        <Kpi icon={<CalendarCheck size={18} />} label="Agendamentos hoje" value={String(stats.todayCount)} note={`${stats.week} nos últimos 7 dias`} delta={stats.weekDelta} />
        <Kpi icon={<Wallet size={18} />} label="Movimentado (7 dias)" value={money(stats.revenue)} note="estimativa pelos preços" delta={stats.revenueDelta} />
        <Kpi icon={<GraduationCap size={18} />} label="Inscrições em cursos" value={String(stats.enrollments)} note={`${db.courses.filter((c) => c.published).length} cursos publicados`} />
        <Kpi icon={<Briefcase size={18} />} label="Candidaturas novas" value={String(stats.newApps)} note={`${stats.openJobs} vagas abertas`} />
      </div>

      <div className="grid two" style={{ marginTop: 18 }}>
        <div className="card">
          <div className="card-head">
            <h3>Agendamentos por dia</h3>
            <span>últimas 2 semanas + próximos 7 dias</span>
          </div>
          <div className="chart">
            {chart.map((c) => (
              <div key={c.d} className={`bar-col ${c.d === t ? 'today' : ''}`} title={`${fmtDate(c.d)}: ${c.n} agendamentos`}>
                <div className={`bar ${c.d > t ? 'future' : ''}`} style={{ height: `${Math.max(c.h, 3)}%` }} />
                <small>{Number(c.d.slice(8))}</small>
              </div>
            ))}
          </div>
          <div className="legend">
            <span><i style={{ background: '#FF6A13' }} />Realizados</span>
            <span><i style={{ background: '#ffd9c2' }} />Confirmados (futuro)</span>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Profissionais mais procurados</h3>
          </div>
          <div style={{ paddingTop: 10 }}>
            {topPros.map(({ p, n }) => (
              <div className="list-row" key={p.id}>
                <Avatar name={p.name} color={p.avatarColor} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <strong>{p.name}</strong>
                    <span className="muted">{n}</span>
                  </div>
                  <div className="progress" style={{ marginTop: 6 }}>
                    <div style={{ width: `${(n / topMax) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-head">
          <h3>Próximos atendimentos</h3>
          <Link to="/agendamentos" style={{ color: 'var(--brand)', fontWeight: 600, fontSize: 14 }}>Ver todos</Link>
        </div>
        <div className="table-wrap" style={{ marginTop: 8 }}>
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Serviço</th>
                <th>Profissional</th>
                <th>Quando</th>
                <th className="right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div className="cell-main">
                      <Avatar name={user(b.userId)?.name ?? '?'} color="#3A3A3C" />
                      <span className="t">{user(b.userId)?.name}</span>
                    </div>
                  </td>
                  <td>{svc(b.serviceId)?.name}</td>
                  <td className="muted">{pro(b.professionalId)?.name}</td>
                  <td>
                    {b.date === t ? <Badge tone="orange">Hoje · {b.time}</Badge> : <span>{fmtDate(b.date)} · {b.time}</span>}
                  </td>
                  <td className="right">{money(b.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

function Kpi({ icon, label, value, note, delta }: { icon: React.ReactNode; label: string; value: string; note: string; delta?: number }) {
  return (
    <div className="card kpi">
      <div className="kpi-top">
        {label}
        <div className="kpi-icon">{icon}</div>
      </div>
      <div className="kpi-value">{value}</div>
      <div style={{ display: 'flex', gap: 8, fontSize: 12.5 }} className="muted">
        {delta !== undefined && <span className={`kpi-delta ${delta < 0 ? 'neg' : ''}`}>{delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}%</span>}
        {note}
      </div>
    </div>
  )
}
