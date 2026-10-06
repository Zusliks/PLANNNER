import { useState } from 'react'
import { done } from '../DATA/STORE.js'
import { Shape, PRIORITIES } from './BITS.jsx'

const STATUS = { todo: 'To do', doing: 'Doing', done: 'Done' }

export default function DRAWER({ task, store, close }) {
  const [t, setT] = useState(task)
  const [error, setError] = useState('')
  const can = store.can(task)
  const project = store.project(t.project)
  const set = k => e => setT({ ...t, [k]: e.target.value })

  const save = extra => {
    if (!t.title.trim()) return setError('Title is required')
    store.saveTask({ ...t, ...extra, title: t.title.trim() }).then(close, e => setError(e.message))
  }

  const remove = () => {
    if (!confirm('Delete this task?')) return
    store.removeTask(t.id)
    close()
  }

  return (
    <div className="scrim" onClick={close}>
      <aside className="drawer" onClick={e => e.stopPropagation()}>
        <header>
          <small>{project ? project.name : 'Personal task'}</small>
          <button onClick={close}>X</button>
        </header>
        <input className="big-input" value={t.title} onChange={set('title')} placeholder="Task title" disabled={!can} autoFocus={!t.id} />
        {error && <p className="error">{error}</p>}
        <textarea value={t.desc} onChange={set('desc')} placeholder="Add a description" disabled={!can} />
        <label className="prop">
          <span>Due</span>
          <input type="date" value={t.due} onChange={set('due')} disabled={!can} />
        </label>
        <div className="prop">
          <span>Priority</span>
          {PRIORITIES.map(p => (
            <button key={p} className={t.priority === p ? 'pick on' : 'pick'} onClick={() => setT({ ...t, priority: p })} disabled={!can}>
              <Shape priority={p} />{p}
            </button>
          ))}
        </div>
        {project && (
          <label className="prop">
            <span>Assignee</span>
            <select value={t.assignee || ''} onChange={set('assignee')} disabled={!can}>
              <option value="">Nobody</option>
              {project.members.map(id => <option key={id} value={id}>{store.person(id).name}</option>)}
            </select>
          </label>
        )}
        {project && (
          <label className="prop">
            <span>Status</span>
            <select value={t.status} onChange={set('status')} disabled={!can}>
              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
        )}
        {!can && <p className="note">Only the owner, the creator or the assignee can change this task.</p>}
        {can && (
          <footer>
            <button className="btn" onClick={() => save()}>Save</button>
            {t.id && <button className="btn line" onClick={() => save({ status: done(t) ? 'todo' : 'done' })}>{done(t) ? 'Reopen' : 'Done!'}</button>}
            {t.id && <button className="btn danger" onClick={remove}>Delete</button>}
          </footer>
        )}
      </aside>
    </div>
  )
}
