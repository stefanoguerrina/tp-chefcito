// Grilla masonry genérica (columnas tipo Pinterest): acomoda a sus hijos en
// columnas de alto disparejo, sin que ninguno quede partido entre dos columnas.
// Es solo layout: no sabe qué card recibe adentro, así que sirve para cualquier
// feature que quiera este acomodo (hoy la usa la galería del perfil con RecipeCard).
import { Children } from 'react';
import './_masonry-grid.scss';

// Recibe: children (las cards a distribuir). La cantidad de columnas se resuelve
// por media queries en el SCSS (1 en mobile, hasta 4 en desktop) en vez de
// escuchar el resize desde JS.
function MasonryGrid({ children }) {
  return (
    <div className="MasonryGrid">
      {/* El wrapper de cada hijo es el que lleva el break-inside, así la card
          que se pase adentro no necesita saber nada de este layout. */}
      {Children.map(children, (child) => (
        <div className="MasonryGrid-item">{child}</div>
      ))}
    </div>
  );
}

export default MasonryGrid;
