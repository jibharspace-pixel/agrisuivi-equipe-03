// ÉQUIPE — Rapport : assembler le travail des quatre membres.
// Fiche : fiches/5-equipe-rapport.md · Vérifier : npm run test:rapport
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { surfaceTotale } from "./parcelles.js";
import { alertesIrrigation } from "./irrigation.js";
import { bilanRecoltes, classerParRevenu } from "./recoltes.js";

// Renvoie les id des alertes qui ont cet état, séparés par ', ', ou 'aucune'.
export function listerParEtat(alertes, etat) {
  const alertesDeCetEtat = alertes.filter((alerte) => alerte.etat === etat);
  const idDesParcelles = alertesDeCetEtat.map((alerte) => alerte.id);

  if (idDesParcelles.length === 0) {
    return "aucune";
  }
  return idDesParcelles.join(", ");
}

// Renvoie le texte complet du rapport (voir fiches/5-equipe-rapport.md).
export function construireRapport(donnees, date) {
  const { parcelles, cultures, releves, recoltes } = donnees;

  // Parcelles (Membre 1)
  const nombreDeParcelles = parcelles.length;
  const surfaceTotaleHa = surfaceTotale(parcelles);

  // Irrigation (Membre 2)
  const alertesParParcelle = alertesIrrigation(parcelles, releves, cultures);
  const parcellesAArroser = listerParEtat(alertesParParcelle, "ARROSER");
  const parcellesADrainer = listerParEtat(alertesParParcelle, "DRAINER");
  const parcellesSansReleve = listerParEtat(alertesParParcelle, "INCONNU");

  // Récoltes (Membre 3)
  const bilanParParcelle = bilanRecoltes(parcelles, recoltes, cultures);
  const productionTotaleKg = bilanParParcelle.reduce((total, parcelle) => total + parcelle.kg, 0);
  const revenuTotalFcfa = bilanParParcelle.reduce((total, parcelle) => total + parcelle.revenu, 0);

  // Meilleure parcelle : la première du classement par revenu
  const parcellesClassees = classerParRevenu(bilanParParcelle);
  const meilleureParcelle = parcellesClassees[0];

  // Assemblage du texte, ligne par ligne
  const lignesDuRapport = [
    `=== RAPPORT AGRISUIVI DU ${date} ===`,
    `Parcelles suivies : ${nombreDeParcelles}`,
    `Surface totale : ${surfaceTotaleHa} ha`,
    "",
    "--- Irrigation ---",
    `À arroser : ${parcellesAArroser}`,
    `À drainer : ${parcellesADrainer}`,
    `Sans relevé : ${parcellesSansReleve}`,
    "",
    "--- Récoltes ---",
    `Production totale : ${productionTotaleKg} kg`,
    `Revenu estimé : ${revenuTotalFcfa} FCFA`,
    `Meilleure parcelle : ${meilleureParcelle.id} (${meilleureParcelle.producteur}) avec ${meilleureParcelle.revenu} FCFA`,
  ];

  return lignesDuRapport.join("\n") + "\n";
}

// Écrit le texte dans le fichier demandé. Crée le dossier s'il n'existe pas.
export async function enregistrerRapport(chemin, texte) {
  const dossierDuFichier = dirname(chemin);
  await mkdir(dossierDuFichier, { recursive: true });
  await writeFile(chemin, texte, "utf8");
}