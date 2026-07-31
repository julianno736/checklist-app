export default function InfoField({ label, type = "text", value, onChange }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
