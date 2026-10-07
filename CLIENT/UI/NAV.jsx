export default function NAV({ page, go, badge, user, onLogout }) {
  return (
    <div className="nav">
      <b>Planner</b>
      <a href="#" className={page === 'today' ? 'on' : ''} onClick={() => go('today')}>Today</a>
      <a href="#" className={page === 'tasks' ? 'on' : ''} onClick={() => go('tasks')}>All tasks</a>
      <a href="#" className={page === 'projects' ? 'on' : ''} onClick={() => go('projects')}>Projects</a>
      <a href="#" className={page === 'inbox' ? 'on' : ''} onClick={() => go('inbox')}>Inbox ({badge})</a>
      <span className="right">{user.name} <a href="#" onClick={onLogout}>Log out</a></span>
    </div>
  )
}
