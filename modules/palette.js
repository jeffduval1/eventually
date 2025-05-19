/**
 * 🎨 palette.js
 * Gère le changement de palette de couleurs et l'application globale
 */

import { getTextColor, rgbToHex } from './utils/helpers.js';
import { ouvrirDB } from './db/indexedDB.js';
import { nomsCouleursParPalette, paletteActuelle } from './config.js';
import { afficherCartes } from './cartes.js';
import { afficherVueParCategories } from './categories.js';
import { chargerMenuCategories } from './categories.js';

let db;

ouvrirDB().then(database => {
  db = database;
});

// 🌈 Appliquer une nouvelle palette en mettant à jour les couleurs par index
export function appliquerPaletteGlobale(anciennePaletteId) {
  const anciennes = Object.keys(nomsCouleursParPalette[anciennePaletteId]);
  const nouvelles = Object.keys(nomsCouleursParPalette[paletteActuelle]);

  if (anciennes.length !== nouvelles.length) {
    alert("Les palettes ne sont pas alignées. Impossible d’appliquer.");
    return;
  }

  // 🔄 Mise à jour des catégories
  const txCat = db.transaction("categories", "readwrite");
  const storeCat = txCat.objectStore("categories");
  storeCat.getAll().onsuccess = function (event) {
    const categories = event.target.result;
    categories.forEach(cat => {
      const index = anciennes.indexOf(cat.couleur);
      if (index !== -1) {
        cat.couleur = nouvelles[index];
        storeCat.put(cat);
      }
    });
    chargerMenuCategories();
    afficherVueParCategories();
  };

  // 🔄 Mise à jour des cartes
  const txCartes = db.transaction("regles", "readwrite");
  const storeCartes = txCartes.objectStore("regles");
  storeCartes.getAll().onsuccess = function (event) {
    const cartes = event.target.result;
    cartes.forEach(carte => {
      const index = anciennes.indexOf(carte.couleurCategorie);
      if (index !== -1) {
        carte.couleurCategorie = nouvelles[index];
        storeCartes.put(carte);
      }
    });
    afficherCartes();
  };

  // 🎨 Mise à jour visuelle immédiate
  document.querySelectorAll(".carte").forEach(div => {
    const couleurActuelle = rgbToHex(div.style.borderLeftColor);
    const index = anciennes.indexOf(couleurActuelle);
    if (index !== -1) {
      div.style.borderLeftColor = nouvelles[index];
    }
  });

  const titre = document.getElementById("titreCategorieSelectionnee");
  if (titre && titre.style.backgroundColor) {
    const ancienne = rgbToHex(titre.style.backgroundColor);
    const index = anciennes.indexOf(ancienne);
    if (index !== -1) {
      titre.style.backgroundColor = nouvelles[index];
    }
  }
}
export function ouvrirModalePalette() {
  const menu = document.getElementById("menuContent");
  if (menu) menu.style.display = "none";

  const container = document.getElementById("listePalettes");
  if (!container) return;

  container.innerHTML = "";

  palettes.forEach(palette => {
    const btn = document.createElement("button");
    btn.classList.add("palette-btn");
    if (palette.id === paletteActuelle) btn.classList.add("active");
    btn.setAttribute("data-id", palette.id);
    btn.onclick = () => changerPalette(palette.id);

    const preview = document.createElement("div");
    preview.classList.add("palette-aperçu");
    palette.couleurs.slice(0, 3).forEach(couleur => {
      const rond = document.createElement("span");
      rond.classList.add("couleur");
      rond.style.backgroundColor = couleur;
      preview.appendChild(rond);
    });

    btn.appendChild(preview);
    btn.append(palette.nom);
    container.appendChild(btn);
  });

  document.getElementById("modalPalette").style.display = "block";
}

// 🧼 Corriger les couleurs existantes qui ne font pas partie de la palette active
export function corrigerCouleursExistantes() {
  const palette = nomsCouleursParPalette["royalDusk"]; // Palette de référence
  const couleursOK = Object.keys(palette);

  const tx = db.transaction("categories", "readwrite");
  const store = tx.objectStore("categories");
  store.getAll().onsuccess = function (event) {
    const categories = event.target.result;
    categories.forEach((cat, i) => {
      if (!couleursOK.includes(cat.couleur)) {
        const nouvelle = couleursOK[i % couleursOK.length];
        cat.couleur = nouvelle;
        store.put(cat);
      }
    });
  };
}

export function corrigerCouleursCartesExistantes() {
  const palette = nomsCouleursParPalette["royalDusk"];
  const couleursOK = Object.keys(palette);

  const tx = db.transaction("regles", "readwrite");
  const store = tx.objectStore("regles");
  store.getAll().onsuccess = function (event) {
    const cartes = event.target.result;
    cartes.forEach((carte, i) => {
      if (!couleursOK.includes(carte.couleurCategorie)) {
        const nouvelle = couleursOK[i % couleursOK.length];
        carte.couleurCategorie = nouvelle;
        store.put(carte);
      }
    });
  };
}
