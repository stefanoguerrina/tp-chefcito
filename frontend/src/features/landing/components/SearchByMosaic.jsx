// Mosaico animado de la pantalla "Buscá por": una foto dividida en teselas que aparecen,
// "respiran" y se van, en bucle. La animación es CSS (ver _search-by-section.scss), así no
// hace falta ninguna librería de animación.
// Es decorativo: no lleva texto ni es clickeable (lo interactivo es el menú de al lado).
//
// Cómo se logra que la foto se vea quieta mientras las teselas crecen: la foto se declara
// una sola vez como <pattern> del tamaño del lienzo y cada tesela es una figura rellena con
// ese patrón. Como el patrón se ancla al lienzo (patternUnits="userSpaceOnUse") y no a cada
// figura, todas muestran la parte de la foto que les toca, como si fuera una sola imagen
// recortada. Se animan las figuras, que son elementos visibles del SVG (los hijos de un
// <clipPath> viven en <defs> y no todos los navegadores les corren las animaciones).

// Id del patrón con la foto. Es único en la página: hay un solo mosaico en la landing.
const PHOTO_PATTERN_ID = 'searchBy-photo';

// Los mosaicos, en coordenadas del lienzo de 500x500. De cada uno se guardan:
//   - viewBox: el recorte del lienzo hasta donde llegan sus figuras (incluido el 4% que
//     crecen al "respirar"). Recortarlo es lo que hace que la foto llene la caja en vez de
//     dejar franjas vacías arriba y abajo;
//   - shapes: las teselas, guardadas como los atributos del elemento SVG que las dibuja
//     (las que tienen `d` son <path> y el resto <rect>).
// Los ids los elige SearchBySection (uno por opción del menú).
const MOSAICS = {
  // Capas apiladas (como los ingredientes de un sándwich).
  'searchBy-layers': {
    viewBox: '0 70 500 360',
    shapes: [
      { d: 'M480.6,235H19.4c-6,0-10.8-4.9-10.8-10.8v-9.5c0-6,4.9-10.8,10.8-10.8h461.1c6,0,10.8,4.9,10.8,10.8v9.5C491.4,230.2,486.6,235,480.6,235z' },
      { d: 'M483.1,362.4H16.9c-4.6,0-8.3-3.7-8.3-8.3v-1.8c0-4.6,3.7-8.3,8.3-8.3h466.1c4.6,0,8.3,3.7,8.3,8.3v1.8C491.4,358.7,487.7,362.4,483.1,362.4z' },
      { d: 'M460.3,336.3H39.7c-17.2,0-31.1-13.9-31.1-31.1v-31.5c0-17.2,13.9-31.1,31.1-31.1h420.7c17.2,0,31.1,13.9,31.1,31.1v31.5C491.4,322.4,477.5,336.3,460.3,336.3z' },
      { d: 'M459.2,196.2H40.8v-35c0-47.5,38.5-86,86-86h246.5c47.5,0,86,38.5,86,86V196.2z' },
      { d: 'M441.9,424.9H58.1c-9.6,0-17.3-7.8-17.3-17.3v-37.4h418.5v37.4C459.2,417.1,451.5,424.9,441.9,424.9z' },
    ],
  },
  // Baldosas de distinto tamaño (como las tarjetas de un listado de categorías).
  'searchBy-mosaic': {
    viewBox: '10 10 480 480',
    shapes: [
      { x: 20, y: 20, width: 200, height: 280, rx: 12 },
      { x: 20, y: 320, width: 200, height: 160, rx: 12 },
      { x: 240, y: 20, width: 240, height: 140, rx: 12 },
      { x: 240, y: 180, width: 110, height: 160, rx: 12 },
      { x: 370, y: 180, width: 110, height: 160, rx: 12 },
      { x: 240, y: 360, width: 240, height: 120, rx: 12 },
    ],
  },
  // Grilla de 9 cuadrados iguales (como las fotos de perfil de la comunidad).
  'searchBy-grid': {
    viewBox: '10 10 480 480',
    shapes: Array.from({ length: 9 }, (unused, index) => ({
      x: (index % 3) * 160 + 20,
      y: Math.floor(index / 3) * 160 + 20,
      width: 140,
      height: 140,
      rx: 4,
    })),
  },
};

// Recibe: item, la opción activa del menú ({ mosaicId, image, ... }).
// Devuelve el SVG con la foto de esa opción dividida según su mosaico.
// Se remonta al cambiar de opción (key en el <svg>): así la animación de las teselas
// arranca de cero en cada cambio en vez de seguir a mitad de camino.
function SearchByMosaic({ item }) {
  const fill = `url(#${PHOTO_PATTERN_ID})`;
  const mosaic = MOSAICS[item.mosaicId];

  return (
    <div className="SearchByMosaic">
      <div className="SearchByMosaic-glow" aria-hidden="true" />

      <svg
        key={item.mosaicId}
        className="SearchByMosaic-svg"
        viewBox={mosaic.viewBox}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <pattern id={PHOTO_PATTERN_ID} patternUnits="userSpaceOnUse" width="500" height="500">
            <image href={item.image} width="500" height="500" preserveAspectRatio="xMidYMid slice" />
          </pattern>
        </defs>

        {mosaic.shapes.map((shape, index) => {
          // El retraso escalonado (0.07s por tesela) es lo que hace que aparezcan de a una
          // en vez de todas juntas; va inline porque depende de la posición.
          const style = { animationDelay: `${index * 0.07}s` };
          return shape.d
            ? <path key={index} className="SearchByMosaic-tile" d={shape.d} fill={fill} style={style} />
            : <rect key={index} className="SearchByMosaic-tile" {...shape} fill={fill} style={style} />;
        })}
      </svg>
    </div>
  );
}

export default SearchByMosaic;
