/**
 * 🎨 palette.js
 * Gestion des palettes de couleurs et application globale
 * - appliquerPaletteGlobale : met à jour les couleurs dans l’interface et la DB
 * - changerPalette : bascule entre les palettes disponibles
 * - getCouleursDisponibles : retourne toutes les couleurs hex de la palette active
 * - ouvrirModalePalette : affiche la fenêtre de sélection de palette
 */

import { paletteActuelle, nomsCouleursParPalette, setPaletteActuelle } from './config.js';
import { getTextColor, rgbToHex } from './utils/helpers.js';
import { getCartes, getCategories, modifierCarte, modifierCategorie } from './db/indexedDB.js';
import { afficherCartes } from './cartes.js';
import { afficherVueParCategories } from './categories.js';
import { chargerMenuCategories } from './categories.js'; // ✅ c’est ici qu’elle est définie

// 🔹 Retourne la liste des couleurs de la palette active
export function getCouleursDisponibles() {
  return Object.keys(nomsCouleursParPalette[paletteActuelle]);
}

// 🔄 Appliquer la palette actuelle aux éléments existants
export function appliquerPaletteGlobale(anciennePaletteId) {
  const anciennesCouleurs = Object.keys(nomsCouleursParPalette[anciennePaletteId]);
  const nouvellesCouleurs = Object.keys(nomsCouleursParPalette[paletteActuelle]);

  // 🔹 Mise à jour des catégories
  getCategories().then(categories => {
    categories.forEach(cat => {
      const index = anciennesCouleurs.indexOf(cat.couleur);
      if (index !== -1) {
        cat.couleur = nouvellesCouleurs[index];
        modifierCategorie(cat);
      }
    });

    chargerMenuCategories();
    afficherVueParCategories();
  });

  // 🔹 Mise à jour des cartes
  getCartes().then(cartes => {
    cartes.forEach(carte => {
      const index = anciennesCouleurs.indexOf(carte.couleurCategorie);
      if (index !== -1) {
        carte.couleurCategorie = nouvellesCouleurs[index];
        modifierCarte(carte);
      }
    });

    afficherCartes();

    document.querySelectorAll(".carte").forEach(div => {
      const couleurActuelle = rgbToHex(div.style.borderLeftColor);
      const index = anciennesCouleurs.indexOf(couleurActuelle);
      if (index !== -1) {
        div.style.borderLeftColor = nouvellesCouleurs[index];
      }
    });

    const titre = document.getElementById("titreCategorieSelectionnee");
    if (titre && titre.style.backgroundColor) {
      const couleurActuelle = rgbToHex(titre.style.backgroundColor);
      const index = anciennesCouleurs.indexOf(couleurActuelle);
      if (index !== -1) {
        titre.style.backgroundColor = nouvellesCouleurs[index];
      }
    }
  });
}

// 🎛️ Changer la palette active
export function changerPalette(id) {
  if (!nomsCouleursParPalette[id]) {
    console.warn("❌ Palette inexistante :", id);
    return;
  }

  const ancienne = paletteActuelle;
  setPaletteActuelle(id);
  console.log("🎨 Changement de palette :", ancienne, "→", id);
  appliquerPaletteGlobale(ancienne);
}

// 🪟 Ouvrir la modale de sélection de palette
export function ouvrirModalePalette() {
  const modal = document.getElementById("modalPalette");
  if (modal) modal.style.display = "block";
}
