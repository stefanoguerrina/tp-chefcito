// Lleva la cuenta de los pedidos al backend que están en curso y de las secciones que ya
// muestran su propio spinner (LoadingState), y avisa a quien esté suscripto cada vez que
// cambia (patrón Observer). Lo usan apiFetch (que cuenta los pedidos) y RequestIndicator
// (que muestra el loader global): así el loader funciona para TODOS los pedidos sin que
// cada pantalla tenga que acordarse de mostrarlo.

let pendingRequests = 0;
let visibleSectionLoaders = 0;
const listeners = new Set();

const notifyListeners = () => listeners.forEach((listener) => listener());

// apiFetch llama a estas dos al empezar y al terminar (bien o mal) cada pedido.
export const requestStarted = () => {
  pendingRequests += 1;
  notifyListeners();
};

export const requestFinished = () => {
  pendingRequests = Math.max(pendingRequests - 1, 0);
  notifyListeners();
};

// LoadingState llama a estas dos al aparecer y al desaparecer.
export const sectionLoaderShown = () => {
  visibleSectionLoaders += 1;
  notifyListeners();
};

export const sectionLoaderHidden = () => {
  visibleSectionLoaders = Math.max(visibleSectionLoaders - 1, 0);
  notifyListeners();
};

// Devuelve true si hay algún pedido en curso y ninguna sección lo está indicando con su
// propio spinner (si la pantalla ya muestra uno, un segundo loader sería redundante).
export const needsGlobalLoader = () => pendingRequests > 0 && visibleSectionLoaders === 0;

// Recibe una función que se llama en cada cambio. Devuelve la función para desuscribirse.
export const subscribeToRequests = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
