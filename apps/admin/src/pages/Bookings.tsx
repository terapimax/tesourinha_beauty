import { useMemo, useState } from 'react'

import { Avatar, Badge, PageHeader, SearchInput, Segmented, useToast, type Tone } from '../components/ui'
import { fmtDate, money, today, useStore } from '../data/store'
import type { BookingStatus } from '@shared/types'

const STATUS: Record<BookingStatus, { label: string; tone: Tone }> = {
  confirmado: { label: 'Confirmado', tone: 'blue' },
  concluido: { label: 'Concluído', tone: 'green' },
  cancelado: { label: 'Cancelado', tone: 'red' },
}

type Range = 'proximos' | 'hoje' | 'passados' | 'todos'

export default function Bookings() {
  const { db, patch } = useStore()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [range, setRange] = useState<Range>('proximos')
  const [pro, setPro] = useState('')
  const t = today()

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase()
    return db.bookings
      .filter((b) => (range === 'hoje' ? b.date === t : range === 'proximos' ? b.date >= t : range === 'passados' ? b.date < t : true))
      .filter((b) => !pro || b.professionalId === pro)
      .map((b) => ({
        b,
        user: db.users.find((u) => u.id === b.userId),
        pro: db.professionals.find((p) => p.id === b.professionalId),
        svc: db.services.find((s) => s.id === b.serviceId),
      }))
      .filter((r) => !query || `${r.user?.name} ${r.pro?.name} ${r.svc?.name}`.toLowerCase().includes(query))
      .sort((a, b) => {
        const k = `${a.b.date}${a.b.time}`.localeCompare(`${b.b.date}${b.b.time}`)
        return range === 'passados' || range === 'todos' ? -k : k
      })
  }, [db, q, range, pro, t])

  const total = rows.filter((r) => r.b.status !== 'cancelado').reduce((s, r) => s + r.b.price, 0)

  return (
    <>
      <PageHeader title="Agendamentos" subtitle={`${rows.length} agendamentos · ${money(total)} em serviços`} />
      <div className="card">
        <div className="toolbar">
          <SearchInput value={q} onChange={setQ} placeholder="Buscar cliente, serviço ou profissional" />
          <Segmented<Range>
            value={range}
            onChange={setRange}
            options={[
              { value: 'proximos', label: 'Próximos' },
              { value: 'hoje', label: 'Hoje' },
              { value: 'passados', label: 'Passados' },
              { value: 'todos', label: 'Todos' },
            ]}
          />
          <select className="inline" value={pro} onChange={(e) => setPro(e.target.value)} style={{ marginLeft: 'auto' }}>
            <option value="">Todos os profissionais</option>
            {db.professionals.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Quando</th>
                <th>Cliente</th>
                <th>Serviço</th>
                <th>Profissional</th>
                <th>Status</th>
                <th className="right">Valor</th>
                <th className="right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 150).map(({ b, user, pro, svc }) => (
                <tr key={b.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <strong>{b.date === t ? 'Hoje' : fmtDate(b.date)}</strong> <span className="muted">· {b.time}</span>
                  </td>
                  <td>
                    <div className="cell-main">
                      <Avatar name={user?.name ?? '?'} color="#3A3A3C" />
                      <div>
                        <div className="t">{user?.name}</div>
                        <div className="s">{user?.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td>{svc?.name}</td>
                  <td className="muted">{pro?.name}</td>
                  <td><Badge tone={STATUS[b.status].tone}>{STATUS[b.status].label}</Badge></td>
                  <td className="right">{money(b.price)}</td>
                  <td className="right">
                    <select
                      className="inline"
                      value={b.status}
                      onChange={(e) => {
                        patch('bookings', b.id, { status: e.target.value as BookingStatus })
                        toast('Status atualizado')
                      }}>
                      <option value="confirmado">Confirmado</option>
                      <option value="concluido">Concluído</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <div className="empty">Nenhum agendamento encontrado.</div>}
        </div>
      </div>
    </>
  )
}
