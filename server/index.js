import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import checklistsRouter from "./routes/checklists.js";
import authRouter from "./routes/auth.js";
import { requireAuth } from "./middleware/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use("/api/auth", authRouter);
app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ id: req.userId, email: req.userEmail });
});

app.use("/api/checklists", requireAuth, checklistsRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// En production : sert le build React généré par `npm run build` côté client
const clientDist = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) next();
  });
});

app.listen(PORT, () => {
  console.log(`✅ API Compagnie Masoandro à l'écoute sur http://localhost:${PORT}`);
});