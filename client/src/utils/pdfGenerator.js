import { jsPDF } from "jspdf";
import "jspdf-autotable";
import {
  VEHICLES,
  COMMON_CONTROLE_DEPART,
  COMMON_SECURITE,
  COMMON_CHASSIS,
  COMMON_DOCUMENTS,
  VALIDATION_FIELDS,
  ckKey,
} from "../data/checklistData.js";
import { LOGO_DATA_URL } from "../data/logoBase64.js";

const NAVY = [15, 36, 56];
const AMBER = [240, 166, 58];
const OK = [46, 125, 70];
const NON = [179, 64, 46];

function statusLabel(checks, sectionKey, item) {
  const label = typeof item === "string" ? item : item.label;
  const val = checks[ckKey(sectionKey, label)];
  return val === "non" ? "NON" : "";
}

export function generateChecklistPdf({ vehicle, state, progress }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const v = VEHICLES[vehicle];
  let y = 90;

  doc.setFillColor(...NAVY);
  doc.rect(0, 0, 595, 64, "F");
  try {
    doc.setFillColor(255, 255, 255);
    doc.circle(33, 32, 21, "F");
    doc.addImage(LOGO_DATA_URL, "JPEG", 16, 20, 34, 19);
  } catch (e) {
    /* le logo est optionnel */
  }
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("COMPAGNIE MASOANDRO", 66, 28);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9.5);
  doc.text("« Transportez en toute sécurité. »", 66, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11.5);
  doc.text("CHECK-LIST CAMION — " + v.label.toUpperCase(), 555, 38, { align: "right" });

  doc.setTextColor(20, 20, 20);

  function sectionHeader(title) {
    if (y > 760) {
      doc.addPage();
      y = 40;
    }
    doc.setFillColor(...AMBER);
    doc.rect(40, y, 515, 18, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...NAVY);
    doc.text(title.toUpperCase(), 46, y + 13);
    y += 26;
    doc.setTextColor(20, 20, 20);
  }

  function infoTable(rows) {
    doc.autoTable({
      startY: y,
      margin: { left: 40, right: 40 },
      theme: "plain",
      styles: { fontSize: 9.5, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 170 }, 1: { cellWidth: 345 } },
      body: rows,
    });
    y = doc.lastAutoTable.finalY + 12;
  }

  function checksTable(rows) {
    const filteredRows = rows.filter((row) => {
      if (row.length === 1 && row[0].colSpan) return true;
      return row[1] === "NON";
    });

    const hasOnlyGroups = filteredRows.every((row) => row.length === 1 && row[0].colSpan);

    if (hasOnlyGroups || filteredRows.length === 0) {
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(46, 125, 70);
      doc.text("Aucune anomalie détectée (Conforme)", 40, y);
      y += 18;
      doc.setTextColor(20, 20, 20);
      return;
    }

    doc.autoTable({
      startY: y,
      margin: { left: 40, right: 40 },
      theme: "grid",
      styles: { fontSize: 9.5, cellPadding: 4, lineColor: [216, 210, 192], lineWidth: 0.5 },
      headStyles: { fillColor: [234, 229, 214], textColor: [20, 20, 20], fontStyle: "bold" },
      columnStyles: { 0: { cellWidth: 395 }, 1: { cellWidth: 90, halign: "center", fontStyle: "bold" } },
      head: [["Point de contrôle non conforme", "Statut"]],
      body: filteredRows,
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 1) {
          const val = data.cell.raw;
          if (val === "NON") data.cell.styles.textColor = NON;
        }
      },
    });
    y = doc.lastAutoTable.finalY + 12;
  }

  const { checks, info, dates, obs, validation } = state;

  sectionHeader("1. Informations générales");
  infoTable(v.info.map((f) => [f.label, info[f.id] || "—"]));

  sectionHeader("2. Contrôle avant départ");
  let cdRows = [];
  Object.entries(COMMON_CONTROLE_DEPART).forEach(([g, items]) => {
    cdRows.push([{ content: g, colSpan: 2, styles: { fontStyle: "bold", fillColor: [247, 244, 235] } }]);
    items.forEach((i) => cdRows.push([i, statusLabel(checks, "controle_depart", i)]));
  });
  checksTable(cdRows);

  // Section 3 : Sécurité obligatoire + Affichage systématique de la date d'extincteur
  sectionHeader("3. Sécurité obligatoire");
  checksTable(COMMON_SECURITE.map((item) => [item.label, statusLabel(checks, "securite", item)]));
  
  const extincteurDate = dates.extincteur_validite || dates.date_extincteur;
  if (extincteurDate) {
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 36, 56);
    doc.text(`> Date d'expiration de l'extincteur : ${extincteurDate}`, 40, y - 2);
    y += 14;
    doc.setTextColor(20, 20, 20);
  }

  sectionHeader("4. Pneus");
  let pneuRows = [];
  v.pneus.forEach((g) => {
    if (g.group) pneuRows.push([{ content: g.group, colSpan: 2, styles: { fontStyle: "bold", fillColor: [247, 244, 235] } }]);
    g.items.forEach((i) => pneuRows.push([i, statusLabel(checks, "pneus", i)]));
  });
  checksTable(pneuRows);

  sectionHeader("5. Châssis & carrosserie");
  checksTable(COMMON_CHASSIS.map((item) => [item.label, statusLabel(checks, "chassis", item)]));
  if (obs.obs_chassis) {
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "italic");
    doc.text(doc.splitTextToSize("Observation : " + obs.obs_chassis, 510), 40, y);
    y += 16;
  }

  if (vehicle === "semi") {
    sectionHeader("6. Contrôle sellette");
    checksTable(v.sellette.map((i) => [i, statusLabel(checks, "sellette", i)]));

    sectionHeader("7. Contrôle remorque");
    checksTable(v.remorque.map((i) => [i, statusLabel(checks, "remorque", i)]));
  }

  sectionHeader((vehicle === "semi" ? "8" : "6") + ". Équipement de secours");
  checksTable(v.secours.map((i) => [i, statusLabel(checks, "secours", i)]));

  // Section Documents à bord + Affichage des dates de documents
  sectionHeader((vehicle === "semi" ? "9" : "7") + ". Documents à bord");
  checksTable(COMMON_DOCUMENTS.map((item) => [item.label, statusLabel(checks, "documents", item)]));

  const documentedItems = COMMON_DOCUMENTS.filter((item) => item.date && dates[item.date]);
  if (documentedItems.length > 0) {
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 36, 56);
    doc.text("Dates de validité des documents :", 40, y - 2);
    y += 14;
    doc.setFont("helvetica", "normal");
    documentedItems.forEach((item) => {
      doc.text(`- ${item.label} : ${dates[item.date]}`, 50, y);
      y += 12;
    });
    y += 4;
    doc.setTextColor(20, 20, 20);
  }

  sectionHeader((vehicle === "semi" ? "10" : "8") + ". Observations");
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  const obsText = obs.general || "—";
  const obsLines = doc.splitTextToSize(obsText, 515);
  doc.text(obsLines, 40, y);
  y += obsLines.length * 12 + 14;

  sectionHeader("Validation");
  infoTable(VALIDATION_FIELDS.map((f) => [f.label, validation[f.id] || "—"]));

  doc.setFontSize(8.5);
  doc.setTextColor(140, 140, 140);
  doc.text(
    `Rapport généré le ${new Date().toLocaleDateString("fr-FR")} — ${progress.done}/${progress.total} points contrôlés.`,
    40,
    815
  );

  const filename = `checklist-${vehicle}-${info.date || new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
  return filename;
} 