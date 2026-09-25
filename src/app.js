import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./modules/auth/auth.routes.ts";
import documentRoutes from "./modules/documents/document.routes.ts";
import auditRoutes from "./modules/audit/audit.routes.ts";
import userRoutes from "./modules/users/user.routes.ts";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "../public")
    )
);

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", userRoutes);
app.use("/api/documentos", documentRoutes);
app.use("/api/auditoria", auditRoutes);

export default app;