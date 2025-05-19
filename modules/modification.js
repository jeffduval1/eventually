/**
 * ✏️ modification.js
 * Gère la modification inline des cartes (édition directe dans la carte)
 */

import { getTextColor } from './utils/helpers.js';
import { getCartes, getCarteById, modifierCarte as dbModifierCarte } from './db/indexedDB.js';
import { getCouleursDisponibles, getNomCouleur, paletteActuelle } from './config.js';
import { afficherCartes } from './cartes.js';

export function modifierCarteInline(id) {
  getCarteById(id).then(carte => {
    const carteDiv = document.querySelector(`.carte[data-id="${id}"]`);
    if (!carte || !carteDiv) return;

    carteDiv.innerHTML = `
      <input type="text" id="edit-titre-${id}" value="${carte.titre}">
      <input type="text" id="edit-tags-${id}" value="${carte.tags.join(", ")}">
      <input type="text" id="edit-categorie-${id}" value="${carte.categorie || ""}">
      <select id="edit-couleur-${id}">
        ${getCouleursDisponibles().map(c =>
          `<option value="${c}" ${carte.couleurCategorie === c ? "selected" : ""} 
            style="background:${c};color:${getTextColor(c)}">
            ${getNomCouleur(c, paletteActuelle)}
          </option>`
        ).join("")}
      </select>
      <textarea id="edit-contenu-${id}">${carte.contenu}</textarea>
      <div style="margin-top:8px;">
        <button onclick="window.enregistrerModificationInline(${id})">💾 Enregistrer</button>
        <button onclick="window.annulerModification()">Annuler</button>
      </div>
    `;
  });
}

export function enregistrerModificationInline(id) {
  const titre = document.getElementById(`edit-titre-${id}`).value.trim();
  const tagsInput = document.getElementById(`edit-tags-${id}`).value;
  const categorie = document.getElementById(`edit-categorie-${id}`).value.trim();
  const couleurCategorie = document.getElementById(`edit-couleur-${id}`).value;
  const contenu = document.getElementById(`edit-contenu-${id}`).value.trim();

  if (!titre || !contenu) {
    alert("Veuillez remplir le titre et le contenu !");
    return;
  }

  const tags = tagsInput ? tagsInput.toLowerCase().split(',').map(t => t.trim()) : [];

  getCarteById(id).then(carte => {
    if (!carte) return;

    const carteModifiee = {
      ...carte,
      titre,
      tags,
      contenu,
      categorie,
      couleurCategorie
    };

    dbModifierCarte(carteModifiee).then(() => {
      afficherCartes();
    });
  });
}

// Optionnel : à définir globalement si utilisé dans le HTML inline
window.enregistrerModificationInline = enregistrerModificationInline;
window.annulerModification = afficherCartes;
