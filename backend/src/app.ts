// Express application entry point — configures middleware and mounts routers.
import express from "express";
import cors from "cors";
import { apiRouter } from "./routes/apiRouter.js";
import path from 'path';
import dotenv from 'dotenv';
import { UPLOADS_DIR, UPLOADS_PUBLIC_PATH } from './core/fileStorage.js';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Application initialization
const app = express();
// Puerto y orígenes de CORS salen del .env (en el deploy el hosting define PORT y la URL
// del frontend); si no están, se usan los valores de desarrollo local.
const PORT = Number(process.env.PORT) || 3000;

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
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
// Límite del body JSON: 1mb sobra para cualquier formulario. Las imágenes ya no viajan en
// el JSON: se suben como archivo (multipart) y las procesa multer (ver features/image).
app.use(express.json({ limit: '1mb' }));

// Sirve las imágenes subidas (backend/uploads) en /uploads, ej. /uploads/recipes/x.webp.
app.use(UPLOADS_PUBLIC_PATH, express.static(UPLOADS_DIR));

app.get("/", (req, res) => {
    res.send("You reached the App!");
});

app.use("/api", apiRouter);

app.listen(PORT, () => {
    console.log(`Server listening in ${PORT}`);

});