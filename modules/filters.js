/**
 * 🏷️ filters.js
 * Gestion des filtres :
 * - Tri des cartes (par date, titre)
 * - Filtrage par tag unique ou multiple
 * - Réinitialisation des filtres
 */

import { afficherCartes, afficherCartesFiltres } from './cartes.js';

let tagsFiltres = [];
let modeTri = "date-desc"; // Tri par défaut

// 🔽 TRI DES CARTES
export function changerTri() {
    const select = document.getElementById("triSelect");
    modeTri = select.value;
    afficherCartes(modeTri);
}

// 🏷️ FILTRAGE PAR TAG SIMPLE
export function filtrerParTag() {
    const tagChoisi = document.getElementById("tagFilter").value.toLowerCase();
    const transaction = window.db.transaction("regles", "readonly");
    const store = transaction.objectStore("regles");

    store.getAll().onsuccess = function (event) {
        const cartes = event.target.result.filter(carte =>
            carte.tags.includes(tagChoisi)
        );
        afficherCartesFiltres(cartes);
    };
}

// 🏷️ FILTRAGE MULTIPLE PAR TAGS SÉLECTIONNÉS
export function filtrerParTagsMultiples() {
    const transaction = window.db.transaction("regles", "readonly");
    const store = transaction.objectStore("regles");

    store.getAll().onsuccess = function (event) {
        const cartes = event.target.result.filter(carte =>
            tagsFiltres.length === 0 || tagsFiltres.every(tag => carte.tags.includes(tag))
        );
        afficherCartesFiltres(cartes);
    };
}

// 🏷️ FILTRAGE PAR RECHERCHE (saisie libre)
export function filtrerCartesParTexte() {
    const recherche = document.getElementById("search").value.toLowerCase();
    const transaction = window.db.transaction("regles", "readonly");
    const store = transaction.objectStore("regles");

    store.getAll().onsuccess = function (event) {
        const cartes = event.target.result.filter(carte =>
            carte.tags.some(tag => tag.includes(recherche))
        );
        afficherCartesFiltres(cartes);
    };
}

// 🧼 RÉINITIALISER TOUS LES FILTRES
export function reinitialiserFiltre() {
    tagsFiltres = [];

    // Réinitialise les tags sélectionnés
    const checkboxes = document.querySelectorAll("#tagDropdown input");
    checkboxes.forEach(checkbox => checkbox.checked = false);

    document.getElementById("etiquettes-container").innerHTML = "";
    document.getElementById("resetFilterBtn").style.display = "none";

    afficherCartes(modeTri);
}

// 🏷️ Gestion dynamique des étiquettes visuelles
export function mettreAJourEtiquettes() {
    const container = document.getElementById("etiquettes-container");
    container.innerHTML = "";

    const checkboxes = document.querySelectorAll("#tagDropdown input:checked");
    tagsFiltres = Array.from(checkboxes).map(cb => cb.value);

    tagsFiltres.forEach(tag => {
        const badge = document.createElement("span");
        badge.classList.add("etiquette");
        badge.textContent = tag;

        const btnSupprimer = document.createElement("button");
        btnSupprimer.textContent = "❌";
        btnSupprimer.addEventListener("click", () => retirerEtiquette(tag));

        badge.appendChild(btnSupprimer);
        container.appendChild(badge);
    });

    filtrerParTagsMultiples();

    const resetBtn = document.getElementById("resetFilterBtn");
    resetBtn.style.display = tagsFiltres.length > 0 ? "block" : "none";
}

function retirerEtiquette(tag) {
    const checkboxes = document.querySelectorAll("#tagDropdown input");
    checkboxes.forEach(cb => {
        if (cb.value === tag) cb.checked = false;
    });

    mettreAJourEtiquettes();
}
