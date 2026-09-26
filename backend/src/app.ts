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
const PORT = 3000;

// Middleware
// Orígenes permitidos para CORS: Vite usa 5173 por defecto, 5174 si el puerto ya está ocupado.
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174'
];
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