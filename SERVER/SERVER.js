import 'dotenv/config'
import express from 'express'
import bcrypt from 'bcrypt'
import pg from 'pg'

const db = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const app = express().use(express.json())
const port = process.env.PORT || 3000
const clean = ({ name, email, password } = {}) => ({ name: String(name || '').trim(), email: String(email || '').trim().toLowerCase(), password: String(password || '') })
const one = async (sql, args) => (await db.query(sql, args)).rows[0]
const member = (project, user) => one('SELECT 1 FROM members WHERE project_id = $1 AND user_id = $2', [project, user])
const MINE = 'SELECT project_id FROM members WHERE user_id = $1'
pg.types.setTypeParser(1082, v => v)

app.get('/api/health', async (_, res) => {
  await db.query('SELECT 1')
  res.json({ ok: true })
})

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = clean(req.body)
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) return res.status(400).json({ error: 'Name, a valid email and a password of at least 8 characters are required.' })
  const { rows: [user] } = await db.query(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING RETURNING id, name, email',
    [name, email, await bcrypt.hash(password, 12)]
  )
  if (!user) return res.status(409).json({ error: 'An account with this email already exists.' })
  res.status(201).json({ user })
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = clean(req.body)
  const { rows: [user] } = await db.query('SELECT id, name, email, password_hash FROM users WHERE email = $1', [email])
  if (!user || !await bcrypt.compare(password, user.password_hash)) return res.status(401).json({ error: 'Email or password is incorrect.' })
  const sid = crypto.randomUUID()
  await db.query('INSERT INTO sessions (id, user_id) VALUES ($1, $2)', [sid, user.id])
  res.cookie('sid', sid, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 864e5 })
  res.json({ user: { id: user.id, name: user.name, email: user.email } })
})

app.use('/api', async (req, res, next) => {
  req.sid = req.headers.cookie?.match(/sid=([\w-]+)/)?.[1]
  req.user = req.sid && await one('SELECT u.id, u.name, u.email FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = $1', [req.sid])
  if (!req.user) return res.status(401).json({ error: 'Please sign in.' })
  next()
})

app.get('/api/me', (req, res) => res.json({ user: req.user }))

app.post('/api/auth/logout', async (req, res) => {
  await db.query('DELETE FROM sessions WHERE id = $1', [req.sid])
  res.clearCookie('sid').json({ ok: true })
})

app.get('/api/data', async (req, res) => {
  const all = async sql => (await db.query(sql, [req.user.id])).rows
  res.json({
    people: await all(`SELECT id, name, email FROM users WHERE id = $1 OR id IN (SELECT user_id FROM members WHERE project_id IN (${MINE})) OR id IN (SELECT from_id FROM invites WHERE to_id = $1)`),
    projects: await all(`SELECT p.id, p.name, p.owner_id AS owner, array_agg(m.user_id) AS members FROM projects p JOIN members m ON m.project_id = p.id WHERE p.id IN (${MINE}) OR p.id IN (SELECT project_id FROM invites WHERE to_id = $1) GROUP BY p.id ORDER BY p.id`),
    tasks: await all(`SELECT id, title, description AS "desc", COALESCE(due::text, '') AS due, priority, status, project_id AS project, assignee_id AS assignee, creator_id AS creator FROM tasks WHERE (project_id IS NULL AND creator_id = $1) OR project_id IN (${MINE}) ORDER BY id`),
    invites: await all(`SELECT i.id, i.project_id AS project, i.from_id AS "from", u.email AS "to", i.status, i.created_at AS date FROM invites i JOIN users u ON u.id = i.to_id WHERE i.to_id = $1 OR i.project_id IN (${MINE}) ORDER BY i.id DESC`)
  })
})

const task = b => ({ title: String(b.title || '').trim(), desc: String(b.desc || ''), due: b.due || null, priority: b.priority, status: b.status, project: b.project || null, assignee: b.assignee || null })

const invalid = async (t, user) => {
  if (!t.title || t.title.length > 200) return 'Title is required.'
  if (!['Low', 'Medium', 'High'].includes(t.priority) || !['todo', 'doing', 'done'].includes(t.status)) return 'Invalid priority or status.'
  if (t.due && !/^\d{4}-\d{2}-\d{2}$/.test(t.due)) return 'Invalid date.'
  if (t.project && !await member(t.project, user.id)) return 'You are not in this project.'
  if (t.assignee && !(t.project ? await member(t.project, t.assignee) : t.assignee === user.id)) return 'Assignee must be a project member.'
}

