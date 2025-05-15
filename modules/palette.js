/**
 * 🎨 palette.js
 * Fonctions de **logique métier liée aux palettes de couleurs**.
 * - changerPalette(id) : appliquer une nouvelle palette.
 * - appliquerPaletteGlobale() : met à jour l'interface et IndexedDB.
 * - ouvrirModalePalette() / fermerPalette() : gère la sélection de palette.
 * ❗️ Ce fichier utilise config.js pour les données de palette.
 */

import { nomsCouleursParPalette, palettes } from './config.js';
import { getTextColor, rgbToHex } from './utils/helpers.js';
import { chargerMenuCategories } from './categories.js';
import { afficherVueParCategories } from './categories.js';
import { afficherCartes } from './cartes.js';

export function ouvrirModalePalette() {
    const container = document.getElementById("listePalettes");
    container.innerHTML = "";

    palettes.forEach(palette => {
        const btn = document.createElement("button");
        btn.classList.add("palette-btn");
        if (palette.id === window.paletteActuelle) btn.classList.add("active");
        btn.setAttribute("data-id", palette.id);
        btn.onclick = () => changerPalette(palette.id);

        const preview = document.createElement("div");
        preview.classList.add("palette-aperçu");
        palette.couleurs.forEach(couleur => {
            const rond = document.createElement("span");
            rond.classList.add("couleur");
            rond.style.backgroundColor = couleur;
            preview.appendChild(rond);
        });

        btn.appendChild(preview);
        btn.append(palette.nom);
        container.appendChild(btn);
    });

    document.getElementById("modalPalette").style.display = "block";
}

export function fermerPalette() {
    document.getElementById("modalPalette").style.display = "none";
}

export function changerPalette(id) {
    const anciennePalette = window.paletteActuelle;
    const ancienneCouleurs = Object.keys(nomsCouleursParPalette[anciennePalette]);
    const nouvelleCouleurs = Object.keys(nomsCouleursParPalette[id]);

    if (ancienneCouleurs.length !== nouvelleCouleurs.length) {
        alert("⚠️ Les palettes n'ont pas le même nombre de couleurs !");
        return;
    }

    window.paletteActuelle = id;

    appliquerPaletteGlobale(anciennePalette);

    document.querySelectorAll(".palette-btn").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-id") === id);
    });

    setTimeout(fermerPalette, 300);
}

export function appliquerPaletteGlobale(anciennePaletteId) {
    const anciennes = Object.keys(nomsCouleursParPalette[anciennePaletteId]);
    const nouvelles = Object.keys(nomsCouleursParPalette[window.paletteActuelle]);

    const transactionCategories = window.db.transaction("categories", "readwrite");
    const storeCategories = transactionCategories.objectStore("categories");

    storeCategories.getAll().onsuccess = function (event) {
        event.target.result.forEach(cat => {
            const index = anciennes.indexOf(cat.couleur);
            if (index !== -1) {
                cat.couleur = nouvelles[index];
                storeCategories.put(cat);
            }
        });
        chargerMenuCategories();
        afficherVueParCategories();
    };

    const transactionCartes = window.db.transaction("regles", "readwrite");
    const storeCartes = transactionCartes.objectStore("regles");

    storeCartes.getAll().onsuccess = function (event) {
        event.target.result.forEach(carte => {
            const index = anciennes.indexOf(carte.couleurCategorie);
            if (index !== -1) {
                carte.couleurCategorie = nouvelles[index];
                storeCartes.put(carte);
            }
        });
        afficherCartes();
    };

    // Mise à jour des éléments affichés
    document.querySelectorAll(".carte").forEach(div => {
        const couleurActuelle = rgbToHex(div.style.borderLeftColor);
        const index = anciennes.indexOf(couleurActuelle);
        if (index !== -1) {
            div.style.borderLeftColor = nouvelles[index];
        }
    });

    const titreCategorie = document.getElementById("titreCategorieSelectionnee");
    if (titreCategorie) {
        const couleurActuelle = rgbToHex(titreCategorie.style.backgroundColor);
        const index = anciennes.indexOf(couleurActuelle);
        if (index !== -1) {
            titreCategorie.style.backgroundColor = nouvelles[index];
            titreCategorie.style.color = getTextColor(nouvelles[index]);
        }
    }
}
