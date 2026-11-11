import { CalendarDays, Clock, Pencil, Plus, Users } from 'lucide-react'
import { useState } from 'react'

import { Avatar, Badge, Drawer, Field, PageHeader, Switch, useToast } from '../components/ui'
import { fmtDate, useStore, type AdminCourse } from '../data/store'
import { courseCategories } from '@shared/catalog'
import type { Course } from '@shared/types'

const blank = (): AdminCourse => ({
  id: `c-${Date.now()}`,
  title: '',
  subtitle: '',
  categoryId: 'cabelo',
  level: 'Iniciante',
  durationHours: 40,
  modality: 'Presencial',
  startDate: new Date().toISOString().slice(0, 10),
  seats: 20,
  seatsTaken: 0,
  icon: 'school-outline',
  description: '',
  modules: [],
  certificate: true,
  published: true,
})

export default function Courses() {
  const { db, upsert, patch } = useStore()
  const toast = useToast()
  const [edit, setEdit] = useState<AdminCourse | null>(null)
  const [students, setStudents] = useState<AdminCourse | null>(null)

  const enrolled = (id: string) => db.enrollments.filter((e) => e.courseId === id)

  return (
    <>
      <PageHeader title="Cursos" subtitle="Qualificação profissional gratuita da Associação Tesourinha">
        <button className="btn primary" onClick={() => setEdit(blank())}><Plus size={16} /> Novo curso</button>
      </PageHeader>

      <div className="grid cards">
        {db.courses.map((c) => {
          const pct = Math.min(100, Math.round((c.seatsTaken / c.seats) * 100))
          const full = c.seatsTaken >= c.seats
          return (
            <div className="card course-card" key={c.id} style={{ opacity: c.published ? 1 : 0.6 }}>
              <div className="row">
                <Badge tone={c.published ? (full ? 'orange' : 'green') : 'gray'}>{!c.published ? 'Rascunho' : full ? 'Turma cheia' : 'Inscrições abertas'}</Badge>
                <Switch on={c.published} label="Publicado" onChange={(v) => { patch('courses', c.id, { published: v }); toast(v ? 'Curso publicado' : 'Curso ocultado do app') }} />
              </div>
              <div>
                <h4>{c.title}</h4>
                <div className="muted" style={{ fontSize: 13.5 }}>{c.subtitle}</div>
              </div>
              <div className="muted" style={{ display: 'flex', gap: 14, fontSize: 13, flexWrap: 'wrap' }}>
                <span><Clock size={13} style={{ verticalAlign: -2 }} /> {c.durationHours}h · {c.modality}</span>
                <span><CalendarDays size={13} style={{ verticalAlign: -2 }} /> início {fmtDate(c.startDate)}</span>
              </div>
              <div>
                <div className="row" style={{ fontSize: 13, marginBottom: 6 }}>
                  <span><strong>{c.seatsTaken}</strong> <span className="muted">de {c.seats} vagas</span></span>
                  <span className="muted">{pct}%</span>
                </div>
                <div className="progress"><div style={{ width: `${pct}%`, background: full ? '#AEAEB2' : undefined }} /></div>
              </div>
              <div className="row">
                <button className="btn sm" onClick={() => setStudents(c)}><Users size={13} /> Inscritos ({enrolled(c.id).length})</button>
                <button className="btn sm ghost" onClick={() => setEdit({ ...c })}><Pencil size={13} /> Editar</button>
              </div>
            </div>
          )
        })}
      </div>

      <Drawer
        open={!!edit}
        title={edit && db.courses.some((c) => c.id === edit.id) ? 'Editar curso' : 'Novo curso'}
        onClose={() => setEdit(null)}
        footer={
          <>
            <button className="btn ghost" onClick={() => setEdit(null)}>Cancelar</button>
            <button className="btn primary" disabled={!edit?.title.trim()} onClick={() => { if (edit) { upsert('courses', edit); toast('Curso salvo'); setEdit(null) } }}>Salvar</button>
          </>
        }>
        {edit && (
          <>
            <Field label="Título"><input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} placeholder="Ex.: Curso de Cabeleireiro" /></Field>
            <Field label="Subtítulo"><input value={edit.subtitle} onChange={(e) => setEdit({ ...edit, subtitle: e.target.value })} /></Field>
            <div className="fields-2">
              <Field label="Área">
                <select value={edit.categoryId} onChange={(e) => setEdit({ ...edit, categoryId: e.target.value as Course['categoryId'] })}>
                  {courseCategories.filter((c) => c.id !== 'todos').map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Nível">
                <select value={edit.level} onChange={(e) => setEdit({ ...edit, level: e.target.value as Course['level'] })}>
                  <option>Iniciante</option><option>Intermediário</option><option>Avançado</option>
                </select>
              </Field>
              <Field label="Modalidade">
                <select value={edit.modality} onChange={(e) => setEdit({ ...edit, modality: e.target.value as Course['modality'] })}>
                  <option>Presencial</option><option>Online</option><option>Híbrido</option>
                </select>
              </Field>
              <Field label="Carga horária (h)"><input type="number" min={1} value={edit.durationHours} onChange={(e) => setEdit({ ...edit, durationHours: Number(e.target.value) })} /></Field>
              <Field label="Início"><input type="date" value={edit.startDate} onChange={(e) => setEdit({ ...edit, startDate: e.target.value })} /></Field>
              <Field label="Vagas"><input type="number" min={1} value={edit.seats} onChange={(e) => setEdit({ ...edit, seats: Number(e.target.value) })} /></Field>
            </div>
            <Field label="Descrição"><textarea value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></Field>
            <Field label="Módulos (um por linha)">
              <textarea value={edit.modules.join('\n')} onChange={(e) => setEdit({ ...edit, modules: e.target.value.split('\n') })} />
            </Field>
            <div className="check-row">Emite certificado <Switch on={edit.certificate} onChange={(v) => setEdit({ ...edit, certificate: v })} /></div>
            <div className="check-row">Publicado no app <Switch on={edit.published} onChange={(v) => setEdit({ ...edit, published: v })} /></div>
          </>
        )}
      </Drawer>

      <Drawer open={!!students} title={`Inscritos · ${students?.title ?? ''}`} onClose={() => setStudents(null)}>
        {students &&
          (enrolled(students.id).length === 0 ? (
            <div className="empty">Nenhum inscrito ainda.</div>
          ) : (
            enrolled(students.id).map((e) => {
              const u = db.users.find((x) => x.id === e.userId)
              return (
                <div key={e.id} className="cell-main">
                  <Avatar name={u?.name ?? '?'} color="#3A3A3C" />
                  <div style={{ flex: 1 }}>
                    <div className="t">{u?.name}</div>
                    <div className="s">{u?.phone} · inscrito em {fmtDate(e.createdAt)}</div>
                  </div>
                  <Badge tone={e.status === 'inscrito' ? 'green' : 'orange'}>{e.status}</Badge>
                </div>
              )
            })
          ))}
      </Drawer>
    </>
  )
}
