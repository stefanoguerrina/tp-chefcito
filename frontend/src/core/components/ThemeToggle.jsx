// Botón de ícono que alterna entre modo claro y modo oscuro. Se reutiliza en la sidebar
// del usuario, en la del admin y en la navbar de la landing.
import { useThemeContext } from '../../app/ThemeContext.jsx';
import './_theme-toggle.scss';

function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useThemeContext();
  // El ícono muestra el modo al que se va a pasar, no el actual (como la mayoría de las apps).
  const label = isDarkMode ? 'Activar modo claro' : 'Activar modo oscuro';

  return (
    <button type="button" className="ThemeToggle" onClick={toggleTheme} title={label} aria-label={label}>
      <span className="material-symbols-outlined">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
    </button>
  );
}

export default ThemeToggle;
