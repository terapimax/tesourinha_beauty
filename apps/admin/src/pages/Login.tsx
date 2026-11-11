import { ArrowRight } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { Field, ScissorsMark } from '../components/ui'
import { useStore } from '../data/store'

export default function Login() {
  const { login } = useStore()
  const [email, setEmail] = useState('admin@tesourinha.org.br')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    // MVP: login local. Em produção: Supabase Auth + papel "admin" na tabela profiles.
    if (!email.includes('@') || password.length < 4) {
      setError('Informe um e-mail válido e a senha.')
      return
    }
    login(email)
  }

  return (
    <div className="login">
      <div className="login-art">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <ScissorsMark size={48} />
          <div>
            <div className="brand-name" style={{ fontSize: 22 }}>TESOURINHA</div>
            <div className="brand-sub" style={{ fontSize: 12 }}>BEAUTY</div>
          </div>
        </div>
        <h2>
          Beleza que <em>transforma</em> vidas.
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0 }}>Associação Tesourinha · Qualificação · Oportunidade · Impacto social</p>
      </div>
      <div className="login-form">
        <form onSubmit={submit}>
          <div>
            <h1>Painel administrativo</h1>
            <p className="muted" style={{ margin: '6px 0 12px' }}>Entre para gerenciar agenda, profissionais, cursos e vagas.</p>
          </div>
          <Field label="E-mail">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          </Field>
          <Field label="Senha">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="••••••••" autoFocus />
          </Field>
          {error && <div className="badge b-red plain" style={{ padding: '8px 12px', borderRadius: 10 }}>{error}</div>}
          <button className="btn primary" style={{ height: 46, borderRadius: 14, fontSize: 15 }}>
            Entrar <ArrowRight size={16} />
          </button>
          <p className="muted" style={{ fontSize: 12.5, textAlign: 'center', margin: 0 }}>Versão de demonstração: qualquer senha com 4+ caracteres.</p>
        </form>
      </div>
    </div>
  )
}
