import { useState } from 'react'
import { done, day } from '../DATA/STORE.js'
import { label } from '../UI/BITS.jsx'
import { STATUS } from '../UI/TASK.jsx'
import INVITE from '../UI/INVITE.jsx'

export default function PROJECT({ store, user, id, edit, go }) {
  const [inviting, setInviting] = useState(false)
  const [status, setStatus] = useState('')
  const [person, setPerson] = useState('')
  const p = store.project(id)
  if (!p) return null
  const tasks = store.tasks.filter(t => t.project === id)
  const owner = p.owner === user.id
  let list = tasks
  if (status) list = list.filter(t => t.status === status)
  if (person) list = list.filter(t => t.assignee === person)

  return (
    <main className="page">
      <a href="#" onClick={() => go('projects')}>Projects</a> / {p.name}
      <h1>{p.name}</h1>
      <p>{owner ? 'You own this project.' : 'Owner: ' + store.person(p.owner).name} {p.members.length} members, {tasks.length} tasks.</p>
      <p>
        <button className="btn" onClick={() => edit({ title: '', desc: '', due: '', priority: 'Medium', status: 'todo', project: id, assignee: '' })}>Add task</button>
        {owner && <button className="btn white" onClick={() => setInviting(true)}>Invite people</button>}
      </p>
      <div className="split">
        <div>
          <p>
            Status:{' '}
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">All</option>
              <option value="todo">To do</option>
              <option value="doing">In progress</option>
              <option value="done">Done</option>
            </select>
            {' '}Assignee:{' '}
            <select value={person} onChange={e => setPerson(e.target.value)}>
              <option value="">Everyone</option>
              {p.members.map(m => <option key={m} value={m}>{store.person(m).name}</option>)}
            </select>
          </p>
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Task</th>
                <th>Assignee</th>
                <th>Due</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map(t => (
                <tr key={t.id} className={done(t) ? 'done' : ''}>
                  <td className="check"><input type="checkbox" checked={done(t)} disabled={!store.can(t)} onChange={() => store.toggle(t)} /></td>
                  <td className="click" onClick={() => edit(t)}>{t.title}</td>
                  <td>{t.assignee ? store.person(t.assignee).name : 'Nobody'}</td>
                  <td className={t.due && t.due < day(0) && !done(t) ? 'late' : ''}>{t.due && label(t.due)}</td>
                  <td className={t.priority === 'High' ? 'high' : ''}>{t.priority}</td>
                  <td>{STATUS[t.status]}</td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan="6">No tasks.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="box">
          <h3>Members</h3>
          <ul>
            {p.members.map(m => <li key={m}>{store.person(m).name} ({m === p.owner ? 'owner' : 'member'})</li>)}
            {owner && store.sent(id).map(i => <li key={i.id}>{i.to} (invited)</li>)}
          </ul>
        </div>
      </div>
      {inviting && <INVITE project={p} store={store} close={() => setInviting(false)} />}
    </main>
  )
}
