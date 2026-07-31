export default function ChecklistSection({ id, num, title, done, total, collapsed, onToggleCollapse, children }) {
  return (
    <div className={`section ${collapsed ? "collapsed" : ""}`}>
      <div className="section-head" onClick={() => onToggleCollapse(id)}>
        <span className="chev" />
        <span className="section-num">{num}</span>
        <span className="section-title">{title}</span>
        <span className="section-status">{total ? `${done}/${total}` : ""}</span>
      </div>
      <div className="section-body">{children}</div>
    </div>
  );
}
// Dans votre fichier data/checklistData.js (section COMMON_SECURITE)
export const COMMON_SECURITE = [
  { label: "Extincteur (présence et validité)", date: "extincteur_validite" },
  { label: "Triangle de présignalisation" },
  { label: "Gilet haute visibilité" },
  // ... autres éléments de sécurité
];
