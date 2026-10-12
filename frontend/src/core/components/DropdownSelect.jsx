// Desplegable propio para elegir una opción de una lista, en lugar del <select> nativo:
// el nativo no deja darle estilo a su lista, que en listas largas muestra la barra de
// scroll del navegador. Este usa el mismo criterio que la lista del buscador del editor de
// recetas (RecipeSearchModal): se desliza con la ruedita o el dedo, sin barra visible.
import { useEffect, useRef, useState } from 'react';
import './_dropdown-select.scss';

// Recibe: id (del botón, para el htmlFor de su label), value (valor elegido), options
// ([{ value, label }]), placeholder (texto si no hay nada elegido), onChange(valor) y
// cualquier otro atributo para el botón (ej. los aria de getFieldAriaProps o aria-label).
function DropdownSelect({ id, value, options, placeholder = 'Elegí una opción', onChange, ...triggerProps }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const listRef = useRef(null);

  const selectedOption = options.find((option) => option.value === value);

  // Mientras está abierto, un click afuera lo cierra. El listener se agrega solo con el
  // desplegable abierto, y se saca al cerrarlo o al desmontarlo.
  useEffect(() => {
    if (!isOpen) return undefined;
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  // La lista siempre abre hacia abajo. Si queda tapada por el borde del modal (ej. en la
  // última fila), se desplaza lo justo para que se vea entera, en vez de abrirla hacia arriba.
  useEffect(() => {
    if (isOpen) listRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [isOpen]);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  // Escape cierra sin elegir nada (y sin cerrar el modal de afuera).
  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && isOpen) {
      event.stopPropagation();
      setIsOpen(false);
    }
  };

  return (
    <div className="DropdownSelect" ref={rootRef} onKeyDown={handleKeyDown}>
      <button
        {...triggerProps}
        id={id}
        type="button"
        className={`DropdownSelect-trigger${isOpen ? ' DropdownSelect-trigger--open' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={selectedOption ? 'DropdownSelect-value' : 'DropdownSelect-placeholder'}>
          {selectedOption?.label ?? placeholder}
        </span>
        <span className="material-symbols-outlined" aria-hidden="true">expand_more</span>
      </button>

      {isOpen && (
        <ul ref={listRef} className="DropdownSelect-list" role="listbox">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  className={`DropdownSelect-option${isSelected ? ' DropdownSelect-option--selected' : ''}`}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.label}
                  {isSelected && (
                    <span className="material-symbols-outlined" aria-hidden="true">check</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default DropdownSelect;
