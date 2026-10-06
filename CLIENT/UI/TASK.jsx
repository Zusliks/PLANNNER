import { useState } from 'react'
import { PRIORITIES } from './BITS.jsx'

export const STATUS = { todo: 'To do', doing: 'In progress', done: 'Done' }

export default function TASK({ task, store, close }) {
  const [t, setT] = useState(task)
  const [error, setError] = useState('')
  const can = store.can(task)
  const project = store.project(t.project)
  const set = k => e => setT({ ...t, [k]: e.target.value })

  const save = e => {
    e.preventDefault()
    if (!t.title.trim()) return setError('Please enter a title')
    store.saveTask({ ...t, title: t.title.trim() }).then(close, e => setError(e.message))
  }

  const remove = () => {
    if (!confirm('Delete this task?')) return
    store.removeTask(t.id)
    close()
  }

  return (
    <div className="overlay" onClick={close}>
      <form className="dialog" onClick={e => e.stopPropagation()} onSubmit={save}>
        <header>
          <h2>{t.id ? (can ? 'Edit task' : 'Task') : 'New task'}</h2>
          <button type="button" onClick={close}>Close</button>
        </header>
        {project && <small>{project.name}</small>}
        <label className={error ? 'field bad' : 'field'}>
          Title
          <input value={t.title} onChange={set('title')} disabled={!can} autoFocus={!t.id} />
          {error && <span className="error">{error}</span>}
        </label>
        <label className="field">
          Description
          <textarea value={t.desc} onChange={set('desc')} disabled={!can} rows="3" />
        </label>
        <div className="pair">
          <label className="field">
            Due date
            <input type="date" value={t.due} onChange={set('due')} disabled={!can} />
          </label>
          <label className="field">
            Priority
            <select value={t.priority} onChange={set('priority')} disabled={!can}>
              {PRIORITIES.map(p => <option key={p}>{p}</option>)}
            </select>
          </label>
        </div>
        <div className="pair">
          {project && (
            <label className="field">
              Assignee
              <select value={t.assignee || ''} onChange={set('assignee')} disabled={!can}>
                <option value="">Nobody</option>
                {project.members.map(id => <option key={id} value={id}>{store.person(id).name}</option>)}
              </select>
            </label>
          )}
          <label className="field">
            Status
            <select value={t.status} onChange={set('status')} disabled={!can}>
              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
        </div>
        {!can && <p className="note">Only the project owner, the creator or the assignee can change this task.</p>}
        {can && (
          <footer>
            {t.id && <button type="button" className="btn danger" onClick={remove}>Delete</button>}
            <span className="grow" />
            <button type="button" className="btn line" onClick={close}>Cancel</button>
            <button className="btn">{t.id ? 'Save changes' : 'Add task'}</button>
          </footer>
        )}
      </form>
    </div>
  )
}
