# Check-list Camion — Compagnie Masoandro

Application de check-list véhicule (Semi-remorque / Benne), en **React (Vite)**
côté client et **Node.js / Express** côté serveur.

## Structure

```
masoandro-checklist/
├── client/                 # Application React (Vite)
│   ├── src/
│   │   ├── components/     # Header, VehicleSwitch, ChecklistSection, CheckItem...
│   │   ├── data/           # Modèle des check-lists + logo encodé en base64
│   │   ├── utils/          # Génération PDF (jsPDF) + appels API
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── index.html
└── server/                 # API Node/Express
    ├── data/checklists.json  # Stockage fichier (historique)
    ├── routes/checklists.js
    ├── store.js
    └── index.js
```

## Fonctionnalités

- Bascule **Semi-remorque / Benne** : le formulaire s'adapte (sections
  sellette/remorque, liste des pneus, équipement de secours...).
- Chaque point de contrôle : bouton **OK / NON**.
- Jauge de progression en temps réel dans l'en-tête.
- Sections repliables.
- Bouton **Télécharger le rapport** :
  1. enregistre la check-list sur le serveur Node (`POST /api/checklists`) ;
  2. génère et télécharge un **PDF** récapitulatif (logo, statuts colorés).
- Panneau **Historique** (bas de page) : liste les check-lists enregistrées
  côté serveur, avec mise en évidence des contrôles ayant un point en `NON`.

## Installation

Deux dossiers, deux `npm install` :

```bash
# Serveur
cd server
npm install

# Client
cd ../client
npm install
```

## Lancer en développement

Dans deux terminaux séparés :

```bash
# Terminal 1 — API
cd server
npm run dev        # http://localhost:4000

# Terminal 2 — App React
cd client
npm run dev         # http://localhost:5173
```

Le client est configuré (`vite.config.js`) pour rediriger les appels
`/api/...` vers `http://localhost:4000` en développement.

## Build de production

```bash
cd client
npm run build        # génère client/dist

cd ../server
npm start             # sert l'API + le build React sur http://localhost:4000
```

## Notes

- Le stockage de l'historique est un simple fichier JSON
  (`server/data/checklists.json`), suffisant pour un usage terrain ; il peut
  être remplacé par une vraie base de données sans toucher aux routes
  (`server/store.js` est le seul point à adapter).
- La génération PDF est faite **côté navigateur** avec `jsPDF` /
  `jspdf-autotable`, donc aucune dépendance serveur pour ça.
