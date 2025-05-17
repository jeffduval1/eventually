/**
 * 🖼️ ui.js
 * Gestion de l’interface utilisateur (UI)
 * - Événements DOM : clics, modales, changement de vue
 * - Vue cartes vs catégories
 * - Menu hamburger
 * - Actions globales (import/export, filtres, palette)
 */

import { afficherCartes, ajouterCarte } from './cartes.js';
import { afficherVueParCategories } from './categories.js';
import { exporterCartes, importerCartes } from './db/indexedDB.js';
import { ouvrirModalePalette } from './palette.js';
import { reinitialiserFiltre } from './filters.js';

// 🎬 Initialisation globale des événements
export function setupUI() {
  // Vue : par cartes
  document.getElementById("btnModeCartes")?.addEventListener("click", () => {
    changerModeAffichage("cartes");
  });

  // Vue : par catégories
  document.getElementById("btnModeCategories")?.addEventListener("click", () => {
    changerModeAffichage("categories");
  });

  // Ajout de carte
  document.getElementById("ajoutCarteBtn")?.addEventListener("click", () => {
    const titre = document.getElementById("titre").value.trim();
    const contenu = document.getElementById("contenu").value.trim();
    const tags = document.getElementById("tags").value.split(',').map(t => t.trim()).filter(Boolean);
    const categorie = document.getElementById("categorieChoisie").value;
    const couleur = document.getElementById("categorieChoisie").dataset.couleur || "#ccc";

    if (titre && contenu) {
      ajouterCarte({ titre, contenu, tags, categorie, couleurCategorie: couleur });
    } else {
      alert("Veuillez remplir le titre et le contenu.");
    }
  });

  // Réinitialiser le filtre
  document.getElementById("resetFilterBtn")?.addEventListener("click", reinitialiserFiltre);

  // Changer la palette
  document.getElementById("btnChangerPalette")?.addEventListener("click", ouvrirModalePalette);

  // Exporter
  document.getElementById("btnExporter")?.addEventListener("click", exporterCartes);

  // Importer
  document.getElementById("btnImporter")?.addEventListener("click", () => {
    document.getElementById("importFile").click();
  });

  document.getElementById("importFile")?.addEventListener("change", (e) => {
    if (e.target.files.length) {
      importerCartes(e.target.files[0]);
    }
  });

  // Vue initiale
  changerModeAffichage("categories", true);
}

// 🔁 Changement de vue entre cartes et catégories
export function changerModeAffichage(mode, initial = false) {
  const cartesContainer = document.getElementById("cartes-container");
  const vueCategories = document.getElementById("vue-par-categories");
  const btnCartes = document.getElementById("btnModeCartes");
  const btnCategories = document.getElementById("btnModeCategories");

  if (mode === "cartes") {
    cartesContainer.style.display = "block";
    vueCategories.style.display = "none";
    btnCartes.classList.add("active");
    btnCategories.classList.remove("active");
    if (!initial) afficherCartes();
  } else {
    cartesContainer.style.display = "none";
    vueCategories.style.display = "flex";
    btnCartes.classList.remove("active");
    btnCategories.classList.add("active");
    afficherVueParCategories();
  }
}

// 🗑️ Corbeille – Voir
export function afficherCorbeille() {
  document.getElementById("corbeille-page").style.display = "block";
}

// 🗑️ Corbeille – Fermer
export function fermerCorbeille() {
  document.getElementById("corbeille-page").style.display = "none";
}

// 🗑️ Corbeille – Vider
export function viderCorbeille() {
  const transaction = window.db.transaction("corbeille", "readwrite");
  const store = transaction.objectStore("corbeille");
  const request = store.clear();

  request.onsuccess = () => {
    console.log("🗑️ Corbeille vidée");
    afficherCorbeille();
  };
}

// 🍔 Menu hamburger – ouvrir/fermer
export function initialiserMenuHamburger() {
  const btn = document.getElementById("btnHamburger");
  const menu = document.getElementById("menuContent");

  if (!btn || !menu) {
    console.warn("⛔ Bouton ou menu hamburger introuvable.");
    return;
  }

  btn.addEventListener("click", (event) => {
    event.stopPropagation();
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", (event) => {
    if (!menu.contains(event.target) && event.target !== btn) {
      menu.style.display = "none";
    }
  });
}
