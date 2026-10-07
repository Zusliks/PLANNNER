import { useState } from 'react'

export default function INVITE({ project, store, close }) {
  const [msg, setMsg] = useState('')

  const send = e => {
    e.preventDefault()
    const form = e.target
    store.invite(project.id, form.email.value)
      .then(() => {
        setMsg('Invite sent!')
        form.reset()
      })
      .catch(err => setMsg(err.message))
  }

  return (
    <div className="overlay" onClick={close}>
      <form className="dialog" onClick={e => e.stopPropagation()} onSubmit={send}>
        <header>
          <h2>Invite people</h2>
          <button type="button" onClick={close}>X</button>
        </header>
        <label>
          Email
          <input name="email" type="email" required autoFocus />
        </label>
        <button className="btn">Send invite</button>
        {msg && <p className="msg">{msg}</p>}
        <h3>Waiting for answer</h3>
        <ul>
          {store.sent(project.id).map(i => (
            <li key={i.id}>{i.to} <a href="#" onClick={() => store.revoke(i.id)}>remove</a></li>
          ))}
        </ul>
      </form>
    </div>
  )
}
