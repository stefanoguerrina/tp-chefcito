// Botón "Categorías" con menú desplegable para filtrar la galería por varias
// categorías a la vez (checkboxes), en vez de un selector de una sola.
import { useState, useEffect, useRef } from 'react';
import '../styles/_category-filter-dropdown.scss';

// Recibe: categories (las categorías disponibles: { id, name }), selectedIds
// (array de ids elegidos) y onChange(nuevosIds), que devuelve la selección
// completa ya actualizada.
function CategoryFilterDropdown({ categories, selectedIds, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Sin categorías cargadas no hay nada por lo que filtrar, pero el botón se
  // muestra igual (deshabilitado) para que la opción no desaparezca de la barra.
  const hasCategories = categories.length > 0;

  // Cierra el menú al clickear afuera. Si no, queda abierto tapando las cards
  // hasta que el usuario vuelva a tocar el botón.
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Suma o saca una categoría de la selección actual.
  const handleToggleCategory = (categoryId) => {
    const nextIds = selectedIds.includes(categoryId)
      ? selectedIds.filter((id) => id !== categoryId)
      : [...selectedIds, categoryId];
    onChange(nextIds);
  };

  return (
    <div className="CategoryFilterDropdown" ref={containerRef}>
      <button
        type="button"
        className={`CategoryFilterDropdown-trigger${selectedIds.length > 0 ? ' CategoryFilterDropdown-trigger--active' : ''}`}
        onClick={() => setIsOpen((open) => !open)}
        disabled={!hasCategories}
        title={hasCategories ? undefined : 'Todavía no hay categorías cargadas'}
        aria-expanded={isOpen}
      >
        <span className="material-symbols-outlined">sell</span>
        Categorías
        {selectedIds.length > 0 && (
          <span className="CategoryFilterDropdown-badge">{selectedIds.length}</span>
        )}
        <span className="material-symbols-outlined">{isOpen ? 'expand_less' : 'expand_more'}</span>
      </button>

      {isOpen && (
        <div className="CategoryFilterDropdown-menu">
          <div className="CategoryFilterDropdown-menuHeader">
            <span>Filtrar por categoría</span>
            {selectedIds.length > 0 && (
              <button
                type="button"
                className="CategoryFilterDropdown-clear"
                onClick={() => onChange([])}
              >
                Limpiar
              </button>
            )}
          </div>

          <ul className="CategoryFilterDropdown-list">
            {categories.map((category) => (
              <li key={category.id}>
                <label className="CategoryFilterDropdown-option">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(category.id)}
                    onChange={() => handleToggleCategory(category.id)}
                  />
                  <span>{category.name}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CategoryFilterDropdown;
