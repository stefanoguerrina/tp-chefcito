// Bandera argentina chica (SVG propio, sin depender de emojis: en Windows las banderas en
// emoji se ven como las letras "AR"). Se usa junto a la característica +54 de los teléfonos.
// Los colores son los de la bandera, no del tema: tiene que verse igual en claro y oscuro.
// Recibe: className (para darle tamaño desde el SASS de quien la usa).
function ArgentinaFlag({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 3 2" aria-hidden="true">
      <rect width="3" height="2" fill="#fff" />
      <rect width="3" height="0.667" fill="#74acdf" />
      <rect width="3" height="0.667" y="1.333" fill="#74acdf" />
      <circle cx="1.5" cy="1" r="0.28" fill="#f6b40e" />
    </svg>
  );
}

export default ArgentinaFlag;
