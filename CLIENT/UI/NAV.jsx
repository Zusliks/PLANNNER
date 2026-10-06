const ITEMS = [['today', 'Today'], ['tasks', 'All tasks'], ['projects', 'Projects'], ['inbox', 'Inbox']]

export default function NAV({ page, go, badge, user, onLogout }) {
  return (
    <header className="nav">
      <b className="logo">Planner</b>
      <nav>
        {ITEMS.map(([id, name]) => (
          <button key={id} className={page === id ? 'on' : ''} onClick={() => go(id)}>
            {name}{id === 'inbox' && badge > 0 && ` (${badge})`}
          </button>
        ))}
      </nav>
      <span className="user">{user.name}</span>
      <button className="logout" onClick={onLogout}>Log out</button>
    </header>
  )
}
