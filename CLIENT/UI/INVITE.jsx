import { useState } from 'react'
import { Avatar } from './BITS.jsx'

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
    <div className="popup" onClick={close}>
      <div onClick={e => e.stopPropagation()}>
        <header>
          Invite to the project
          <button onClick={close}>X</button>
        </header>
        <form onSubmit={send}>
          <input autoFocus value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
          <button className="btn">Send</button>
        </form>
        {msg.error && <p className="error">{msg.error}</p>}
        {msg.ok && <p className="ok">{msg.ok}</p>}
        <small>Members</small>
        {project.members.map(id => {
          const m = store.person(id)
          return (
            <div key={id} className="member">
              <Avatar name={m.name} size={28} />
              <div>{m.name}<small>{m.email}</small></div>
              <small>{id === project.owner ? 'owner' : 'member'}</small>
            </div>
          )
        })}
        {store.sent(project.id).map(i => (
          <div key={i.id} className="member">
            <span className="avatar none" />
            <div>{i.to}<small>invited {i.date}</small></div>
            <button className="late" onClick={() => store.revoke(i.id)}>revoke</button>
          </div>
        ))}
      </div>
    </div>
  )
}
