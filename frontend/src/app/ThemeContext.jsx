// Contexto del tema visual (claro u oscuro): guarda el tema elegido, lo recuerda en
// localStorage y lo aplica como atributo data-theme en <html>. Las variables CSS de
// styles/_themes.scss leen ese atributo, así que cambiarlo recolorea toda la app.
// Mismo patrón que AuthContext: Context API + useReducer.
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useLayoutEffect, useReducer } from 'react';

const THEME_STORAGE_KEY = 'theme';

// Tema inicial: el que el usuario eligió la última vez; si nunca eligió, el del sistema
// operativo (si tiene el modo oscuro activado, la app arranca en oscuro).
const getInitialTheme = () => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Reducer del tema. Recibe el tema actual ('light' | 'dark') y una acción { type };
// devuelve el tema nuevo.
const themeReducer = (theme, action) => {
  switch (action.type) {
    case 'TOGGLE':
      return theme === 'dark' ? 'light' : 'dark';
    default:
      return theme;
  }
};

const ThemeContext = createContext(null);

// Provee el tema a toda la app. Recibe: children.
export function ThemeProvider({ children }) {
  const [theme, dispatch] = useReducer(themeReducer, undefined, getInitialTheme);

  // useLayoutEffect (y no useEffect) para que el atributo se aplique antes de que el
  // navegador pinte: si no, al recargar en modo oscuro se vería un parpadeo del claro.
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = () => {
    localStorage.setItem(THEME_STORAGE_KEY, theme === 'dark' ? 'light' : 'dark');
    dispatch({ type: 'TOGGLE' });
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode: theme === 'dark', toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook para leer el tema desde cualquier componente dentro de ThemeProvider.
// Devuelve: { theme, isDarkMode, toggleTheme }.
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemeContext debe usarse dentro de <ThemeProvider>.');
  return context;
};
