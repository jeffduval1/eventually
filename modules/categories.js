import {
  getCategories,
  getCategorieByNom,
  ajouterCategorie,
  modifierCategorie,
  getCartes,
  supprimerCategorie as supprimerCategorieFromDB
} from './db/indexedDB.js';

import { getTextColor } from './utils/helpers.js';
import { paletteActuelle, nomsCouleursParPalette } from './config.js';
import { afficherCartes, afficherCartesFiltres } from './cartes.js';
import { mettreAJourResumeCategorie } from './uiCategories.js';
import { ouvrirModale, fermerModale } from './ui.js';

export let idCategorieActuelle = null;
export function getIdCategorieActuelle() {
  return idCategorieActuelle;
}
const divMessageCliquerCarte = document.getElementById("contenuCategorieSelectionnee");
const messageCliquerCarte = document.getElementById("toggletxt");

export function setIdCategorieActuelle(id) {
  idCategorieActuelle = id;
}
// 🧭 Vue principale par catégories
// 🧭 Vue principale par catégories
export function afficherVueParCategories() {
  document.getElementById("btnAjouterSousCategorie").classList.add("hidden");
  const container = document.getElementById("vue-par-categories");
  const cartesContainer = document.getElementById("cartes-container");
  const titreCategorie = document.getElementById("titreCategorieSelectionnee");
  const boutonRetour = document.getElementById("btnRetourCategories");

  // 🔧 Afficher la zone des catégories et masquer les autres
  container.classList.remove("hidden");
  cartesContainer.classList.add("hidden");
  titreCategorie.classList.add("hidden");
  boutonRetour.classList.add("hidden");
  divMessageCliquerCarte.classList.remove("hidden");
  if (messageCliquerCarte) messageCliquerCarte.classList.remove("hidden");


  // Récupérer les catégories depuis IndexedDB
  getCategories().then(categories => {
    const parNom = {};
    const racines = [];

    // Réinitialiser les enfants
    categories.forEach(cat => {
      cat.enfants = [];
      parNom[cat.nom] = cat;
    });
    console.log(categories)
    // Regrouper les enfants sous leur parent
    categories.forEach(cat => {
      console.log("Nom :", cat.nom, "Parent :", cat.parent);
      if (cat.parent) {
        const parentNom = cat.parent.trim(); // supprime les espaces invisibles
        const parent = parNom[parentNom];
        if (parent) {
          parent.enfants.push(cat);
        } else {
          console.warn("Parent introuvable pour :", cat.nom, "→ parent:", cat.parent);
          racines.push(cat); // fallback : affiché à la racine si parent introuvable
        }
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
  console.log("Création catégorie :", categorie.nom, "enfants :", categorie.enfants.length);

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
  titre.classList.add("zone-texte-categorie"); // pour comportement séparé

  const aDesEnfants = categorie.enfants && categorie.enfants.length > 0;
  const fleche = document.createElement("span");
  fleche.textContent = aDesEnfants ? "➤" : "";
  fleche.style.fontSize = "1rem"; // ou ajustable
  fleche.style.transition = "transform 0.2s";



  const zoneFlèche = document.createElement("div");
  zoneFlèche.classList.add("zone-fleche");
  zoneFlèche.appendChild(fleche);
  
  ligne.appendChild(titre);
  ligne.appendChild(zoneFlèche);
  wrapper.appendChild(ligne);

  const sousContainer = document.createElement("div");
  sousContainer.classList.add("hidden");

  wrapper.appendChild(sousContainer);

  titre.addEventListener("click", () => {
    afficherCartesParCategorie(categorie.nom);
  });
  
  if (aDesEnfants) {
    zoneFlèche.addEventListener("click", (e) => {
      e.stopPropagation();
      sousContainer.classList.toggle("hidden");
      fleche.textContent = sousContainer.classList.contains("hidden") ? "➤" : "⬇";
      fleche.textContent = ouvert ? "➤" : "⬇";
    });
  }

  categorie.enfants.forEach(enfant => {
    const enfantDiv = creerBlocCategorie(enfant, niveau + 1);
    sousContainer.appendChild(enfantDiv);
  });

  return wrapper;
}

// 📌 Afficher les cartes d'une catégorie sélectionnée
export function afficherCartesParCategorie(nomCategorie) {
  document.getElementById("btnAjouterSousCategorie").classList.remove("hidden");
  idCategorieActuelle = nomCategorie;

  const cartesContainer = document.getElementById("cartes-container");
  const vueCategories = document.getElementById("vue-par-categories");
  const titreCategorie = document.getElementById("titreCategorieSelectionnee");
  const resumeCouleur = document.getElementById("resumeNouvelleCouleur");
  const texteCouleur = document.getElementById("texteResumeCouleur");


  // Montrer les bons éléments
  document.getElementById("btnRetourCategories").classList.remove("hidden");
  titreCategorie.classList.remove("hidden");
  document.getElementById("btnAjouterSousCategorie").classList.remove("hidden"); // optionnel

  // Mise à jour du contenu
  cartesContainer.innerHTML = "";
  cartesContainer.classList.remove("hidden");
  divMessageCliquerCarte.classList.add("hidden")
  // vueCategories.classList.add("hidden");

  // Afficher le nom de la catégorie dans le titre
  titreCategorie.textContent = nomCategorie;


  getCategorieByNom(nomCategorie).then(categorie => {
    if (categorie) {
      titreCategorie.textContent = `Catégorie : ${categorie.nom}`;
      titreCategorie.style.backgroundColor = categorie.couleur;
      titreCategorie.style.color = getTextColor(categorie.couleur);
      titreCategorie.classList.remove("hidden");
    }
  });

  getCartes().then(cartes => {
    const cartesFiltrees = cartes.filter(carte => carte.categorie === nomCategorie);
    afficherCartesFiltres(cartesFiltrees);
  });
}

// ➕ Création d'une nouvelle catégorie
export function creerNouvelleCategorie(depuisCarte = false) {
  const nom = document.getElementById("nouvelleCategorieNom").value.trim();
  const couleur = document.getElementById("nouvelleCouleur").value;
  const parent = document.getElementById("parentCategorie").value || null;
  const couleurSelect = document.getElementById("nouvelleCouleur");
  const utiliseCouleurParente = parent && couleurSelect.disabled;
  const resumeCouleur = document.getElementById("resumeNouvelleCouleur");
  const texteCouleur = document.getElementById("texteResumeCouleur");
  if (resumeCouleur) {
    resumeCouleur.classList.add("hidden");
    resumeCouleur.style.backgroundColor = "";
    resumeCouleur.style.color = "";
  }
  if (texteCouleur) texteCouleur.textContent = "";
  if (!nom || (!utiliseCouleurParente && !couleur)) {
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
    const nouvelleCategorie = { nom, couleur, parent };
    ajouterCategorie(nouvelleCategorie).then(() => {
      afficherVueParCategories();
      chargerMenuCategories();

      // Réinitialisation du formulaire
      document.getElementById("nouvelleCategorieNom").value = "";
      document.getElementById("nouvelleCouleur").selectedIndex = 0;
      if (resumeCouleur && texteCouleur) {
        resumeCouleur.classList.add("hidden");
        resumeCouleur.style.backgroundColor = "";
        resumeCouleur.style.color = "";
        texteCouleur.textContent = "";
      }
      document.getElementById("parentCategorie").selectedIndex = 0;
      if (couleurSelect) {
        couleurSelect.style.backgroundColor = "";
        couleurSelect.style.color = "";
      }
      document.getElementById("modalCategorie").classList.add("hidden");

      // Si c'est dans le contexte de création de carte :
      if (depuisCarte && nouvelleCategorie) {
        // Met à jour le champ masqué et le résumé visuel
        const champ = document.getElementById("categorieChoisie");
        champ.value = nouvelleCategorie.nom;
        champ.dataset.couleur = nouvelleCategorie.couleur;

        const resume = document.getElementById("categorieSelectionnee");
        const texte = document.getElementById("texteCategorieCarte");

        if (depuisCarte) {
          mettreAJourResumeCategorie({
            nom: nouvelleCategorie.nom,
            couleur: nouvelleCategorie.couleur
          });


          setTimeout(() => {
            const resumeEl = document.getElementById("categorieSelectionnee");
          }, 100);
          resume.style.backgroundColor = nouvelleCategorie.couleur;
          resume.style.color = getTextColor(nouvelleCategorie.couleur);
          texte.textContent = nouvelleCategorie.nom;
        }
      }
    });
  });
}

// 📜 Chargement des catégories dans le menu de sélection (formulaire carte)
export function chargerMenuCategories() {
  const menu = document.getElementById("listeCategories");
  const inputCategorie = document.getElementById("categorieChoisie");
  const parentSelect = document.getElementById("parentCategorie");
  const couleurSelect = document.getElementById("nouvelleCouleur");

  if (!menu || !inputCategorie) {
    console.warn("🔶 Impossible de charger les catégories : éléments non trouvés dans le DOM.");
    return;
  }

  // 🔄 Réinitialisation
  menu.innerHTML = "";
  if (parentSelect) parentSelect.innerHTML = '<option value="">Aucune</option>';
  if (couleurSelect) couleurSelect.innerHTML = "";

  // 🎨 Préparation aperçu couleur
  const resumeCouleur = document.getElementById("resumeNouvelleCouleur");
  const texteCouleur = document.getElementById("texteResumeCouleur");

  const mettreÀJourAperçu = () => {
    if (!couleurSelect || !resumeCouleur || !texteCouleur) return;

    const hex = couleurSelect.value;
    if (!hex) {
      resumeCouleur.classList.add("hidden");
      return;
    }

    const nom = (nomsCouleursParPalette[paletteActuelle] || {})[hex] || hex;
    resumeCouleur.style.backgroundColor = hex;
    resumeCouleur.style.color = getTextColor(hex);
    texteCouleur.textContent = nom;
    resumeCouleur.classList.remove("hidden");
  };

  if (couleurSelect) {
    couleurSelect.innerHTML = "";

    // 🟡 Option par défaut vide et non sélectionnable
    const optionVide = document.createElement("option");
    optionVide.value = "";
    optionVide.textContent = "-- Choisir une couleur --";
    optionVide.disabled = true;
    optionVide.selected = true;
    couleurSelect.appendChild(optionVide);

    // 🎨 Ajout des vraies couleurs
    const palette = nomsCouleursParPalette[paletteActuelle] || {};
    Object.entries(palette).forEach(([hex, nom]) => {
      const option = document.createElement("option");
      option.value = hex;
      option.textContent = nom;
      option.style.backgroundColor = hex;
      option.style.color = getTextColor(hex);
      couleurSelect.appendChild(option);
    });

    // 🔁 Affichage aperçu SEULEMENT si l’utilisateur choisit une couleur
    couleurSelect.addEventListener("change", mettreÀJourAperçu);
  }

  getCategories().then(categories => {
    categories.sort((a, b) => a.nom.localeCompare(b.nom));

    categories.forEach(cat => {
      // 🧾 Menu pour sélection de catégorie
      const div = document.createElement("div");
      div.textContent = cat.nom;
      div.style.backgroundColor = cat.couleur;
      div.style.color = getTextColor(cat.couleur);

      div.addEventListener("click", () => {
        inputCategorie.value = cat.nom;
        inputCategorie.dataset.couleur = cat.couleur;

        setTimeout(() => {
          const resume = document.getElementById("categorieSelectionnee");
          const texte = document.querySelector("#categorieSelectionnee #texteCategorieCarte");
          const btn = document.getElementById("btnCategorieOptions");

          if (resume && texte && btn) {
            mettreAJourResumeCategorie({ nom: cat.nom, couleur: cat.couleur });
            menu.classList.add("hidden");
          }
        }, 50);
      });

      menu.appendChild(div);

      // 🧩 Select de parent
      if (parentSelect) {
        const option = document.createElement("option");
        option.value = cat.nom;
        option.textContent = cat.nom;
        parentSelect.appendChild(option);
      }
    });

    // 🧭 Choix parent
    if (parentSelect) {
      parentSelect.addEventListener("change", () => {
        const parent = categories.find(c => c.nom === parentSelect.value);
        const resumeParent = document.getElementById("resumeParentCategorie");
        const nomResume = document.getElementById("nomParentResume");

        if (parent) {
          resumeParent.style.display = "flex";
          nomResume.textContent = parent.nom;
          nomResume.style.backgroundColor = parent.couleur;
          nomResume.style.color = getTextColor(parent.couleur);

          if (couleurSelect) {
            couleurSelect.disabled = true;
            couleurSelect.title = "La couleur est héritée du parent.";
          }
        } else {
          resumeParent.classList.add("hidden");

          if (couleurSelect) {
            couleurSelect.disabled = false;
            couleurSelect.title = "";
          }
        }
      });
    }

    // ❌ Retrait du parent
    const retirerBtn = document.getElementById("retirerParentBtn");
    retirerBtn?.addEventListener("click", () => {
      if (parentSelect) parentSelect.value = "";
      document.getElementById("resumeParentCategorie")?.classList.add("hidden");

      if (couleurSelect) {
        couleurSelect.disabled = false;
        couleurSelect.title = "";
        mettreÀJourAperçu();
      }
    });
  });
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

        if (titreCategorie) titreCategorie.classList.add("hidden");

        if (cartesContainer) {
          cartesContainer.innerHTML = "";
          cartesContainer.classList.add("hidden");

        }
        if (vueCategories) vueCategories.style.display = "flex";

      }
    });
  }
}
let categorieEnCoursDeModification = null;

