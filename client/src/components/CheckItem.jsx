export default function CheckItem({ item, value, onToggle, dateValue, onDateChange, obsValue, onObsChange }) {
  const label = typeof item === "object" ? item.label : item;

  return (
    <div className="check-item-container">
      <div className="check-item">
        <span className="check-label">{label}</span>

        {/* Champ de date (si présent) */}
        {onDateChange && (
          <div className="item-date-wrapper">
            <span className="date-badge-label">Date d'expiration</span>
            <input
              type="date"
              className="item-date-input"
              value={dateValue || ""}
              onChange={(e) => onDateChange(e.target.value)}
            />
          </div>
        )}

        <div className="check-buttons">
          <button
            type="button"
            className={`btn-check ok ${value === "ok" ? "active" : ""}`}
            onClick={() => onToggle("ok")}
          >
            OK
          </button>
          <button
            type="button"
            className={`btn-check non ${value === "non" ? "active" : ""}`}
            onClick={() => onToggle("non")}
          >
            Non OK
          </button>
        </div>
      </div>

      {/* Petit champ d'observation optionnel (ex: pour chocs, fissures...) */}
      {onObsChange && (
        <div className="item-obs-wrapper">
          <input
            type="text"
            className="item-obs-input"
            placeholder="Préciser l'observation (choc, fissure...)"
            value={obsValue || ""}
            onChange={(e) => onObsChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}