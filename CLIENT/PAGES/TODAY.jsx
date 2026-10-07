import { useState } from 'react'
import { done, day } from '../DATA/STORE.js'
import { when } from '../UI/BITS.jsx'
import ROW from '../UI/ROW.jsx'

const GROUPS = ['Overdue', 'Today', 'Upcoming', 'No date']
const RANK = { High: 0, Medium: 1, Low: 2 }

export default function TODAY({ store, user, edit, all }) {
  const [show, setShow] = useState('open')
  const [sort, setSort] = useState('due')
  const [prio, setPrio] = useState('')

  const add = e => {
    e.preventDefault()
    const form = Object.fromEntries(new FormData(e.target))
    store.saveTask({ ...form, desc: '', status: 'todo', project: null, assignee: user.id })
    e.target.reset()
  }

  const pool = all ? store.tasks : store.tasks.filter(t => done(t) || when(t.due) !== 'No date')
  let list = pool.filter(t => show === 'all' || (show === 'done') === done(t))
  if (prio) list = list.filter(t => t.priority === prio)
  list.sort(sort === 'due' ? (a, b) => (a.due || '9').localeCompare(b.due || '9') : (a, b) => RANK[a.priority] - RANK[b.priority])

  return (
    <main className="page">
      <h1>{all ? 'All tasks' : `Hello, ${user.name.split(' ')[0]}`}</h1>
      <p>{new Date().toDateString()}</p>
      <form className="add" onSubmit={add}>
        <input name="title" required />
        <select name="priority" defaultValue="Medium">
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        <input name="due" type="date" defaultValue={all ? '' : day(0)} />
        <button className="btn">Add task</button>
      </form>
      <div className="tabs">
        <button className={show === 'open' ? 'on' : ''} onClick={() => setShow('open')}>Open ({pool.filter(t => !done(t)).length})</button>
        <button className={show === 'done' ? 'on' : ''} onClick={() => setShow('done')}>Completed ({pool.filter(done).length})</button>
        <select value={sort} onChange={e => setSort(e.target.value)}>
          <option value="due">Sort by: Due date</option>
          <option value="priority">Sort by: Priority</option>
        </select>
        <select value={prio} onChange={e => setPrio(e.target.value)}>
          <option value="">Priority: All</option>
          <option value="High">Priority: High</option>
          <option value="Medium">Priority: Medium</option>
          <option value="Low">Priority: Low</option>
        </select>
      </div>
      {list.length === 0 && <p>No tasks.</p>}
      {sort === 'priority' && (
        <table>
          <tbody>
            {list.map(t => <ROW key={t.id} task={t} store={store} edit={edit} />)}
          </tbody>
        </table>
      )}
      {sort === 'due' && GROUPS.map(g => {
        const items = list.filter(t => when(t.due) === g)
        if (items.length === 0) return null
        return (
          <div key={g}>
            <h3>{g}</h3>
            <table>
              <tbody>
                {items.map(t => <ROW key={t.id} task={t} store={store} edit={edit} />)}
              </tbody>
            </table>
          </div>
        )
      })}
    </main>
  )
}
