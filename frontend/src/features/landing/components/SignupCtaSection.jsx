// Cuarta y última pantalla de la landing: la invitación a crearse una cuenta, con fotos de
// platos flotando alrededor del texto. Reemplaza a la vieja sección de comunidad.
// Las fotos son decorativas: van en un contenedor aria-hidden para que un lector de pantalla
// lea solo el título, el texto y el botón.
import burgerPhoto from '../../../assets/cta-burger.webp';
import dumplingsPhoto from '../../../assets/cta-dumplings.webp';
import pizzaPhoto from '../../../assets/cta-pizza.webp';
import basilPhoto from '../../../assets/cta-basil.webp';
import tomatoPhoto from '../../../assets/cta-tomato.webp';
import '../styles/_signup-cta-section.scss';

// Las fotos que flotan alrededor del texto. `place` es el sufijo de la clase que decide
// dónde va cada una y cuánto mide (ver _signup-cta-section.scss). El tomate aparece dos
// veces, en dos tamaños distintos.
const FLOATING_PHOTOS = [
  { place: 'burger', src: burgerPhoto },
  { place: 'dumplings', src: dumplingsPhoto },
  { place: 'pizza', src: pizzaPhoto },
  { place: 'basil', src: basilPhoto },
  { place: 'tomato', src: tomatoPhoto },
  { place: 'tomatoSmall', src: tomatoPhoto },
];

// Recibe: onRegisterClick, el mismo atajo al registro que usa el Navbar (viene de AuthPage).
function SignupCtaSection({ onRegisterClick }) {
  return (
    <section className="SignupCtaSection">
      <div className="SignupCtaSection-photos" aria-hidden="true">
        {FLOATING_PHOTOS.map((photo, index) => (
          // El retraso escalonado es lo que hace que no suban y bajen todas a la vez; va
          // inline porque depende de la posición en la lista.
          <img
            key={photo.place}
            src={photo.src}
            alt=""
            className={`SignupCtaSection-photo SignupCtaSection-photo--${photo.place}`}
            style={{ animationDelay: `${index * 0.3}s` }}
          />
        ))}
      </div>

      <div className="SignupCtaSection-content">
        <h2 className="SignupCtaSection-title">
          <span className="SignupCtaSection-titleAccent">Registrate</span> para desbloquear
          todo el potencial
        </h2>
        <p className="SignupCtaSection-description">
          Guardá recetas, cargá tu inventario y descubrí qué cocinar con lo que ya tenés.
        </p>
        <button type="button" className="SignupCtaSection-cta" onClick={onRegisterClick}>
          Crear mi cuenta
        </button>
      </div>
    </section>
  );
}

export default SignupCtaSection;