const allowed = async (id, user) => {
  const t = await one('SELECT t.*, p.owner_id FROM tasks t LEFT JOIN projects p ON p.id = t.project_id WHERE t.id = $1', [id])
  if (!t) return
  if (!t.project_id) return t.creator_id === user.id && t
  return await member(t.project_id, user.id) && [t.owner_id, t.creator_id, t.assignee_id].includes(user.id) && t
}

app.post('/api/tasks', async (req, res) => {
  const t = task(req.body)
  const error = await invalid(t, req.user)
  if (error) return res.status(400).json({ error })
  await db.query('INSERT INTO tasks (title, description, due, priority, status, project_id, assignee_id, creator_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [...Object.values(t), req.user.id])
  res.status(201).json({ ok: true })
})

app.put('/api/tasks/:id', async (req, res) => {
  const old = await allowed(req.params.id, req.user)
  if (!old) return res.status(403).json({ error: 'You cannot change this task.' })
  const t = task({ ...req.body, project: old.project_id })
  const error = await invalid(t, req.user)
  if (error) return res.status(400).json({ error })
  await db.query('UPDATE tasks SET title = $1, description = $2, due = $3, priority = $4, status = $5, project_id = $6, assignee_id = $7 WHERE id = $8', [...Object.values(t), old.id])
  res.json({ ok: true })
})

app.delete('/api/tasks/:id', async (req, res) => {
  const old = await allowed(req.params.id, req.user)
  if (!old) return res.status(403).json({ error: 'You cannot delete this task.' })
  await db.query('DELETE FROM tasks WHERE id = $1', [old.id])
  res.json({ ok: true })
})

app.post('/api/projects', async (req, res) => {
  const name = String(req.body.name || '').trim()
  if (!name || name.length > 120) return res.status(400).json({ error: 'Project name is required.' })
  const { id } = await one('INSERT INTO projects (name, owner_id) VALUES ($1, $2) RETURNING id', [name, req.user.id])
  await db.query('INSERT INTO members (project_id, user_id) VALUES ($1, $2)', [id, req.user.id])
  res.status(201).json({ id })
})

app.post('/api/projects/:id/invites', async (req, res) => {
  const p = await one('SELECT id FROM projects WHERE id = $1 AND owner_id = $2', [req.params.id, req.user.id])
  if (!p) return res.status(403).json({ error: 'Only the owner can invite.' })
  const to = await one('SELECT id FROM users WHERE email = $1', [clean(req.body).email])
  if (!to) return res.status(404).json({ error: 'User not found' })
  if (await member(p.id, to.id)) return res.status(409).json({ error: 'Already a member' })
  if (await one("SELECT 1 FROM invites WHERE project_id = $1 AND to_id = $2 AND status = 'pending'", [p.id, to.id])) return res.status(409).json({ error: 'Already invited' })
  await db.query('INSERT INTO invites (project_id, from_id, to_id) VALUES ($1, $2, $3)', [p.id, req.user.id, to.id])
  res.status(201).json({ ok: true })
})

app.post('/api/invites/:id', async (req, res) => {
  const i = await one("UPDATE invites SET status = $1 WHERE id = $2 AND to_id = $3 AND status = 'pending' RETURNING project_id", [req.body.accept ? 'accepted' : 'declined', req.params.id, req.user.id])
  if (!i) return res.status(404).json({ error: 'Invite not found.' })
  if (req.body.accept) await db.query('INSERT INTO members (project_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [i.project_id, req.user.id])
  res.json({ ok: true })
})

app.delete('/api/invites/:id', async (req, res) => {
  await db.query("DELETE FROM invites WHERE id = $1 AND status = 'pending' AND project_id IN (SELECT id FROM projects WHERE owner_id = $2)", [req.params.id, req.user.id])
  res.json({ ok: true })
})

app.use((err, _req, res, _next) => {
  if (err.code === '22P02') return res.status(400).json({ error: 'Invalid input.' })
  console.error(err)
  res.status(500).json({ error: 'Server error.' })
})

app.listen(port, () => console.log(`API on http://localhost:${port}`))
