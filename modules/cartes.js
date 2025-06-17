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

  // 🔢 Récupération de l’ID (création ou modification)
  const idStr = document.getElementById("carteId")?.value;
  const id = idStr ? Number(idStr) : null; // ← CHANGÉ
  console.log("📌 Type d'ID soumis :", typeof id, id);
  // 📝 Récupération des champs du formulaire
  const titreInput = document.getElementById("titre");
  const contenuInput = document.getElementById("contenu");
  const tagsInput = document.getElementById("tags");
  const categorieInput = document.getElementById("categorieChoisie");

  const titre = titreInput.value.trim();
  const contenu = contenuInput.value.trim();
  const tags = tagsInput.value.split(",").map(t => t.trim()).filter(Boolean);
  const categorie = categorieInput.value;
  const couleurCategorie = categorieInput.dataset.couleur || "#ccc";

  // 🧼 Réinitialiser les messages d'erreur
  document.getElementById("erreurTitre").textContent = "";
  document.getElementById("erreurTitre").classList.add("hidden");
  document.getElementById("erreurCategorie").textContent = "";
  document.getElementById("erreurCategorie").classList.add("hidden");
  document.getElementById("erreurContenu").textContent = "";
  document.getElementById("erreurContenu").classList.add("hidden");

  let erreur = false;

  if (!titre) {
    document.getElementById("erreurTitre").textContent = "Le titre est requis.";
    document.getElementById("erreurTitre").classList.remove("hidden");
    erreur = true;
  }

  if (!categorie) {
    document.getElementById("erreurCategorie").textContent = "Veuillez choisir une catégorie.";
    document.getElementById("erreurCategorie").classList.remove("hidden");
    erreur = true;
  }

  if (!contenu) {
    document.getElementById("erreurContenu").textContent = "Le contenu ne peut pas être vide.";
    document.getElementById("erreurContenu").classList.remove("hidden");
    erreur = true;
  }

  if (erreur) {
    return;
  }

  // 🧠 Construction de l'objet carte
  const texteCategorie = document.getElementById("texteCategorieCarte");
  const nomCategorie = texteCategorie?.textContent?.trim() || categorie;
  const nouvelleCarte = {
    id: id ?? Date.now(), // ← CHANGÉ : permet la mise à jour correcte si id existe
    titre,
    contenu,
    tags,
    categorie,
    nomCategorie,
    couleurCategorie,
    dateCreation: id ? undefined : Date.now() // ← CHANGÉ : évite de recréer la date si on modifie
  };

  // 💾 Enregistrement dans la base de données
  if (id) {
    await dbModifierCarte(nouvelleCarte); // ← CHANGÉ : mise à jour au lieu d'ajout
  } else {
    await dbAjouterCarte(nouvelleCarte);
  }
  await afficherCartes();
  // ✅ Fermeture de la modale et mise à jour de l’affichage
  document.getElementById("modalAjoutCarte").classList.add("hidden");

  // ♻️ Réinitialise les champs du formulaire
  titreInput.value = "";
  contenuInput.value = "";
  tagsInput.value = "";
  categorieInput.value = "";
  categorieInput.dataset.couleur = "";
  document.getElementById("carteId").value = ""; // ← CHANGÉ : repasse en mode création

  mettreAJourResumeCategorie({ nom: "-- Choisir une catégorie --", couleur: "#ccc" });
  document.getElementById("categorieSelectionnee").classList.add("hidden"); // (facultatif)
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