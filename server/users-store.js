import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "data", "users.json");

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

export async function findUserByEmail(email) {
  const all = await readAll();
  return all.find((u) => u.email === email) || null;
}

export async function createUser({ email, passwordHash }) {
  const all = await readAll();
  const user = {
    id: generateId(),
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  all.push(user);
  await writeAll(all);
  return user;
}