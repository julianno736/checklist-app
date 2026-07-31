export default function VehicleSwitch({ vehicle, onChange }) {
  return (
    <div className="type-switch">
      <button className={vehicle === "semi" ? "active" : ""} onClick={() => onChange("semi")}>
        Semi-remorque
      </button>
      <button className={vehicle === "benne" ? "active" : ""} onClick={() => onChange("benne")}>
        Benne
      </button>
    </div>
  );
}
