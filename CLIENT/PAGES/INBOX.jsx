import { label } from '../UI/BITS.jsx'

export default function INBOX({ store, go }) {
  const pending = store.invites.filter(i => i.status === 'pending')
  const earlier = store.invites.filter(i => i.status !== 'pending')

  const answer = (i, yes) => {
    store.answer(i.id, yes).then(() => yes && go('project', i.project))
  }

  return (
    <main className="page">
      <h1>Invitations</h1>
      <table>
        <tbody>
          {pending.map(i => (
            <tr key={i.id}>
              <td>{store.person(i.from).name} invited you to <b>{store.project(i.project).name}</b></td>
              <td>{label(i.date)}</td>
              <td>
                <button className="btn white" onClick={() => answer(i, false)}>Decline</button>
                <button className="btn" onClick={() => answer(i, true)}>Accept</button>
              </td>
            </tr>
          ))}
          {pending.length === 0 && <tr><td>No new invitations.</td></tr>}
        </tbody>
      </table>
      <h3>Earlier</h3>
      <ul>
        {earlier.map(i => (
          <li key={i.id}>You {i.status === 'accepted' ? 'joined' : 'declined'} {store.project(i.project).name} ({label(i.date)})</li>
        ))}
      </ul>
    </main>
  )
}
