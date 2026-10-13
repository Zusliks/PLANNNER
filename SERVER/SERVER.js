import 'dotenv/config'
import express from 'express'
import bcrypt from 'bcrypt'
import pg from 'pg'

pg.types.setTypeParser(1082, v => v)
const db = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const q = async (sql, args) => (await db.query(sql, args)).rows

await db.query(`
  create table if not exists users (id bigserial primary key, name varchar(120) not null, email varchar(255) unique not null, password_hash text not null, created_at timestamptz default now());
  create table if not exists sessions (id text primary key, user_id bigint not null references users on delete cascade, created_at timestamptz default now());
  create table if not exists projects (id bigserial primary key, name varchar(120) not null, owner_id bigint not null references users on delete cascade);
  create table if not exists members (project_id bigint references projects on delete cascade, user_id bigint references users on delete cascade, primary key (project_id, user_id));
  create table if not exists tasks (id bigserial primary key, title varchar(200) not null, description text not null default '', due date, priority varchar(6) not null default 'Medium' check (priority in ('Low', 'Medium', 'High')), status varchar(5) not null default 'todo' check (status in ('todo', 'doing', 'done')), project_id bigint references projects on delete cascade, assignee_id bigint references users on delete set null, creator_id bigint not null references users on delete cascade);
  create table if not exists invites (id bigserial primary key, project_id bigint not null references projects on delete cascade, from_id bigint not null references users on delete cascade, to_id bigint not null references users on delete cascade, status varchar(8) not null default 'pending', created_at date not null default current_date);
`)

const app = express()
app.use(express.json())

const mine = 'select project_id from members where user_id = $1'
const isMember = async (project, user) => (await q('select 1 from members where project_id = $1 and user_id = $2', [project, user])).length > 0

app.post('/api/auth/register', async (req, res) => {
  const name = String(req.body.name || '').trim()
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')
  if (!name || name.length > 120 || email.length > 255 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8)
    return res.status(400).json({ error: 'Name, email and a password with 8+ characters are needed.' })

  const hash = await bcrypt.hash(password, 12)
  const [user] = await q('insert into users (name, email, password_hash) values ($1, $2, $3) on conflict (email) do nothing returning id, name, email', [name, email, hash])
  if (!user) return res.status(409).json({ error: 'That email already has an account.' })
  res.status(201).json({ user })
})

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const [user] = await q('select * from users where email = $1', [email])
  if (!user || !(await bcrypt.compare(String(req.body.password || ''), user.password_hash)))
    return res.status(401).json({ error: 'Wrong email or password, try again.' })

  const sid = crypto.randomUUID()
  await q('insert into sessions (id, user_id) values ($1, $2)', [sid, user.id])
  res.cookie('sid', sid, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 3600 * 1000 })
  res.json({ user: { id: user.id, name: user.name, email: user.email } })
})

app.use('/api', async (req, res, next) => {
  req.sid = req.headers.cookie?.match(/sid=([\w-]+)/)?.[1]
  if (req.sid) [req.user] = await q("select u.id, u.name, u.email from sessions s join users u on u.id = s.user_id where s.id = $1 and s.created_at > now() - interval '7 days'", [req.sid])
  if (!req.user) return res.status(401).json({ error: 'Please sign in.' })
  next()
})

app.get('/api/me', (req, res) => res.json({ user: req.user }))

app.delete('/api/me', async (req, res) => {
  await q('delete from users where id = $1', [req.user.id])
  res.clearCookie('sid').json({ ok: true })
})

app.post('/api/auth/logout', async (req, res) => {
  await q('delete from sessions where id = $1', [req.sid])
  res.clearCookie('sid').json({ ok: true })
})

app.get('/api/data', async (req, res) => {
  const me = [req.user.id]
  res.json({
    people: await q(`select id, name, email from users where id = $1 or id in (select user_id from members where project_id in (${mine})) or id in (select from_id from invites where to_id = $1)`, me),
    projects: await q(`select p.id, p.name, p.owner_id as owner, array_agg(m.user_id) as members from projects p join members m on m.project_id = p.id where p.id in (${mine}) or p.id in (select project_id from invites where to_id = $1) group by p.id order by p.id`, me),
    tasks: await q(`select id, title, description as "desc", coalesce(due::text, '') as due, priority, status, project_id as project, assignee_id as assignee, creator_id as creator from tasks where (project_id is null and creator_id = $1) or project_id in (${mine}) order by id`, me),
    invites: await q(`select i.id, i.project_id as project, i.from_id as "from", u.email as "to", i.status, i.created_at as date from invites i join users u on u.id = i.to_id where i.to_id = $1 or i.project_id in (${mine}) order by i.id desc`, me)
  })
})

const fields = b => [String(b.title || '').trim(), String(b.desc || ''), b.due || null, b.priority, b.status, b.project || null, b.assignee || null]

