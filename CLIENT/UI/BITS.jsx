import { day } from '../DATA/STORE.js'

export function when(d) {
  if (!d) return 'No date'
  if (d < day()) return 'Overdue'
  return d == day() ? 'Today' : 'Upcoming'
}

export function label(d) {
  if (d == day()) return 'Today'
  if (d == day(1)) return 'Tomorrow'
  return d.split('-').reverse().join('.')
}

export const Title = ({ text, small }) => (
  <h1 className={small ? 'title small' : 'title'}>
    {text.split(' ').map((w, i) => <b key={i}>{[...w].map((c, j) => <span key={j}>{c}</span>)} </b>)}
  </h1>
)
