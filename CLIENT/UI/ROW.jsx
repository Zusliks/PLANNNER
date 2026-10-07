import { done, day } from '../DATA/STORE.js'
import { label } from './BITS.jsx'

export default function ROW({ task, store, edit }) {
  const project = store.project(task.project)
  const late = !done(task) && task.due && task.due < day(0)

  return (
    <tr className={done(task) ? 'done' : ''}>
      <td className="check">
        <input type="checkbox" checked={done(task)} disabled={!store.can(task)} onChange={() => store.toggle(task)} />
      </td>
      <td onClick={() => edit(task)} className="click">
        {task.title}
        <br />
        <small>{project ? project.name : task.desc}</small>
      </td>
      <td className={task.priority === 'High' ? 'high' : ''}>{task.priority}</td>
      <td className={late ? 'late' : ''}>{label(task.due)}</td>
    </tr>
  )
}
