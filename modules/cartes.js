/**
 * 🗃 cartes.js
 * Gère les cartes (affichage, ajout, modification, suppression)
 * - afficherCartes(modeTri) : vue par cartes
 * - afficherCartesFiltres(cartes) : affichage filtré
 * - ajouterCarte, modifierCarte, supprimerCarte
 */

import { getTextColor } from './utils/helpers.js';
import { getCartes, ajouterCarte as dbAjouterCarte, modifierCarte as dbModifierCarte, supprimerCarte as dbSupprimerCarte } from './db/indexedDB.js';


export function afficherCartes(modeTri = "date-desc") {
    const container = document.getElementById("cartes-container");
    container.innerHTML = "";

    getCartes().then(cartes => {
        if (modeTri === "titre-asc") cartes.sort((a, b) => a.titre.localeCompare(b.titre));
        else if (modeTri === "titre-desc") cartes.sort((a, b) => b.titre.localeCompare(a.titre));
        else if (modeTri === "date-asc") cartes.sort((a, b) => a.dateCreation - b.dateCreation);
        else cartes.sort((a, b) => b.dateCreation - a.dateCreation);

        cartes.forEach(carte => {
            const div = document.createElement("div");
            div.classList.add("carte");
            div.style.borderLeft = `6px solid ${carte.couleurCategorie || "#ccc"}`;
            div.innerHTML = `
                <h3>${carte.titre}</h3>
                <p>${carte.contenu}</p>
                <small class="tags">${carte.tags.join(", ")}</small>
            `;
            container.appendChild(div);
        });
    });
}

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
            <small class="tags">${carte.tags.join(", ")}</small>
        `;
        container.appendChild(div);
    });
}

export function ajouterCarte() {
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

    dbAjouterCarte(nouvelleCarte);
    document.getElementById("modalAjoutCarte").style.display = "none";
    afficherCartes();
    document.getElementById("titre").value = "";
    document.getElementById("contenu").value = "";
    document.getElementById("tags").value = "";
}

export function modifierCarte(carte) {
    dbModifierCarte(carte);
    afficherCartes();
}

export function supprimerCarte(id) {
    dbSupprimerCarte(id);
    afficherCartes();
}
