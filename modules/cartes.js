/**
 * 🗃 cartes.js
 * Gère les cartes (affichage, ajout, modification, suppression)
 */

import { getTextColor } from './utils/helpers.js';
import {
  getCartes,
  ajouterCarte as dbAjouterCarte,
  modifierCarte as dbModifierCarte,
  deplacerCarteDansCorbeille, db
} from './db/indexedDB.js';
let idCarteASupprimer = null;
// 📌 Affiche toutes les cartes
function afficherCartes(modeTri = "date-desc") {
  const boutonRetour = document.getElementById("btnRetourCategories");
  document.getElementById("btnAjouterSousCategorie").classList.add("hidden");
  boutonRetour.classList.add("hidden");
  const cartesContainer = document.getElementById("cartes-container");
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

  const nouvelleCarte = {
    titre,
    contenu,
    tags,
    categorie,
    couleurCategorie,
    dateCreation: Date.now()
  };

  await dbAjouterCarte(nouvelleCarte);
  document.getElementById("modalAjoutCarte").classList.add("hidden");
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
function ouvrirModaleModification(carte) {
  setCarteASupprimer(carte.id);
  const boutonSuppression = document.getElementById("ouvrirConfirmationSuppressionCarteBtn");
  if (boutonSuppression) {
    boutonSuppression.classList.remove("hidden");
  
    const nouveauBtn = boutonSuppression.cloneNode(true);
    boutonSuppression.replaceWith(nouveauBtn);
  
    nouveauBtn.addEventListener("click", () => {
      setCarteASupprimer(carte.id);
      document.getElementById("modalConfirmationSuppression").classList.remove("hidden");
    });
  }
  const boutonAjout = document.getElementById("ajoutCarteBtn");
  const boutonSupprimer = document.getElementById("ouvrirConfirmationSuppressionCarteBtn");
  document.getElementById("carteId").value = carte.id;
if (boutonAjout) {
  boutonAjout.textContent = "Enregistrer les modifications";
}
  document.getElementById("modalAjoutCarte").classList.remove("hidden");
  document.getElementById("titre").value = carte.titre;
  document.getElementById("contenu").value = carte.contenu;
  document.getElementById("tags").value = carte.tags.join(", ");
  document.getElementById("carteId").value = carte.id;

  // Affiche la catégorie visuellement si existante
  if (carte.categorie) {
    const champCategorie = document.getElementById("categorieChoisie");
    champCategorie.value = carte.categorie;
    champCategorie.dataset.couleur = carte.couleurCategorie;

    document.getElementById("categorieSelectionnee").style.display = "flex";
    document.getElementById("texteCategorie").textContent = carte.nomCategorie || "Catégorie sélectionnée";
  }

  document.getElementById("annulerModifBtn").style.display = "inline-block";
    // ✅ Affiche le bouton de suppression
   
}
function supprimerCarteDansCorbeille(id) {
  if (!db) {
    console.error("❌ La base de données n'est pas encore prête.");
    return;
  }

  // Récupère la carte depuis IndexedDB
  const transaction = db.transaction(["regles", "corbeille"], "readwrite");
  const storeCartes = transaction.objectStore("regles");
  const storeCorbeille = transaction.objectStore("corbeille");

  const request = storeCartes.get(id);

  request.onsuccess = function () {
    const carte = request.result;
    if (carte) {
      // Supprimer de la store principale
      storeCartes.delete(id);

      // Ajouter à la corbeille avec une date de suppression
      carte.dateSuppression = Date.now();
      storeCorbeille.add(carte);

      // Fermer la modale et rafraîchir l'affichage
      document.getElementById("modalAjoutCarte").classList.add("hidden");
      afficherCartes();
    }
  };
}
function setCarteASupprimer(id) {
  idCarteASupprimer = id;
}

function getCarteASupprimer() {
  return idCarteASupprimer;
}
export {   afficherCartes,
  afficherCartesFiltres,
  ajouterCarte,
  supprimerCarteDansCorbeille,
  setCarteASupprimer,
  getCarteASupprimer };