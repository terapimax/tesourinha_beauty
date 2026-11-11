import { Award, Pencil, Plus, Star } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Avatar, Badge, Drawer, Field, PageHeader, SearchInput, Switch, useToast } from '../components/ui'
import { useStore, type AdminProfessional } from '../data/store'
import { categories } from '@shared/catalog'
import type { CategoryId } from '@shared/types'

const blank = (): AdminProfessional => ({
  id: `p-${Date.now()}`,
  name: '',
  role: '',
  categoryIds: [],
  serviceIds: [],
  rating: 5,
  reviewsCount: 0,
  distanceKm: 0,
  neighborhood: '',
  bio: '',
  yearsExperience: 1,
  tesourinhaAlumni: true,
  avatarColor: '#FF6A13',
  workingHours: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
  reviews: [],
  active: true,
})

export default function Professionals() {
  const { db, upsert, patch } = useStore()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [edit, setEdit] = useState<AdminProfessional | null>(null)

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase()
    return db.professionals.filter((p) => !query || `${p.name} ${p.role} ${p.neighborhood}`.toLowerCase().includes(query))
  }, [db, q])

  const count = (id: string) => db.bookings.filter((b) => b.professionalId === id && b.status !== 'cancelado').length

  const save = () => {
    if (!edit || !edit.name.trim()) return
    upsert('professionals', edit)
    toast('Profissional salvo')
    setEdit(null)
  }

  return (
    <>
      <PageHeader title="Profissionais" subtitle={`${db.professionals.filter((p) => p.active).length} ativos · ${db.professionals.filter((p) => p.tesourinhaAlumni).length} formados pela Tesourinha`}>
        <button className="btn primary" onClick={() => setEdit(blank())}><Plus size={16} /> Novo profissional</button>
      </PageHeader>
      <div className="card">
        <div className="toolbar">
          <SearchInput value={q} onChange={setQ} placeholder="Buscar por nome, função ou bairro" />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Profissional</th>
                <th>Especialidades</th>
                <th>Avaliação</th>
                <th>Atendimentos</th>
                <th>Ativo</th>
                <th className="right"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} style={{ opacity: p.active ? 1 : 0.55 }}>
                  <td>
                    <div className="cell-main">
                      <Avatar name={p.name} color={p.avatarColor} />
                      <div>
                        <div className="t" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {p.name} {p.tesourinhaAlumni && <Award size={14} color="#FF6A13" />}
                        </div>
                        <div className="s">{p.role} · {p.neighborhood}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="chips">
                      {p.categoryIds.map((c) => <Badge key={c} tone="gray" plain>{categories.find((x) => x.id === c)?.name}</Badge>)}
                    </div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <Star size={13} fill="#FFB800" color="#FFB800" style={{ verticalAlign: -2 }} /> <strong>{p.rating.toFixed(1)}</strong> <span className="muted">({p.reviewsCount})</span>
                  </td>
                  <td>{count(p.id)}</td>
                  <td>
                    <Switch on={p.active} label="Ativo" onChange={(v) => { patch('professionals', p.id, { active: v }); toast(v ? 'Profissional ativado' : 'Profissional ocultado do app') }} />
                  </td>
                  <td className="right">
                    <button className="btn sm" onClick={() => setEdit({ ...p })}><Pencil size={13} /> Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer
        open={!!edit}
        title={edit && db.professionals.some((p) => p.id === edit.id) ? 'Editar profissional' : 'Novo profissional'}
        onClose={() => setEdit(null)}
        footer={
          <>
            <button className="btn ghost" onClick={() => setEdit(null)}>Cancelar</button>
            <button className="btn primary" onClick={save} disabled={!edit?.name.trim()}>Salvar</button>
          </>
        }>
        {edit && (
          <>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <Avatar name={edit.name || 'Novo'} color={edit.avatarColor} size="lg" />
              <div className="muted" style={{ fontSize: 13 }}>Foto de perfil e portfólio serão enviados pelo Supabase Storage.</div>
            </div>
            <Field label="Nome"><input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
            <div className="fields-2">
              <Field label="Função"><input value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value })} placeholder="Ex.: Cabeleireira" /></Field>
              <Field label="Bairro"><input value={edit.neighborhood} onChange={(e) => setEdit({ ...edit, neighborhood: e.target.value })} placeholder="Ex.: Santo Amaro, SP" /></Field>
            </div>
            <Field label="Especialidades">
              <div className="chips">
                {categories.map((c) => {
                  const on = edit.categoryIds.includes(c.id)
                  return (
                    <button
                      type="button"
                      key={c.id}
                      className={`chip ${on ? 'on' : ''}`}
                      onClick={() => setEdit({ ...edit, categoryIds: on ? edit.categoryIds.filter((x) => x !== c.id) : [...edit.categoryIds, c.id as CategoryId] })}>
                      {c.name}
                    </button>
                  )
                })}
              </div>
            </Field>
            <Field label="Serviços oferecidos">
              <div className="chips">
                {db.services.map((s) => {
                  const on = edit.serviceIds.includes(s.id)
                  return (
                    <button type="button" key={s.id} className={`chip ${on ? 'on' : ''}`} onClick={() => setEdit({ ...edit, serviceIds: on ? edit.serviceIds.filter((x) => x !== s.id) : [...edit.serviceIds, s.id] })}>
                      {s.name}
                    </button>
                  )
                })}
              </div>
            </Field>
            <Field label="Anos de experiência"><input type="number" min={0} value={edit.yearsExperience} onChange={(e) => setEdit({ ...edit, yearsExperience: Number(e.target.value) })} /></Field>
            <Field label="Sobre"><textarea value={edit.bio} onChange={(e) => setEdit({ ...edit, bio: e.target.value })} /></Field>
            <div className="check-row">
              Formado(a) pela Associação Tesourinha
              <Switch on={edit.tesourinhaAlumni} onChange={(v) => setEdit({ ...edit, tesourinhaAlumni: v })} />
            </div>
            <div className="check-row">
              Visível no app
              <Switch on={edit.active} onChange={(v) => setEdit({ ...edit, active: v })} />
            </div>
          </>
        )}
      </Drawer>
    </>
  )
}
