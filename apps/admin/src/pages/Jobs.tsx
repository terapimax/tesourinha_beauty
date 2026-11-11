import { Pencil, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Avatar, Badge, Drawer, Field, PageHeader, Segmented, Switch, useToast, type Tone } from '../components/ui'
import { fmtDate, useStore, type AdminJob, type ApplicationStatus } from '../data/store'
import type { Job, JobType } from '@shared/types'

const APP_TONE: Record<ApplicationStatus, Tone> = { nova: 'orange', 'em análise': 'blue', aprovada: 'green', recusada: 'gray' }

const blank = (): AdminJob => ({
  id: `j-${Date.now()}`,
  title: '',
  company: '',
  location: '',
  type: 'Tempo integral',
  salary: '',
  postedAt: new Date().toISOString().slice(0, 10),
  icon: 'briefcase-outline',
  description: '',
  requirements: [],
  benefits: [],
  open: true,
})

export default function Jobs() {
  const { db, upsert, patch } = useStore()
  const toast = useToast()
  const [tab, setTab] = useState<'vagas' | 'candidaturas'>('vagas')
  const [edit, setEdit] = useState<AdminJob | null>(null)
  const [status, setStatus] = useState<ApplicationStatus | 'todas'>('todas')

  const apps = useMemo(
    () =>
      db.applications
        .filter((a) => status === 'todas' || a.status === status)
        .map((a) => ({ a, user: db.users.find((u) => u.id === a.userId), job: db.jobs.find((j) => j.id === a.jobId) }))
        .sort((x, y) => y.a.createdAt.localeCompare(x.a.createdAt)),
    [db, status],
  )

  return (
    <>
      <PageHeader title="Vagas e candidaturas" subtitle="Conectando alunos e profissionais a salões parceiros">
        <Segmented value={tab} onChange={setTab} options={[{ value: 'vagas', label: `Vagas (${db.jobs.length})` }, { value: 'candidaturas', label: `Candidaturas (${db.applications.length})` }]} />
        <button className="btn primary" onClick={() => setEdit(blank())}><Plus size={16} /> Nova vaga</button>
      </PageHeader>

      {tab === 'vagas' ? (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Vaga</th>
                  <th>Tipo</th>
                  <th>Remuneração</th>
                  <th>Publicada</th>
                  <th>Candidatos</th>
                  <th>Aberta</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {db.jobs.map((j) => (
                  <tr key={j.id} style={{ opacity: j.open ? 1 : 0.55 }}>
                    <td>
                      <div className="t" style={{ fontWeight: 600 }}>{j.title}</div>
                      <div className="muted" style={{ fontSize: 12.5 }}>{j.company} · {j.location}</div>
                    </td>
                    <td><Badge tone="gray" plain>{j.type}</Badge></td>
                    <td>{j.salary || <span className="muted">A combinar</span>}</td>
                    <td className="muted">{fmtDate(j.postedAt)}</td>
                    <td>
                      <button className="btn sm ghost" onClick={() => { setTab('candidaturas'); setStatus('todas') }}>
                        {db.applications.filter((a) => a.jobId === j.id).length}
                      </button>
                    </td>
                    <td><Switch on={j.open} label="Aberta" onChange={(v) => { patch('jobs', j.id, { open: v }); toast(v ? 'Vaga reaberta' : 'Vaga encerrada') }} /></td>
                    <td className="right"><button className="btn sm" onClick={() => setEdit({ ...j })}><Pencil size={13} /> Editar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="toolbar">
            <Segmented<ApplicationStatus | 'todas'>
              value={status}
              onChange={setStatus}
              options={[
                { value: 'todas', label: 'Todas' },
                { value: 'nova', label: 'Novas' },
                { value: 'em análise', label: 'Em análise' },
                { value: 'aprovada', label: 'Aprovadas' },
                { value: 'recusada', label: 'Recusadas' },
              ]}
            />
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Candidato</th>
                  <th>Vaga</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th className="right">Mover para</th>
                </tr>
              </thead>
              <tbody>
                {apps.map(({ a, user, job }) => (
                  <tr key={a.id}>
                    <td>
                      <div className="cell-main">
                        <Avatar name={user?.name ?? '?'} color="#3A3A3C" />
                        <div>
                          <div className="t">{user?.name}</div>
                          <div className="s">{user?.phone} · {user?.city}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{job?.title}</div>
                      <div className="muted" style={{ fontSize: 12.5 }}>{job?.company}</div>
                    </td>
                    <td className="muted">{fmtDate(a.createdAt)}</td>
                    <td><Badge tone={APP_TONE[a.status]}>{a.status}</Badge></td>
                    <td className="right">
                      <select className="inline" value={a.status} onChange={(e) => { patch('applications', a.id, { status: e.target.value as ApplicationStatus }); toast('Candidatura atualizada') }}>
                        <option value="nova">Nova</option>
                        <option value="em análise">Em análise</option>
                        <option value="aprovada">Aprovada</option>
                        <option value="recusada">Recusada</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {apps.length === 0 && <div className="empty">Nenhuma candidatura nesse status.</div>}
          </div>
        </div>
      )}

      <Drawer
        open={!!edit}
        title={edit && db.jobs.some((j) => j.id === edit.id) ? 'Editar vaga' : 'Nova vaga'}
        onClose={() => setEdit(null)}
        footer={
          <>
            <button className="btn ghost" onClick={() => setEdit(null)}>Cancelar</button>
            <button className="btn primary" disabled={!edit?.title.trim() || !edit?.company.trim()} onClick={() => { if (edit) { upsert('jobs', edit); toast('Vaga salva'); setEdit(null) } }}>Salvar</button>
          </>
        }>
        {edit && (
          <>
            <Field label="Cargo"><input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} placeholder="Ex.: Cabeleireiro(a)" /></Field>
            <div className="fields-2">
              <Field label="Empresa / salão"><input value={edit.company} onChange={(e) => setEdit({ ...edit, company: e.target.value })} /></Field>
              <Field label="Local"><input value={edit.location} onChange={(e) => setEdit({ ...edit, location: e.target.value })} placeholder="Ex.: Zona Sul - SP" /></Field>
              <Field label="Tipo">
                <select value={edit.type} onChange={(e) => setEdit({ ...edit, type: e.target.value as JobType })}>
                  {(['Tempo integral', 'Meio período', 'Freelance', 'Comissionado'] as Job['type'][]).map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Remuneração"><input value={edit.salary ?? ''} onChange={(e) => setEdit({ ...edit, salary: e.target.value })} placeholder="Ex.: R$ 2.000 + comissão" /></Field>
            </div>
            <Field label="Descrição"><textarea value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></Field>
            <Field label="Requisitos (um por linha)"><textarea value={edit.requirements.join('\n')} onChange={(e) => setEdit({ ...edit, requirements: e.target.value.split('\n') })} /></Field>
            <Field label="Benefícios (um por linha)"><textarea value={edit.benefits.join('\n')} onChange={(e) => setEdit({ ...edit, benefits: e.target.value.split('\n') })} /></Field>
            <div className="check-row">Vaga aberta <Switch on={edit.open} onChange={(v) => setEdit({ ...edit, open: v })} /></div>
          </>
        )}
      </Drawer>
    </>
  )
}
