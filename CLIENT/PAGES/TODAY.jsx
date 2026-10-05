import { useState } from 'react'
import { done, day } from '../DATA/STORE.js'
import { PRIORITIES, when, pad } from '../UI/BITS.jsx'
import ROW from '../UI/ROW.jsx'

const GROUPS = ['overdue', 'today', 'this week', 'later', 'no date']
const RANK = { High: 0, Medium: 1, Low: 2 }

const greet = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export default function TODAY({ store, user, edit, all }) {
  const [show, setShow] = useState('open')
  const [sort, setSort] = useState('due')
  const [prio, setPrio] = useState('')
  const [text, setText] = useState('')

  const add = e => {
    e.preventDefault()
    const p = text.match(/!(high|medium|low)/i)
    const title = text.replace(/!(high|medium|low)/i, '').trim()
    if (!title) return
    store.saveTask({ title, desc: '', due: all ? '' : day(0), priority: p ? p[1][0].toUpperCase() + p[1].slice(1).toLowerCase() : 'Medium', status: 'todo', project: null, assignee: user.id })
    setText('')
  }

  let list = store.tasks.filter(t => show === 'all' || (show === 'done') === done(t))
  if (!all) list = list.filter(t => ['overdue', 'today', 'this week'].includes(when(t.due)))
  if (prio) list = list.filter(t => t.priority === prio)
  list.sort(sort === 'due' ? (a, b) => (a.due || '9').localeCompare(b.due || '9') : (a, b) => RANK[a.priority] - RANK[b.priority])

  const open = store.tasks.filter(t => !done(t))
  const left = all
    ? <><small>All tasks</small><h1 className="big">{pad(open.length)}</h1><h2>Things to do</h2></>
    : <><small>{new Date().toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric' })}</small><h1 className="big">{pad(new Date().getDate())}</h1><h2>{greet()}, {user.name.split(' ')[0]}.</h2></>

  return (
    <main className="page">
      <section className="side">
        {left}
        <p>{open.length} open, {store.tasks.length - open.length} done</p>
      </section>
      <section>
        <form className="quick" onSubmit={add}>
          <span>+</span>
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Add a task..." />
          <small>!high !low</small>
        </form>
        <div className="filters">
          {['open', 'done', 'all'].map(s => <button key={s} className={show === s ? 'on' : ''} onClick={() => setShow(s)}>{s}</button>)}
          <span className="grow" />
          <select value={prio} onChange={e => setPrio(e.target.value)}>
            <option value="">Any priority</option>
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)}>
            <option value="due">Sort by date</option>
            <option value="priority">Sort by priority</option>
          </select>
        </div>
        {!list.length && <p className="empty">Nothing here.</p>}
        {sort === 'due'
          ? GROUPS.map(g => {
            const items = list.filter(t => when(t.due) === g)
            return items.length > 0 && (
              <div key={g}>
                <small className="group">{g}</small>
                {items.map(t => <ROW key={t.id} task={t} store={store} edit={edit} />)}
              </div>
            )
          })
          : list.map(t => <ROW key={t.id} task={t} store={store} edit={edit} />)}
      </section>
    </main>
  )
}
