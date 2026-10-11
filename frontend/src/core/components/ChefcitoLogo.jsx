// Logo de Chefcito (gorro de chef). Tiene dos versiones y elige sola según el tema activo:
// verde oliva para el modo claro y verde claro para el modo oscuro.
import { useThemeContext } from '../../app/ThemeContext.jsx';
import lightThemeLogo from '../../assets/chefcito-logo-light-theme.png';
import darkThemeLogo from '../../assets/chefcito-logo-dark-theme.png';
import './_chefcito-logo.scss';

// Recibe: className (para que cada lugar elija el tamaño) y onDarkBackground (true si el
// fondo es oscuro en los dos temas, como el footer: ahí siempre va la versión del modo oscuro).
function ChefcitoLogo({ className = '', onDarkBackground = false }) {
  const { isDarkMode } = useThemeContext();
  const logo = isDarkMode || onDarkBackground ? darkThemeLogo : lightThemeLogo;

  return (
    // alt vacío: siempre va al lado del texto "Chefcito" o de un título, que ya lo nombran.
    <img className={`ChefcitoLogo ${className}`} src={logo} alt="" />
  );
}

export default ChefcitoLogo;
