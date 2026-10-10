// Punto de entrada del backend (npm run dev / npm start): levanta el servidor HTTP con la app
// armada en app.ts y programa las tareas periódicas. Está separado de app.ts para que los
// tests puedan importar la app sin abrir un puerto ni arrancar el timer de donaciones.
import app from './app.js';
import { expireStaleDonations } from './features/donation/services/donationService.js';

// En el deploy el hosting define PORT; si no está, el de desarrollo local.
const PORT = Number(process.env.PORT) || 3000;

// Cada cuánto se revisan las donaciones pendientes con el link de pago vencido.
const DONATION_EXPIRATION_CHECK_MS = 10 * 60 * 1000;

// Recibe nada. Revisa las donaciones pendientes vencidas (ver expireStaleDonations) y
// registra el resultado; los errores se loguean para que nunca tiren abajo el servidor.
const checkStaleDonations = () =>
    expireStaleDonations()
        .then((count) => {
            if (count > 0) console.log(`[donations] ${count} donación(es) pendiente(s) actualizada(s).`);
        })
        .catch((error) => console.error('[donations] Falló la revisión de donaciones pendientes:', error));

app.listen(PORT, () => {
    console.log(`Server listening in ${PORT}`);
    // Una revisión al arrancar (por si el servidor estuvo apagado) y después cada 10 minutos.
    checkStaleDonations();
    setInterval(checkStaleDonations, DONATION_EXPIRATION_CHECK_MS);
});
