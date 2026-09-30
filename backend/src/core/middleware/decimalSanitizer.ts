// Sanitizador compartido para los campos numéricos con decimales de express-validator. En
// Argentina se escribe "2,7" pero la base (y isFloat) esperan "2.7": se aceptan los dos y
// el valor sigue con punto, así se guarda igual se escriba como se escriba.
// Se usa en la cadena de reglas, antes de isFloat: body('value').customSanitizer(commaDecimalToDot).isFloat()

// Recibe: el valor del body. Devuelve: el mismo valor con la coma decimal cambiada por punto
// (solo si es texto: un número ya viene con punto y null/undefined quedan igual).
export const commaDecimalToDot = (value: unknown): unknown =>
  typeof value === 'string' ? value.trim().replace(',', '.') : value;
