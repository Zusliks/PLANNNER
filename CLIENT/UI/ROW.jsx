import { done, day } from '../DATA/STORE.js'
import { Ring, Shape, Avatar, label } from './BITS.jsx'

export default function ROW({ task, store, edit }) {
  const finished = done(task)
  const late = !finished && task.due && task.due < day(0)
  const project = store.project(task.project)

  const toggle = e => {
    e.stopPropagation()
    if (store.can(task)) store.toggle(task)
  }

  return (
    <div className={finished ? 'row done' : 'row'} onClick={() => edit(task)}>
      <Ring done={finished} late={late} onClick={toggle} />
      <span className="title">{task.title}</span>
      <Shape priority={task.priority} />
      <small className="tag">{project && '#' + project.name.toLowerCase()}</small>
      <small className={late ? 'due late' : 'due'}>{label(task.due)}</small>
      {project && task.assignee ? <Avatar name={store.person(task.assignee).name} /> : <span className="avatar none" />}
    </div>
  )
}
