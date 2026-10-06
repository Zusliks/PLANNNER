import { label } from '../UI/BITS.jsx'

export default function INBOX({ store, go }) {
  const pending = store.invites.filter(i => i.status === 'pending')
  const earlier = store.invites.filter(i => i.status !== 'pending')

  const answer = (i, yes) => {
    store.answer(i.id, yes).then(() => yes && go('project', i.project))
  }

  return (
    <main className="page">
      <div className="head">
        <div>
          <h1>Invitations</h1>
          <p>Accept an invitation to see the project and its tasks.</p>
        </div>
      </div>
      {pending.length > 0
        ? (
          <div className="list">
            {pending.map(i => (
              <div key={i.id} className="row static">
                <div className="name">
                  <span>{store.person(i.from).name} invited you to <b>{store.project(i.project).name}</b></span>
                  <small>{label(i.date)}</small>
                </div>
                <button className="btn line" onClick={() => answer(i, false)}>Decline</button>
                <button className="btn" onClick={() => answer(i, true)}>Accept</button>
              </div>
            ))}
          </div>
        )
        : <p className="empty">No new invitations.</p>}
      {earlier.length > 0 && (
        <section>
          <h3>Earlier</h3>
          <div className="list">
            {earlier.map(i => (
              <div key={i.id} className="row static">
                <span className="name muted">You {i.status} {store.project(i.project).name}</span>
                <small>{label(i.date)}</small>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
