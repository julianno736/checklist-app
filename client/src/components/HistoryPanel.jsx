import { useState } from "react";
import { getChecklist } from "../utils/api.js";
import {
  VEHICLES,
  COMMON_CONTROLE_DEPART,
  COMMON_SECURITE,
  COMMON_CHASSIS,
  COMMON_DOCUMENTS,
  VALIDATION_FIELDS,
  ckKey,
} from "../data/checklistData.js";

function StatusBadge({ val }) {
  if (val === "non") {
    return <span style={{ color: "#e74c3c", fontWeight: "bold" }}>NON</span>;
  }
  if (val === "ok") {
    return <span style={{ color: "#27ae60", fontWeight: "bold" }}>OK</span>;
  }
  return <span style={{ color: "#aaa" }}>—</span>;
}

function CheckRow({ label, val }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f0f0f0", fontSize: "13px" }}>
      <span>{label}</span>
      <StatusBadge val={val} />
    </div>
  );
}

function DetailModal({ record, onClose }) {
  const v = VEHICLES[record.vehicle];
  const checks = record.checks || {};
  const info = record.info || {};
  const dates = record.dates || {};
  const obs = record.obs || {};
  const validation = record.validation || {};

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "10px",
          maxWidth: "600px",
          width: "100%",
          maxHeight: "85vh",
          overflowY: "auto",
          padding: "24px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0 }}>Détail de la check-list — {v.label}</h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#888" }}
          >
            ✕
          </button>
        </div>

        <h4 style={{ marginBottom: "6px" }}>Informations générales</h4>
        {v.info.map((f) => (
          <CheckRow key={f.id} label={f.label} val={info[f.id] || "—"} />
        ))}

        <h4 style={{ margin: "16px 0 6px" }}>Contrôle avant départ</h4>
        {Object.entries(COMMON_CONTROLE_DEPART).map(([group, items]) => (
          <div key={group}>
            <div style={{ fontWeight: "bold", fontSize: "12px", color: "#888", marginTop: "8px" }}>{group}</div>
            {items.map((label) => (
              <CheckRow key={label} label={label} val={checks[ckKey("controle_depart", label)]} />
            ))}
          </div>
        ))}

        <h4 style={{ margin: "16px 0 6px" }}>Sécurité obligatoire</h4>
        {COMMON_SECURITE.map((item) => (
          <CheckRow key={item.label} label={item.label} val={checks[ckKey("securite", item.label)]} />
        ))}
        {(dates.extincteur_validite || dates.date_extincteur) && (
          <div style={{ fontSize: "12px", marginTop: "4px" }}>
            Date d'expiration de l'extincteur : <b>{dates.extincteur_validite || dates.date_extincteur}</b>
          </div>
        )}

        <h4 style={{ margin: "16px 0 6px" }}>Pneus</h4>
        {v.pneus.map((g, gi) => (
          <div key={gi}>
            {g.group && <div style={{ fontWeight: "bold", fontSize: "12px", color: "#888", marginTop: "8px" }}>{g.group}</div>}
            {g.items.map((label) => (
              <CheckRow key={label} label={label} val={checks[ckKey("pneus", label)]} />
            ))}
          </div>
        ))}

        <h4 style={{ margin: "16px 0 6px" }}>Châssis & carrosserie</h4>
        {COMMON_CHASSIS.map((item) => (
          <CheckRow key={item.label} label={item.label} val={checks[ckKey("chassis", item.label)]} />
        ))}
        {obs.obs_chassis && <div style={{ fontSize: "12px", fontStyle: "italic", marginTop: "4px" }}>Observation : {obs.obs_chassis}</div>}

        {record.vehicle === "semi" && (
          <>
            <h4 style={{ margin: "16px 0 6px" }}>Contrôle sellette</h4>
            {v.sellette.map((label) => (
              <CheckRow key={label} label={label} val={checks[ckKey("sellette", label)]} />
            ))}

            <h4 style={{ margin: "16px 0 6px" }}>Contrôle remorque</h4>
            {v.remorque.map((label) => (
              <CheckRow key={label} label={label} val={checks[ckKey("remorque", label)]} />
            ))}
          </>
        )}

        <h4 style={{ margin: "16px 0 6px" }}>Équipement de secours</h4>
        {v.secours.map((label) => (
          <CheckRow key={label} label={label} val={checks[ckKey("secours", label)]} />
        ))}

        <h4 style={{ margin: "16px 0 6px" }}>Documents à bord</h4>
        {COMMON_DOCUMENTS.map((item) => (
          <CheckRow key={item.label} label={item.label} val={checks[ckKey("documents", item.label)]} />
        ))}
        {COMMON_DOCUMENTS.filter((item) => item.date && dates[item.date]).map((item) => (
          <div key={item.date} style={{ fontSize: "12px", marginTop: "4px" }}>
            {item.label} : <b>{dates[item.date]}</b>
          </div>
        ))}

        <h4 style={{ margin: "16px 0 6px" }}>Observations</h4>
        <div style={{ fontSize: "13px", whiteSpace: "pre-wrap" }}>{obs.general || "—"}</div>

        <h4 style={{ margin: "16px 0 6px" }}>Validation</h4>
        {VALIDATION_FIELDS.map((f) => (
          <CheckRow key={f.id} label={f.label} val={validation[f.id] || "—"} />
        ))}
      </div>
    </div>
  );
}

