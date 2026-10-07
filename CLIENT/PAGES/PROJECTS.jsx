import { done } from '../DATA/STORE.js'

export default function PROJECTS({ store, go }) {
  const create = e => {
    e.preventDefault()
    store.addProject(e.target.name.value)
    e.target.reset()
  }

  return (
    <main className="page">
      <h1>Projects</h1>
      <p>You have {store.projects.length} projects.</p>
      <form className="add" onSubmit={create}>
        New project:
        <input name="name" required />
        <button className="btn">Create</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Owner</th>
            <th>Members</th>
            <th>Tasks</th>
            <th>Done</th>
          </tr>
        </thead>
        <tbody>
          {store.projects.map(p => {
            const tasks = store.tasks.filter(t => t.project === p.id)
            return (
              <tr key={p.id}>
                <td><a href="#" onClick={() => go('project', p.id)}>{p.name}</a></td>
                <td>{store.person(p.owner).name}</td>
                <td>{p.members.length}</td>
                <td>{tasks.length}</td>
                <td>{tasks.filter(done).length} of {tasks.length}</td>
              </tr>
            )
          })}
          {store.projects.length === 0 && <tr><td colSpan="5">No projects yet.</td></tr>}
        </tbody>
      </table>
    </main>
  )
}
