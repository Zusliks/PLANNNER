import { useEffect, useState } from 'react'

export const day = n => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toLocaleDateString('sv')
}

export const done = t => t.status === 'done'

export const api = async (url, method = 'GET', body) => {
  const res = await fetch('/api' + url, { method, headers: { 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Something went wrong.')
  return data
}

export function useStore(me) {
  const [db, setDb] = useState({ people: [me], projects: [], invites: [], tasks: [] })
  const load = () => api('/data').then(setDb)
  const run = (...args) => api(...args).finally(load)
  useEffect(() => { load() }, [])

  const project = id => db.projects.find(p => p.id === id)

  return {
    projects: db.projects.filter(p => p.members.includes(me.id)),
    tasks: db.tasks,
    invites: db.invites.filter(i => i.to === me.email),
    sent: id => db.invites.filter(i => i.project === id && i.status === 'pending'),
    person: id => id === me.id ? { ...me, name: 'You' } : db.people.find(p => p.id === id) || { name: '?' },
    project,
    can: t => !t.project || !t.id || [project(t.project)?.owner, t.assignee, t.creator].includes(me.id),
    invite: (id, email) => run(`/projects/${id}/invites`, 'POST', { email }),
    answer: (id, yes) => run(`/invites/${id}`, 'POST', { accept: yes }),
    saveTask: t => run(t.id ? `/tasks/${t.id}` : '/tasks', t.id ? 'PUT' : 'POST', t),
    toggle: t => run(`/tasks/${t.id}`, 'PUT', { ...t, status: done(t) ? 'todo' : 'done' }),
    removeTask: id => run(`/tasks/${id}`, 'DELETE'),
    addProject: name => run('/projects', 'POST', { name }),
    revoke: id => run(`/invites/${id}`, 'DELETE')
  }
}
