/**
 * 🗃 cartes.js
 * Gère les cartes (affichage, ajout, modification, suppression)
 */

import { getTextColor } from './utils/helpers.js';
import {
  getCartes,
  ajouterCarte as dbAjouterCarte,
  modifierCarte as dbModifierCarte,
  deplacerCarteDansCorbeille, db, getCategorieByNom } 
  from './db/indexedDB.js';
import { mettreAJourResumeCategorie } from "./uiCategories.js";
import { changerModeAffichage } from './ui.js';

let idCarteASupprimer = null;

// 📌 Affiche toutes les cartes
function afficherCartes(modeTri = "date-desc") {
  console.log("🌀 afficherCartes() appelée");
  const boutonRetour = document.getElementById("btnRetourCategories");
  document.getElementById("btnAjouterSousCategorie").classList.add("hidden");
  boutonRetour.classList.add("hidden");
  const cartesContainer = document.getElementById("cartes-container");
  cartesContainer.innerHTML = "";
  const vueCategories = document.getElementById("vue-par-categories");
  const titreCategorie = document.getElementById("titreCategorieSelectionnee");

  cartesContainer.classList.remove("hidden");
  vueCategories.classList.add("hidden");
  titreCategorie.classList.add("hidden");
  getCartes().then(cartes => {

    cartes.sort((a, b) => {
      if (modeTri === "titre-asc") return a.titre.localeCompare(b.titre);
      if (modeTri === "titre-desc") return b.titre.localeCompare(a.titre);
      if (modeTri === "date-asc") return a.dateCreation - b.dateCreation;
      return b.dateCreation - a.dateCreation;
    });

    cartes.forEach(carte => {
      const div = document.createElement("div");
      div.classList.add("carte");
      div.dataset.carteId = carte.id;
      div.style.borderLeft = `6px solid ${carte.couleurCategorie || "#ccc"}`;
      div.innerHTML = `
      <button class="modifier-carte" data-id="${carte.id}" title="Modifier cette carte">✏️</button>
        <h3>${carte.titre}</h3>
        <p>${carte.contenu}</p>
        <small class="tags">Tags : ${(carte.tags || []).join(", ")}</small>
      `;
      cartesContainer.appendChild(div);
      const boutonModifier = div.querySelector('.modifier-carte');
      if (boutonModifier) {
        boutonModifier.addEventListener('click', () => {
          ouvrirModaleModification(carte); // ← tu crées cette fonction juste après
        });
      }

    });
  });
}

// 📌 Affiche des cartes filtrées (ex. par tag)
function afficherCartesFiltres(cartes) {
  const cartesContainer = document.getElementById("cartes-container");
  cartesContainer.innerHTML = "";

  cartes.forEach(carte => {
    const div = document.createElement("div");
    div.classList.add("carte");
    div.style.borderLeft = `6px solid ${carte.couleurCategorie || "#ccc"}`;
    div.innerHTML = `
      <h3>${carte.titre}</h3>
      <p>${carte.contenu}</p>
      <small class="tags">Tags : ${(carte.tags || []).join(", ")}</small>
    `;
    cartesContainer.appendChild(div);
  });
}

