import { useEffect, useState } from 'react'

export const day = n => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toLocaleDateString('sv')
}

export const done = t => t.status === 'done'

const uid = () => Math.random().toString(36).slice(2, 9)

const seed = me => ({
  people: [me, { id: 'anna', name: 'Anna Berzina', email: 'anna@example.com' }, { id: 'martins', name: 'Martins Kalns', email: 'martins@example.com' }],
  projects: [
    { id: 'p1', name: 'Website relaunch', owner: me.id, members: [me.id, 'anna'] },
    { id: 'p2', name: 'Thesis', owner: 'anna', members: ['anna', 'martins'] }
  ],
  invites: [{ id: 'i1', project: 'p2', from: 'anna', to: me.email, status: 'pending', date: day(0) }],
  tasks: [
    { id: uid(), title: 'Submit lab report', desc: 'Physics lab #3, upload the PDF', due: day(-1), priority: 'High', status: 'todo', project: null, assignee: me.id, creator: me.id },
    { id: uid(), title: 'Prepare presentation slides', desc: '', due: day(1), priority: 'Medium', status: 'todo', project: null, assignee: me.id, creator: me.id },
    { id: uid(), title: 'Book flights to Riga', desc: '', due: day(8), priority: 'Low', status: 'done', project: null, assignee: me.id, creator: me.id },
    { id: uid(), title: 'Finish database schema', desc: 'Users, tasks, projects, invitations', due: day(0), priority: 'High', status: 'doing', project: 'p1', assignee: me.id, creator: me.id },
    { id: uid(), title: 'Review pull request', desc: '', due: day(2), priority: 'Low', status: 'todo', project: 'p1', assignee: 'anna', creator: me.id },
    { id: uid(), title: 'Login screen', desc: '', due: day(-3), priority: 'Medium', status: 'done', project: 'p1', assignee: me.id, creator: me.id },
    { id: uid(), title: 'Write literature review', desc: '', due: day(10), priority: 'Medium', status: 'todo', project: 'p2', assignee: 'anna', creator: 'anna' },
    { id: uid(), title: 'Survey questions', desc: '', due: day(5), priority: 'High', status: 'doing', project: 'p2', assignee: 'martins', creator: 'anna' }
  ]
})

export function useStore(me) {
  const key = `planner:${me.email}`
  const [db, setDb] = useState(() => JSON.parse(localStorage.getItem(key)) || seed(me))
  useEffect(() => localStorage.setItem(key, JSON.stringify(db)), [key, db])

  const update = fn => setDb(d => ({ ...d, ...fn(d) }))
  const projects = db.projects.filter(p => p.members.includes(me.id))
  const mine = projects.map(p => p.id)
  const person = id => db.people.find(p => p.id === id) || { name: '?' }
  const project = id => db.projects.find(p => p.id === id)

  const can = t => {
    const p = project(t.project)
    return !p || !t.id || p.owner === me.id || t.assignee === me.id || t.creator === me.id
  }

  const invite = (id, email) => {
    const p = project(id)
    const to = db.people.find(x => x.email === email.trim().toLowerCase())
    if (!to) return 'User not found'
    if (p.members.includes(to.id)) return 'Already a member'
    if (db.invites.some(i => i.project === id && i.to === to.email && i.status === 'pending')) return 'Already invited'
    update(d => ({ invites: [...d.invites, { id: uid(), project: id, from: me.id, to: to.email, status: 'pending', date: day(0) }] }))
  }

  const answer = (id, yes) => update(d => {
    const inv = d.invites.find(i => i.id === id)
    return {
      invites: d.invites.map(i => i.id === id ? { ...i, status: yes ? 'accepted' : 'declined' } : i),
      projects: yes ? d.projects.map(p => p.id === inv.project ? { ...p, members: [...p.members, me.id] } : p) : d.projects
    }
  })

  return {
    projects,
    tasks: db.tasks.filter(t => mine.includes(t.project) || (!t.project && t.creator === me.id)),
    invites: db.invites.filter(i => i.to === me.email),
    sent: id => db.invites.filter(i => i.project === id && i.status === 'pending'),
    person,
    project,
    can,
    invite,
    answer,
    saveTask: t => update(d => ({ tasks: t.id ? d.tasks.map(x => x.id === t.id ? t : x) : [...d.tasks, { ...t, id: uid(), creator: me.id }] })),
    toggle: t => update(d => ({ tasks: d.tasks.map(x => x.id === t.id ? { ...x, status: done(x) ? 'todo' : 'done' } : x) })),
    removeTask: id => update(d => ({ tasks: d.tasks.filter(t => t.id !== id) })),
    addProject: name => update(d => ({ projects: [...d.projects, { id: uid(), name, owner: me.id, members: [me.id] }] })),
    revoke: id => update(d => ({ invites: d.invites.filter(i => i.id !== id) }))
  }
}
