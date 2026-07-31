import { Router } from "express";
import {
  listChecklists,
  getChecklist,
  insertChecklist,
  removeChecklist,
} from "../store.js";

const router = Router();

const VALID_VEHICLES = ["semi", "benne"];

// GET /api/checklists — historique résumé, du plus récent au plus ancien
router.get("/", async (req, res) => {
  try {
    const items = await listChecklists();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Impossible de lire l'historique." });
  }
});

// GET /api/checklists/:id — détail complet d'une check-list enregistrée
router.get("/:id", async (req, res) => {
  try {
    const item = await getChecklist(req.params.id);
    if (!item) return res.status(404).json({ error: "Check-list introuvable." });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Impossible de lire cette check-list." });
  }
});

// POST /api/checklists — enregistrer une check-list remplie
router.post("/", async (req, res) => {
  try {
    const { vehicle, info, checks, dates, obs, validation, progress } = req.body || {};

    if (!VALID_VEHICLES.includes(vehicle)) {
      return res.status(400).json({ error: "Type de véhicule invalide (attendu: semi ou benne)." });
    }

    const record = await insertChecklist({
      vehicle,
      info: info || {},
      checks: checks || {},
      dates: dates || {},
      obs: obs || {},
      validation: validation || {},
      progress: progress || { done: 0, total: 0, hasNonOk: false },
    });

    res.status(201).json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Impossible d'enregistrer cette check-list." });
  }
});

// DELETE /api/checklists/:id
router.delete("/:id", async (req, res) => {
  try {
    const removed = await removeChecklist(req.params.id);
    if (!removed) return res.status(404).json({ error: "Check-list introuvable." });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Impossible de supprimer cette check-list." });
  }
});

export default router;
