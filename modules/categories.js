console.log("🧩 categories.js chargé");
import {
    getCategories,
    getCategorieByNom,
    ajouterCategorie,
    modifierCategorie
  } from './db/indexedDB.js';
  
  import { getTextColor } from './utils/helpers.js';
  import { paletteActuelle, nomsCouleursParPalette } from './config.js';
  import { afficherCartes } from './cartes.js';
  import { supprimerCategorie as supprimerCategorieFromDB } from './db/indexedDB.js';
  import { ouvrirModale, fermerModale } from './ui.js';
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
export function afficherGestionCategories() {
  
  const conteneur = document.getElementById("listeGestionCategories");
  if (!conteneur) return;

  conteneur.innerHTML = ""; 

  getCategories().then(categories => {
    console.log("📦 Catégories récupérées :", categories);
    categories.forEach(cat => {
      const bloc = document.createElement("div");
      bloc.classList.add("ligne-categorie");
    
      const ligne = document.createElement("div");
      ligne.classList.add("nom-et-edition");
    
      const nom = document.createElement("span");
      nom.classList.add("nom-categorie");
      nom.textContent = cat.nom;
      nom.style.backgroundColor = cat.couleur;
      nom.style.color = getTextColor(cat.couleur);
    
      const actions = document.createElement("div");
      actions.classList.add("actions-categorie");

      const btnCouleur = document.createElement("button");
btnCouleur.textContent = "🎨";
btnCouleur.title = "Changer la couleur de cette catégorie";
btnCouleur.addEventListener("click", () => {
  lancerModificationCouleur(cat);
});
    
      const btnModifier = document.createElement("button");
      btnModifier.textContent = "✏️";
      btnModifier.title = "Modifier cette catégorie";
      btnModifier.addEventListener("click", () => {
        lancerEditionCategorie(cat);
      });
    
      const btnSupprimer = document.createElement("button");
      btnSupprimer.textContent = "🗑️";
      btnSupprimer.title = "Supprimer cette catégorie";
      btnSupprimer.addEventListener("click", () => {
        supprimerCategorie(cat.nom);
      });
      actions.appendChild(btnCouleur);
      actions.appendChild(btnModifier);
      actions.appendChild(btnSupprimer);


      ligne.appendChild(nom);
      ligne.appendChild(actions);
      bloc.appendChild(ligne);
    
      conteneur.appendChild(bloc);
    });
    
  });
}
  
  // 📁 Création récursive des blocs de catégories
  function creerBlocCategorie(categorie, niveau = 0) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("bloc-categorie");
    wrapper.style.marginLeft = `${niveau * 20}px`;
  
    const ligne = document.createElement("div");
    ligne.classList.add("ligne-categorie-liste");
ligne.style.backgroundColor = categorie.couleur;
ligne.style.color = getTextColor(categorie.couleur);
ligne.style.padding = "8px 12px";
ligne.style.borderRadius = "6px";
ligne.style.display = "flex";
ligne.style.alignItems = "center"; // ✅ Centre verticalement
ligne.style.justifyContent = "space-between"; // ✅ Pousse le nom à gauche et flèche à droite
ligne.style.cursor = "pointer";
ligne.style.gap = "8px";

const titre = document.createElement("span");
titre.textContent = categorie.nom;
titre.style.flexGrow = "1";
  
const fleche = document.createElement("span");
fleche.textContent = categorie.enfants.length > 0 ? "➤" : "";
fleche.style.fontSize = "1rem"; // ou ajustable
fleche.style.transition = "transform 0.2s";
  
   
  
