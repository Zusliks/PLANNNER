import { useState } from 'react'
import { done } from '../DATA/STORE.js'
import { Avatar, Progress, pad } from '../UI/BITS.jsx'

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
      <section className="side">
        <small>Your work</small>
        <h1 className="big">{pad(store.projects.length)}</h1>
        <h2>My projects</h2>
        <p>{owned} owned, {store.projects.length - owned} shared</p>
        {name === null
          ? <button className="btn" onClick={() => setName('')}>+ New project</button>
          : (
            <form className="inline" onSubmit={create}>
              <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Project name" />
              <button className="btn">Create</button>
            </form>
          )}
      </section>
      <section className="grid">
        {store.projects.map(p => {
          const tasks = store.tasks.filter(t => t.project === p.id)
          const finished = tasks.filter(done).length
          return (
            <button key={p.id} className="tile" onClick={() => go('project', p.id)}>
              <Progress value={tasks.length ? finished / tasks.length : 0} />
              <b>{p.name}</b>
              <small>{p.owner === user.id ? 'Owner' : 'Member'}</small>
              <footer>
                <span className="avatars">{p.members.map(id => <Avatar key={id} name={store.person(id).name} />)}</span>
                <small>{finished}/{tasks.length}</small>
              </footer>
            </button>
          )
        })}
        <button className="tile new" onClick={() => setName('')}>
          <span>+</span>
          New project
        </button>
      </section>
    </main>
  )
}
