import { day } from '../DATA/STORE.js'

export const PRIORITIES = ['High', 'Medium', 'Low']

export const when = due => {
  if (!due) return 'No date'
  if (due < day(0)) return 'Overdue'
  if (due === day(0)) return 'Today'
  return due <= day(7) ? 'This week' : 'Later'
}

export const label = due => {
  if (!due) return ''
  if (due === day(-1)) return 'Yesterday'
  if (due === day(0)) return 'Today'
  if (due === day(1)) return 'Tomorrow'
  return new Date(due + 'T00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

export const Priority = ({ priority }) => <span className={`prio ${priority.toLowerCase()}`}>{priority}</span>

export const Check = ({ done, onClick, disabled }) => (
  <button className={done ? 'check done' : 'check'} onClick={onClick} disabled={disabled} aria-label={done ? 'Mark as not done' : 'Mark as done'} />
)
