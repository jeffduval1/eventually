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
  const titre = document.getElementById("titre").value.trim();
  const contenu = document.getElementById("contenu").value.trim();
  const tags = document.getElementById("tags").value.split(",").map(t => t.trim()).filter(Boolean);
  const categorie = document.getElementById("categorieChoisie").value;
  const couleurCategorie = document.getElementById("categorieChoisie").dataset.couleur || "#ccc";

  if (!titre || !contenu) {
    alert("Veuillez remplir tous les champs.");
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

  // Réinitialise les champs
  document.getElementById("titre").value = "";
  document.getElementById("contenu").value = "";
  document.getElementById("tags").value = "";
  document.getElementById("categorieChoisie").value = "";
  document.getElementById("categorieChoisie").dataset.couleur = "";
  document.getElementById("categorieSelectionnee").textContent = "-- Choisir une catégorie --";
  document.getElementById("categorieSelectionnee").style = "";
}

// ✏️ Met à jour une carte
export async function modifierCarte(carte) {
  await dbModifierCarte(carte);
  afficherCartes();
}

// ❌ Supprime une carte
export async function supprimerCarte(id) {
  await dbSupprimerCarte(id);
  afficherCartes();
}
