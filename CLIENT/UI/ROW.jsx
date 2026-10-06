import { done, day } from '../DATA/STORE.js'
import { Check, Priority, label } from './BITS.jsx'

export default function ROW({ task, store, edit }) {
  const finished = done(task)
  const late = !finished && task.due && task.due < day(0)
  const project = store.project(task.project)
  const sub = project ? project.name + (task.assignee ? ', ' + store.person(task.assignee).name : '') : task.desc

  const toggle = e => {
    e.stopPropagation()
    if (store.can(task)) store.toggle(task)
  }

  return (
    <div className={finished ? 'row done' : 'row'} onClick={() => edit(task)}>
      <Check done={finished} onClick={toggle} disabled={!store.can(task)} />
      <div className="name">
        <span>{task.title}</span>
        {sub && <small>{sub}</small>}
      </div>
      <Priority priority={task.priority} />
      <span className={late ? 'due late' : 'due'}>{label(task.due)}</span>
    </div>
  )
}
