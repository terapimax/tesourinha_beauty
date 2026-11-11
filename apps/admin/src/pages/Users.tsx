import { Download } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Avatar, Badge, PageHeader, SearchInput, Segmented, type Tone } from '../components/ui'
import { fmtDate, useStore, type AdminUser } from '../data/store'

const ROLE_TONE: Record<AdminUser['role'], Tone> = { cliente: 'blue', aluno: 'orange', profissional: 'green' }

export default function UsersPage() {
  const { db } = useStore()
  const [q, setQ] = useState('')
  const [role, setRole] = useState<AdminUser['role'] | 'todos'>('todos')

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase()
    return db.users
      .filter((u) => role === 'todos' || u.role === role)
      .filter((u) => !query || `${u.name} ${u.email} ${u.city}`.toLowerCase().includes(query))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [db, q, role])

  const exportCsv = () => {
    const header = 'nome,email,telefone,cidade,perfil,cadastro'
    const lines = rows.map((u) => [u.name, u.email, u.phone, u.city, u.role, u.createdAt].map((v) => `"${v}"`).join(','))
    const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'usuarios-tesourinha.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <>
      <PageHeader title="Usuários" subtitle={`${db.users.length} pessoas cadastradas no app`}>
        <button className="btn" onClick={exportCsv}><Download size={15} /> Exportar CSV</button>
      </PageHeader>
      <div className="card">
        <div className="toolbar">
          <SearchInput value={q} onChange={setQ} placeholder="Buscar nome, e-mail ou bairro" />
          <Segmented<AdminUser['role'] | 'todos'>
            value={role}
            onChange={setRole}
            options={[
              { value: 'todos', label: 'Todos' },
              { value: 'cliente', label: 'Clientes' },
              { value: 'aluno', label: 'Alunos' },
              { value: 'profissional', label: 'Profissionais' },
            ]}
          />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Contato</th>
                <th>Bairro</th>
                <th>Perfil</th>
                <th>Agendamentos</th>
                <th>Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="cell-main">
                      <Avatar name={u.name} color="#3A3A3C" />
                      <span className="t">{u.name}</span>
                    </div>
                  </td>
                  <td>
                    <div>{u.email}</div>
                    <div className="muted" style={{ fontSize: 12.5 }}>{u.phone}</div>
                  </td>
                  <td className="muted">{u.city}</td>
                  <td><Badge tone={ROLE_TONE[u.role]}>{u.role}</Badge></td>
                  <td>{db.bookings.filter((b) => b.userId === u.id).length}</td>
                  <td className="muted">{fmtDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <div className="empty">Nenhum usuário encontrado.</div>}
        </div>
      </div>
    </>
  )
}
