// Test unitario del componente ErrorState: se renderiza en un DOM simulado (jsdom) con Testing
// Library y se revisa lo que ve y puede hacer el usuario: el mensaje y el botón "Reintentar".
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ErrorState from './ErrorState.jsx';

describe('ErrorState', () => {
  // Desmonta lo renderizado en cada test, así el siguiente arranca con la pantalla vacía.
  afterEach(() => {
    cleanup();
  });

  it('muestra el título por defecto y el mensaje de error que recibe', () => {
    render(<ErrorState message="No hay conexión con el servidor." />);

    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText('No pudimos cargar esta sección')).toBeTruthy();
    expect(screen.getByText('No hay conexión con el servidor.')).toBeTruthy();
  });

  it('muestra un título propio si se lo pasan', () => {
    render(<ErrorState title="No pudimos cargar tus recetas" message="Error" />);

    expect(screen.getByText('No pudimos cargar tus recetas')).toBeTruthy();
  });

  it('al tocar "Reintentar" llama a onRetry (output property)', () => {
    const handleRetry = vi.fn();
    render(<ErrorState message="Error" onRetry={handleRetry} />);

    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));

    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('sin onRetry no muestra el botón', () => {
    render(<ErrorState message="Error" />);

    expect(screen.queryByRole('button')).toBeNull();
  });
});
