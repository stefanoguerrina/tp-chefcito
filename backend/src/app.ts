// Arma la app de Express (middlewares, rutas y manejo de errores) y la exporta, SIN levantar
// el servidor: así los tests de integración (Supertest) pueden usarla sin abrir un puerto.
// El servidor lo levanta server.ts, que es el punto de entrada (npm run dev / npm start).
import express from "express";
import cors from "cors";
import { apiRouter } from "./routes/apiRouter.js";
import path from 'path';
import dotenv from 'dotenv';
import { UPLOADS_DIR, UPLOADS_PUBLIC_PATH } from './core/fileStorage.js';
import { handleNotFound, handleUnexpectedError } from './core/middleware/errorMiddleware.js';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Middleware
// Orígenes permitidos para CORS. En el .env: CORS_ORIGINS separados por comas
// (ej. "https://chefcito.vercel.app"). Por defecto, los de Vite en local: 5173, o 5174 si
// el puerto ya está ocupado.
const DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174'
];
const ALLOWED_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : DEFAULT_ORIGINS;
// maxAge: el navegador guarda 10 minutos la respuesta del preflight (el pedido OPTIONS que
// hace antes de los que llevan el token), en vez de repetirlo antes de cada pedido.
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true, maxAge: 600 }));
// Límite del body JSON: 1mb sobra para cualquier formulario. Las imágenes ya no viajan en
// el JSON: se suben como archivo (multipart) y las procesa multer (ver features/image).
app.use(express.json({ limit: '1mb' }));

// Sirve las imágenes subidas (backend/uploads) en /uploads, ej. /uploads/recipes/x.webp.
app.use(UPLOADS_PUBLIC_PATH, express.static(UPLOADS_DIR));

app.get("/", (req, res) => {
    res.send("You reached the App!");
});

app.use("/api", apiRouter);

// Siempre al final: ruta inexistente → 404 JSON; error sin atrapar → JSON (ver errorMiddleware).
app.use(handleNotFound);
app.use(handleUnexpectedError);

export default app;
