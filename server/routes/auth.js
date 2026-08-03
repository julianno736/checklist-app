import { Router } from "express";
import { findUserByEmail, createUser } from "../users-store.js";
import { hashPassword, comparePassword, generateToken } from "../auth-utils.js";

const router = Router();

// POST /api/auth/register — inscription libre
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères." });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existing = await findUserByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({ error: "Un compte existe déjà avec cet email." });
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({ email: cleanEmail, passwordHash });

    const token = generateToken(user);
    res.status(201).json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Impossible de créer le compte." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await findUserByEmail(cleanEmail);

    if (!user) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }

    const token = generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Impossible de se connecter." });
  }
});

export default router;