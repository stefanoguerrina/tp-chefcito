import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Las paletas de los temas (styles/_themes.scss) no se importan acá: llegan antes, desde
// index.html (styles/critical.scss), para que la pantalla de carga ya tenga sus colores.
import './index.css'
import App from './app/App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