ligne.appendChild(titre);
ligne.appendChild(fleche); // ✅ La flèche vient maintenant après le titre
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
    console.log("🟢 afficherCartesParCategorie appelé avec :", nomCategorie);
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

  // Réinitialisation visuelle
  menu.innerHTML = "";
  const parentSelect = document.getElementById("parentCategorie");
  const couleurSelect = document.getElementById("nouvelleCouleur");
  if (parentSelect) parentSelect.innerHTML = '<option value="">Aucune</option>';
  if (couleurSelect) couleurSelect.innerHTML = '';

  // Chargement des catégories
  getCategories().then(categories => {
    categories.sort((a, b) => a.nom.localeCompare(b.nom));

    // 🔁 Menu des catégories pour formulaire carte
    categories.forEach(cat => {
      const div = document.createElement("div");
      div.textContent = cat.nom;
      div.style.backgroundColor = cat.couleur;
      div.style.color = getTextColor(cat.couleur);

      div.addEventListener("click", () => {
        inputCategorie.value = cat.nom;
        inputCategorie.dataset.couleur = cat.couleur;

        const resume = document.getElementById("categorieSelectionnee");
        const texte = document.getElementById("texteCategorie");
        const btn = document.getElementById("btnCategorieOptions");

        if (resume && texte && btn) {
          texte.textContent = cat.nom;
          resume.style.backgroundColor = cat.couleur;
          resume.style.color = getTextColor(cat.couleur);
          resume.style.display = "flex";
          btn.textContent = "Changer de catégorie";
        }

        menu.style.display = "none";
      });

      menu.appendChild(div);

      // 🧩 Select de catégories parent (formulaire de création de catégorie)
      if (parentSelect) {
        const option = document.createElement("option");
        option.value = cat.nom;
        option.textContent = cat.nom;
        parentSelect.appendChild(option);
      }
    });

    // 🎯 Réagir au changement de parent sélectionné
    if (parentSelect) {
      parentSelect.addEventListener("change", () => {
        const selectedNom = parentSelect.value;
        const parent = categories.find(c => c.nom === selectedNom);
        const resume = document.getElementById("resumeParentCategorie");
        const nomResume = document.getElementById("nomParentResume");

        if (parent) {
          resume.style.display = "flex";
          nomResume.textContent = parent.nom;
          nomResume.style.backgroundColor = parent.couleur;
          nomResume.style.color = getTextColor(parent.couleur);
          nomResume.style.padding = "4px 8px";
          nomResume.style.borderRadius = "6px";

          couleurSelect.disabled = true;
          couleurSelect.title = "La couleur est héritée du parent.";
        } else {
          resume.style.display = "none";
          couleurSelect.disabled = false;
          couleurSelect.title = "";
        }
      });
    }

    // ❌ Réinitialiser le choix du parent via bouton "X"
    const retirerBtn = document.getElementById("retirerParentBtn");
    if (retirerBtn) {
      retirerBtn.addEventListener("click", () => {
        parentSelect.value = "";
        const resume = document.getElementById("resumeParentCategorie");
        if (resume) resume.style.display = "none";
        if (couleurSelect) {
          couleurSelect.disabled = false;
          couleurSelect.title = "";
        }
      });
    }
  });

  // 🎨 Charger les couleurs disponibles
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
function lancerEditionCategorie(cat) {
  categorieEnCoursDeModification = cat;
  document.getElementById("editCategorieNom").value = cat.nom;
  ouvrirModale("modalEditCategorie");
}



function supprimerCategorie(nom) {
  const confirmation = confirm(`Voulez-vous vraiment supprimer la catégorie « ${nom} » ?`);
  if (confirmation) {
    supprimerCategorieFromDB(nom).then(() => {
      console.log("🗑️ Catégorie supprimée :", nom);
      afficherGestionCategories();
      chargerMenuCategories();

      // 🟢 Rafraîchir la vue par catégories complète
      afficherVueParCategories();

      // 🟢 Si c’est la catégorie actuellement affichée, on vide l’affichage
      if (idCategorieActuelle === nom) {
        idCategorieActuelle = null;

        const titreCategorie = document.getElementById("titreCategorieSelectionnee");
        const cartesContainer = document.getElementById("cartes-container");
        const vueCategories = document.getElementById("vue-par-categories");

        if (titreCategorie) titreCategorie.style.display = "none";
        if (cartesContainer) {
          cartesContainer.innerHTML = "";
          cartesContainer.style.display = "none";
        }
        if (vueCategories) vueCategories.style.display = "flex";

        console.log("🟢 Rafraîchissement complet après suppression de la catégorie affichée");
      }
    });
  }
}
let categorieEnCoursDeModification = null;

document.getElementById("closeEditModal").addEventListener("click", () => {
  fermerModale("modalEditCategorie");
});

