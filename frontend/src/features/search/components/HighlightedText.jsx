// Muestra un texto resaltando (<mark>) las partes que coinciden con lo que se buscó.
import '../styles/_search-result-items.scss';

// Escapa los caracteres especiales de una expresión regular, para que buscar "c++" o
// "(vegano)" se tome como texto literal y no rompa el RegExp.
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Saca las tildes ("María" → "Maria"): separa cada letra de su tilde (NFD) y borra las
// tildes sueltas (\p{M} = cualquier marca: tilde, diéresis). Así se resalta igual que
// busca MySQL, que no distingue tildes.
const removeAccents = (text) => text.normalize('NFD').replace(/\p{M}/gu, '');

// Recibe: text (el texto a mostrar) y term (lo buscado). Cada palabra de term se resalta
// por separado, igual que el backend busca "santiago pas" palabra por palabra.
function HighlightedText({ text, term }) {
  const words = removeAccents(term).trim().split(/\s+/).filter(Boolean).map(escapeRegExp);
  const comparableText = removeAccents(text);
  // Las coincidencias se buscan en el texto sin tildes, pero se muestra el original: sirve
  // porque cada letra con tilde queda como una sola letra sin tilde (mismas posiciones).
  // Si por algún motivo el largo cambió, se muestra el texto sin resaltar.
  if (words.length === 0 || comparableText.length !== text.length) return text;

  const parts = [];
  let lastIndex = 0;
  for (const match of comparableText.matchAll(new RegExp(words.join('|'), 'gi'))) {
    const start = match.index;
    const end = start + match[0].length;
    if (start > lastIndex) parts.push(text.slice(lastIndex, start));
    parts.push(
      <mark key={start} className="HighlightedText">
        {text.slice(start, end)}
      </mark>
    );
    lastIndex = end;
  }
  parts.push(text.slice(lastIndex));

  return <>{parts}</>;
}

export default HighlightedText;
