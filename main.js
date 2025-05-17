/**
 * 🧠 main.js
 * Point d'entrée de l'application Bee Organized
 * - Initialise IndexedDB
 * - Applique la palette
 * - Affiche la vue par catégories par défaut
 * - Relie les événements DOM principaux
 */

import { paletteActuelle } from './modules/config.js';
import { appliquerPaletteGlobale } from './modules/palette.js';
import { ouvrirDB } from './modules/db/indexedDB.js';
import { afficherCartes, ajouterCarte } from './modules/cartes.js';
import { afficherVueParCategories, creerNouvelleCategorie } from './modules/categories.js';
import { filtrerParTag, reinitialiserFiltre } from './modules/filters.js';
import { afficherCorbeille, initialiserMenuHamburger } from './modules/ui.js';


document.addEventListener('DOMContentLoaded', async () => {
  console.log('🟢 Initialisation Bee Organized');
  await ouvrirDB();

  appliquerPaletteGlobale(paletteActuelle);
  afficherVueParCategories();
  initialiserMenuHamburger();

  // Écouteurs globaux
  document.getElementById("btnAfficherFormCategorie")?.addEventListener("click", () => {
    document.getElementById("modalCategorie").style.display = "block";
  });

  document.getElementById("btnGererCategories")?.addEventListener("click", () => {
    document.getElementById("modalGestionCategories").style.display = "block";
  });

  document.getElementById("btnRetourCategories")?.addEventListener("click", afficherVueParCategories);
  document.getElementById("btnCreerCategorie")?.addEventListener("click", creerNouvelleCategorie);
  document.getElementById("ajoutCarteBtn")?.addEventListener("click", ajouterCarte);
  document.getElementById("btnModeCategories")?.addEventListener("click", afficherVueParCategories);
  document.getElementById("btnModeCartes")?.addEventListener("click", afficherCartes);
  document.getElementById("resetFilterBtn")?.addEventListener("click", reinitialiserFiltre);
  document.getElementById("btnAfficherCorbeille")?.addEventListener("click", afficherCorbeille);

  // Menu hamburger (version simple d’origine)
  document.getElementById("btnHamburger")?.addEventListener("click", () => {
    const menu = document.getElementById("menuContent");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  });
   // 🔁 Liens du menu hamburger vers les actions existantes
   document.getElementById("btnNouvelleCategorieMenu")?.addEventListener("click", () => {
    document.getElementById("modalCategorie").style.display = "block";
  });

  document.getElementById("btnGererCategoriesMenu")?.addEventListener("click", () => {
    document.getElementById("modalGestionCategories").style.display = "block";
  });

  document.querySelector('#menuContent button[onclick="exporterCartes()"]')?.addEventListener("click", () => {
    document.getElementById("btnExporter")?.click();
  });

  document.querySelector('#menuContent button[onclick="importerCartes()"]')?.addEventListener("click", () => {
    document.getElementById("btnImporter")?.click();
  });

  document.querySelector('#menuContent button[onclick="afficherCorbeille()"]')?.addEventListener("click", () => {
    afficherCorbeille();
  });

  document.querySelector('#menuContent button[onclick="ouvrirModalePalette()"]')?.addEventListener("click", () => {
    document.getElementById("btnChangerPalette")?.click();
  });

  document.querySelector('#menuContent button[onclick="ouvrirAPropos()"]')?.addEventListener("click", () => {
    document.getElementById("btnAPropos")?.click();
  });

});
 