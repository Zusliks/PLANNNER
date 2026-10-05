import { useState } from 'react'
import DITHER from '../UI/DITHER.jsx'

const LEVELS = [['', 'transparent'], ['Weak', '#f87171'], ['Fair', '#fb923c'], ['Good', '#facc15'], ['Strong', '#4ade80']]
const strength = pw => [/.{8}/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter(r => r.test(pw)).length

const post = async (url, body) => {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Something went wrong.')
  return data
}

const EYE = ({ open }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {open
      ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
      : <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />}
  </svg>
)

export default function AUTH({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState({})
  const reg = mode === 'register'
  const score = strength(form.password)
  const set = k => e => setForm({ ...form, [k]: e.target.value })
  const swap = m => { setMode(m); setMsg({}) }

  const submit = async e => {
    e.preventDefault()
    setBusy(true)
    setMsg({})
    try {
      const { user } = await post(`/api/auth/${mode}`, form)
      if (reg) { setMode('login'); setMsg({ ok: 'Account created. Sign in.' }) } else onAuth(user)
    } catch (err) {
      setMsg({ error: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <div className="auth-bg" aria-hidden="true">
        <DITHER waveColor={[0.557, 0.212, 0.212]} backgroundColor={[0.604, 0.357, 0.357]} colorNum={15.8} waveAmplitude={0.35} mouseRadius={0.3} />
        <div className="auth-shade" />
      </div>
      <form className="panel" onSubmit={submit}>
        <h1>{reg ? 'Create account' : 'Sign in'}</h1>
        <div className={`tabs ${mode}`}>
          <button type="button" className={reg ? '' : 'on'} onClick={() => swap('login')}>Sign in</button>
          <button type="button" className={reg ? 'on' : ''} onClick={() => swap('register')}>Register</button>
        </div>
        <div key={mode} className={`fields ${reg ? 'from-right' : 'from-left'}`}>
          {reg && <label>FULL NAME<input className="input" value={form.name} onChange={set('name')} placeholder="Lauris Zuselis" autoComplete="name" /></label>}
          <label>EMAIL ADDRESS<input className="input" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" /></label>
          <label>PASSWORD
            <span className="pw">
              <input className="input" type={show ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder={reg ? 'Min. 8 characters' : '••••••••'} autoComplete={reg ? 'new-password' : 'current-password'} />
              <button type="button" onClick={() => setShow(!show)}><EYE open={show} /></button>
            </span>
          </label>
          {reg && form.password && (
            <div className="meter">
              {[1, 2, 3, 4].map(i => <i key={i} style={{ background: i <= score ? LEVELS[score][1] : undefined }} />)}
              <small style={{ color: LEVELS[score][1] }}>{LEVELS[score][0]}</small>
            </div>
          )}
          {msg.error && <p className="error" role="alert">{msg.error}</p>}
          {msg.ok && <p className="ok">{msg.ok}</p>}
          <button className="btn" disabled={busy}>{busy ? 'Please wait…' : reg ? 'Create account' : 'Sign in'}</button>
        </div>
        <p className="switch">
          {reg ? 'Already have one? ' : 'No account? '}
          <a onClick={() => swap(reg ? 'login' : 'register')}>{reg ? 'Sign in' : 'Create one'}</a>
        </p>
      </form>
    </div>
  )
}
