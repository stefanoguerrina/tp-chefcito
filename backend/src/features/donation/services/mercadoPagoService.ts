// Cliente mínimo de la API REST de Mercado Pago (Checkout Pro), hecho con fetch para no sumar
// el SDK como dependencia. Solo usa dos endpoints: crear una preferencia de pago (el link al
// checkout) y consultar un pago. Lanza MercadoPagoHttpError si Mercado Pago responde con error.
const MERCADO_PAGO_API_URL = 'https://api.mercadopago.com';
const REQUEST_TIMEOUT_MS = 15000;

// Error HTTP de Mercado Pago con su código, para distinguir casos (ej. 404 = pago inexistente).
export class MercadoPagoHttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// Datos que Chefcito usa de un pago de Mercado Pago (la respuesta trae muchos más).
export interface MercadoPagoPayment {
  id: number;
  status: string;
  external_reference: string | null;
}

// Recibe el access token, el método, la ruta y el body opcional. Devuelve el JSON de la respuesta.
async function requestMercadoPago(accessToken: string, method: 'GET' | 'POST', path: string, body?: unknown) {
  const response = await fetch(`${MERCADO_PAGO_API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new MercadoPagoHttpError(response.status, `Mercado Pago respondió ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

// Recibe el access token y los datos del pago. Crea una preferencia de Checkout Pro y devuelve
// la URL del checkout, a donde el frontend redirige al usuario para pagar.
export async function createCheckoutPreference(accessToken: string, preference: {
  itemId: string;
  title: string;
  amount: number;
  currency: string;
  externalReference: string;
  returnUrl: string;
  expiresAt: Date;
}): Promise<string> {
  const data = await requestMercadoPago(accessToken, 'POST', '/checkout/preferences', {
    items: [{
      id: preference.itemId,
      title: preference.title,
      quantity: 1,
      currency_id: preference.currency,
      unit_price: preference.amount,
    }],
    // Con esta referencia se reconoce la donación cuando el usuario vuelve del checkout.
    external_reference: preference.externalReference,
    // Mercado Pago vuelve a la misma página en los tres casos y agrega en la URL el
    // payment_id y el estado; la página decide qué mostrar según el pago real.
    back_urls: { success: preference.returnUrl, failure: preference.returnUrl, pending: preference.returnUrl },
    // La vuelta automática solo se pide con una URL pública (https): Mercado Pago no la
    // acepta con localhost. En local, el usuario vuelve con el botón "Volver al sitio".
    ...(preference.returnUrl.startsWith('https://') ? { auto_return: 'approved' } : {}),
    statement_descriptor: 'CHEFCITO',
    // El link de pago vence: así, cuando una donación pendiente se da por vencida, ya nadie
    // puede pagarla después.
    expires: true,
    expiration_date_to: preference.expiresAt.toISOString(),
  });
  // Los tokens de prueba viejos (TEST-...) solo funcionan con el checkout de sandbox; los
  // APP_USR (incluidos los de cuentas de prueba) usan el checkout normal.
  return accessToken.startsWith('TEST-') ? data.sandbox_init_point : data.init_point;
}

// Recibe el access token y el id del pago. Devuelve el pago tal como lo tiene Mercado Pago.
export async function getPayment(accessToken: string, paymentId: string): Promise<MercadoPagoPayment> {
  return requestMercadoPago(accessToken, 'GET', `/v1/payments/${encodeURIComponent(paymentId)}`);
}

// Recibe el access token y la referencia de una donación (external_reference). Devuelve los
// pagos que Mercado Pago tiene con esa referencia (vacío si nadie pagó todavía).
export async function searchPaymentsByReference(accessToken: string, externalReference: string): Promise<MercadoPagoPayment[]> {
  const data = await requestMercadoPago(
    accessToken,
    'GET',
    `/v1/payments/search?external_reference=${encodeURIComponent(externalReference)}`
  );
  return data.results ?? [];
}
