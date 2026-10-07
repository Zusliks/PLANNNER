import { useState } from 'react'

export const STATUS = { todo: 'To do', doing: 'In progress', done: 'Done' }

export default function TASK({ task, store, close }) {
  const [error, setError] = useState('')
  const can = store.can(task)
  const project = store.project(task.project)

  const save = e => {
    e.preventDefault()
    const form = Object.fromEntries(new FormData(e.target))
    store.saveTask({ ...task, ...form }).then(close, err => setError(err.message))
  }

  const remove = () => {
    if (confirm('Delete this task?')) {
      store.removeTask(task.id)
      close()
    }
  }

  return (
    <div className="overlay" onClick={close}>
      <form className="dialog" onClick={e => e.stopPropagation()} onSubmit={save}>
        <header>
          <h2>{task.id ? 'Edit task' : 'New task'}</h2>
          <button type="button" onClick={close}>X</button>
        </header>
        <fieldset disabled={!can}>
          <label>
            Title
            <input name="title" defaultValue={task.title} required />
          </label>
          <label>
            Description
            <textarea name="desc" defaultValue={task.desc} rows="3" />
          </label>
          <label>
            Due date
            <input name="due" type="date" defaultValue={task.due} />
          </label>
          <label>
            Priority
            <select name="priority" defaultValue={task.priority}>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </label>
          {project && (
            <label>
              Assignee
              <select name="assignee" defaultValue={task.assignee || ''}>
                <option value="">Nobody</option>
                {project.members.map(id => <option key={id} value={id}>{store.person(id).name}</option>)}
              </select>
            </label>
          )}
          <label>
            Status
            <select name="status" defaultValue={task.status}>
              <option value="todo">To do</option>
              <option value="doing">In progress</option>
              <option value="done">Done</option>
            </select>
          </label>
        </fieldset>
        {error && <p className="msg">{error}</p>}
        {!can && <p>You can only look at this task.</p>}
        {can && (
          <footer>
            {task.id && <button type="button" className="btn red" onClick={remove}>Delete</button>}
            <button type="button" className="btn white" onClick={close}>Cancel</button>
            <button className="btn">Save</button>
          </footer>
        )}
      </form>
    </div>
  )
}