export default function HistoryPanel({ items, loading, error, onRefresh, onDelete }) {
  const [detailRecord, setDetailRecord] = useState(null);
  const [detailLoadingId, setDetailLoadingId] = useState(null);
  const [detailError, setDetailError] = useState("");

  async function handleViewDetail(id) {
    setDetailLoadingId(id);
    setDetailError("");
    try {
      const record = await getChecklist(id);
      setDetailRecord(record);
    } catch (err) {
      setDetailError(err.message);
    } finally {
      setDetailLoadingId(null);
    }
  }

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
        {detailError && <p className="hist-msg hist-error">{detailError}</p>}
        {!loading && !error && items.length === 0 && <p className="hist-msg">Aucune check-list enregistrée pour l'instant.</p>}

        {!loading && items.length > 0 && (
          <div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table className="hist-table" style={{ width: "100%", minWidth: "560px", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Véhicule</th>
                  <th>Chauffeur</th>
                  <th>Immat.</th>
                  <th>Points</th>
                  <th
                    style={{
                      textAlign: "center",
                      position: "sticky",
                      right: 0,
                      background: "#fff",
                      boxShadow: "-4px 0 6px -4px rgba(0,0,0,0.15)",
                    }}
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id || it._id} className={it.hasNonOk ? "row-alert" : ""}>
                    <td>{it.date || "—"}</td>
                    <td>{it.vehicle === "semi" ? "Semi-remorque" : "Benne"}</td>
                    <td>{it.chauffeur || it.info?.chauffeur || "—"}</td>
                    <td>{it.immatriculation || it.info?.immatriculation || "—"}</td>
                    <td>
                      {it.donePoints ?? it.progress?.done ?? 0}/{it.totalPoints ?? it.progress?.total ?? 0}
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        position: "sticky",
                        right: 0,
                        background: it.hasNonOk ? "#fdecea" : "#fff",
                        boxShadow: "-4px 0 6px -4px rgba(0,0,0,0.15)",
                        display: "flex",
                        gap: "6px",
                        justifyContent: "center",
                      }}
                    >
                      <button
                        onClick={() => handleViewDetail(it.id || it._id)}
                        disabled={detailLoadingId === (it.id || it._id)}
                        title="Voir le détail"
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
                        {detailLoadingId === (it.id || it._id) ? "…" : "👁️"}
                      </button>

                      {onDelete && (
                        <button
                          onClick={() => onDelete(it.id || it._id)}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detailRecord && <DetailModal record={detailRecord} onClose={() => setDetailRecord(null)} />}
    </div>
  );
}
