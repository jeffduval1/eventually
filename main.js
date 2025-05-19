// main.js

import { paletteActuelle } from './modules/config.js';
import { appliquerPaletteGlobale } from './modules/palette.js';
import { ouvrirDB, getCategories, ajouterCategorie } from './modules/db/indexedDB.js';
import { afficherCartes, ajouterCarte } from './modules/cartes.js';
import { afficherVueParCategories, creerNouvelleCategorie, chargerMenuCategories } from './modules/categories.js';
import { filtrerParTag, reinitialiserFiltre } from './modules/filters.js';
import { afficherCorbeille, initialiserMenuHamburger, exporterCartes, importerCartes } from './modules/ui.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🟢 Initialisation Bee Organized');
  await ouvrirDB();
  await initialiserDonneesSiVides();

  appliquerPaletteGlobale(paletteActuelle);
  afficherVueParCategories();
  initialiserMenuHamburger();

  // Écouteurs globaux
  document.getElementById("btnAfficherFormCategorie")?.addEventListener("click", () => {
    chargerMenuCategories();
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

  // Menu hamburger
  document.getElementById("btnHamburger")?.addEventListener("click", () => {
    const menu = document.getElementById("menuContent");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  });

  document.getElementById("btnNouvelleCategorieMenu")?.addEventListener("click", () => {
    chargerMenuCategories();
    document.getElementById("modalCategorie").style.display = "block";
  });

  document.getElementById("btnGererCategoriesMenu")?.addEventListener("click", () => {
    document.getElementById("modalGestionCategories").style.display = "block";
  });

  document.getElementById("btnExporter")?.addEventListener("click", exporterCartes);
  document.getElementById("btnImporter")?.addEventListener("click", importerCartes);

  document.getElementById("btnChangerPalette")?.addEventListener("click", () => {
    const event = new CustomEvent('ouvrirModalePalette');
    window.dispatchEvent(event);
  });

  document.getElementById("btnAPropos")?.addEventListener("click", () => {
    alert("Bee Organized – Version 1.0\nUn outil simple pour structurer vos idées 🐝");
  });
});

async function initialiserDonneesSiVides() {
  const categories = await getCategories();
  if (categories.length === 0) {
    await ajouterCategorie({ nom: "Exemple", couleur: "#FF9800" });
    console.log("📦 Catégorie par défaut ajoutée");
  }
}
