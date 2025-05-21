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
 // 🧭 Vue principale par catégories
export function afficherVueParCategories() {
  const container = document.getElementById("vue-par-categories");
  const cartesContainer = document.getElementById("cartes-container");
  const titreCategorie = document.getElementById("titreCategorieSelectionnee");

  // Masquer les autres zones
  container.style.display = "flex";
  cartesContainer.style.display = "none";
  titreCategorie.style.display = "none";

  // Récupérer les catégories depuis IndexedDB
  getCategories().then(categories => {
    const parNom = {};
    const racines = [];

    // Réinitialiser les enfants
    categories.forEach(cat => {
      cat.enfants = [];
      parNom[cat.nom] = cat;
    });

    // Regrouper les enfants sous leur parent
    categories.forEach(cat => {
      if (cat.parent && parNom[cat.parent]) {
        parNom[cat.parent].enfants.push(cat);
      } else {
        racines.push(cat);
      }
    });

    // ✅ Nettoyer ici juste avant d’insérer les blocs
    container.innerHTML = "";

    // Cas où il n’y a aucune catégorie
    if (racines.length === 0) {
      const info = document.createElement("p");
      info.textContent = "Aucune catégorie trouvée. Cliquez sur + pour en créer une.";
      info.style.padding = "20px";
      info.style.color = "#666";
      container.appendChild(info);
      return;
    }

    // Générer les blocs de catégories à partir des racines
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
  
    // 🔍 Vérification si une catégorie avec ce nom existe déjà
    getCategories().then(categories => {
      const existe = categories.some(cat => cat.nom.toLowerCase() === nom.toLowerCase());
  
      if (existe) {
        alert("Ce nom de catégorie existe déjà.");
        return;
      }
  
      // ➕ Ajout si le nom est unique
      ajouterCategorie({ nom, couleur, parent }).then(() => {
        afficherVueParCategories();
        chargerMenuCategories();
  
        // Réinitialisation du formulaire
        document.getElementById("nouvelleCategorieNom").value = "";
        document.getElementById("nouvelleCouleur").selectedIndex = 0;
        document.getElementById("parentCategorie").selectedIndex = 0;
        document.getElementById("modalCategorie").style.display = "none";
  
        const resume = document.getElementById("categorieSelectionnee");
        if (resume) {
          resume.textContent = "-- Choisir une catégorie --";
          resume.style.backgroundColor = "";
          resume.style.color = "";
        }
      });
    });
  }
  
  
 // 📜 Chargement des catégories dans le menu de sélection (formulaire carte)
 export function chargerMenuCategories() {
  const menu = document.getElementById("listeCategories");
  const inputCategorie = document.getElementById("categorieChoisie");

  if (!menu || !inputCategorie) {
    console.warn("🔶 Impossible de charger les catégories : éléments non trouvés dans le DOM.");
    return;
  }

  menu.innerHTML = "";
  const parentSelect = document.getElementById("parentCategorie");
  const couleurSelect = document.getElementById("nouvelleCouleur");
  if (parentSelect) parentSelect.innerHTML = '<option value="">Aucune</option>';
  if (couleurSelect) couleurSelect.innerHTML = '';

  getCategories().then(categories => {
    categories.sort((a, b) => a.nom.localeCompare(b.nom));

    // Remplir le menu personnalisé pour formulaire carte
    categories.forEach(cat => {
      const div = document.createElement("div");
      div.textContent = cat.nom;
      div.style.backgroundColor = cat.couleur;
      div.style.color = getTextColor(cat.couleur);

      div.addEventListener("click", () => {
        inputCategorie.value = cat.nom;
        inputCategorie.dataset.couleur = cat.couleur;

        const resume = document.getElementById("categorieSelectionnee");
        if (resume) {
          resume.textContent = cat.nom;
          resume.style.backgroundColor = cat.couleur;
          resume.style.color = getTextColor(cat.couleur);
        }

        menu.style.display = "none";
      });

      menu.appendChild(div);

      // Remplir le select des parents
      if (parentSelect) {
        const option = document.createElement("option");
        option.value = cat.nom;
        option.textContent = cat.nom;
        parentSelect.appendChild(option);
      }
    });
  });

  // 🎨 Remplir le menu des couleurs
  if (couleurSelect) {
    const palette = nomsCouleursParPalette[paletteActuelle] || {};
    Object.entries(palette).forEach(([hex, nom]) => {
      const option = document.createElement("option");
      option.value = hex;
      option.textContent = nom;
      option.style.backgroundColor = hex;
      option.style.color = getTextColor(hex);
      couleurSelect.appendChild(option);
    });
  }
}
