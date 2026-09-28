import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/_themes.scss'
import './index.css'
import App from './app/App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
