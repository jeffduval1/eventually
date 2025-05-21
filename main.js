// main.js

import { paletteActuelle } from './modules/config.js';
import { appliquerPaletteGlobale } from './modules/palette.js';
import { ouvrirDB, getCategories, ajouterCategorie } from './modules/db/indexedDB.js';
import { afficherCartes, ajouterCarte } from './modules/cartes.js';
console.log("📦 ajouterCarte est bien importée :", typeof ajouterCarte);
import { afficherVueParCategories, creerNouvelleCategorie, chargerMenuCategories } from './modules/categories.js';
import { filtrerParTag, reinitialiserFiltre } from './modules/filters.js';
import {
  afficherCorbeille,
  initialiserMenuHamburger,
  exporterCartes,
  setupUI
} from './modules/ui.js';
import { restaurerCarte, viderCorbeille, fermerCorbeille } from './modules/corbeille.js';
window.restaurerCarte = restaurerCarte;
window.viderCorbeille = viderCorbeille;
window.fermerCorbeille = fermerCorbeille;

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🟢 Initialisation Bee Organized');
  await ouvrirDB();
  await initialiserDonneesSiVides();
  chargerMenuCategories();
  appliquerPaletteGlobale(paletteActuelle);
  afficherVueParCategories();
  initialiserMenuHamburger();
  setupUI();

  // Écouteurs globaux
  document.getElementById("btnAfficherFormCategorie")?.addEventListener("click", () => {
    document.getElementById("modalCategorie").style.display = "block";
  });

  document.getElementById("btnGererCategories")?.addEventListener("click", () => {
    document.getElementById("modalGestionCategories").style.display = "block";
  });
  document.getElementById("closeModal")?.addEventListener("click", () => {
    document.getElementById("modalCategorie").style.display = "none";
  });
  document.getElementById("btnRetourCategories")?.addEventListener("click", afficherVueParCategories);
  document.getElementById("btnCreerCategorie")?.addEventListener("click", creerNouvelleCategorie);
  document.getElementById("ajoutCarteBtn")?.addEventListener("click", ajouterCarte);
  document.getElementById("btnModeCategories")?.addEventListener("click", afficherVueParCategories);
  document.getElementById("btnModeCartes")?.addEventListener("click", afficherCartes);
  document.getElementById("resetFilterBtn")?.addEventListener("click", reinitialiserFiltre);
  document.getElementById("btnAfficherCorbeille")?.addEventListener("click", afficherCorbeille);
  document.getElementById("btnFermerCorbeille")?.addEventListener("click", fermerCorbeille);
  document.getElementById("btnViderCorbeille")?.addEventListener("click", viderCorbeille);
  // Menu hamburger
  document.getElementById("btnHamburger")?.addEventListener("click", () => {
    const menu = document.getElementById("menuContent");
    if (!menu) return;
  
    const current = window.getComputedStyle(menu).display;
    if (current === "none") {
      menu.style.display = "block";
      console.log("✅ Menu affiché");
    } else {
      menu.style.display = "none";
      console.log("✅ Menu caché");
    }
  });
  document.getElementById("btnNouvelleCategorieMenu")?.addEventListener("click", () => {
    fermerMenuHamburger();
    document.getElementById("modalCategorie").style.display = "block";
    console.log("🟢 Modale catégorie affichée");
  });
  document.getElementById("btnGererCategoriesMenu")?.addEventListener("click", () => {
    document.getElementById("modalGestionCategories").style.display = "block";
    document.getElementById("menuContent").style.display = "none";
  });

  document.getElementById("btnExporter")?.addEventListener("click", exporterCartes);

  // 🟢 Ne PAS ré-attacher btnImporter ici — géré dans ui.js

  document.getElementById("btnChangerPalette")?.addEventListener("click", () => {
    const event = new CustomEvent('ouvrirModalePalette');
    window.dispatchEvent(event);
  });

  document.getElementById("btnAPropos")?.addEventListener("click", () => {
    alert("Bee Organized – Version 1.0\nUn outil simple pour structurer vos idées 🐝");
  });
});
document.addEventListener("click", (event) => {
  const menu = document.getElementById("menuContent");
  const bouton = document.getElementById("btnHamburger");

  if (!menu || !bouton) return;

  // Vérifie si le menu est visible
  const isMenuOpen = window.getComputedStyle(menu).display === "block";

  // Si on clique en dehors du menu et du bouton, on le ferme
  if (
    isMenuOpen &&
    !menu.contains(event.target) &&
    !bouton.contains(event.target)
  ) {
    menu.style.display = "none";
    console.log("🔒 Menu fermé car clic extérieur");
  }
});
async function initialiserDonneesSiVides() {
  console.log("✅ Données initiales vérifiées – aucune catégorie ajoutée automatiquement");
}
function fermerMenuHamburger() {
  const menu = document.getElementById("menuContent");
  if (menu) {
    menu.style.display = "none";
    console.log("✔️ Menu hamburger fermé");
  }
}
document.getElementById("toggleFormBtn")?.addEventListener("click", () => {
  console.log("🟡 Clic sur le bouton d’ajout de carte");
  document.getElementById("modalAjoutCarte").style.display = "block";
});