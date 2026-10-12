// Test unitario del CU "Donaciones a creadores": cómo se decide el estado de una donación a
// partir de los pagos de Mercado Pago y cómo se arma el resumen del historial. Son funciones
// puras: no llaman a Mercado Pago ni a la base.
import { describe, it, expect } from 'vitest';
import { statusFromPayments, buildHistorySide } from './donationService.js';
import type { DonationHistoryItem, DonationStatus } from '../models/donationModel.js';

// Arma una fila del historial con lo mínimo que usa buildHistorySide.
const historyItem = (otherUserId: number, amount: number, status: DonationStatus): DonationHistoryItem => ({
  transactionRef: `ref-${otherUserId}-${amount}-${status}`,
  amount,
  currency: 'ARS',
  status,
  tierLabel: null,
  tierIcon: null,
  createdAt: null,
  otherUser: { id: otherUserId, username: `user${otherUserId}`, name: 'Nombre', lastName: 'Apellido', avatarUrl: null },
});

describe('statusFromPayments', () => {
  it('sin ningún pago todavía, no hay estado para actualizar', () => {
    expect(statusFromPayments([])).toBeNull();
  });

  it('si algún intento se aprobó, la donación está completada', () => {
    expect(statusFromPayments([{ status: 'rejected' }, { status: 'approved' }])).toBe('completed');
  });

  it('un pago en proceso deja la donación pendiente', () => {
    expect(statusFromPayments([{ status: 'rejected' }, { status: 'in_process' }])).toBe('pending');
  });

  it('si todos los intentos fallaron, la donación queda rechazada', () => {
    expect(statusFromPayments([{ status: 'rejected' }, { status: 'cancelled' }])).toBe('rejected');
  });
});

describe('buildHistorySide', () => {
  it('cuenta solo las completadas en el total, la cantidad y el promedio', () => {
    const side = buildHistorySide([
      historyItem(1, 1000, 'completed'),
      historyItem(2, 2500, 'completed'),
      historyItem(3, 10000, 'pending'),
      historyItem(4, 5000, 'rejected'),
    ]);

    expect(side.stats).toEqual({ totalAmount: 3500, count: 2, averageAmount: 1750 });
    // La lista muestra todas, aunque no sumen.
    expect(side.items).toHaveLength(4);
  });

  it('suma las donaciones de una misma persona y ordena el top de mayor a menor', () => {
    const side = buildHistorySide([
      historyItem(1, 1000, 'completed'),
      historyItem(2, 5000, 'completed'),
      historyItem(1, 10000, 'completed'),
    ]);

    expect(side.topUsers.map((top) => ({ id: top.user.id, totalAmount: top.totalAmount, count: top.count }))).toEqual([
      { id: 1, totalAmount: 11000, count: 2 },
      { id: 2, totalAmount: 5000, count: 1 },
    ]);
  });

  it('el top muestra como máximo 5 personas', () => {
    const items = [1, 2, 3, 4, 5, 6].map((userId) => historyItem(userId, userId * 1000, 'completed'));

    const side = buildHistorySide(items);

    expect(side.topUsers).toHaveLength(5);
    expect(side.topUsers[0].user.id).toBe(6);
  });

  it('sin donaciones completadas, el promedio es 0', () => {
    expect(buildHistorySide([historyItem(1, 1000, 'pending')]).stats).toEqual({
      totalAmount: 0,
      count: 0,
      averageAmount: 0,
    });
  });
});
