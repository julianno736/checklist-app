export default function HistoryPanel({ items, loading, error, onRefresh }) {
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
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className={it.hasNonOk ? "row-alert" : ""}>
                  <td>{it.date || "—"}</td>
                  <td>{it.vehicle === "semi" ? "Semi-remorque" : "Benne"}</td>
                  <td>{it.chauffeur || "—"}</td>
                  <td>{it.immatriculation || "—"}</td>
                  <td>
                    {it.donePoints}/{it.totalPoints}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
