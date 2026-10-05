import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import APP from './APP.jsx'
import './STYLE.css'

createRoot(document.getElementById('root')).render(<StrictMode><APP /></StrictMode>)
