// Utilidades para los campos de número con decimales (cantidades, valores nutricionales).
// Acá se usa la coma como separador ("2,7") pero el navegador y la base esperan punto
// ("2.7"): se aceptan los dos y el valor queda siempre con punto, así se guarda igual se
// escriba como se escriba.

// Decimales que guarda la base en esas columnas (Decimal(10,2)).
const MAX_DECIMALS = 2;

// Normaliza lo que se escribe en el input.
// Recibe: el texto del input. Devuelve: solo dígitos y, como mucho, un punto decimal con
// hasta 2 decimales (ej. "2,7" -> "2.7", "1.5kg" -> "1.5", "3,,2" -> "3.2", "0,125" -> "0.12").
export const normalizeDecimalInput = (text) => {
  const withDot = text.replace(/,/g, '.').replace(/[^\d.]/g, '');
  const [integerPart, ...decimalParts] = withDot.split('.');
  if (decimalParts.length === 0) return integerPart;
  return `${integerPart}.${decimalParts.join('').slice(0, MAX_DECIMALS)}`;
};

// Indica si el texto (ya normalizado) es una cantidad válida: un número mayor o igual a 0.
// Recibe: el texto. Devuelve: true/false ("" y "." no son válidos).
export const isValidQuantity = (text) => text.trim() !== '' && Number(text) >= 0;

// Suma o resta 1 a una cantidad (botones +/-), sin bajar de 0. Redondea a 2 decimales
// para que 0.1 + 1 no quede como 1.1000000000000001.
// Recibe: el texto actual y delta (1 o -1). Devuelve: el texto nuevo.
export const stepQuantity = (text, delta) => {
  const current = isValidQuantity(text) ? Number(text) : 0;
  const next = Math.max(0, current + delta);
  return String(Math.round(next * 100) / 100);
};
