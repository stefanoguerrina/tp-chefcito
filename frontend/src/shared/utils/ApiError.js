// Error de la API: además del mensaje amigable, guarda el código HTTP y los errores por
// campo que devolvió el backend. Permite decidir qué hacer según el status (ej. 404 = lista
// vacía, 409 = duplicado) en vez de comparar textos del mensaje.
export class ApiError extends Error {
  // Recibe: message (texto para el usuario), status (código HTTP, 0 si no hubo respuesta),
  // fieldErrors ([{ campo, mensaje }], vacío si no aplica) y data (el body crudo del error).
  constructor(message, status = 0, fieldErrors = [], data = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.data = data;
  }

  get isNotFound() {
    return this.status === 404;
  }

  get isConflict() {
    return this.status === 409;
  }

  get isNetworkError() {
    return this.status === 0;
  }
}
