// Utilidad para leer el payload de un JWT sin verificar su firma (eso ya lo hizo
// el backend al emitirlo). Solo se usa para leer campos no sensibles como el id
// del usuario autenticado (ver app/AuthContext.jsx).

// Recibe: un JWT (string). Devuelve el payload decodificado o null si es inválido.
export const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
};
