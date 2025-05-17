/**
 * 🗂 categories.js
 * Gère les catégories (CRUD + affichage arborescence)
 * - afficherVueParCategories() : vue arborescente
 * - ajouter / modifier / supprimer une catégorie
 * - interactions pour sélection & gestion
 */

import {
    getCategories,
    getCategorieByNom,
    ajouterCategorie,
    modifierCategorie
  } from './db/indexedDB.js';
  
  import { getTextColor } from './utils/helpers.js';
  import { paletteActuelle, nomsCouleursParPalette } from './config.js';
  import { afficherCartes } from './cartes.js';
  
  export let idCategorieActuelle = null;
  
  // 🧭 Vue principale par catégories
  export function afficherVueParCategories() {
    const container = document.getElementById("vue-par-categories");
    const cartesContainer = document.getElementById("cartes-container");
    const titreCategorie = document.getElementById("titreCategorieSelectionnee");
  
    container.innerHTML = "";
    container.style.display = "flex";
    cartesContainer.style.display = "none";
    titreCategorie.style.display = "none";
  
    getCategories().then(categories => {
      const parNom = {};
      const racines = [];
  
      categories.forEach(cat => {
        cat.enfants = [];
        parNom[cat.nom] = cat;
      });
  
      categories.forEach(cat => {
        if (cat.parent && parNom[cat.parent]) {
          parNom[cat.parent].enfants.push(cat);
        } else {
          racines.push(cat);
        }
      });
  
      racines.forEach(racine => {
        const wrapper = creerBlocCategorie(racine);
        container.appendChild(wrapper);
      });
    });
  }
  
  // 📁 Création récursive des blocs de catégories
  function creerBlocCategorie(categorie, niveau = 0) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("bloc-categorie");
    wrapper.style.marginLeft = `${niveau * 20}px`;
  
    const ligne = document.createElement("div");
    ligne.classList.add("ligne-categorie");
    ligne.style.backgroundColor = categorie.couleur;
    ligne.style.color = getTextColor(categorie.couleur);
    ligne.style.padding = "8px";
    ligne.style.borderRadius = "6px";
    ligne.style.display = "flex";
    ligne.style.cursor = "pointer";
    ligne.style.gap = "8px";
  
    const fleche = document.createElement("span");
    fleche.textContent = categorie.enfants.length > 0 ? "➤" : "";
    fleche.style.width = "20px";
  
    const titre = document.createElement("span");
    titre.textContent = categorie.nom;
    titre.style.flexGrow = "1";
  
    ligne.appendChild(fleche);
    ligne.appendChild(titre);
    wrapper.appendChild(ligne);
  
    const sousContainer = document.createElement("div");
    sousContainer.style.display = "none";
    wrapper.appendChild(sousContainer);
  
    ligne.addEventListener("click", () => {
      if (categorie.enfants.length > 0) {
        const ouvert = sousContainer.style.display === "block";
        sousContainer.style.display = ouvert ? "none" : "block";
        fleche.textContent = ouvert ? "➤" : "⬇";
      } else {
        afficherCartesParCategorie(categorie.nom);
      }
    });
  
    categorie.enfants.forEach(enfant => {
      const enfantDiv = creerBlocCategorie(enfant, niveau + 1);
      sousContainer.appendChild(enfantDiv);
    });
  
    return wrapper;
  }
  
  // 📌 Afficher les cartes d'une catégorie sélectionnée
  export function afficherCartesParCategorie(nomCategorie) {
    idCategorieActuelle = nomCategorie;
  
    const cartesContainer = document.getElementById("cartes-container");
    const vueCategories = document.getElementById("vue-par-categories");
    const titreCategorie = document.getElementById("titreCategorieSelectionnee");
  
    cartesContainer.innerHTML = "";
    cartesContainer.style.display = "block";
    vueCategories.style.display = "none";
  
    getCategorieByNom(nomCategorie).then(categorie => {
      if (categorie) {
        titreCategorie.textContent = `Catégorie : ${categorie.nom}`;
        titreCategorie.style.backgroundColor = categorie.couleur;
        titreCategorie.style.color = getTextColor(categorie.couleur);
        titreCategorie.style.display = "block";
      }
    });
  
    afficherCartes();
  }
  
  // ➕ Création d'une nouvelle catégorie
  export function creerNouvelleCategorie() {
    const nom = document.getElementById("nouvelleCategorieNom").value.trim();
    const couleur = document.getElementById("nouvelleCouleur").value;
    const parent = document.getElementById("parentCategorie").value || null;
  
    if (!nom || !couleur) {
      alert("Veuillez renseigner le nom et la couleur.");
      return;
    }
  
    ajouterCategorie({ nom, couleur, parent });
    afficherVueParCategories();
    chargerMenuCategories();
  }
  
  // 📜 Chargement des catégories dans le menu de sélection (formulaire carte)
  export function chargerMenuCategories() {
    const menu = document.getElementById("listeCategories");
    const inputCategorie = document.getElementById("categorieChoisie");
  
    menu.innerHTML = "";
  
    getCategories().then(categories => {
      categories.sort((a, b) => a.nom.localeCompare(b.nom));
  
      categories.forEach(cat => {
        const div = document.createElement("div");
        div.textContent = cat.nom;
        div.style.backgroundColor = cat.couleur;
        div.style.color = getTextColor(cat.couleur);
  
        div.addEventListener("click", () => {
          inputCategorie.value = cat.nom;
          inputCategorie.dataset.couleur = cat.couleur;
  
          const resume = document.getElementById("categorieSelectionnee");
          resume.textContent = cat.nom;
          resume.style.backgroundColor = cat.couleur;
          resume.style.color = getTextColor(cat.couleur);
  
          menu.style.display = "none";
        });
  
        menu.appendChild(div);
      });
    });
  }
  