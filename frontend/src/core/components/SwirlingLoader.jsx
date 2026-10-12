// Spinner animado (un círculo que gira y se estira): indica que algo está cargando. Toma el
// color del texto del elemento que lo contiene (stroke="currentColor"), así se puede
// pintar con cualquier color del tema desde el CSS del padre.
// Sus estilos (_swirling-loader.scss) llegan desde index.html a través de
// styles/critical.scss (los usa la pantalla de carga, que se ve antes de que cargue el JS).

// Recibe: className (opcional, ej. para darle tamaño) y cualquier otro atributo del <svg>.
function SwirlingLoader({ className = '', ...svgProps }) {
  return (
    <svg
      className={`SwirlingLoader ${className}`.trim()}
      viewBox="0 0 800 800"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...svgProps}
    >
      <circle
        className="SwirlingLoader-circle"
        cx="400"
        cy="400"
        r="200"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="50"
      />
    </svg>
  );
}

export default SwirlingLoader;
