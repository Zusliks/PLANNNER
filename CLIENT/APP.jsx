import { useState } from 'react'
import AUTH from './AUTH/AUTH.jsx'

export default function APP() {
  const [user, setUser] = useState(null)
  return user ? <canvas className="blank" /> : <AUTH onAuth={setUser} />
}
