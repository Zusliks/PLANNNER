import { useState } from 'react'
import { done, day } from '../DATA/STORE.js'
import { PRIORITIES, when } from '../UI/BITS.jsx'
import ROW from '../UI/ROW.jsx'

const GROUPS = ['Overdue', 'Today', 'This week', 'Later', 'No date']
const RANK = { High: 0, Medium: 1, Low: 2 }

const greet = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export default function TODAY({ store, user, edit, all }) {
  const [show, setShow] = useState('open')
  const [sort, setSort] = useState('due')
  const [prio, setPrio] = useState('')
  const [draft, setDraft] = useState({ title: '', priority: 'Medium', due: all ? '' : day(0) })
  const change = k => e => setDraft({ ...draft, [k]: e.target.value })

  const add = e => {
    e.preventDefault()
    if (!draft.title.trim()) return
    store.saveTask({ ...draft, title: draft.title.trim(), desc: '', status: 'todo', project: null, assignee: user.id })
    setDraft({ ...draft, title: '' })
  }

  const pool = all ? store.tasks : store.tasks.filter(t => done(t) || ['Overdue', 'Today', 'This week'].includes(when(t.due)))
  let list = pool.filter(t => show === 'all' || (show === 'done') === done(t))
  if (prio) list = list.filter(t => t.priority === prio)
  list.sort(sort === 'due' ? (a, b) => (a.due || '9').localeCompare(b.due || '9') : (a, b) => RANK[a.priority] - RANK[b.priority])

  const count = { open: pool.filter(t => !done(t)).length, done: pool.filter(done).length, all: pool.length }

  return (
    <main className="page">
      <div className="head">
        <div>
          <h1>{all ? 'All tasks' : `${greet()}, ${user.name.split(' ')[0]}`}</h1>
          <p>{all ? 'Everything you have to do, in one list.' : new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
      </div>
      <form className="add" onSubmit={add}>
        <input value={draft.title} onChange={change('title')} placeholder="Add a task, for example Buy groceries" />
        <select value={draft.priority} onChange={change('priority')} aria-label="Priority">
          {PRIORITIES.map(p => <option key={p}>{p}</option>)}
        </select>
        <input type="date" value={draft.due} onChange={change('due')} aria-label="Due date" />
        <button className="btn">Add task</button>
      </form>
      <div className="tabs">
        {[['open', 'Open'], ['done', 'Completed'], ['all', 'All']].map(([s, name]) => <button key={s} className={show === s ? 'on' : ''} onClick={() => setShow(s)}>{name} ({count[s]})</button>)}
        <span className="grow" />
        <select value={prio} onChange={e => setPrio(e.target.value)}>
          <option value="">All priorities</option>
          {PRIORITIES.map(p => <option key={p}>{p}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)}>
          <option value="due">Sort by due date</option>
          <option value="priority">Sort by priority</option>
        </select>
      </div>
      {!list.length && <p className="empty">{show === 'done' ? 'No completed tasks yet.' : 'No tasks here. Add one above.'}</p>}
      {sort === 'due'
        ? GROUPS.map(g => {
          const items = list.filter(t => when(t.due) === g)
          return items.length > 0 && (
            <section key={g}>
              <h3>{g}</h3>
              <div className="list">{items.map(t => <ROW key={t.id} task={t} store={store} edit={edit} />)}</div>
            </section>
          )
        })
        : <div className="list">{list.map(t => <ROW key={t.id} task={t} store={store} edit={edit} />)}</div>}
    </main>
  )
}
