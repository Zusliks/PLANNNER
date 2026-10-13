import { useState } from 'react'
import { day, done } from '../DATA/STORE.js'
import { when, label, Title } from '../UI/BITS.jsx'

export default function TODAY({ store, user, edit, all }) {
  const [tab, setTab] = useState('open')
  const [prio, setPrio] = useState('')

  let tasks = store.tasks
  if (!all) tasks = tasks.filter(t => done(t) || t.due)
  const open = tasks.filter(t => !done(t))
  const finished = tasks.filter(done)

  let list = tab == 'open' ? open : finished
  if (prio) list = list.filter(t => t.priority == prio)
  list.sort((a, b) => a.due.localeCompare(b.due))

  function add(e) {
    e.preventDefault()
    let f = Object.fromEntries(new FormData(e.target))
    store.save({ ...f, desc: '', status: 'todo', project: null, assignee: user.id })
    e.target.reset()
  }

  const row = t => {
    let late = !done(t) && t.due && t.due < day()
    let p = store.project(t.project)
    return (
      <div key={t.id} className={done(t) ? 'row done' : 'row'}>
        <input type="checkbox" checked={done(t)} disabled={!store.can(t)} onChange={() => store.toggle(t)} />
        <div className="text" onClick={() => edit(t)}>
          <b>{t.title}</b>
          <small>{p ? p.name : t.desc}</small>
        </div>
        <span className={'tag ' + t.priority}>{t.priority}</span>
        <span className={late ? 'due late' : 'due'}>{label(t.due)}</span>
        {late && <span className="stamp">LATE!</span>}
      </div>
    )
  }

  return (
    <main className="page today">
      <div className="left">
        <p className="date">{new Date().toDateString()}</p>
        <Title text={all ? 'ALL TASKS' : 'TODAY'} />
        <h2>Hey {user.name.split(' ')[0]},<br />{open.length} tasks still waiting.</h2>
        <div className="stats">
          <div className="stat"><b>{open.filter(t => when(t.due) == 'Overdue').length}</b>Overdue</div>
          <div className="stat white"><b>{open.filter(t => when(t.due) == 'Today').length}</b>Today</div>
          <div className="stat red"><b>{finished.length}</b>Done</div>
        </div>
        <form className="add" onSubmit={add}>
          <span className="label">New task</span>
          <div className="line">
            <input name="title" required />
            <button className="btn black">ADD +</button>
          </div>
          <div className="line">
            <label className="pick"><input type="radio" name="priority" value="High" /> High</label>
            <label className="pick"><input type="radio" name="priority" value="Medium" defaultChecked /> Medium</label>
            <label className="pick"><input type="radio" name="priority" value="Low" /> Low</label>
            <input name="due" type="date" defaultValue={all ? '' : day()} />
          </div>
        </form>
      </div>

      <div className="right">
        <div className="tabs">
          <button className={tab == 'open' ? 'on' : ''} onClick={() => setTab('open')}>Open {open.length}</button>
          <button className={tab == 'done' ? 'on' : ''} onClick={() => setTab('done')}>Done {finished.length}</button>
          <select value={prio} onChange={e => setPrio(e.target.value)}>
            <option value="">Priority: all</option>
            <option value="High">Priority: high</option>
            <option value="Medium">Priority: medium</option>
            <option value="Low">Priority: low</option>
          </select>
        </div>
        {!list.length && <p>Nothing here.</p>}
        {['Overdue', 'Today', 'Upcoming', 'No date'].map(g => {
          let items = list.filter(t => when(t.due) == g)
          if (!items.length) return null
          return <div key={g}><h3>{g}</h3>{items.map(row)}</div>
        })}
      </div>
    </main>
  )
}
