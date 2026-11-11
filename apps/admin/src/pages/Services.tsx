import { Pencil, Plus } from 'lucide-react'
import { useState } from 'react'

import { Badge, Drawer, Field, PageHeader, Switch, useToast } from '../components/ui'
import { money, useStore, type AdminService } from '../data/store'
import { categories } from '@shared/catalog'
import type { CategoryId } from '@shared/types'

export default function Services() {
  const { db, upsert, patch } = useStore()
  const toast = useToast()
  const [edit, setEdit] = useState<AdminService | null>(null)

  const count = (id: string) => db.bookings.filter((b) => b.serviceId === id && b.status !== 'cancelado').length
  const pros = (id: string) => db.professionals.filter((p) => p.serviceIds.includes(id)).length

  return (
    <>
      <PageHeader title="Serviços" subtitle="Catálogo exibido no app, com preços de referência">
        <button className="btn primary" onClick={() => setEdit({ id: `s-${Date.now()}`, categoryId: 'cabelo', name: '', description: '', durationMin: 60, priceFrom: 50, icon: 'cut-outline', active: true })}>
          <Plus size={16} /> Novo serviço
        </button>
      </PageHeader>
      <div className="grid" style={{ gap: 18 }}>
        {categories.map((c) => {
          const list = db.services.filter((s) => s.categoryId === c.id)
          if (!list.length) return null
          return (
            <div className="card" key={c.id}>
              <div className="card-head" style={{ paddingBottom: 10 }}>
                <h3>{c.name}</h3>
                <span>{list.length} serviço(s)</span>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Serviço</th>
                      <th>Duração</th>
                      <th>A partir de</th>
                      <th>Profissionais</th>
                      <th>Agendamentos</th>
                      <th>Ativo</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((s) => (
                      <tr key={s.id} style={{ opacity: s.active ? 1 : 0.55 }}>
                        <td>
                          <div className="t" style={{ fontWeight: 600 }}>{s.name}</div>
                          <div className="muted" style={{ fontSize: 12.5 }}>{s.description}</div>
                        </td>
                        <td>{s.durationMin} min</td>
                        <td><strong>{money(s.priceFrom)}</strong></td>
                        <td><Badge tone="gray" plain>{pros(s.id)}</Badge></td>
                        <td>{count(s.id)}</td>
                        <td><Switch on={s.active} label="Ativo" onChange={(v) => { patch('services', s.id, { active: v }); toast('Serviço atualizado') }} /></td>
                        <td className="right"><button className="btn sm" onClick={() => setEdit({ ...s })}><Pencil size={13} /> Editar</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>

      <Drawer
        open={!!edit}
        title={edit && db.services.some((s) => s.id === edit.id) ? 'Editar serviço' : 'Novo serviço'}
        onClose={() => setEdit(null)}
        footer={
          <>
            <button className="btn ghost" onClick={() => setEdit(null)}>Cancelar</button>
            <button className="btn primary" disabled={!edit?.name.trim()} onClick={() => { if (edit) { upsert('services', edit); toast('Serviço salvo'); setEdit(null) } }}>Salvar</button>
          </>
        }>
        {edit && (
          <>
            <Field label="Nome"><input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
            <Field label="Categoria">
              <select value={edit.categoryId} onChange={(e) => setEdit({ ...edit, categoryId: e.target.value as CategoryId })}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <div className="fields-2">
              <Field label="Duração (min)"><input type="number" min={5} step={5} value={edit.durationMin} onChange={(e) => setEdit({ ...edit, durationMin: Number(e.target.value) })} /></Field>
              <Field label="Preço a partir de (R$)"><input type="number" min={0} value={edit.priceFrom} onChange={(e) => setEdit({ ...edit, priceFrom: Number(e.target.value) })} /></Field>
            </div>
            <Field label="Descrição"><textarea value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></Field>
            <div className="check-row">Visível no app <Switch on={edit.active} onChange={(v) => setEdit({ ...edit, active: v })} /></div>
          </>
        )}
      </Drawer>
    </>
  )
}
