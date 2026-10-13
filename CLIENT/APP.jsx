import { useEffect, useState } from 'react'
import { api, useStore } from './DATA/STORE.js'
import AUTH from './AUTH/AUTH.jsx'
import TASK from './UI/TASK.jsx'
import TODAY from './PAGES/TODAY.jsx'
import PROJECTS from './PAGES/PROJECTS.jsx'
import PROJECT from './PAGES/PROJECT.jsx'
import INBOX from './PAGES/INBOX.jsx'

function Planner({ user, logout, deleteMe }) {
  const store = useStore(user)
  const [page, setPage] = useState('today')
  const [id, setId] = useState(null)
  const [task, setTask] = useState(null)

  const go = (p, i) => { setPage(p); setId(i) }
  const props = { store, user, id, go, edit: setTask }
  const waiting = store.invites.filter(i => i.status == 'pending').length
  const link = (p, text) => {
    let on = page == p || (p == 'projects' && page == 'project')
    return <a href="#" className={on ? 'on' : ''} onClick={() => go(p)}>{text}</a>
  }

  return (
    <>
      <div className="nav">
        <b>Planner</b>
        {link('today', 'Today')}
        {link('tasks', 'All tasks')}
        {link('projects', 'Projects')}
        {link('inbox', `Inbox (${waiting})`)}
        <span className="user">{user.name} <a href="#" onClick={logout}>Log out</a> <a href="#" onClick={deleteMe}>Delete account</a></span>
      </div>
      {page == 'today' && <TODAY {...props} />}
      {page == 'tasks' && <TODAY {...props} all />}
      {page == 'projects' && <PROJECTS {...props} />}
      {page == 'project' && <PROJECT {...props} />}
      {page == 'inbox' && <INBOX {...props} />}
      {task && <TASK key={task.id || 'new'} task={task} store={store} close={() => setTask(null)} />}
    </>
  )
}

export default function App() {
  const [user, setUser] = useState()

  useEffect(() => {
    api('/me').then(d => setUser(d.user)).catch(() => setUser(null))
  }, [])

  if (user === undefined) return null
  function deleteMe() {
    if (!confirm('Delete your account? All your tasks and the projects you own will be gone.')) return
    api('/me', 'DELETE').then(() => setUser(null))
  }

  if (!user) return <AUTH onLogin={setUser} />
  return <Planner user={user} deleteMe={deleteMe} logout={() => api('/auth/logout', 'POST').finally(() => setUser(null))} />
}
