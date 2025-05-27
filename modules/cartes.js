/**
 * 🗃 cartes.js
 * Gère les cartes (affichage, ajout, modification, suppression)
 */

import { getTextColor } from './utils/helpers.js';
import {
  getCartes,
  ajouterCarte as dbAjouterCarte,
  modifierCarte as dbModifierCarte,
  supprimerCarte as dbSupprimerCarte
} from './db/indexedDB.js';

// 📌 Affiche toutes les cartes
export function afficherCartes(modeTri = "date-desc") {
  const container = document.getElementById("cartes-container");
  container.innerHTML = "";

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
      div.style.borderLeft = `6px solid ${carte.couleurCategorie || "#ccc"}`;
      div.innerHTML = `
        <h3>${carte.titre}</h3>
        <p>${carte.contenu}</p>
        <small class="tags">Tags : ${carte.tags.join(", ")}</small>
      `;
      container.appendChild(div);
    });
  });
}

// 📌 Affiche des cartes filtrées (ex. par tag)
export function afficherCartesFiltres(cartes) {
  const container = document.getElementById("cartes-container");
  container.innerHTML = "";

  cartes.forEach(carte => {
    const div = document.createElement("div");
    div.classList.add("carte");
    div.style.borderLeft = `6px solid ${carte.couleurCategorie || "#ccc"}`;
    div.innerHTML = `
      <h3>${carte.titre}</h3>
      <p>${carte.contenu}</p>
      <small class="tags">Tags : ${carte.tags.join(", ")}</small>
    `;
    container.appendChild(div);
  });
}

// ➕ Ajoute une carte depuis le formulaire
export async function ajouterCarte() {
  console.log("🟢 Fonction ajouterCarte appelée");

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
  document.getElementById("erreurTitre").style.display = "none";
  document.getElementById("erreurCategorie").textContent = "";
  document.getElementById("erreurCategorie").style.display = "none";
  document.getElementById("erreurContenu").textContent = "";
  document.getElementById("erreurContenu").style.display = "none";

  let erreur = false;

  if (!titre) {
    document.getElementById("erreurTitre").textContent = "Le titre est requis.";
    document.getElementById("erreurTitre").style.display = "block";
    erreur = true;
  }

  if (!categorie) {
    document.getElementById("erreurCategorie").textContent = "Veuillez choisir une catégorie.";
    document.getElementById("erreurCategorie").style.display = "block";
    erreur = true;
  }

  if (!contenu) {
    document.getElementById("erreurContenu").textContent = "Le contenu ne peut pas être vide.";
    document.getElementById("erreurContenu").style.display = "block";
    erreur = true;
  }

  if (erreur) {
    return;
  }

  const nouvelleCarte = {
    titre,
    contenu,
    tags,
    categorie,
    couleurCategorie,
    dateCreation: Date.now()
  };

  await dbAjouterCarte(nouvelleCarte);
  document.getElementById("modalAjoutCarte").style.display = "none";
  afficherCartes();

  // 🧼 Réinitialise les champs du formulaire
  titreInput.value = "";
  contenuInput.value = "";
  tagsInput.value = "";
  categorieInput.value = "";
  categorieInput.dataset.couleur = "";

  const resume = document.getElementById("categorieSelectionnee");
  if (resume) {
    resume.textContent = "-- Choisir une catégorie --";
    resume.style = "";
  }
}