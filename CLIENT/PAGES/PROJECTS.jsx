import { done } from '../DATA/STORE.js'
import { Title } from '../UI/BITS.jsx'

export default function PROJECTS({ store, user, go }) {
  const shared = store.projects.filter(p => p.owner !== user.id).length

  const create = e => {
    e.preventDefault()
    store.addProject(e.target.name.value)
    e.target.reset()
  }

  return (
    <main className="page projects">
      <Title text="PROJECTS" />
      <p>{store.projects.length} projects, {shared} shared with you.</p>
      <div className="cards">
        {store.projects.map((p, i) => {
          const tasks = store.tasks.filter(t => t.project === p.id)
          const finished = tasks.filter(done).length
          const filled = tasks.length ? Math.round(finished / tasks.length * 10) : 0
          return (
            <div key={p.id} className={i % 2 === 0 ? 'pcard red' : 'pcard'} onClick={() => go('project', p.id)}>
              <small>{p.owner === user.id ? 'Owner' : store.person(p.owner).name}</small>
              <h3>{p.name}</h3>
              <div className="bar">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <i key={n} className={n <= filled ? 'on' : ''} />)}
              </div>
              <small>{finished} of {tasks.length} done, {p.members.length} members</small>
            </div>
          )
        })}
        <form className="pcard new" onSubmit={create}>
          <h3>+ New project</h3>
          <input name="name" required />
          <button className="btn">Create</button>
        </form>
      </div>
    </main>
  )
}
