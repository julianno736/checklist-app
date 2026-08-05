import { useState } from "react";
import { login, register } from "../utils/api.js";
import logo from "../assets/LOGO-transparent.png";

export default function AuthForm({ onAuth }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fn = mode === "login" ? login : register;
      const data = await fn(email.trim(), password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", data.user.email);
      onAuth(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "360px", margin: "80px auto", padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <img src={logo} alt="Compagnie Masoandro" style={{ maxWidth: "220px", width: "100%", height: "auto" }} />
      </div>
      <h2 style={{ marginBottom: "16px", textAlign: "center" }}>
        {mode === "login" ? "Connexion" : "Créer un compte"}
      </h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
        />
        {error && <div style={{ color: "#c0392b", fontSize: "13px" }}>{error}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px",
            background: "#f39c12",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {loading ? "..." : mode === "login" ? "Se connecter" : "S'inscrire"}
        </button>
      </form>
      <p style={{ textAlign: "center", marginTop: "14px", fontSize: "13px" }}>
        {mode === "login" ? (
          <>
            Pas de compte ?{" "}
            <button
              type="button"
              onClick={() => setMode("register")}
              style={{ background: "none", border: "none", color: "#f39c12", cursor: "pointer", fontWeight: "bold" }}
            >
              S'inscrire
            </button>
          </>
        ) : (
          <>
            Déjà un compte ?{" "}
            <button
              type="button"
              onClick={() => setMode("login")}
              style={{ background: "none", border: "none", color: "#f39c12", cursor: "pointer", fontWeight: "bold" }}
            >
              Se connecter
            </button>
          </>
        )}
      </p>
    </div>
  );
}
