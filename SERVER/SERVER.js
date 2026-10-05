import 'dotenv/config'
import express from 'express'
import bcrypt from 'bcrypt'
import pg from 'pg'

const db = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const app = express().use(express.json())
const port = process.env.PORT || 3000
const clean = ({ name, email, password } = {}) => ({ name: String(name || '').trim(), email: String(email || '').trim().toLowerCase(), password: String(password || '') })

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
  res.json({ user: { id: user.id, name: user.name, email: user.email } })
})

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Server error.' })
})

app.listen(port, () => console.log(`API on http://localhost:${port}`))
