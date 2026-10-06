import { useState, useEffect } from 'react'
import AUTH from './AUTH/AUTH.jsx'
import NAV from './UI/NAV.jsx'
import TASK from './UI/TASK.jsx'
import TODAY from './PAGES/TODAY.jsx'
import PROJECTS from './PAGES/PROJECTS.jsx'
import PROJECT from './PAGES/PROJECT.jsx'
import INBOX from './PAGES/INBOX.jsx'
import { useStore, api } from './DATA/STORE.js'

const PAGES = { today: TODAY, tasks: props => <TODAY {...props} all />, projects: PROJECTS, project: PROJECT, inbox: INBOX }

function PLANNER({ user, onLogout }) {
  const store = useStore(user)
  const [page, setPage] = useState({ name: 'today' })
  const [task, setTask] = useState(null)
  const PAGE = PAGES[page.name]
  const go = (name, id) => setPage({ name, id })

  return (
    <>
      <NAV page={page.name === 'project' ? 'projects' : page.name} go={go} badge={store.invites.filter(i => i.status === 'pending').length} user={user} onLogout={onLogout} />
      <PAGE store={store} user={user} id={page.id} go={go} edit={setTask} />
      {task && <TASK key={task.id || 'new'} task={task} store={store} close={() => setTask(null)} />}
    </>
  )
}

export default function APP() {
  const [user, setUser] = useState()
  const login = u => setUser({ ...u, id: String(u.id) })
  const logout = () => api('/auth/logout', 'POST').finally(() => setUser(null))
  useEffect(() => { api('/me').then(d => login(d.user), () => setUser(null)) }, [])

  if (user === undefined) return null
  return user ? <PLANNER user={user} onLogout={logout} /> : <AUTH onAuth={login} />
}
