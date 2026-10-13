import { useState } from 'react'
import { day, done } from '../DATA/STORE.js'
import { label, Title } from '../UI/BITS.jsx'

const cols = [['todo', 'To do'], ['doing', 'In progress'], ['done', 'Done']]

export default function PROJECT({ store, user, id, edit, go }) {
  const [inviting, setInviting] = useState(false)
  const [msg, setMsg] = useState('')
  const p = store.project(id)
  if (!p) return null

  const tasks = store.tasks.filter(t => t.project == id)
  const owner = p.owner == user.id
  const short = name => name.split(' ').map(w => w[0]).join('')

  function drop() {
    if (!confirm(`Delete "${p.name}" and all its tasks?`)) return
    store.dropProject(id).then(() => go('projects'))
  }

  function invite(e) {
    e.preventDefault()
    let form = e.target
    store.invite(id, form.email.value)
      .then(() => { setMsg('Invite sent!'); form.reset() })
      .catch(err => setMsg(err.message))
  }

  return (
    <main className="page project">
      <div className="top">
        <a href="#" onClick={() => go('projects')}>PROJECTS</a> /
        <Title text={p.name.toUpperCase()} small />
      </div>
      <p>
        {owner ? 'You own this project.' : 'Owner: ' + store.person(p.owner).name + '.'} {p.members.length} members, {tasks.length} tasks.
        <button className="btn black" onClick={() => edit({ title: '', desc: '', due: '', priority: 'Medium', status: 'todo', project: id, assignee: '' })}>ADD TASK +</button>
      </p>

      <div className="board">
        {cols.map(([s, name]) => {
          let col = tasks.filter(t => t.status == s)
          return (
            <div key={s} className="col">
              <h3 className={s}>{name} {col.length}</h3>
              {col.map(t => (
                <div key={t.id} className={done(t) ? 'card done' : 'card'} onClick={() => edit(t)}>
                  <b>{t.title}</b>
                  <div>
                    <span className={'tag ' + t.priority}>{t.priority}</span>
                    <span className={t.due && t.due < day() && !done(t) ? 'late' : ''}>{t.due && label(t.due)}</span>
                    {t.assignee && <span className="who">{short(store.person(t.assignee).name)}</span>}
                  </div>
                </div>
              ))}
            </div>
          )
        })}
        <div className="box">
          <h3>Members</h3>
          {p.members.map(m => <p key={m}><b>{store.person(m).name}</b><br /><small>{m == p.owner ? 'owner' : 'member'}</small></p>)}
          {owner && store.sent(id).map(i => <p key={i.id}><small>Invited: {i.to}</small></p>)}
          {owner && <button className="btn white" onClick={() => { setInviting(true); setMsg('') }}>INVITE +</button>}
          {owner && <p><button className="btn red" onClick={drop}>DELETE PROJECT</button></p>}
        </div>
      </div>

      {inviting && (
        <div className="overlay" onClick={() => setInviting(false)}>
          <form className="dialog" onClick={e => e.stopPropagation()} onSubmit={invite}>
            <header>
              <h2>Invite people</h2>
              <button type="button" onClick={() => setInviting(false)}>X</button>
            </header>
            <label>
              Email
              <input name="email" type="email" required autoFocus />
            </label>
            <button className="btn">Send invite</button>
            {msg && <p className="msg">{msg}</p>}
            <h3>Waiting for answer</h3>
            <ul>
              {store.sent(id).map(i => <li key={i.id}>{i.to} <a href="#" onClick={() => store.revoke(i.id)}>remove</a></li>)}
            </ul>
          </form>
        </div>
      )}
    </main>
  )
}
