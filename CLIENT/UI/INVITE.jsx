import { useState } from 'react'

export default function INVITE({ project, store, close }) {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState({})

  const send = e => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setMsg({ error: 'Please enter a valid email' })
    store.invite(project.id, email)
      .then(() => { setMsg({ ok: 'Invite sent' }); setEmail('') })
      .catch(e => setMsg({ error: e.message }))
  }

  return (
    <div className="overlay" onClick={close}>
      <form className="dialog" onClick={e => e.stopPropagation()} onSubmit={send}>
        <header>
          <h2>Invite people</h2>
          <button type="button" onClick={close}>Close</button>
        </header>
        <p className="note">Invite someone who already has a Planner account. They can accept or decline in their inbox.</p>
        <label className={msg.error ? 'field bad' : 'field'}>
          Email
          <span className="row-input">
            <input autoFocus value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" />
            <button className="btn">Send invite</button>
          </span>
          {msg.error && <span className="error">{msg.error}</span>}
          {msg.ok && <span className="ok">{msg.ok}</span>}
        </label>
        {store.sent(project.id).length > 0 && <h3>Waiting for an answer</h3>}
        {store.sent(project.id).map(i => (
          <div key={i.id} className="member">
            <span>{i.to}</span>
            <button type="button" className="link" onClick={() => store.revoke(i.id)}>Revoke</button>
          </div>
        ))}
      </form>
    </div>
  )
}
