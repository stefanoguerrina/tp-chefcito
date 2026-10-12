// Contexto del usuario logueado: pide sus datos (nombre, apellido, fotos) UNA sola vez por
// sesión y los comparte con toda la app (pie de las sidebars, perfil propio). Así cada
// pantalla no vuelve a pedir el mismo usuario, y al editar el perfil todos ven el cambio
// al instante porque leen la misma copia.
// Es aparte de AuthContext a propósito: aquel guarda la sesión (token, id, rol) y este,
// los datos del perfil; toma el userId de la sesión con useAuthContext.
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useReducer } from 'react';
import { useAuthContext } from './AuthContext.jsx';
import { getUserByIdService } from '../features/user/services/getUserByIdService.js';

// userId = de qué usuario son los datos guardados. Si no coincide con el de la sesión
// actual (recién se logueó otro, o se está reintentando), todavía se están cargando.
const INITIAL_STATE = { userId: null, user: null, error: '', reloadCount: 0 };

// Reducer del usuario logueado. Recibe el estado actual y una acción { type, payload? };
// devuelve el estado nuevo.
const currentUserReducer = (state, action) => {
  switch (action.type) {
    case 'LOADED':
      return { ...state, userId: action.payload.userId, user: action.payload.user, error: '' };
    case 'FAILED':
      return { ...state, userId: action.payload.userId, user: null, error: action.payload.error };
    // Datos editados desde "Editar perfil": reemplazan a los guardados sin volver a pedirlos.
    case 'UPDATED':
      return { ...state, user: { ...state.user, ...action.payload } };
    // Reintento después de un error: vuelve a "cargando" y dispara otro pedido.
    case 'RELOAD':
      return { ...state, userId: null, error: '', reloadCount: state.reloadCount + 1 };
    default:
      return state;
  }
};

const CurrentUserContext = createContext(null);

// Provee el usuario logueado a toda la app. Recibe: children. Va dentro de AuthProvider.
export function CurrentUserProvider({ children }) {
  const { userId } = useAuthContext();
  const [state, dispatch] = useReducer(currentUserReducer, INITIAL_STATE);

  // Pide el usuario cada vez que cambia la sesión (o se reintenta). Sin sesión no pide
  // nada. El estado se actualiza solo dentro de los callbacks de la promesa, y si la
  // sesión cambió antes de que llegue la respuesta, esa respuesta se descarta.
  useEffect(() => {
    if (!userId) return undefined;
    let isStale = false;

    getUserByIdService(userId)
      .then((user) => {
        if (!isStale) dispatch({ type: 'LOADED', payload: { userId, user } });
      })
      .catch((err) => {
        if (!isStale) dispatch({ type: 'FAILED', payload: { userId, error: err.message } });
      });

    return () => {
      isStale = true;
    };
  }, [userId, state.reloadCount]);

  // Los datos guardados solo valen si son de la sesión actual (al cerrar sesión o entrar
  // con otra cuenta, los del usuario anterior dejan de mostrarse sin tener que borrarlos).
  const isCurrent = Boolean(userId) && state.userId === userId;

  const value = {
    currentUser: isCurrent ? state.user : null,
    currentUserError: isCurrent ? state.error : '',
    isCurrentUserLoading: Boolean(userId) && !isCurrent,
    // Recibe: el usuario actualizado (ej. el que devuelve el backend al editar el perfil).
    updateCurrentUser: (user) => dispatch({ type: 'UPDATED', payload: user }),
    reloadCurrentUser: () => dispatch({ type: 'RELOAD' }),
  };

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>;
}

// Hook para leer el usuario logueado desde cualquier componente dentro del provider.
// Devuelve: { currentUser (null mientras carga o sin sesión), currentUserError,
// isCurrentUserLoading, updateCurrentUser(user), reloadCurrentUser() }.
export const useCurrentUser = () => {
  const context = useContext(CurrentUserContext);
  if (!context) throw new Error('useCurrentUser debe usarse dentro de <CurrentUserProvider>.');
  return context;
};
