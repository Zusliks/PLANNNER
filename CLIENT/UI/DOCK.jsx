import { Avatar } from './BITS.jsx'

const ITEMS = [['today', 'circle'], ['tasks', 'square'], ['projects', 'triangle'], ['inbox', 'diamond']]

export default function DOCK({ page, go, badge, user, onLogout }) {
  return (
    <nav className="dock">
      {ITEMS.map(([id, icon]) => (
        <button key={id} className={page === id ? 'on' : ''} onClick={() => go(id)}>
          <i className={`icon ${icon}`} />
          <span>{id}</span>
          {id === 'inbox' && badge > 0 && <b>{badge}</b>}
        </button>
      ))}
      <button className="me" onClick={() => confirm('Log out?') && onLogout()} title={`${user.name}, log out`}>
        <Avatar name={user.name} size={38} />
      </button>
    </nav>
  )
}