document.getElementById("closeEditModal").addEventListener("click", () => {
  fermerModale("modalEditCategorie");
  reinitialiserFormulaireNouvelleCategorie();
});

document.getElementById("btnEnregistrerModification").addEventListener("click", () => {
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
                titreCategorie.classList.remove("hidden");
              }
              afficherCartesParCategorie(nouveauNom);

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
            titreCategorie.classList.remove("hidden");
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
export function reinitialiserFormulaireNouvelleCategorie() {
  const nomInput = document.getElementById("nouvelleCategorieNom");
  const couleurSelect = document.getElementById("nouvelleCouleur");
  const parentSelect = document.getElementById("parentCategorie");
  const resumeCouleur = document.getElementById("resumeNouvelleCouleur");
  const texteCouleur = document.getElementById("texteResumeCouleur");

  if (nomInput) nomInput.value = "";
  if (couleurSelect) {
    couleurSelect.selectedIndex = 0;
    couleurSelect.disabled = false;
    couleurSelect.title = "";
    couleurSelect.style.backgroundColor = "";
    couleurSelect.style.color = "";
  }
  if (parentSelect) parentSelect.selectedIndex = 0;

  if (resumeCouleur) {
    resumeCouleur.classList.add("hidden");
    resumeCouleur.style.backgroundColor = "";
    resumeCouleur.style.color = "";
  }
  if (texteCouleur) texteCouleur.textContent = "";

  const resumeParent = document.getElementById("resumeParentCategorie");
  if (resumeParent) resumeParent.classList.add("hidden");
}
