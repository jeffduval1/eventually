/**
 * 🖼️ ui.js
 * Gestion de l’interface utilisateur (UI)
 */
// console.log("🧩 ui.js chargé");

import { afficherCartes, ajouterCarte } from './cartes.js';
import { afficherVueParCategories } from './categories.js';
import { exporterCartes, importerCartes } from './db/indexedDB.js';
import { ouvrirModalePalette } from './palette.js';
import { reinitialiserFiltre } from './filters.js';

function setupUI() {
  // Importer
  document.getElementById("btnImporter")?.addEventListener("click", () => {
    const input = document.getElementById("importFile");
    input.value = ""; // permet de réimporter le même fichier
    input.click();
  });

  document.getElementById("importFile")?.addEventListener("change", (e) => {
    const fichier = e.target.files[0];
    if (fichier instanceof Blob) {
      importerCartes(fichier)
        .then(() => {
          alert("Importation réussie !");
          afficherCartes(); // recharge l’affichage après import
        })
        .catch(err => alert("Erreur d'import : " + err.message));
    } else {
      alert("Aucun fichier valide sélectionné.");
    }
  });

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

  document.getElementById("resetFilterBtn")?.addEventListener("click", reinitialiserFiltre);
  document.getElementById("btnChangerPalette")?.addEventListener("click", ouvrirModalePalette);
  document.getElementById("btnExporter")?.addEventListener("click", exporterCartes);

  changerModeAffichage("categories", true);
}

function changerModeAffichage(mode, initial = false) {
  const cartesContainer = document.getElementById("cartes-container");
  const vueCategories = document.getElementById("vue-par-categories");
  const btnCartes = document.getElementById("btnModeCartes");
  const btnCategories = document.getElementById("btnModeCategories");

  if (mode === "cartes") {
    cartesContainer.style.display = "flex";
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

function afficherCorbeille() {
  document.getElementById("corbeille-page").style.display = "block";
}

function fermerCorbeille() {
  document.getElementById("corbeille-page").style.display = "none";
}

function viderCorbeille() {
  const transaction = window.db.transaction("corbeille", "readwrite");
  const store = transaction.objectStore("corbeille");
  const request = store.clear();

  request.onsuccess = () => {
    console.log("🗑️ Corbeille vidée");
    afficherCorbeille();
  };
}

function initialiserMenuHamburger() {
  const btn = document.getElementById("btnHamburger");
  const menu = document.getElementById("menuContent");

  if (!btn || !menu) {
    console.warn("⛔ Bouton ou menu hamburger introuvable.");
    return;
  }

  btn.addEventListener("click", (event) => {
    event.stopPropagation();
    menu.classList.toggle("show");
  });

  document.addEventListener("click", (event) => {
    if (!menu.contains(event.target) && event.target !== btn) {
      menu.classList.remove("show");
    }
  });
}
function reinitialiserFormulaireCategorie() {
  const nomInput = document.getElementById("nouvelleCategorieNom");
  const couleurSelect = document.getElementById("nouvelleCouleur");
  const parentSelect = document.getElementById("parentCategorie");
  const resumeParent = document.getElementById("resumeParentCategorie");

  if (nomInput) nomInput.value = "";
  if (couleurSelect) {
    couleurSelect.selectedIndex = 0;
    couleurSelect.disabled = false;
    couleurSelect.title = "";
  }
  if (parentSelect) parentSelect.selectedIndex = 0;
  if (resumeParent) resumeParent.style.display = "none";
}
function ouvrirModale(id) {
  const modal = document.getElementById(id);

  if (modal) {
    modal.classList.remove("hidden");
modal.style.display = "block";
  }
}

function fermerModale(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add("hidden");
modal.style.display = "none";
  }
}

// ✅ Export unique propre et clair
export {
  setupUI,
  changerModeAffichage,
  afficherCorbeille,
  fermerCorbeille,
  viderCorbeille,
  initialiserMenuHamburger,
  reinitialiserFormulaireCategorie,
  ouvrirModale,
  fermerModale,
  exporterCartes,
  importerCartes
};