const VILLES = ["Tana", "Tamatave", "Fort-Dauphin", "Tuléar"];

export default function InfoField({ label, type = "text", value, onChange }) {
  if (type === "select-ville") {
    return (
      <div className="field">
        <label>{label}</label>
        <div style={{ position: "relative" }}>
          <select
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 36px 10px 12px",
              fontSize: "14px",
              color: value ? "#2c3e50" : "#95a5a6",
              background: "#fff",
              border: "1px solid #dcdfe3",
              borderRadius: "6px",
              appearance: "none",
              WebkitAppearance: "none",
              MozAppearance: "none",
              cursor: "pointer",
              outline: "none",
              transition: "border-color 0.15s ease, box-shadow 0.15s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#f39c12";
              e.target.style.boxShadow = "0 0 0 3px rgba(243, 156, 18, 0.15)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#dcdfe3";
              e.target.style.boxShadow = "none";
            }}
          >
            <option value="" disabled>
              -- Sélectionner --
            </option>
            {VILLES.map((ville) => (
              <option key={ville} value={ville} style={{ color: "#2c3e50" }}>
                {ville}
              </option>
            ))}
          </select>
          <span
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              color: "#95a5a6",
              fontSize: "11px",
            }}
          >
            ▼
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="field">
      <label>{label}</label>
      <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
