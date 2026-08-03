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
        
        {/* Conteneur responsive pour le tableau */}
        {!loading && items.length > 0 && (
          <div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table className="hist-table" style={{ width: "100%", minWidth: "550px", borderCollapse: "collapse" }}>
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
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "6px", justifyContent: "center", alignItems: "center" }}>
                          {/* Bouton Œil */}
                          <button
                            onClick={() => setSelectedItem(it)}
                            title="Voir les détails"
                            style={{
                              background: "#3498db",
                              color: "#fff",
                              border: "none",
                              borderRadius: "4px",
                              padding: "5px 9px",
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                          >
                            👁️
                          </button>

                          {/* Bouton Supprimer */}
                          {canDelete && onDelete && (
                            <button
                              onClick={() => onDelete(it.id)}
                              title="Supprimer cet historique"
                              style={{
                                background: "#e74c3c",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                              padding: "5px 9px",
                                cursor: "pointer",
                                fontSize: "12px",
                              }}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Fenêtre modale des détails (responsive avec max-width et max-height adaptées) */}
      {selectedItem && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "15px"
        }}>
          <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", width: "100%", maxWidth: "500px", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 4px 15px rgba(0,0,0,0.2)" }}>
            <h4 style={{ marginTop: 0, color: "#2c3e50", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>Détails du rapport</h4>
            
            <p style={{ fontSize: "14px", margin: "8px 0" }}><strong>Véhicule :</strong> {selectedItem.vehicle === "semi" ? "Semi-remorque" : "Benne"}</p>
            <p style={{ fontSize: "14px", margin: "8px 0" }}><strong>Date :</strong> {selectedItem.date || "—"}</p>
            <p style={{ fontSize: "14px", margin: "8px 0" }}><strong>Chauffeur :</strong> {selectedItem.chauffeur || "—"}</p>
            <p style={{ fontSize: "14px", margin: "8px 0" }}><strong>Immatriculation :</strong> {selectedItem.immatriculation || "—"}</p>
            <p style={{ fontSize: "14px", margin: "8px 0" }}><strong>Créateur :</strong> {selectedItem.userEmail || selectedItem.email || "Non spécifié"}</p>
            
            <h5 style={{ margin: "15px 0 5px 0", color: "#34495e" }}>Informations générales :</h5>
            <pre style={{ background: "#f8f9fa", padding: "10px", borderRadius: "4px", fontSize: "12px", overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
              {JSON.stringify(selectedItem.info || {}, null, 2)}
            </pre>

            <h5 style={{ margin: "15px 0 5px 0", color: "#34495e" }}>Observations :</h5>
            <p style={{ background: "#f8f9fa", padding: "10px", borderRadius: "4px", fontSize: "12px", wordBreak: "break-all" }}>
              {selectedItem.obs?.general || selectedItem.observation || "Aucune observation."}
            </p>

            <div style={{ textAlign: "right", marginTop: "20px" }}>
              <button 
                onClick={() => setSelectedItem(null)}
                style={{ background: "#95a5a6", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}
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