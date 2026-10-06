import { useState } from 'react'
import { done, day } from '../DATA/STORE.js'
import { Check, Priority, label } from '../UI/BITS.jsx'
import { STATUS } from '../UI/TASK.jsx'
import INVITE from '../UI/INVITE.jsx'

export default function PROJECT({ store, user, id, edit, go }) {
  const [inviting, setInviting] = useState(false)
  const [tab, setTab] = useState('all')
  const p = store.project(id)
  if (!p) return null
  const tasks = store.tasks.filter(t => t.project === id)
  const finished = tasks.filter(done).length
  const owner = p.owner === user.id
  const list = tasks.filter(t => tab === 'all' || t.status === tab)
  const who = t => t.assignee ? store.person(t.assignee).name : 'Nobody'

  const toggle = (e, t) => {
    e.stopPropagation()
    store.toggle(t)
  }

  return (
    <main className="page">
      <button className="crumb" onClick={() => go('projects')}>Projects</button>
      <div className="head">
        <div>
          <h1>{p.name}</h1>
          <p>{owner ? 'You own this project' : `Owner: ${store.person(p.owner).name}`}. {p.members.length} members, {tasks.length ? `${finished} of ${tasks.length} tasks done.` : 'no tasks yet.'}</p>
        </div>
        {owner && <button className="btn line" onClick={() => setInviting(true)}>Invite people</button>}
        <button className="btn" onClick={() => edit({ title: '', desc: '', due: '', priority: 'Medium', status: 'todo', project: id, assignee: '' })}>Add task</button>
      </div>
      <div className="split">
        <div>
          <div className="tabs">
            {[['all', 'All'], ...Object.entries(STATUS)].map(([s, name]) => (
              <button key={s} className={tab === s ? 'on' : ''} onClick={() => setTab(s)}>
                {name} ({s === 'all' ? tasks.length : tasks.filter(t => t.status === s).length})
              </button>
            ))}
          </div>
          {list.length > 0
            ? (
              <table>
                <thead>
                  <tr><th>Task</th><th className="wide">Assignee</th><th className="wide">Due</th><th className="wide">Priority</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {list.map(t => (
                    <tr key={t.id} className={done(t) ? 'done' : ''} onClick={() => edit(t)}>
                      <td>
                        <div className="task">
                          <Check done={done(t)} onClick={e => toggle(e, t)} disabled={!store.can(t)} />
                          <div className="name">
                            <span>{t.title}</span>
                            <small className="sm">{who(t)}{t.due && `, ${label(t.due)}`}</small>
                          </div>
                        </div>
                      </td>
                      <td className="wide">{who(t)}</td>
                      <td className={t.due && t.due < day(0) && !done(t) ? 'wide late' : 'wide'}>{label(t.due)}</td>
                      <td className="wide"><Priority priority={t.priority} /></td>
                      <td className={t.status === 'doing' ? 'accent' : 'muted'}>{STATUS[t.status]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
            : <p className="empty">No tasks here yet.</p>}
        </div>
        <aside className="box">
          <h3>Members</h3>
          {p.members.map(m => (
            <div key={m} className="member">
              <span>{store.person(m).name}</span>
              <small>{m === p.owner ? 'Owner' : 'Member'}</small>
            </div>
          ))}
          {owner && store.sent(id).map(i => <small key={i.id}>Invited: {i.to}</small>)}
          {owner && <button className="link" onClick={() => setInviting(true)}>Invite people</button>}
        </aside>
      </div>
      {inviting && <INVITE project={p} store={store} close={() => setInviting(false)} />}
    </main>
  )
}
