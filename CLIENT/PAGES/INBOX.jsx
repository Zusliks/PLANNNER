import { Avatar, pad } from '../UI/BITS.jsx'

export default function INBOX({ store, go }) {
  const pending = store.invites.filter(i => i.status === 'pending')
  const earlier = store.invites.filter(i => i.status !== 'pending')

  const answer = (i, yes) => {
    store.answer(i.id, yes).then(() => yes && go('project', i.project))
  }

  return (
    <main className="page">
      <section className="side">
        <small>Inbox</small>
        <h1 className="big">{pad(pending.length)}</h1>
        <h2>Invites</h2>
        <p>Accept to join the project</p>
      </section>
      <section className="list">
        {!pending.length && <p className="empty">No new invites.</p>}
        {pending.map(i => {
          const from = store.person(i.from)
          return (
            <div key={i.id} className="invite">
              <header>
                <Avatar name={from.name} size={44} />
                <div>
                  <small>{from.name} invites you to</small>
                  <h3>{store.project(i.project).name}</h3>
                </div>
                <small>{i.date}</small>
              </header>
              <footer>
                <button className="btn" onClick={() => answer(i, true)}>Accept</button>
                <button className="btn line" onClick={() => answer(i, false)}>Decline</button>
              </footer>
            </div>
          )
        })}
        {earlier.length > 0 && <small className="group">earlier</small>}
        {earlier.map(i => (
          <div key={i.id} className="member">
            <Avatar name={store.person(i.from).name} />
            <div>{store.person(i.from).name}, {store.project(i.project).name}</div>
            <small>{i.status}</small>
          </div>
        ))}
      </section>
    </main>
  )
}
