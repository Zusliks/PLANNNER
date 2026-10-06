import { useState } from 'react'

const check = (f, reg) => ({
  name: reg && !f.name.trim() ? 'Please enter your name' : '',
  email: /^\S+@\S+\.\S+$/.test(f.email.trim()) ? '' : 'Enter a valid email address, for example name@example.com',
  password: !f.password ? 'Please enter a password' : reg && f.password.length < 8 ? 'Password must be at least 8 characters' : ''
})

const post = async (url, body) => {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Something went wrong.')
  return data
}

export default function AUTH({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState({})
  const [errors, setErrors] = useState({})
  const reg = mode === 'register'
  const set = k => e => setForm({ ...form, [k]: e.target.value })
  const swap = () => { setMode(reg ? 'login' : 'register'); setMsg({}); setErrors({}) }

  const submit = async e => {
    e.preventDefault()
    const bad = check(form, reg)
    setErrors(bad)
    if (Object.values(bad).some(Boolean)) return
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

  const field = (k, label, props) => (
    <label className={errors[k] ? 'field bad' : 'field'}>
      {label}
      <input value={form[k]} onChange={set(k)} {...props} />
      {errors[k] && <span className="error">{errors[k]}</span>}
    </label>
  )

  return (
    <div className="auth">
      <form onSubmit={submit} noValidate>
        <b className="logo">Planner</b>
        <h1>{reg ? 'Create an account' : 'Sign in'}</h1>
        {reg && field('name', 'Name', { autoComplete: 'name' })}
        {field('email', 'Email', { type: 'email', autoComplete: 'email' })}
        <label className={errors.password ? 'field bad' : 'field'}>
          Password
          <span className="pw">
            <input type={show ? 'text' : 'password'} value={form.password} onChange={set('password')} autoComplete={reg ? 'new-password' : 'current-password'} />
            <button type="button" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button>
          </span>
          {errors.password ? <span className="error">{errors.password}</span> : reg && <span className="hint">At least 8 characters</span>}
        </label>
        {msg.error && <p className="error" role="alert">{msg.error}</p>}
        {msg.ok && <p className="ok">{msg.ok}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Please wait...' : reg ? 'Create account' : 'Sign in'}</button>
        <p className="switch">
          {reg ? 'Already have an account? ' : "Don't have an account? "}
          <a onClick={swap}>{reg ? 'Sign in' : 'Create one'}</a>
        </p>
      </form>
    </div>
  )
}