document.getElementById("btnEnregistrerModification").addEventListener("click", () => {
  console.log("✅ BOUTON MODIFICATION ENCLENCHÉ");
  const nouveauNom = document.getElementById("editCategorieNom").value.trim();

  if (!nouveauNom) {
    alert("Le nom ne peut pas être vide.");
    return;
  }

  if (nouveauNom === categorieEnCoursDeModification.nom) {
    fermerModale("modalEditCategorie");
    return;
  }

  getCategories().then(categories => {
    const existe = categories.some(cat => cat.nom === nouveauNom);
    if (existe) {
      alert("Ce nom de catégorie existe déjà.");
      return;
    }

    const nouvelleCategorie = {
      ...categorieEnCoursDeModification,
      nom: nouveauNom
    };

    supprimerCategorieFromDB(categorieEnCoursDeModification.nom)
      .then(() => ajouterCategorie(nouvelleCategorie))
      
      .then(() => {
        console.log("✅ Modification enregistrée dans IndexedDB");
        console.log("idCategorieActuelle :", idCategorieActuelle);
        console.log("ancienne :", categorieEnCoursDeModification.nom);
        console.log("nouveauNom :", nouveauNom);
      
        fermerModale("modalEditCategorie");
        afficherGestionCategories();
        chargerMenuCategories();
      
        // 🟢 Forcer le rafraîchissement de la vue par catégories complète
        afficherVueParCategories();
      
        // 🟢 Si une catégorie était sélectionnée, on tente de réafficher ses cartes
        if (idCategorieActuelle === categorieEnCoursDeModification.nom) {
          idCategorieActuelle = nouveauNom;
          getCategorieByNom(nouveauNom).then(categorie => {
            if (categorie) {
              const titreCategorie = document.getElementById("titreCategorieSelectionnee");
              if (titreCategorie) {
                titreCategorie.textContent = `Catégorie : ${categorie.nom}`;
                titreCategorie.style.backgroundColor = categorie.couleur;
                titreCategorie.style.color = getTextColor(categorie.couleur);
                titreCategorie.style.display = "block";
              }
              afficherCartesParCategorie(nouveauNom);
              console.log("🟢 Rafraîchissement complet de la catégorie :", nouveauNom);
            }
          });
        }
      });
      
  });
});
let categorieEnCoursDeCouleur = null;

document.getElementById("closeCouleurModal").addEventListener("click", () => {
  fermerModale("modalChangerCouleur");
});

document.getElementById("btnValiderCouleur").addEventListener("click", () => {
  const nouvelleCouleur = document.getElementById("selectNouvelleCouleur").value;
  if (!categorieEnCoursDeCouleur) return;

  const nouvelleCategorie = {
    ...categorieEnCoursDeCouleur,
    couleur: nouvelleCouleur
  };

  modifierCategorie(nouvelleCategorie).then(() => {
    console.log("🎨 Couleur modifiée dans IndexedDB");
    console.log("idCategorieActuelle :", idCategorieActuelle);
    console.log("catégorie modifiée :", nouvelleCategorie.nom);
  
    fermerModale("modalChangerCouleur");
    afficherGestionCategories();
    chargerMenuCategories();
  
    // 🟢 Forcer le rafraîchissement de la vue par catégories complète
    afficherVueParCategories();
  
    // 🟢 Si la catégorie affichée est celle qu'on vient de modifier
    if (idCategorieActuelle === nouvelleCategorie.nom) {
      getCategorieByNom(nouvelleCategorie.nom).then(categorie => {
        if (categorie) {
          const titreCategorie = document.getElementById("titreCategorieSelectionnee");
          if (titreCategorie) {
            titreCategorie.textContent = `Catégorie : ${categorie.nom}`;
            titreCategorie.style.backgroundColor = categorie.couleur;
            titreCategorie.style.color = getTextColor(categorie.couleur);
            titreCategorie.style.display = "block";
          }
          afficherCartesParCategorie(nouvelleCategorie.nom);
          console.log("🟢 Rafraîchissement complet de la catégorie :", nouvelleCategorie.nom);
        }
      });
    }
  });
  
});
function lancerModificationCouleur(cat) {
  categorieEnCoursDeCouleur = cat;

  const select = document.getElementById("selectNouvelleCouleur");
  select.innerHTML = "";

  const palette = nomsCouleursParPalette[paletteActuelle] || {};
  Object.entries(palette).forEach(([hex, nom]) => {
    const option = document.createElement("option");
    option.value = hex;
    option.textContent = nom;
    option.style.backgroundColor = hex;
    option.style.color = getTextColor(hex);
    if (hex === cat.couleur) option.selected = true;
    select.appendChild(option);
  });

  // 🟢 Appliquer la couleur actuelle au fond du <select>
  select.style.backgroundColor = cat.couleur;
  select.style.color = getTextColor(cat.couleur);

  // 🟢 Mettre à jour la couleur en fonction du choix
  select.addEventListener("change", () => {
    const couleurChoisie = select.value;
    select.style.backgroundColor = couleurChoisie;
    select.style.color = getTextColor(couleurChoisie);
  });

  ouvrirModale("modalChangerCouleur");
}
