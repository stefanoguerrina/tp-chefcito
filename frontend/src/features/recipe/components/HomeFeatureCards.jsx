// Tres accesos rápidos a las distintas formas de explorar recetas en Chefcito.
// "Cargá tus ingredientes" ya lleva al inventario; la búsqueda avanzada y el asistente
// IA todavía no existen, así que se muestran deshabilitados con la etiqueta "Próximamente".
import { Link } from 'react-router-dom';
import '../styles/_home-feature-cards.scss';

const FEATURE_CARDS = [
  { icon: 'kitchen', label: 'Cargá tus ingredientes', accent: 'secondary', to: '/inventario' },
  { icon: 'manage_search', label: 'Buscá por categoría, receta o usuario', accent: 'tertiary', to: null },
  { icon: 'psychology', label: 'Consultá a la IA qué podés hacer', accent: 'primary', to: null },
];

function HomeFeatureCards() {
  return (
    <section className="HomeFeatureCards">
      <div className="HomeFeatureCards-grid">
        {FEATURE_CARDS.map((card) => {
          const className = `HomeFeatureCards-card HomeFeatureCards-card--${card.accent}`;
          const content = (
            <>
              <span className="material-symbols-outlined">{card.icon}</span>
              <span>{card.label}</span>
              {!card.to && <span className="HomeFeatureCards-soon">Próximamente</span>}
            </>
          );

          return card.to ? (
            <Link key={card.label} to={card.to} className={className}>
              {content}
            </Link>
          ) : (
            <button key={card.label} type="button" className={className} disabled>
              {content}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default HomeFeatureCards;
