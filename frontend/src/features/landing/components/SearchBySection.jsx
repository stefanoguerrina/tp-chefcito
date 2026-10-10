// Tercera pantalla de la landing: "Buscá por". A la izquierda, las tres formas de buscar en
// Chefcito; a la derecha, un mosaico con la foto de la opción que el visitante está mirando
// (ver SearchByMosaic). Reemplaza a la vieja sección "Explorar por categoría".
import { useState } from 'react';
import SearchByMosaic from './SearchByMosaic.jsx';
import ingredientsPhoto from '../../../assets/search-by-ingredients.jpg';
import categoriesPhoto from '../../../assets/search-by-categories.jpg';
import chefsPhoto from '../../../assets/search-by-chefs.jpg';
import '../styles/_search-by-section.scss';

// Las tres opciones del menú. `lines` son las dos líneas del título (se muestra en dos
// renglones, así que el corte se decide acá y no en el CSS) y `mosaicId` elige en qué
// figuras se divide la foto (ver MOSAICS en SearchByMosaic).
const SEARCH_BY_ITEMS = [
  {
    lines: ['Ingredientes', 'disponibles'],
    mosaicId: 'searchBy-layers',
    image: ingredientsPhoto,
  },
  {
    lines: ['Categorías', 'de recetas'],
    mosaicId: 'searchBy-mosaic',
    image: categoriesPhoto,
  },
  {
    lines: ['Nuestros', 'chefcitos'],
    mosaicId: 'searchBy-grid',
    image: chefsPhoto,
  },
];

// Recibe: onItemClick, invocado al elegir una de las tres opciones. El buscador todavía
// pide cuenta, así que abre el modal "necesitás una cuenta" (ver LandingPage).
function SearchBySection({ onItemClick }) {
  const [activeIndex, setActiveIndex] = useState(0);

  // El mosaico cambia al pasar el mouse por una opción y también al llegar a ella con el
  // teclado (onFocus), para que quien no usa mouse vea lo mismo.
  const handleItemActivate = (index) => setActiveIndex(index);

  return (
    <section className="SearchBySection">
      {/* Desde md: el texto (encabezado + listado) a la izquierda y el mosaico a la derecha,
          del mismo alto que todo el texto y centrado en el espacio que sobra. */}
      <div className="SearchBySection-body">
        <div className="SearchBySection-text">
          {/* Arranca en el mismo borde que el listado y "Buscá por" mide lo mismo de ancho
              que su título más largo, así se lee como el primer renglón de la lista. */}
          <header className="SearchBySection-header">
            <p className="SearchBySection-eyebrow">Encontrá tu próxima receta</p>
            <h2 className="SearchBySection-heading">Buscá por</h2>
          </header>

          <nav className="SearchBySection-menu">
            <ul>
              {SEARCH_BY_ITEMS.map((item, index) => (
                <li key={item.mosaicId}>
                  <button
                    type="button"
                    className={`SearchBySection-item${index === activeIndex ? ' SearchBySection-item--active' : ''}`}
                    onMouseEnter={() => handleItemActivate(index)}
                    onFocus={() => handleItemActivate(index)}
                    onClick={onItemClick}
                  >
                    <span className="SearchBySection-itemLabel">
                      {item.lines[0]}
                      <br />
                      {item.lines[1]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <SearchByMosaic item={SEARCH_BY_ITEMS[activeIndex]} />
      </div>
    </section>
  );
}

export default SearchBySection;
