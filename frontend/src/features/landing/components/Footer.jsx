// Pie de página de la landing: marca, atajos a las pantallas de la página, qué se puede
// hacer con una cuenta, los accesos a login/registro y el copyright.
import '../styles/_footer.scss';

// Atajos a las pantallas de la landing. Los ids los pone LandingPage; el scroll suave lo
// hace el navegador (ver _landing-page.scss).
const SECTION_LINKS = [
  { href: '#top', label: 'Inicio' },
  { href: '#recetas-del-momento', label: 'Recetas del momento' },
  { href: '#buscar-por', label: 'Formas de buscar' },
  { href: '#registrate', label: 'Crear una cuenta' },
];

// Lo que se desbloquea al registrarse. Es texto, no enlaces: todavía piden cuenta.
const FEATURES = [
  'Buscar con los ingredientes que tenés',
  'Guardar las recetas que te gustan',
  'Publicar y editar las tuyas',
  'Seguir a otros chefcitos y reseñar',
  'Donar a quienes te inspiran',
];

// Recibe: onLoginClick y onRegisterClick, los mismos atajos del Navbar (vienen de AuthPage).
function Footer({ onLoginClick, onRegisterClick }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="Footer">
      <div className="Footer-content">
        <div className="Footer-brand">
          <span className="Footer-logo">
            <span className="material-symbols-outlined">restaurant_menu</span>
            Chefcito
          </span>
          <p>
            Cociná con lo que ya tenés en casa: cargá tu inventario, descubrí recetas que te
            entran con esos ingredientes y compartí las tuyas con la comunidad.
          </p>
        </div>

        <div className="Footer-column">
          <h3>Explorar</h3>
          <ul>
            {SECTION_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="Footer-column">
          <h3>Con tu cuenta podés</h3>
          <ul>
            {FEATURES.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>

        <div className="Footer-column">
          <h3>Tu cuenta</h3>
          <ul>
            <li>
              <button type="button" className="Footer-action" onClick={onRegisterClick}>
                Registrarse
              </button>
            </li>
            <li>
              <button type="button" className="Footer-action" onClick={onLoginClick}>
                Iniciar sesión
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="Footer-bottom">
        <p>© {currentYear} Chefcito. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

export default Footer;
