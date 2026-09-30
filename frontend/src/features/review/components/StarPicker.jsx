// Selector interactivo de rating de 1 a 5 estrellas (medias estrellas incluidas).
// Es distinto de StarRating (solo lectura en core/components) — este responde a
// hover y click del usuario para elegir el valor. Las estrellas se dibujan igual que
// RatingStars: el contorno siempre visible y, encima, el relleno con el degradé verde de
// la marca recortado hasta donde llega el valor (una media estrella muestra su mitad).
import { useState } from 'react';
import './_star-picker.scss';

// Recibe: value (número 0-5, el rating seleccionado actualmente),
//         onChange (función que recibe el nuevo rating al clickear).
function StarPicker({ value, onChange }) {
  // Rating que el mouse está sobrevolando; null si el mouse no está en el picker.
  const [hovered, setHovered] = useState(null);

  const displayValue = hovered ?? value;

  // Recibe: la posición de la estrella (1-5). Devuelve cuánto se pinta (0, 50 o 100%)
  // según el valor a mostrar (el sobrevolado o el elegido).
  const getFillPercent = (position) => {
    if (displayValue >= position) return 100;
    if (displayValue >= position - 0.5) return 50;
    return 0;
  };

  // Al mover el mouse sobre la mitad izquierda de una estrella → media estrella;
  // sobre la mitad derecha → estrella completa.
  const handleMouseMove = (event, position) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    setHovered(isLeftHalf ? position - 0.5 : position);
  };

  const handleClick = (event, position) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    onChange(isLeftHalf ? position - 0.5 : position);
  };

  return (
    <div
      className="StarPicker"
      onMouseLeave={() => setHovered(null)}
      role="group"
      aria-label="Seleccioná tu rating"
    >
      {[1, 2, 3, 4, 5].map((position) => (
        <span
          key={position}
          className="StarPicker-star"
          onMouseMove={(e) => handleMouseMove(e, position)}
          onClick={(e) => handleClick(e, position)}
          role="radio"
          aria-checked={value === position || value === position - 0.5}
          aria-label={`${position} estrella${position > 1 ? 's' : ''}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onChange(position);
          }}
        >
          <span className="StarPicker-outline material-symbols-outlined" aria-hidden="true">star</span>
          {getFillPercent(position) > 0 && (
            // El ancho depende del valor: es el único estilo que va en línea.
            <span className="StarPicker-fill" style={{ width: `${getFillPercent(position)}%` }} aria-hidden="true">
              <span className="StarPicker-fillIcon material-symbols-outlined">star</span>
            </span>
          )}
        </span>
      ))}
      {displayValue > 0 && (
        <span className="StarPicker-value">{displayValue.toFixed(1)}</span>
      )}
    </div>
  );
}

export default StarPicker;
