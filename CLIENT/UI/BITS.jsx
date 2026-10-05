import { day } from '../DATA/STORE.js'

export const PRIORITIES = ['High', 'Medium', 'Low']

export const pad = n => String(n).padStart(2, '0')

export const when = due => {
  if (!due) return 'no date'
  if (due < day(0)) return 'overdue'
  if (due === day(0)) return 'today'
  return due <= day(7) ? 'this week' : 'later'
}

export const label = due => {
  if (!due) return ''
  if (due === day(-1)) return 'Yesterday'
  if (due === day(0)) return 'Today'
  if (due === day(1)) return 'Tomorrow'
  return new Date(due + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export const Shape = ({ priority }) => <i className={`shape ${priority.toLowerCase()}`} title={priority} />

export const Ring = ({ done, late, onClick }) => (
  <button className={`ring${done ? ' done' : ''}${late ? ' late' : ''}`} onClick={onClick} aria-label={done ? 'Mark as open' : 'Mark as done'} />
)

export const Avatar = ({ name = '?', size = 24 }) => (
  <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.36 }} title={name}>
    {name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
  </span>
)

export const Progress = ({ value, size = 92 }) => {
  const r = size / 2 - 4
  const c = 2 * Math.PI * r
  return (
    <span className="progress" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--line)" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--accent)" strokeDasharray={`${c * value} ${c}`} />
      </svg>
      <span style={{ fontSize: size * 0.26 }}>{Math.round(value * 100)}%</span>
    </span>
  )
}
