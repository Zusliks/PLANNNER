import { useState } from 'react'
import { api } from '../DATA/STORE.js'
import { Title } from '../UI/BITS.jsx'

export default function AUTH({ onAuth }) {
  const [reg, setReg] = useState(false)
  const [msg, setMsg] = useState('')

  const submit = e => {
    e.preventDefault()
    const form = Object.fromEntries(new FormData(e.target))
    if (reg && !form.name.trim()) return setMsg('Write your name and try again.')
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setMsg('Email must look like xxx@xxx.com, try again.')
    if (form.password.length < (reg ? 8 : 1)) return setMsg(reg ? 'Password needs 8 characters, try again.' : 'Write your password and try again.')
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
      <div className="intro">
        <Title text="PLANNER" />
        <h2>STEAL BACK YOUR TIME.</h2>
        <p>Tasks, deadlines and shared projects in one place.</p>
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
