/**
 * 🖼️ ui.js
 * Gestion de l’interface utilisateur (UI)
 */
// console.log("🧩 ui.js chargé");

import { afficherCartes, ajouterCarte} from './cartes.js';
import { afficherVueParCategories, setIdCategorieActuelle } from './categories.js';
import { exporterCartes, importerCartes } from './db/indexedDB.js';
import { ouvrirModalePalette } from './palette.js';
import { reinitialiserFiltre } from './filters.js';
import { mettreAJourResumeCategorie } from "./uiCategories.js";

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
  document.getElementById("ajoutCarteBtn")?.addEventListener("click", (e) => {
    e.preventDefault();          // évite le submit implicite
    ajouterCarte();              // appelle la fonction de cartes.js
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
    setIdCategorieActuelle(null);
    cartesContainer.style.display = "flex";
    vueCategories.classList.add("hidden");
    btnCartes.classList.add("active");
    btnCategories.classList.remove("active");
    if (!initial) afficherCartes();
  } else {
    cartesContainer.classList.add("hidden");
    vueCategories.style.display = "flex";
    btnCartes.classList.remove("active");
    btnCategories.classList.add("active");
    afficherVueParCategories();
  }
}

function afficherCorbeille() {
  document.getElementById("corbeille-page").classList.remove("hidden");
}

function fermerCorbeille() {
  document.getElementById("corbeille-page").classList.add("hidden");
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
  if (resumeParent) resumeParent.classList.add("hidden");
}
function ouvrirModale(id) {
  const modal = document.getElementById(id);

  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.remove("hidden");
  }
}

function fermerModale(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.add("hidden");
  }
}

function ouvrirModaleAjoutCarte() {
  preparerModalePourNouvelleCarte();
  const modale = document.getElementById("modalAjoutCarte");
  const form = document.getElementById("formAjoutCarte");
  const resume = document.getElementById("categorieSelectionnee");
  const titre = document.getElementById("titreModaleCarte");
  const texteResume = document.getElementById("texteCategorieCarte");
  if (texteResume) texteResume.textContent = "-- Choisir une catégorie --";
  modale.classList.remove("hidden");
  form.reset();

  document.getElementById("carteId").value = "";
  document.getElementById("categorieChoisie").value = "";
  document.getElementById("categorieChoisie").dataset.couleur = "";

  // 🔴 🔽 AJOUT ICI : refermer tous les menus de catégories s'ils sont restés ouverts
  const menuExistantes = document.getElementById("listeCategories");
  if (menuExistantes) menuExistantes.classList.add("hidden");

  const zoneParent = document.getElementById("zoneChoixParent");
  if (zoneParent) zoneParent.classList.add("hidden");

  // Nettoyage visuel du résumé
  if (resume) {
    resume.textContent = "-- Choisir une catégorie --";
    resume.style.backgroundColor = "";
    resume.style.color = "";
    resume.classList.add("hidden");
  }

  // Titre de la modale
  if (titre) titre.textContent = "Créer une nouvelle carte";

  // Masquer bouton "Annuler"
  document.getElementById("annulerModifBtn").classList.add("hidden");

  // 🔵 Facultatif mais recommandé : nettoyer messages d’erreur
  ["erreurTitre", "erreurCategorie", "erreurContenu"].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = "";
      element.classList.add("hidden")
    }
  });
  const boutonAjout = document.getElementById("ajoutCarteBtn");
  if (boutonAjout) {
    boutonAjout.textContent = "Ajouter";
  }
}
function preparerModalePourNouvelleCarte() {
  mettreAJourResumeCategorie({ nom: "", couleur: "" });
  document.getElementById("btnCategorieOptions").classList.remove("hidden");
  document.getElementById("categorieSelectionnee").classList.add("hidden");
  document.querySelector("#titreModaleCarte").textContent = "Créer une nouvelle carte";
  const modale = document.getElementById("modalAjoutCarte");
  const form = document.getElementById("formAjoutCarte");

  if (!modale || !form) return;

  // Réinitialisation du formulaire HTML
  form.reset();

  // Réinitialisation manuelle (au cas où form.reset() ne suffit pas)
  document.getElementById("carteId").value = "";

  const champCategorie = document.getElementById("categorieChoisie");
  champCategorie.value = "";
  champCategorie.dataset.couleur = "";

  const texteResume = document.getElementById("texteCategorieCarte");
  const resume = document.getElementById("categorieSelectionnee");

  if (texteResume) texteResume.textContent = "-- Choisir une catégorie --";
  if (resume) {
    resume.classList.add("hidden");
    resume.removeAttribute("style"); // Nettoyage du style inline
  }

  // Masquer bouton "Annuler"
  const annulerBtn = document.getElementById("annulerModifBtn");
  if (annulerBtn) {
    annulerBtn.classList.add("hidden");
    annulerBtn.style.display = "none";
  }

  // Réinitialiser le bouton d’envoi
  const boutonAjout = document.getElementById("ajoutCarteBtn");
  if (boutonAjout) {
    boutonAjout.textContent = "Ajouter";
  }

  // Nettoyage des messages d’erreur
  ["erreurTitre", "erreurCategorie", "erreurContenu"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = "";
      el.classList.add("hidden");
    }
  });
  ouvrirModale("modalAjoutCarte");
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
  ouvrirModaleAjoutCarte,
  fermerModale,
  exporterCartes,
  importerCartes,
  preparerModalePourNouvelleCarte
};