import { CheckCircle2, Search, X } from 'lucide-react'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

import { initials } from '../data/store'

export function ScissorsMark({ size = 36, color = '#FF6A13' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <path d="M39.7 68.3 L32.3 61.7 L85.3 8.3 L86.7 9.7 Z" fill={color} />
      <path d="M60.3 68.3 L67.7 61.7 L14.7 8.3 L13.3 9.7 Z" fill={color} />
      <circle cx="30" cy="78" r="12" stroke={color} strokeWidth="7.5" fill="none" />
      <circle cx="70" cy="78" r="12" stroke={color} strokeWidth="7.5" fill="none" />
      <circle cx="50" cy="49.3" r="3" fill="#0B0B0C" />
    </svg>
  )
}

export function Brand() {
  return (
    <div className="brand">
      <ScissorsMark size={38} />
      <div>
        <div className="brand-name">TESOURINHA</div>
        <div className="brand-sub">BEAUTY</div>
      </div>
    </div>
  )
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="topbar">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="actions">{children}</div>}
    </div>
  )
}

export function Avatar({ name, color, size }: { name: string; color?: string; size?: 'lg' }) {
  return (
    <div className={`avatar ${size ?? ''}`} style={color ? { background: `linear-gradient(135deg, ${color}, ${color}cc)` } : undefined}>
      {initials(name)}
    </div>
  )
}

export type Tone = 'green' | 'red' | 'orange' | 'blue' | 'gray'
export function Badge({ tone, children, plain }: { tone: Tone; children: ReactNode; plain?: boolean }) {
  return <span className={`badge b-${tone} ${plain ? 'plain' : ''}`}>{children}</span>
}

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="search">
      <Search size={16} />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      {value && (
        <button className="btn ghost icon" style={{ width: 22, height: 22 }} onClick={() => onChange('')} aria-label="Limpar">
          <X size={14} />
        </button>
      )}
    </label>
  )
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="seg" role="tablist">
      {options.map((o) => (
        <button key={o.value} className={o.value === value ? 'on' : ''} onClick={() => onChange(o.value)} role="tab" aria-selected={o.value === value}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return <button type="button" className={`switch ${on ? 'on' : ''}`} onClick={() => onChange(!on)} aria-pressed={on} aria-label={label} />
}

export function Drawer({ title, open, onClose, children, footer }: { title: string; open: boolean; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <>
      <div className="overlay" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label={title}>
        <div className="drawer-head">
          <h2>{title}</h2>
          <button className="btn icon" onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>
        <div className="drawer-body">{children}</div>
        {footer && <div className="drawer-foot">{footer}</div>}
      </aside>
    </>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  )
}

/* Toast */
const ToastCtx = createContext<(msg: string) => void>(() => {})
export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null)
  const show = useCallback((m: string) => {
    setMsg(m)
    window.setTimeout(() => setMsg(null), 2200)
  }, [])
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg && (
        <div className="toast">
          <CheckCircle2 size={18} color="#34C759" /> {msg}
        </div>
      )}
    </ToastCtx.Provider>
  )
}
export const useToast = () => useContext(ToastCtx)
