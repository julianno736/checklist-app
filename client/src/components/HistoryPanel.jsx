import { useState } from "react";

export default function HistoryPanel({ items, loading, error, onRefresh, onDelete }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const currentUserEmail = localStorage.getItem("userEmail") || "";

  return (
    <div className="section">
      <div className="section-head" style={{ cursor: "default" }}>
        <span className="section-num">•</span>
        <span className="section-title">Historique (serveur)</span>
        <span className="section-status" style={{ cursor: "pointer" }} onClick={onRefresh}>
          ↻ actualiser
        </span>
      </div>
      <div className="section-body">
        {loading && <p className="hist-msg">Chargement...</p>}
        {error && <p className="hist-msg hist-error">{error}</p>}
        {!loading && !error && items.length === 0 && <p className="hist-msg">Aucune check-list enregistrée pour l'instant.</p>}
        {!loading && items.length > 0 && (
          <table className="hist-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Véhicule</th>
                <th>Chauffeur</th>
                <th>Immat.</th>
                <th>Points</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                // Vérifie si l'utilisateur connecté est le créateur de cet historique
                const creatorEmail = it.userEmail || it.email || "";
                const canDelete = creatorEmail && currentUserEmail && creatorEmail.toLowerCase() === currentUserEmail.toLowerCase();

                return (
                  <tr key={it.id} className={it.hasNonOk ? "row-alert" : ""}>
                    <td>{it.date || "—"}</td>
                    <td>{it.vehicle === "semi" ? "Semi-remorque" : "Benne"}</td>
                    <td>{it.chauffeur || "—"}</td>
                    <td>{it.immatriculation || "—"}</td>
                    <td>
                      {it.donePoints}/{it.totalPoints}
                    </td>
                    <td style={{ textAlign: "center", display: "flex", gap: "6px", justifyContent: "center", alignItems: "center" }}>
                      {/* Bouton Œil pour voir les détails */}
                      <button
                        onClick={() => setSelectedItem(it)}
                        title="Voir les détails"
                        style={{
                          background: "#3498db",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          padding: "4px 8px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        👁️
                      </button>

                      {/* Bouton Supprimer (Affiché uniquement si c'est l'auteur et si onDelete est fourni) */}
                      {canDelete && onDelete && (
                        <button
                          onClick={() => onDelete(it.id)}
                          title="Supprimer cet historique"
                          style={{
                            background: "#e74c3c",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Fenêtre modale des détails */}
      {selectedItem && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div style={{ background: "#fff", padding: "25px", borderRadius: "8px", width: "90%", maxWidth: "500px", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 4px 15px rgba(0,0,0,0.2)" }}>
            <h4 style={{ marginTop: 0, color: "#2c3e50", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>Détails du rapport</h4>
            
            <p><strong>Véhicule :</strong> {selectedItem.vehicle === "semi" ? "Semi-remorque" : "Benne"}</p>
            <p><strong>Date :</strong> {selectedItem.date || "—"}</p>
            <p><strong>Chauffeur :</strong> {selectedItem.chauffeur || "—"}</p>
            <p><strong>Immatriculation :</strong> {selectedItem.immatriculation || "—"}</p>
            <p><strong>Créateur :</strong> {selectedItem.userEmail || selectedItem.email || "Non spécifié"}</p>
            
            <h5 style={{ margin: "15px 0 5px 0", color: "#34495e" }}>Informations générales :</h5>
            <pre style={{ background: "#f8f9fa", padding: "10px", borderRadius: "4px", fontSize: "12px", overflowX: "auto" }}>
              {JSON.stringify(selectedItem.info || {}, null, 2)}
            </pre>

            <h5 style={{ margin: "15px 0 5px 0", color: "#34495e" }}>Observations :</h5>
            <p style={{ background: "#f8f9fa", padding: "10px", borderRadius: "4px", fontSize: "12px" }}>
              {selectedItem.obs?.general || selectedItem.observation || "Aucune observation."}
            </p>

            <div style={{ textAlign: "right", marginTop: "20px" }}>
              <button 
                onClick={() => setSelectedItem(null)}
                style={{ background: "#95a5a6", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}