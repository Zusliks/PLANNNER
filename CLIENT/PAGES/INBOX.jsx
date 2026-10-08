import { label, Title } from '../UI/BITS.jsx'

export default function INBOX({ store, go }) {
  const pending = store.invites.filter(i => i.status === 'pending')
  const earlier = store.invites.filter(i => i.status !== 'pending')

  const answer = (i, yes) => {
    store.answer(i.id, yes).then(() => yes && go('project', i.project))
  }

  return (
    <main className="page inbox">
      <div className="left">
        <Title text="INBOX" />
        <h2>{pending.length} invites waiting<br />for your answer.</h2>
        <h3>Earlier</h3>
        {earlier.map(i => (
          <p key={i.id}>You {i.status === 'accepted' ? 'joined' : 'declined'} {store.project(i.project).name}, {label(i.date)}</p>
        ))}
      </div>
      <div className="right">
        {pending.length === 0 && <p>No new invites.</p>}
        {pending.map((i, n) => (
          <div key={i.id} className={n === 0 ? 'invite' : 'invite small'}>
            {n === 0 && <Title text="YOU'RE INVITED" small />}
            <p>{store.person(i.from).name} wants you on</p>
            <h2>{store.project(i.project).name}</h2>
            <small>Sent {label(i.date)}</small>
            <div>
              <button className="btn" onClick={() => answer(i, true)}>ACCEPT</button>
              <button className="btn black" onClick={() => answer(i, false)}>DECLINE</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
