import { useState } from 'react'
import { api } from '../DATA/STORE.js'
import { Title } from '../UI/BITS.jsx'

export default function AUTH({ onLogin }) {
  const [reg, setReg] = useState(false)
  const [msg, setMsg] = useState('')

  async function submit(e) {
    e.preventDefault()
    let f = Object.fromEntries(new FormData(e.target))
    if (reg && !f.name.trim()) return setMsg('Write your name and try again.')
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setMsg('Email must look like xxx@xxx.com, try again.')
    if (reg && f.password.length < 8) return setMsg('Password needs 8 characters, try again.')
    if (!f.password) return setMsg('Write your password and try again.')

    try {
      let data = await api(reg ? '/auth/register' : '/auth/login', 'POST', f)
      if (!reg) return onLogin(data.user)
      setReg(false)
      setMsg('Account created, you can sign in now.')
    } catch (err) {
      setMsg(err.message)
    }
  }

  return (
    <div className="auth">
      <div className="intro">
        <Title text="PLANNER" />
      </div>
      <form key={reg} onSubmit={submit} noValidate>
        <Title text={reg ? 'JOIN' : 'SIGN IN'} small />
        {reg && (
          <label>
            Name
            <input name="name" />
          </label>
        )}
        <label>
          Email
          <input name="email" type="email" />
        </label>
        <label>
          Password
          <input name="password" type="password" />
          {reg && <small>At least 8 characters</small>}
        </label>
        {msg && <p className="msg">{msg}</p>}
        <button className="btn">{reg ? 'CREATE ACCOUNT' : "LET'S GO"}</button>
        <p>
          {reg ? 'Already have an account? ' : "Don't have an account? "}
          <a href="#" onClick={() => { setReg(!reg); setMsg('') }}>{reg ? 'Sign in' : 'Create one'}</a>
        </p>
      </form>
    </div>
  )
}