async function bad([title, , due, priority, status, project, assignee], me) {
  if (!title || title.length > 200) return 'Task needs a title (max 200 characters).'
  if (!['Low', 'Medium', 'High'].includes(priority)) return 'Bad priority.'
  if (!['todo', 'doing', 'done'].includes(status)) return 'Bad status.'
  if (due && !/^\d{4}-\d{2}-\d{2}$/.test(due)) return 'Bad date.'
  if (project && !(await isMember(project, me))) return 'You are not in this project.'
  if (assignee && !(project ? await isMember(project, assignee) : assignee == me)) return 'Assignee must be in the project.'
}

async function editable(id, me) {
  const [t] = await q('select t.*, p.owner_id from tasks t left join projects p on p.id = t.project_id where t.id = $1', [id])
  if (!t) return null
  if (!t.project_id) return t.creator_id == me ? t : null
  if (!(await isMember(t.project_id, me))) return null
  return [t.owner_id, t.creator_id, t.assignee_id].includes(me) ? t : null
}

app.post('/api/tasks', async (req, res) => {
  const t = fields(req.body)
  const err = await bad(t, req.user.id)
  if (err) return res.status(400).json({ error: err })
  await q('insert into tasks (title, description, due, priority, status, project_id, assignee_id, creator_id) values ($1, $2, $3, $4, $5, $6, $7, $8)', [...t, req.user.id])
  res.status(201).json({ ok: true })
})

app.put('/api/tasks/:id', async (req, res) => {
  const old = await editable(req.params.id, req.user.id)
  if (!old) return res.status(403).json({ error: "You can't change this task." })
  const t = fields({ ...req.body, project: old.project_id })
  const err = await bad(t, req.user.id)
  if (err) return res.status(400).json({ error: err })
  await q('update tasks set title = $1, description = $2, due = $3, priority = $4, status = $5, project_id = $6, assignee_id = $7 where id = $8', [...t, old.id])
  res.json({ ok: true })
})

app.delete('/api/tasks/:id', async (req, res) => {
  const old = await editable(req.params.id, req.user.id)
  if (!old) return res.status(403).json({ error: "You can't delete this task." })
  await q('delete from tasks where id = $1', [old.id])
  res.json({ ok: true })
})

app.post('/api/projects', async (req, res) => {
  const name = String(req.body.name || '').trim()
  if (!name || name.length > 120) return res.status(400).json({ error: 'Project needs a name.' })
  const [p] = await q('insert into projects (name, owner_id) values ($1, $2) returning id', [name, req.user.id])
  await q('insert into members (project_id, user_id) values ($1, $2)', [p.id, req.user.id])
  res.status(201).json({ id: p.id })
})

app.delete('/api/projects/:id', async (req, res) => {
  const gone = await q('delete from projects where id = $1 and owner_id = $2 returning id', [req.params.id, req.user.id])
  if (!gone.length) return res.status(403).json({ error: 'Only the owner can delete a project.' })
  res.json({ ok: true })
})

app.post('/api/projects/:id/invites', async (req, res) => {
  const [p] = await q('select id from projects where id = $1 and owner_id = $2', [req.params.id, req.user.id])
  if (!p) return res.status(403).json({ error: 'Only the owner can invite.' })

  const [to] = await q('select id from users where email = $1', [String(req.body.email || '').trim().toLowerCase()])
  if (!to) return res.status(404).json({ error: 'User not found' })
  if (await isMember(p.id, to.id)) return res.status(409).json({ error: 'Already a member' })

  const pending = await q("select 1 from invites where project_id = $1 and to_id = $2 and status = 'pending'", [p.id, to.id])
  if (pending.length) return res.status(409).json({ error: 'Already invited' })

  await q('insert into invites (project_id, from_id, to_id) values ($1, $2, $3)', [p.id, req.user.id, to.id])
  res.status(201).json({ ok: true })
})

app.post('/api/invites/:id', async (req, res) => {
  const yes = !!req.body.accept
  const [inv] = await q("update invites set status = $1 where id = $2 and to_id = $3 and status = 'pending' returning project_id", [yes ? 'accepted' : 'declined', req.params.id, req.user.id])
  if (!inv) return res.status(404).json({ error: 'Invite not found.' })
  if (yes) await q('insert into members (project_id, user_id) values ($1, $2) on conflict do nothing', [inv.project_id, req.user.id])
  res.json({ ok: true })
})

app.delete('/api/invites/:id', async (req, res) => {
  await q("delete from invites where id = $1 and status = 'pending' and project_id in (select id from projects where owner_id = $2)", [req.params.id, req.user.id])
  res.json({ ok: true })
})

app.use((err, req, res, next) => {
  if (err.code == '22P02') return res.status(400).json({ error: 'Bad id.' })
  console.error(err)
  res.status(500).json({ error: 'Server error.' })
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log('api running on ' + port))
