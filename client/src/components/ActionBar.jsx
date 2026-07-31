export default function ActionBar({ done, total, saving, onDownload }) {
  return (
    <div className="actionbar">
      <div className="actionbar-info">
        <b>{done}</b>/{total} points contrôlés
      </div>
      <button className="btn-download" onClick={onDownload} disabled={saving}>
        {saving ? "Enregistrement..." : "⬇ Télécharger le rapport"}
      </button>
    </div>
  );
}
