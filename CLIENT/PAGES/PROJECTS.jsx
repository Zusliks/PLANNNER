import { useState } from 'react'
import { done } from '../DATA/STORE.js'

export default function PROJECTS({ store, user, go }) {
  const [name, setName] = useState(null)
  const owned = store.projects.filter(p => p.owner === user.id).length

  const create = e => {
    e.preventDefault()
    if (!name.trim()) return
    store.addProject(name.trim())
    setName(null)
  }

  return (
    <main className="page">
      <div className="head">
        <div>
          <h1>Projects</h1>
          <p>{owned} owned, {store.projects.length - owned} shared with you</p>
        </div>
        {name === null && <button className="btn" onClick={() => setName('')}>New project</button>}
      </div>
      {name !== null && (
        <form className="add" onSubmit={create}>
          <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Project name" />
          <button type="button" className="btn line" onClick={() => setName(null)}>Cancel</button>
          <button className="btn">Create project</button>
        </form>
      )}
      {store.projects.length > 0
        ? (
          <table>
            <thead>
              <tr><th>Name</th><th>Owner</th><th>Members</th><th>Open tasks</th><th>Completed</th></tr>
            </thead>
            <tbody>
              {store.projects.map(p => {
                const tasks = store.tasks.filter(t => t.project === p.id)
                const finished = tasks.filter(done).length
                return (
                  <tr key={p.id} onClick={() => go('project', p.id)}>
                    <td className="strong">{p.name}</td>
                    <td>{store.person(p.owner).name}</td>
                    <td>{p.members.length}</td>
                    <td>{tasks.length - finished}</td>
                    <td className="muted">{finished} of {tasks.length}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )
        : <p className="empty">No projects yet. Create one to share tasks with other people.</p>}
    </main>
  )
}
