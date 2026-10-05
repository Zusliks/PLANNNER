import { useState } from 'react'
import { done, day } from '../DATA/STORE.js'
import { Avatar, Progress, Shape, label, pad } from '../UI/BITS.jsx'
import INVITE from '../UI/INVITE.jsx'

const COLUMNS = [['todo', 'to do'], ['doing', 'doing'], ['done', 'done']]

export default function PROJECT({ store, user, id, edit, go }) {
  const [inviting, setInviting] = useState(false)
  const p = store.project(id)
  if (!p) return null
  const tasks = store.tasks.filter(t => t.project === id)
  const finished = tasks.filter(done).length
  const owner = p.owner === user.id

  return (
    <main className="page">
      <section className="side">
        <button className="link" onClick={() => go('projects')}>Projects /</button>
        <h1 className="title">{p.name}</h1>
        <div className="stat">
          <Progress value={tasks.length ? finished / tasks.length : 0} size={112} />
          <p>
            {finished} of {tasks.length} done<br />
            {owner ? 'You own this project' : `Owner: ${store.person(p.owner).name}`}
          </p>
        </div>
        <div className="members">
          <span className="avatars">{p.members.map(m => <Avatar key={m} name={store.person(m).name} size={32} />)}</span>
          {owner && <button className="btn line" onClick={() => setInviting(true)}>+ Invite</button>}
        </div>
      </section>
      <section className="board">
        {COLUMNS.map(([status, name]) => {
          const list = tasks.filter(t => t.status === status)
          return (
            <div key={status} className="col">
              <h3><span>{pad(list.length)}</span>{name}</h3>
              {list.map(t => (
                <button key={t.id} className={status === 'done' ? 'card done' : 'card'} onClick={() => edit(t)}>
                  <b>{t.title}</b>
                  <footer>
                    <Shape priority={t.priority} />
                    <small className={t.due && t.due < day(0) && status !== 'done' ? 'late' : ''}>{label(t.due)}</small>
                    {t.assignee && <Avatar name={store.person(t.assignee).name} size={22} />}
                  </footer>
                </button>
              ))}
              <button className="add" onClick={() => edit({ title: '', desc: '', due: '', priority: 'Medium', status, project: id, assignee: '' })}>+ add</button>
            </div>
          )
        })}
      </section>
      {inviting && <INVITE project={p} store={store} close={() => setInviting(false)} />}
    </main>
  )
}
