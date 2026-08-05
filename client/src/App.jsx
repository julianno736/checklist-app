import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import VehicleSwitch from "./components/VehicleSwitch.jsx";
import ChecklistSection from "./components/ChecklistSection.jsx";
import CheckItem from "./components/CheckItem.jsx";
import InfoField from "./components/InfoField.jsx";
import HistoryPanel from "./components/HistoryPanel.jsx";
import AuthForm from "./components/AuthForm.jsx";
import {
  VEHICLES,
  COMMON_CONTROLE_DEPART,
  COMMON_SECURITE,
  COMMON_CHASSIS,
  COMMON_DOCUMENTS,
  VALIDATION_FIELDS,
  ckKey,
} from "./data/checklistData.js";
import { generateChecklistPdf } from "./utils/pdfGenerator.js";
import { fetchHistory, saveChecklist, deleteChecklist } from "./utils/api.js";

const emptyState = () => ({
  info: {},
  checks: {},
  dates: {},
  obs: {},
  validation: {},
});

export default function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("userEmail");
    return token && email ? { email } : null;
  });

  const [vehicle, setVehicle] = useState("semi");
  const [state, setState] = useState(emptyState);
  const [collapsed, setCollapsed] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");

  const v = VEHICLES[vehicle];

  function loadHistory() {
    setHistoryLoading(true);
    setHistoryError("");
    fetchHistory()
      .then(setHistory)
      .catch((err) => setHistoryError(err.message))
      .finally(() => setHistoryLoading(false));
  }

  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setUser(null);
  }

  // Fonction de suppression d'un élément de l'historique
  async function handleDeleteHistory(id) {
    if (!window.confirm("Voulez-vous vraiment supprimer cet élément de l'historique ?")) return;

    try {
      await deleteChecklist(id);
      showToast("Élément supprimé avec succès !");
      loadHistory();
    } catch (err) {
      showToast("Erreur lors de la suppression : " + err.message);
    }
  }

  function toggleCollapse(id) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function updateInfo(id, value) {
    setState((s) => ({ ...s, info: { ...s.info, [id]: value } }));
  }
  function updateValidation(id, value) {
    setState((s) => ({ ...s, validation: { ...s.validation, [id]: value } }));
  }
  function updateDate(id, value) {
    setState((s) => ({ ...s, dates: { ...s.dates, [id]: value } }));
  }
  function updateObs(id, value) {
    setState((s) => ({ ...s, obs: { ...s.obs, [id]: value } }));
  }
  function toggleCheck(key, val) {
    setState((s) => {
      const next = { ...s.checks };
      if (next[key] === val) delete next[key];
      else next[key] = val;
      return { ...s, checks: next };
    });
  }

  function selectAllKeys(keys, val = "ok") {
    setState((s) => {
      const next = { ...s.checks };
      keys.forEach((k) => {
        next[k] = val;
      });
      return { ...s, checks: next };
    });
    showToast("Section validée en un clic !");
  }

  const sections = useMemo(() => {
    const list = [];

    let cdKeys = [];
    Object.values(COMMON_CONTROLE_DEPART).forEach((items) => items.forEach((i) => cdKeys.push(ckKey("controle_depart", i))));
    list.push({ id: "controle_depart", title: "Contrôle avant départ", keys: cdKeys });

    list.push({ id: "securite", title: "Sécurité obligatoire", keys: COMMON_SECURITE.map((i) => ckKey("securite", i.label)) });

    let pneuKeys = [];
    v.pneus.forEach((g) => g.items.forEach((i) => pneuKeys.push(ckKey("pneus", i))));
    list.push({ id: "pneus", title: "Pneus", keys: pneuKeys });

    list.push({ id: "chassis", title: "Châssis & carrosserie", keys: COMMON_CHASSIS.map((i) => ckKey("chassis", i.label)) });

    if (vehicle === "semi") {
      list.push({ id: "sellette", title: "Contrôle sellette", keys: v.sellette.map((i) => ckKey("sellette", i)) });
      list.push({ id: "remorque", title: "Contrôle remorque", keys: v.remorque.map((i) => ckKey("remorque", i)) });
    }

    list.push({ id: "secours", title: "Équipement de secours", keys: v.secours.map((i) => ckKey("secours", i)) });
    list.push({ id: "documents", title: "Documents à bord", keys: COMMON_DOCUMENTS.map((i) => ckKey("documents", i.label)) });

    return list;
  }, [vehicle, v]);

  const progress = useMemo(() => {
    let done = 0;
    let total = 0;
    let hasNonOk = false;
    sections.forEach((sec) => {
      sec.keys.forEach((k) => {
        total++;
        if (state.checks[k]) done++;
        if (state.checks[k] === "non") hasNonOk = true;
      });
    });
    return { done, total, hasNonOk, percent: total ? Math.round((done / total) * 100) : 0 };
  }, [sections, state.checks]);

  function sectionProgress(id) {
    const sec = sections.find((s) => s.id === id);
    if (!sec) return { done: 0, total: 0, keys: [] };
    const done = sec.keys.filter((k) => state.checks[k]).length;
    return { done, total: sec.keys.length, keys: sec.keys };
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }

  async function handleDownload() {
    setSaving(true);
    try {
      await saveChecklist({
        vehicle,
        info: state.info,
        checks: state.checks,
        dates: state.dates,
        obs: state.obs,
        validation: state.validation,
        progress: { done: progress.done, total: progress.total, hasNonOk: progress.hasNonOk },
      });
      loadHistory();

      const filename = generateChecklistPdf({ vehicle, state, progress });
      showToast("Rapport téléchargé et enregistré : " + filename);
    } catch (err) {
      try {
        const filename = generateChecklistPdf({ vehicle, state, progress });
        showToast("Rapport téléchargé (serveur indisponible : " + err.message + ")");
      } catch (pdfErr) {
        showToast("Erreur lors de la génération du rapport.");
      }
    } finally {
      setSaving(false);
    }
  }

  let n = 0;

  const pCd = sectionProgress("controle_depart");
  const pSec = sectionProgress("securite");
  const pPneu = sectionProgress("pneus");
  const pChassis = sectionProgress("chassis");
  const pSel = vehicle === "semi" ? sectionProgress("sellette") : { keys: [] };
  const pRem = vehicle === "semi" ? sectionProgress("remorque") : { keys: [] };
  const pSecours = sectionProgress("secours");
  const pDoc = sectionProgress("documents");

  if (!user) {
    return <AuthForm onAuth={setUser} />;
  }

  const userInitial = user.email ? user.email.charAt(0).toUpperCase() : "U";

  return (
    <>
      <Header percent={progress.percent} />

      <div className="top-action-bar" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "10px 20px" }}>
        <button 
          className="icon-download-btn" 
          onClick={handleDownload} 
          disabled={saving}
          title="Télécharger le rapport"
        >
          {saving ? (
            <span className="spinner">⏳</span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          )}
          <span>Télécharger ({progress.done}/{progress.total})</span>
        </button>
      </div>

      <div className="wrap">
        <VehicleSwitch vehicle={vehicle} onChange={setVehicle} />

        {/* 1. Informations générales */}
        <ChecklistSection
          id="info"
          num={++n}
          title="Informations générales"
          done={0}
          total={0}
          collapsed={collapsed.has("info")}
          onToggleCollapse={toggleCollapse}
        >
          <div className="field-row">
            {v.info.map((f) => (
              <InfoField key={f.id} label={f.label} type={f.type} value={state.info[f.id]} onChange={(val) => updateInfo(f.id, val)} />
            ))}
          </div>
        </ChecklistSection>

        {/* 2. Contrôle avant départ */}
        <ChecklistSection
          id="controle_depart"
          num={++n}
          title={
            <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", paddingRight: "10px" }}>
              <span>Contrôle avant départ</span>
              <button onClick={(e) => { e.stopPropagation(); selectAllKeys(pCd.keys); }} style={{ fontSize: "11px", padding: "3px 10px", cursor: "pointer", background: "#f39c12", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold" }}>Tout OK</button>
            </span>
          }
          done={pCd.done}
          total={pCd.total}
          collapsed={collapsed.has("controle_depart")}
          onToggleCollapse={toggleCollapse}
        >
          {Object.entries(COMMON_CONTROLE_DEPART).map(([group, items]) => (
            <div key={group}>
              <div className="subgroup-title">{group}</div>
              {items.map((label) => {
                const key = ckKey("controle_depart", label);
                return <CheckItem key={key} item={label} value={state.checks[key]} onToggle={(val) => toggleCheck(key, val)} />;
              })}
            </div>
          ))}
        </ChecklistSection>

        {/* 3. Sécurité obligatoire */}
        <ChecklistSection
          id="securite"
          num={++n}
          title={
            <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", paddingRight: "10px" }}>
              <span>Sécurité obligatoire</span>
              <button onClick={(e) => { e.stopPropagation(); selectAllKeys(pSec.keys); }} style={{ fontSize: "11px", padding: "3px 10px", cursor: "pointer", background: "#f39c12", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold" }}>Tout OK</button>
            </span>
          }
          done={pSec.done}
          total={pSec.total}
          collapsed={collapsed.has("securite")}
          onToggleCollapse={toggleCollapse}
        >
          {COMMON_SECURITE.map((item) => {
            const key = ckKey("securite", item.label);
            const isExtincteur = item.label.toLowerCase().includes("extincteur");
            const dateKey = item.date || (isExtincteur ? "extincteur_validite" : undefined);

            return (
              <CheckItem
                key={key}
                item={item}
                value={state.checks[key]}
                onToggle={(val) => toggleCheck(key, val)}
                dateValue={dateKey ? state.dates[dateKey] : undefined}
                onDateChange={dateKey ? (val) => updateDate(dateKey, val) : undefined}
              />
            );
          })}
        </ChecklistSection>

        {/* 4. Pneus */}
        <ChecklistSection
          id="pneus"
          num={++n}
          title={
            <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", paddingRight: "10px" }}>
              <span>Pneus</span>
              <button onClick={(e) => { e.stopPropagation(); selectAllKeys(pPneu.keys); }} style={{ fontSize: "11px", padding: "3px 10px", cursor: "pointer", background: "#f39c12", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold" }}>Tout OK</button>
            </span>
          }
          done={pPneu.done}
          total={pPneu.total}
          collapsed={collapsed.has("pneus")}
          onToggleCollapse={toggleCollapse}
        >
          {v.pneus.map((g, gi) => (
            <div key={gi}>
              {g.group && <div className="subgroup-title">{g.group}</div>}
              {g.items.map((label) => {
                const key = ckKey("pneus", label);
                return <CheckItem key={key} item={label} value={state.checks[key]} onToggle={(val) => toggleCheck(key, val)} />;
              })}
            </div>
          ))}
        </ChecklistSection>

        {/* 5. Châssis & carrosserie */}
        <ChecklistSection
          id="chassis"
          num={++n}
          title={
            <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", paddingRight: "10px" }}>
              <span>Châssis & carrosserie</span>
              <button onClick={(e) => { e.stopPropagation(); selectAllKeys(pChassis.keys); }} style={{ fontSize: "11px", padding: "3px 10px", cursor: "pointer", background: "#f39c12", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold" }}>Tout OK</button>
            </span>
          }
          done={pChassis.done}
          total={pChassis.total}
          collapsed={collapsed.has("chassis")}
          onToggleCollapse={toggleCollapse}
        >
          {COMMON_CHASSIS.map((item) => {
            const key = ckKey("chassis", item.label);
            return (
              <CheckItem
                key={key}
                item={item}
                value={state.checks[key]}
                onToggle={(val) => toggleCheck(key, val)}
                obsValue={item.obs ? state.obs[item.obs] : undefined}
                onObsChange={item.obs ? (val) => updateObs(item.obs, val) : undefined}
              />
            );
          })}
        </ChecklistSection>

        {/* 6/7. Sellette + remorque (semi uniquement) */}
        {vehicle === "semi" && (
          <>
            <ChecklistSection
              id="sellette"
              num={++n}
              title={
                <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", paddingRight: "10px" }}>
                  <span>Contrôle sellette</span>
                  <button onClick={(e) => { e.stopPropagation(); selectAllKeys(pSel.keys); }} style={{ fontSize: "11px", padding: "3px 10px", cursor: "pointer", background: "#f39c12", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold" }}>Tout OK</button>
                </span>
              }
              done={pSel.done}
              total={pSel.total}
              collapsed={collapsed.has("sellette")}
              onToggleCollapse={toggleCollapse}
            >
              {v.sellette.map((label) => {
                const key = ckKey("sellette", label);
                return <CheckItem key={key} item={label} value={state.checks[key]} onToggle={(val) => toggleCheck(key, val)} />;
              })}
            </ChecklistSection>

            <ChecklistSection
              id="remorque"
              num={++n}
              title={
                <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", paddingRight: "10px" }}>
                  <span>Contrôle remorque</span>
                  <button onClick={(e) => { e.stopPropagation(); selectAllKeys(pRem.keys); }} style={{ fontSize: "11px", padding: "3px 10px", cursor: "pointer", background: "#f39c12", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold" }}>Tout OK</button>
                </span>
              }
              done={pRem.done}
              total={pRem.total}
              collapsed={collapsed.has("remorque")}
              onToggleCollapse={toggleCollapse}
            >
              {v.remorque.map((label) => {
                const key = ckKey("remorque", label);
                return <CheckItem key={key} item={label} value={state.checks[key]} onToggle={(val) => toggleCheck(key, val)} />;
              })}
            </ChecklistSection>
          </>
        )}

        {/* Équipement de secours */}
        <ChecklistSection
          id="secours"
          num={++n}
          title={
            <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", paddingRight: "10px" }}>
              <span>Équipement de secours</span>
              <button onClick={(e) => { e.stopPropagation(); selectAllKeys(pSecours.keys); }} style={{ fontSize: "11px", padding: "3px 10px", cursor: "pointer", background: "#f39c12", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold" }}>Tout OK</button>
            </span>
          }
          done={pSecours.done}
          total={pSecours.total}
          collapsed={collapsed.has("secours")}
          onToggleCollapse={toggleCollapse}
        >
          {v.secours.map((label) => {
            const key = ckKey("secours", label);
            return <CheckItem key={key} item={label} value={state.checks[key]} onToggle={(val) => toggleCheck(key, val)} />;
          })}
        </ChecklistSection>

        {/* Documents à bord */}
        <ChecklistSection
          id="documents"
          num={++n}
          title={
            <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", paddingRight: "10px" }}>
              <span>Documents à bord</span>
              <button onClick={(e) => { e.stopPropagation(); selectAllKeys(pDoc.keys); }} style={{ fontSize: "11px", padding: "3px 10px", cursor: "pointer", background: "#f39c12", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold" }}>Tout OK</button>
            </span>
          }
          done={pDoc.done}
          total={pDoc.total}
          collapsed={collapsed.has("documents")}
          onToggleCollapse={toggleCollapse}
        >
          {COMMON_DOCUMENTS.map((item) => {
            const key = ckKey("documents", item.label);
            return (
              <CheckItem
                key={key}
                item={item}
                value={state.checks[key]}
                onToggle={(val) => toggleCheck(key, val)}
                dateValue={item.date ? state.dates[item.date] : undefined}
                onDateChange={item.date ? (val) => updateDate(item.date, val) : undefined}
              />
            );
          })}
        </ChecklistSection>

        {/* Observations */}
        <ChecklistSection
          id="observations"
          num={++n}
          title="Observations"
          done={0}
          total={0}
          collapsed={collapsed.has("observations")}
          onToggleCollapse={toggleCollapse}
        >
          <div className="obs-box">
            <textarea placeholder="Observations générales..." value={state.obs.general || ""} onChange={(e) => updateObs("general", e.target.value)} />
          </div>
        </ChecklistSection>

        {/* Validation */}
        <ChecklistSection
          id="validation"
          num={++n}
          title="Validation"
          done={0}
          total={0}
          collapsed={collapsed.has("validation")}
          onToggleCollapse={toggleCollapse}
        >
          <div className="validation-grid">
            {VALIDATION_FIELDS.map((f) => (
              <InfoField key={f.id} label={f.label} type={f.type} value={state.validation[f.id]} onChange={(val) => updateValidation(f.id, val)} />
            ))}
          </div>
        </ChecklistSection>

        {/* Intégration de l'historique avec la fonction de suppression active */}
        <HistoryPanel 
          items={history} 
          loading={historyLoading} 
          error={historyError} 
          onRefresh={loadHistory} 
          onDelete={handleDeleteHistory}
        />

        {/* Panneau de profil et déconnexion en bas */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#fff",
          border: "1px solid #e1e4e8",
          borderRadius: "10px",
          padding: "15px 20px",
          margin: "25px 0 10px 0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div 
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3498db, #2980b9)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "16px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
                userSelect: "none"
              }}
            >
              {userInitial}
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "600" }}>Connecté en tant que</div>
              <div style={{ fontSize: "14px", color: "#333", fontWeight: "500" }}>{user.email}</div>
            </div>
          </div>

          <button 
            onClick={handleLogout} 
            style={{ 
              padding: "9px 18px", 
              fontSize: "13px", 
              cursor: "pointer", 
              border: "1px solid #e74c3c", 
              borderRadius: "6px", 
              background: "#fff",
              color: "#e74c3c",
              fontWeight: "600",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 4px rgba(231, 76, 60, 0.1)"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#e74c3c";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.color = "#e74c3c";
            }}
          >
            Déconnexion
          </button>
        </div>
      </div>

      <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
    </>
  );
}