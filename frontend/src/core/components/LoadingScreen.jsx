// Pantalla de carga de la app: ocupa toda la ventana con el spinner verde al centro. Se
// muestra mientras se descarga la página a la que se entra (fallback del <Suspense> de
// App.jsx). index.html tiene una copia de este mismo HTML dentro de #root para que se vea
// desde el primer instante, antes de que cargue React; si se cambia uno, cambiar el otro.
// Sus estilos (_loading-screen.scss) no se importan acá: llegan desde index.html a través
// de styles/critical.scss, para estar listos antes que el JS.
import SwirlingLoader from './SwirlingLoader.jsx';

function LoadingScreen() {
  return (
    <div className="LoadingScreen" role="status" aria-label="Cargando Chefcito">
      <SwirlingLoader className="LoadingScreen-spinner" width="64" height="64" />
    </div>
  );
}

export default LoadingScreen;
