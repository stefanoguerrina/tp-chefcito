// Contexto de autenticación: guarda la sesión (token + datos del usuario) en un único
// lugar y la comparte con toda la app (rutas protegidas, sidebar, cierre de sesión), en
// vez de pasar isAdmin/onLogout por props de componente en componente.
// El estado se maneja con useReducer: cada cambio de sesión es una acción con nombre.
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useReducer } from 'react';
import { decodeToken } from '../shared/utils/decodeToken.js';
import { SESSION_EXPIRED_EVENT } from '../shared/utils/apiFetch.js';

const TOKEN_STORAGE_KEY = 'token';

// Estado sin sesión iniciada.
const LOGGED_OUT_STATE = {
  isLoggedIn: false,
  isAdmin: false,
  userId: null,
  username: null,
  // true cuando la sesión se cerró sola porque el token venció (para avisarle al usuario).
  sessionExpired: false,
};

// Arma el estado de sesión a partir de un JWT, o null si el token es inválido o venció
// (el campo exp del JWT viene en segundos).
const sessionFromToken = (token) => {
  const payload = token ? decodeToken(token) : null;
  if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) return null;
  return {
    isLoggedIn: true,
    isAdmin: payload.isAdmin === true,
    userId: payload.id ?? null,
    username: payload.username ?? null,
    sessionExpired: false,
  };
};

// Estado inicial: si hay un token válido guardado, la sesión sobrevive a un F5.
const getInitialState = () => {
  const session = sessionFromToken(localStorage.getItem(TOKEN_STORAGE_KEY));
  if (!session) localStorage.removeItem(TOKEN_STORAGE_KEY);
  return session ?? LOGGED_OUT_STATE;
};

// Reducer de la sesión. Recibe el estado actual y una acción { type, payload? };
// devuelve el estado nuevo.
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return action.payload;
    case 'LOGOUT':
      return LOGGED_OUT_STATE;
    case 'SESSION_EXPIRED':
      return { ...LOGGED_OUT_STATE, sessionExpired: true };
    case 'DISMISS_SESSION_EXPIRED':
      return { ...state, sessionExpired: false };
    default:
      return state;
  }
};

const AuthContext = createContext(null);

// Provee la sesión a toda la app. Recibe: children.
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, undefined, getInitialState);

  // Guarda el token y abre la sesión. Recibe: el JWT devuelto por el login.
  // Devuelve: true si el token era válido.
  const login = (token) => {
    const session = sessionFromToken(token);
    if (!session) return false;
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    dispatch({ type: 'LOGIN', payload: session });
    return true;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    dispatch({ type: 'LOGOUT' });
  };

  const dismissSessionExpired = () => dispatch({ type: 'DISMISS_SESSION_EXPIRED' });

  // apiFetch avisa con un evento cuando el backend responde 401 (token vencido o
  // inválido): se cierra la sesión desde acá, sin que cada pantalla tenga que hacerlo.
  useEffect(() => {
    const handleSessionExpired = () => {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      dispatch({ type: 'SESSION_EXPIRED' });
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, dismissSessionExpired }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para leer la sesión desde cualquier componente dentro de AuthProvider.
// Devuelve: { isLoggedIn, isAdmin, userId, username, sessionExpired, login, logout,
// dismissSessionExpired }.
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext debe usarse dentro de <AuthProvider>.');
  return context;
};
