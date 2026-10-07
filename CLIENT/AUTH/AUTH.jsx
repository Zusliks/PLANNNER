import { useState } from 'react'
import { api } from '../DATA/STORE.js'

export default function AUTH({ onAuth }) {
  const [reg, setReg] = useState(false)
  const [msg, setMsg] = useState('')

  const submit = e => {
    e.preventDefault()
    const form = Object.fromEntries(new FormData(e.target))
    api(reg ? '/auth/register' : '/auth/login', 'POST', form)
      .then(data => {
        if (reg) {
          setReg(false)
          setMsg('Account created, you can sign in now.')
        } else {
          onAuth(data.user)
        }
      })
      .catch(err => setMsg(err.message))
  }

  return (
    <div className="auth">
      <form key={reg} onSubmit={submit}>
        <b>Planner</b>
        <h1>{reg ? 'Create an account' : 'Sign in'}</h1>
        {reg && (
          <label>
            Name
            <input name="name" required />
          </label>
        )}
        <label>
          Email
          <input name="email" type="email" required />
        </label>
        <label>
          Password
          <input name="password" type="password" required minLength={reg ? 8 : undefined} />
          {reg && <small>At least 8 characters</small>}
        </label>
        {msg && <p className="msg">{msg}</p>}
        <button className="btn">{reg ? 'Create account' : 'Sign in'}</button>
        <p>
          {reg ? 'Already have an account? ' : "Don't have an account? "}
          <a href="#" onClick={() => { setReg(!reg); setMsg('') }}>{reg ? 'Sign in' : 'Create one'}</a>
        </p>
      </form>
    </div>
  )
}
