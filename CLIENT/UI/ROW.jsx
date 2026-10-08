import { done, day } from '../DATA/STORE.js'
import { label } from './BITS.jsx'

export default function ROW({ task, store, edit }) {
  const project = store.project(task.project)
  const late = !done(task) && task.due && task.due < day(0)

  return (
    <div className={done(task) ? 'row done' : 'row'}>
      <input type="checkbox" checked={done(task)} disabled={!store.can(task)} onChange={() => store.toggle(task)} />
      <div className="text" onClick={() => edit(task)}>
        <b>{task.title}</b>
        <small>{project ? project.name : task.desc}</small>
      </div>
      <span className={'tag ' + task.priority}>{task.priority}</span>
      <span className={late ? 'due late' : 'due'}>{label(task.due)}</span>
      {late && <span className="stamp">LATE!</span>}
    </div>
  )
}
