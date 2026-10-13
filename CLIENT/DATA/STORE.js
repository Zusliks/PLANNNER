import { useEffect, useState } from 'react'

export function day(n = 0) {
  let d = new Date()
  d.setDate(d.getDate() + n)
  return d.toLocaleDateString('sv')
}

export const done = t => t.status == 'done'

export async function api(url, method = 'GET', body) {
  let res = await fetch('/api' + url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  })
  let data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Something broke, try again.')
  return data
}

export function useStore(me) {
  const [db, setDb] = useState({ people: [], projects: [], invites: [], tasks: [] })
  const load = () => api('/data').then(setDb)
  useEffect(() => { load() }, [])

  const send = (url, method, body) => api(url, method, body).finally(load)
  const project = id => db.projects.find(p => p.id == id)

  return {
    tasks: db.tasks,
    projects: db.projects.filter(p => p.members.includes(me.id)),
    invites: db.invites.filter(i => i.to == me.email),
    sent: id => db.invites.filter(i => i.project == id && i.status == 'pending'),
    project,
    person(id) {
      if (id == me.id) return { ...me, name: 'You' }
      return db.people.find(p => p.id == id) || { name: '?' }
    },
    can(t) {
      if (!t.id || !t.project) return true
      return [project(t.project)?.owner, t.assignee, t.creator].includes(me.id)
    },
    save: t => t.id ? send('/tasks/' + t.id, 'PUT', t) : send('/tasks', 'POST', t),
    toggle: t => send('/tasks/' + t.id, 'PUT', { ...t, status: done(t) ? 'todo' : 'done' }),
    remove: id => send('/tasks/' + id, 'DELETE'),
    newProject: name => send('/projects', 'POST', { name }),
    dropProject: id => send('/projects/' + id, 'DELETE'),
    invite: (id, email) => send(`/projects/${id}/invites`, 'POST', { email }),
    answer: (id, yes) => send('/invites/' + id, 'POST', { accept: yes }),
    revoke: id => send('/invites/' + id, 'DELETE')
  }
}
