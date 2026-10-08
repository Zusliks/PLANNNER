import { day } from '../DATA/STORE.js'

export const when = due => {
  if (!due) return 'No date'
  if (due < day(0)) return 'Overdue'
  if (due === day(0)) return 'Today'
  return 'Upcoming'
}

export const Title = ({ text, small }) => (
  <h1 className={small ? 'title small' : 'title'}>
    {text.split(' ').map((word, i) => <b key={i}>{word.split('').map((c, j) => <span key={j}>{c}</span>)} </b>)}
  </h1>
)

export const label = due => {
  if (due === day(0)) return 'Today'
  if (due === day(1)) return 'Tomorrow'
  return due.split('-').reverse().join('.')
}
