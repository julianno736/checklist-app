// Modèle de données fidèle aux deux documents source :
// "CHECK-LIST CAMION POUR SEMI-REMORQUE" et "CHECK-LIST CAMION POUR BENNE"

export const COMMON_CONTROLE_DEPART = {
  "Moteur et niveaux": ["Niveau huile moteur", "Liquide de refroidissement", "Lave-glace"],
  "Système mécanique": ["Fuites visibles (huile, gasoil, eau)", "État batterie (fixation + charge)"],
  "Freinage et conduite": ["Test des freins au départ", "Pression d'air"],
  "Éclairage et signalisation": [
    "Feux avant / arrière",
    "Clignotants",
    "Feux stop",
    "Feux de position",
    "Klaxon",
    "Essuie-glaces",
    "Voyants tableau de bord",
  ],
};

export const COMMON_SECURITE = [
  { label: "Ceinture de sécurité" },
  { label: "Extincteur", date: "date_extincteur", dateLabel: "Date de validité" },
  { label: "Triangle de signalisation" },
  { label: "Gilet réfléchissant" },
  { label: "Trousse de secours" },
  { label: "Cadenas de sécurité" },
  { label: "Sangles / chaîne de fixation du pneu secours" },
];

export const COMMON_CHASSIS = [
  { label: "Choc ou fissure", obs: "obs_chassis" },
  { label: "Fixation ailes / marchepieds" },
  { label: "État pare-chocs" },
  { label: "Rétroviseurs" },
  { label: "Suspension / amortisseurs" },
  { label: "Réservoir air en bon état" },
  { label: "Absence fuite d'air" },
  { label: "Pare-brise" },
];

export const COMMON_DOCUMENTS = [
  { label: "Carte grise (tracteur + remorque)" },
  { label: "Assurance", date: "date_assurance", dateLabel: "Date d'expiration" },
  { label: "Visite technique", date: "date_visite", dateLabel: "Date d'expiration" },
  { label: "Patente", date: "date_patente", dateLabel: "Date d'expiration" },
];

export const VEHICLES = {
  semi: {
    label: "Semi-remorque",
    info: [
      { id: "date", label: "Date", type: "date" },
      { id: "chauffeur", label: "Chauffeur", type: "text" },
      { id: "aide", label: "Aide chauffeur", type: "text" },
      { id: "immat_tracteur", label: "Immatriculation tracteur", type: "text" },
      { id: "immat_remorque", label: "Immatriculation semi-remorque", type: "text" },
      { id: "km", label: "Kilométrage actuelle", type: "text" },
      { id: "km_vidange", label: "Kilomètrage seuil vidange", type: "text" },
      { id: "depart", label: "Lieu de départ", type: "text" },
      { id: "destination", label: "Destination", type: "text" },
      { id: "fond_cuve", label: "Fond de cuve", type: "text" },
    ],
    pneus: [
      { group: "Pneu directionnel", items: ["Droite", "Gauche"] },
      { group: "Essieu 1", items: ["Ar. Ext droite", "Ar. Int Droite", "Ar. Ext Gauche", "Ar. Int Gauche"] },
      { group: "Essieu 2", items: ["Ar. Ext droite", "Ar. Int Droite", "Ar. Ext Gauche", "Ar. Int Gauche"] },
      {
        group: "Pneus remorque",
        items: ["Ar. Droite 1", "Ar. Gauche 1", "Ar. Droite 2", "Ar. Gauche 2", "Ar. Droite 3", "Ar. Gauche 3"],
      },
      { group: "Pneu de secours", items: ["Pneu secours Tracteur", "Pneu secours Remorque"] },
      { group: null, items: ["Hernies", "Serrage des écrous"] },
    ],
    sellette: [
      "Verrouillage sellette",
      "Graissage sellette",
      "Câbles électriques bien branchés",
      "Tuyaux air bien connectés",
    ],
    remorque: [
      "Plaque d'immatriculation",
      "Feux et signalisation",
      "Câblage électrique",
      "Freins remorque",
      "Tuyaux d'air",
      "Suspension / essieux",
      "Goupilles et verrous",
      "Bâche / portes",
    ],
    secours: ["Cric (50T ou 20T)", "Clé de roue", "Tuyau gonflage", "Barre d'abattage", "Cales de roue", "Câble de remorquage"],
  },
  benne: {
    label: "Benne",
    info: [
      { id: "date", label: "Date", type: "date" },
      { id: "chauffeur", label: "Chauffeur", type: "text" },
      { id: "immat", label: "Immatriculation", type: "text" },
      { id: "km", label: "Kilométrage actuelle", type: "text" },
      { id: "km_vidange", label: "Kilomètrage seuil vidange", type: "text" },
      { id: "depart", label: "Lieu de départ", type: "text" },
      { id: "destination", label: "Destination", type: "text" },
      { id: "fond_cuve", label: "Fond de cuve", type: "text" },
    ],
    pneus: [
      { group: "Pneu directionnel", items: ["Droite", "Gauche"] },
      { group: "Essieu 1", items: ["Ar. Ext droite", "Ar. Int Droite", "Ar. Ext Gauche", "Ar. Int Gauche"] },
      { group: "Essieu 2", items: ["Ar. Ext droite", "Ar. Int Droite", "Ar. Ext Gauche", "Ar. Int Gauche"] },
      { group: null, items: ["Hernies", "Serrage des écrous"] },
    ],
    secours: ["Cric", "Clé de roue", "Tuyau gonflage", "Barre d'abattage", "Cales de roue"],
  },
};

export const VALIDATION_FIELDS = [
  { id: "controle_par", label: "Contrôlé par" },
  { id: "fonction", label: "Fonction" },
  { id: "sign_chauffeur", label: "Nom et signature chauffeur" },
  { id: "sign_aide", label: "Nom et signature aide chauffeur" },
];

export function ckKey(section, item) {
  return `${section}::${item}`;
}
