import { useState } from 'react'
import { done, day } from '../DATA/STORE.js'
import { when, Title } from '../UI/BITS.jsx'
import ROW from '../UI/ROW.jsx'

const GROUPS = ['Overdue', 'Today', 'Upcoming', 'No date']

export default function TODAY({ store, user, edit, all }) {
  const [show, setShow] = useState('open')
  const [prio, setPrio] = useState('')

  const add = e => {
    e.preventDefault()
    const form = Object.fromEntries(new FormData(e.target))
    store.saveTask({ ...form, desc: '', status: 'todo', project: null, assignee: user.id })
    e.target.reset()
  }

  const pool = all ? store.tasks : store.tasks.filter(t => done(t) || when(t.due) !== 'No date')
  const open = pool.filter(t => !done(t))
  const list = (show === 'done' ? pool.filter(done) : open).filter(t => !prio || t.priority === prio).sort((a, b) => a.due.localeCompare(b.due))

  return (
    <main className="page today">
      <div className="left">
        <p className="date">{new Date().toDateString()}</p>
        <Title text={all ? 'ALL TASKS' : 'TODAY'} />
        <h2>Hey {user.name.split(' ')[0]},<br />{open.length} tasks still waiting.</h2>
        <div className="stats">
          <div className="stat"><b>{open.filter(t => when(t.due) === 'Overdue').length}</b>Overdue</div>
          <div className="stat white"><b>{open.filter(t => when(t.due) === 'Today').length}</b>Today</div>
          <div className="stat red"><b>{pool.filter(done).length}</b>Done</div>
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
            <input name="due" type="date" defaultValue={all ? '' : day(0)} />
          </div>
        </form>
      </div>
      <div className="right">
        <div className="tabs">
          <button className={show === 'open' ? 'on' : ''} onClick={() => setShow('open')}>Open {open.length}</button>
          <button className={show === 'done' ? 'on' : ''} onClick={() => setShow('done')}>Done {pool.filter(done).length}</button>
          <select value={prio} onChange={e => setPrio(e.target.value)}>
            <option value="">Priority: all</option>
            <option value="High">Priority: high</option>
            <option value="Medium">Priority: medium</option>
            <option value="Low">Priority: low</option>
          </select>
        </div>
        {list.length === 0 && <p>Nothing here.</p>}
        {GROUPS.map(g => {
          const items = list.filter(t => when(t.due) === g)
          if (items.length === 0) return null
          return (
            <div key={g}>
              <h3>{g}</h3>
              {items.map(t => <ROW key={t.id} task={t} store={store} edit={edit} />)}
            </div>
          )
        })}
      </div>
    </main>
  )
}
