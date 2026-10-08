import { useState } from 'react'
import { done, day } from '../DATA/STORE.js'
import { label, Title } from '../UI/BITS.jsx'
import { STATUS } from '../UI/TASK.jsx'
import INVITE from '../UI/INVITE.jsx'

export default function PROJECT({ store, user, id, edit, go }) {
  const [inviting, setInviting] = useState(false)
  const p = store.project(id)
  if (!p) return null
  const tasks = store.tasks.filter(t => t.project === id)
  const owner = p.owner === user.id
  const short = name => name.split(' ').map(w => w[0]).join('')

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
        {Object.entries(STATUS).map(([s, name]) => {
          const col = tasks.filter(t => t.status === s)
          return (
            <div key={s} className="col">
              <h3 className={s}>{name} {col.length}</h3>
              {col.map(t => (
                <div key={t.id} className={done(t) ? 'card done' : 'card'} onClick={() => edit(t)}>
                  <b>{t.title}</b>
                  <div>
                    <span className={'tag ' + t.priority}>{t.priority}</span>
                    <span className={t.due && t.due < day(0) && !done(t) ? 'late' : ''}>{t.due && label(t.due)}</span>
                    {t.assignee && <span className="who">{short(store.person(t.assignee).name)}</span>}
                  </div>
                </div>
              ))}
            </div>
          )
        })}
        <div className="box">
          <h3>Members</h3>
          {p.members.map(m => <p key={m}><b>{store.person(m).name}</b><br /><small>{m === p.owner ? 'owner' : 'member'}</small></p>)}
          {owner && store.sent(id).map(i => <p key={i.id}><small>Invited: {i.to}</small></p>)}
          {owner && <button className="btn white" onClick={() => setInviting(true)}>INVITE +</button>}
        </div>
      </div>
      {inviting && <INVITE project={p} store={store} close={() => setInviting(false)} />}
    </main>
  )
}
