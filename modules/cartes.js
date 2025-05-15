/**
 * 🗂 cartes.js
 * Gère toutes les opérations sur les cartes :
 * - afficherCartes() : affichage général
 * - ajouterCarte(), modifierCarte(), supprimerCarte()
 * - filtrage : par tag, par recherche
 * - gestion des couleurs et tri
 * Utilise db (indexedDB), palette et helpers.
 */

import { getTextColor } from './utils/helpers.js';
import { getCouleursDisponibles, getNomCouleur } from './utils/helpers.js';
import { paletteActuelle } from './config.js';
import { chargerMenuCategories } from './categories.js';

export let modeTri = "date-desc";

export function afficherCartes() {
    const transaction = window.db.transaction("regles", "readonly");
    const store = transaction.objectStore("regles");

    store.getAll().onsuccess = function (event) {
        const cartes = event.target.result;
        const container = document.getElementById("cartes-container");
        container.innerHTML = "";

        cartes.sort(trierCartes);

        const tagsUniques = new Set();
        cartes.forEach(carte => {
            afficherCarte(carte, container);
            carte.tags.forEach(tag => tagsUniques.add(tag));
        });

        mettreAJourTags(Array.from(tagsUniques));
    };
}

function trierCartes(a, b) {
    const dateA = new Date(a.dateCreation).getTime();
    const dateB = new Date(b.dateCreation).getTime();

    switch (modeTri) {
        case "date-desc": return dateB - dateA;
        case "date-asc": return dateA - dateB;
        case "titre-asc": return a.titre.localeCompare(b.titre);
        case "titre-desc": return b.titre.localeCompare(a.titre);
        default: return dateB - dateA;
    }
}

function afficherCarte(carte, container) {
    const dateAffichee = carte.dateCreation
        ? new Date(carte.dateCreation).toLocaleDateString()
        : "Date inconnue";

    const div = document.createElement("div");
    div.classList.add("carte");
    div.setAttribute("data-id", carte.id);
    div.style.borderLeft = `8px solid ${carte.couleurCategorie || '#ccc'}`;

    div.innerHTML = `
        <div style="display: flex; justify-content: space-between;">
            <h3>${carte.titre}</h3>
            <span style="font-size: 12px; color: gray;">${dateAffichee}</span>
        </div>
        <div class="badge-categorie" 
             style="background-color:${carte.couleurCategorie || "#ccc"};
                    color:${getTextColor(carte.couleurCategorie || "#ccc")};
                    padding: 4px 8px; border-radius: 4px; display: inline-block; margin: 4px 0;">
            ${carte.categorie || 'Sans catégorie'}
        </div>
        <p>${carte.contenu}</p>
        <p class="tags">Tags : ${carte.tags.join(", ")}</p>
        <button onclick="modifierCarte(${carte.id})">Modifier</button>
        <button onclick="supprimerCarte(${carte.id})">Supprimer</button>
    `;

    container.appendChild(div);
}

export function ajouterCarte() {
    const titre = document.getElementById("titre").value.trim();
    const contenu = document.getElementById("contenu").value.trim();
    const tags = document.getElementById("tags").value.toLowerCase().split(',').map(t => t.trim()).filter(Boolean);
    const categorie = document.getElementById("categorieChoisie").value;
    const couleurCategorie = document.getElementById("categorieChoisie").dataset.couleur || "#ccc";

    if (!titre || !contenu) {
        alert("Veuillez remplir le titre et le contenu !");
        return;
    }

    const carte = {
        titre,
        contenu,
        tags,
        categorie,
        couleurCategorie,
        dateCreation: new Date().toISOString()
    };

    const transaction = window.db.transaction("regles", "readwrite");
    const store = transaction.objectStore("regles");

    store.add(carte).onsuccess = function () {
        console.log("✅ Carte ajoutée");
        afficherCartes();
    };
}

export function filtrerParTag(tag) {
    const transaction = window.db.transaction("regles", "readonly");
    const store = transaction.objectStore("regles");

    store.getAll().onsuccess = function (event) {
        const cartes = event.target.result.filter(carte => carte.tags.includes(tag.toLowerCase()));
        afficherCartesFiltrees(cartes);
    };
}

export function filtrerCartes(recherche) {
    const transaction = window.db.transaction("regles", "readonly");
    const store = transaction.objectStore("regles");

    store.getAll().onsuccess = function (event) {
        const cartes = event.target.result.filter(carte =>
            carte.tags.some(tag => tag.includes(recherche.toLowerCase()))
        );
        afficherCartesFiltrees(cartes);
    };
}

function afficherCartesFiltrees(cartes) {
    const container = document.getElementById("cartes-container");
    container.innerHTML = "";

    cartes.forEach(carte => afficherCarte(carte, container));
}

export function changerTri(nouveauTri) {
    modeTri = nouveauTri;
    afficherCartes();
}

function mettreAJourTags(tags) {
    const select = document.getElementById("tagFilter");
    select.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Sélectionner un tag";
    select.appendChild(defaultOption);

    tags.forEach(tag => {
        const option = document.createElement("option");
        option.value = tag;
        option.textContent = tag;
        select.appendChild(option);
    });
}
