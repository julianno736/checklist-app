import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "data", "checklists.json");

/**
 * Petit "store" fichier JSON — largement suffisant pour ce volume de données
 * (quelques check-lists par jour). Peut être remplacé plus tard par une vraie
 * base (SQLite, Postgres, MongoDB...) sans changer les routes, tant que
 * l'interface (readAll / getById / insert / removeById) reste la même.
 */

async function readAll() {
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

async function writeAll(list) {
  await fs.writeFile(DB_PATH, JSON.stringify(list, null, 2), "utf-8");
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export async function listChecklists() {
  const all = await readAll();
  // Résumé seulement pour la liste (pas tout le détail des points de contrôle)
  return all
    .map((c) => ({
      id: c.id,
      vehicle: c.vehicle,
      date: c.info?.date || null,
      chauffeur: c.info?.chauffeur || null,
      immatriculation: c.info?.immat_tracteur || c.info?.immat || null,
      donePoints: c.progress?.done ?? 0,
      totalPoints: c.progress?.total ?? 0,
      hasNonOk: c.progress?.hasNonOk ?? false,
      createdAt: c.createdAt,
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getChecklist(id) {
  const all = await readAll();
  return all.find((c) => c.id === id) || null;
}

export async function insertChecklist(payload) {
  const all = await readAll();
  const record = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    ...payload,
  };
  all.push(record);
  await writeAll(all);
  return record;
}

export async function removeChecklist(id) {
  const all = await readAll();
  const next = all.filter((c) => c.id !== id);
  const removed = next.length !== all.length;
  if (removed) await writeAll(next);
  return removed;
}