// ➕ Ajoute une carte depuis le formulaire
async function ajouterCarte() {
  // 🔢 1. ID
  const idStr = document.getElementById("carteId")?.value;
  const id = idStr ? Number(idStr) : null;

  // 📝 2. Récupération des champs
  const titreInput = document.getElementById("titre");
  const contenuInput = document.getElementById("contenu");
  const tagsInput = document.getElementById("tags");
  const categorieInput = document.getElementById("categorieChoisie");

  const titre = titreInput.value.trim();
  const contenu = contenuInput.value.trim();
  const tags = tagsInput.value.split(",").map(t => t.trim()).filter(Boolean);
  const categorie = categorieInput.value;
  const couleurCategorie = categorieInput.dataset.couleur || "#ccc";

  // 🧼 3. Validation (inchangé)
  // ... ton code de validation ici ...

  // 📦 4. Construction de la carte
  const texteCategorie = document.getElementById("texteCategorieCarte");
  const nomCategorie = texteCategorie?.textContent?.trim() || categorie;

  const nouvelleCarte = {
    id: id ?? Date.now(),
    titre,
    contenu,
    tags,
    categorie,
    nomCategorie,
    couleurCategorie,
    dateCreation: id ? undefined : Date.now()
  };

  // 💾 5. Enregistrement
  if (id) {
    await dbModifierCarte(nouvelleCarte);
  } else {
    await dbAjouterCarte(nouvelleCarte);
  }

 // 🔄 6. Rafraîchir interface et recentrer proprement
await afficherCartes();

// 📍 7. Attendre que le DOM soit bien mis à jour avant de cibler la carte
requestAnimationFrame(() => {
  const carteModifiee = document.querySelector(`[data-carte-id="${nouvelleCarte.id}"]`);
  if (carteModifiee) {
    carteModifiee.scrollIntoView({ behavior: "auto", block: "center" });
  }
});

  // 🧼 9. Nettoyage de la modale
  document.getElementById("modalAjoutCarte").classList.add("hidden");

  titreInput.value = "";
  contenuInput.value = "";
  tagsInput.value = "";
  categorieInput.value = "";
  categorieInput.dataset.couleur = "";
  document.getElementById("carteId").value = "";

  mettreAJourResumeCategorie({ nom: "-- Choisir une catégorie --", couleur: "#ccc" });
  document.getElementById("categorieSelectionnee").classList.add("hidden");
}

function ouvrirModaleModification(carte) {
  console.log("📝 Données de la carte à modifier :", carte);
  setCarteASupprimer(carte.id);

  /* ─── 1. Titre de la modale ───────────────────────────────────────────── */
  document.getElementById("titreModaleCarte").textContent = "Modifier la carte";

  /* ─── 2. Champ caché de la catégorie (toujours visible en modification) ─ */
  const champCategorie = document.getElementById("categorieChoisie");
  champCategorie.classList.remove("hidden");
  champCategorie.disabled = false;
  champCategorie.style.display = "block";

  /* ─── 3. Résumé visuel : première mise à jour rapide depuis la carte ──── */
  mettreAJourResumeCategorie({
    nom    : carte.nomCategorie || carte.categorie || "-- Aucune catégorie --",
    couleur: carte.couleurCategorie || "#ccc"
  });
  document.getElementById("ouvrirConfirmationSuppressionCarteBtn").classList.remove("hidden");
document.getElementById("ouvrirConfirmationSuppressionCarteBtn").style.display = "inline-block";
  console.log("🧩 Mise à jour visuelle avec :", {
    nom    : carte.nomCategorie || carte.categorie,
    couleur: carte.couleurCategorie
  });
  /* ─── 4. Optionnel : re-valider avec la base si la catégorie existe ───── */
  if (carte.categorie) {
    getCategorieByNom(carte.categorie).then(cat => {
      if (cat) {
        mettreAJourResumeCategorie({ nom: cat.nom, couleur: cat.couleur });
       
      }
    });
  }

 /* ─── 5. Gérer le bouton "Changer de catégorie" ─────────────────────────── */
const btnCategorie = document.getElementById("btnCategorieOptions");
btnCategorie.textContent = "Changer de catégorie";
btnCategorie.classList.remove("hidden");
  

  /* ─── 6. Pré-remplir les champs texte/tags ────────────────────────────── */
  document.getElementById("titre").value   = carte.titre;
  document.getElementById("contenu").value = carte.contenu;
  document.getElementById("tags").value    = (carte.tags || []).join(", ");
  document.getElementById("carteId").value = carte.id;

  /* ─── 7. Afficher la modale ───────────────────────────────────────────── */
  const boutonAjout = document.getElementById("ajoutCarteBtn");
if (boutonAjout) {
  boutonAjout.textContent = "Enregistrer les modifications";
}
  document.getElementById("modalAjoutCarte").classList.remove("hidden");
}


function setCarteASupprimer(id) {
  idCarteASupprimer = id;
}

function getCarteASupprimer() {
  return idCarteASupprimer;
}
export {
  afficherCartes,
  afficherCartesFiltres,
  ajouterCarte,
  setCarteASupprimer,
  getCarteASupprimer
};