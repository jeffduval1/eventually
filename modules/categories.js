import { getCategories } from './db/indexedDB.js';
import { getTextColor } from './utils/helpers.js';
import { afficherCartesParCategorie } from './cartes.js';

// Affiche la vue principale des catégories (arborescence)
export function afficherVueParCategories() {
    const container = document.getElementById("vue-par-categories");
    const cartesContainer = document.getElementById("cartes-container");
    const titreCategorie = document.getElementById("titreCategorieSelectionnee");
    const btnRetour = document.getElementById("btnRetourCategories");

    container.innerHTML = "";
    container.style.display = "flex";
    cartesContainer.style.display = "none";
    btnRetour.style.display = "none";
    titreCategorie.style.display = "none";
    document.getElementById("zoneFiltres").style.display = "none";

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
            afficherCategorieEtEnfants(racine, 0, container);
        });
    });
}

// Affiche une catégorie et ses sous-catégories (récursif)
function afficherCategorieEtEnfants(categorie, niveau, container) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("bloc-categorie");
    wrapper.style.marginLeft = `${niveau * 20}px`;

    const ligne = document.createElement("div");
    ligne.classList.add("ligne-categorie");
    ligne.style.backgroundColor = categorie.couleur;
    ligne.style.color = getTextColor(categorie.couleur);
    ligne.style.padding = "8px";
    ligne.style.borderRadius = "6px";
    ligne.style.marginBottom = "4px";
    ligne.style.display = "flex";
    ligne.style.alignItems = "center";
    ligne.style.cursor = "pointer";
    ligne.style.gap = "8px";

    const fleche = document.createElement("span");
    fleche.textContent = categorie.enfants.length > 0 ? "➤" : "";
    fleche.style.transition = "transform 0.2s ease";
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
            afficherCartesParCategorie(categorie.id);
        }
    });

    container.appendChild(wrapper);

    categorie.enfants.forEach(enfant => {
        afficherCategorieEtEnfants(enfant, niveau + 1, sousContainer);
    });
}

// Créer une nouvelle catégorie (via le formulaire)
export function creerNouvelleCategorie() {
    const nomInput = document.getElementById("nouvelleCategorieNom");
    const couleurSelect = document.getElementById("nouvelleCouleur");
    const parentSelect = document.getElementById("parentCategorie");

    const nom = nomInput.value.trim();
    const couleur = couleurSelect.value;
    const parent = parentSelect.value || null;

    if (!nom || !couleur) {
        alert("Veuillez nommer la catégorie et choisir une couleur.");
        return;
    }

    const transaction = db.transaction("categories", "readwrite");
    const store = transaction.objectStore("categories");

    const request = store.add({ nom, couleur, parent });

    request.onsuccess = () => {
        document.getElementById("modalCategorie").style.display = "none";
        nomInput.value = "";
        couleurSelect.value = "";
        parentSelect.value = "";

        afficherVueParCategories();
    };

    request.onerror = () => {
        alert("Erreur : cette catégorie existe déjà.");
    };
}
