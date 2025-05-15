/**
 * 🎛 ui.js
 * Gestion des éléments d'interface utilisateur (UI)
 * - Ouvre/ferme modales, corbeille, palettes
 * - Gère les menus (hamburger, dropdowns)
 * - Actions globales non liées aux cartes ou catégories
 */

import { afficherCartes } from './cartes.js';
import { afficherVueParCategories } from './categories.js';
import { palettes, paletteActuelle, nomsCouleursParPalette } from './config.js';
import { appliquerPaletteGlobale } from './palette.js';

// 🗑 CORBEILLE
export function afficherCorbeille() {
    const transaction = window.db.transaction("corbeille", "readonly");
    const store = transaction.objectStore("corbeille");

    store.getAll().onsuccess = function (event) {
        const cartes = event.target.result;
        const container = document.getElementById("cartes-corbeille");

        container.innerHTML = cartes.length === 0
            ? "<p>Aucune carte supprimée.</p>"
            : cartes.map(carte => `
                <div class="carte">
                    <h3>${carte.titre}</h3>
                    <span>Supprimé le : ${new Date(carte.dateSuppression).toLocaleDateString()}</span>
                    <p>${carte.contenu}</p>
                    <button onclick="restaurerCarte(${carte.id})">Restaurer</button>
                </div>
            `).join("");

        document.getElementById("corbeille-page").style.display = "flex";
    };
}

export function fermerCorbeille() {
    document.getElementById("corbeille-page").style.display = "none";
}

export function viderCorbeille() {
    if (confirm("Voulez-vous vraiment vider la corbeille ?")) {
        const transaction = window.db.transaction("corbeille", "readwrite");
        const store = transaction.objectStore("corbeille");

        store.clear().onsuccess = afficherCorbeille;
    }
}

// 🎨 PALETTES
export function ouvrirModalePalette() {
    const container = document.getElementById("listePalettes");
    container.innerHTML = "";

    palettes.forEach(palette => {
        const btn = document.createElement("button");
        btn.classList.add("palette-btn");
        if (palette.id === paletteActuelle) btn.classList.add("active");

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

        btn.addEventListener("click", () => changerPalette(palette.id));
        container.appendChild(btn);
    });

    document.getElementById("modalPalette").style.display = "block";
}

export function fermerPalette() {
    document.getElementById("modalPalette").style.display = "none";
}

function changerPalette(id) {
    if (Object.keys(nomsCouleursParPalette[paletteActuelle]).length !== Object.keys(nomsCouleursParPalette[id]).length) {
        alert("Les palettes doivent avoir le même nombre de couleurs.");
        return;
    }

    const ancienne = paletteActuelle;
    paletteActuelle = id;

    appliquerPaletteGlobale(ancienne);
    fermerPalette();
}

// 🟦 MENU HAMBURGER
export function setupHamburger() {
    const btn = document.getElementById("btnHamburger");
    const menu = document.getElementById("menuContent");

    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.style.display = (menu.style.display === "block") ? "none" : "block";
    });

    document.addEventListener("click", (e) => {
        if (!menu.contains(e.target) && e.target !== btn) {
            menu.style.display = "none";
        }
    });
}

// ⏹️ GLOBAL INIT UI
export function setupUI() {
    // Boutons d'ouverture de modales
    document.getElementById("btnAfficherFormCategorie").addEventListener("click", () => {
        document.getElementById("modalCategorie").style.display = "block";
    });

    document.getElementById("btnGererCategories").addEventListener("click", () => {
        document.getElementById("modalGestionCategories").style.display = "block";
    });

    document.getElementById("btnRetourCategories").addEventListener("click", afficherVueParCategories);

    document.getElementById("btnAfficherCorbeille")?.addEventListener("click", afficherCorbeille);

    document.getElementById("closeGestionModal").addEventListener("click", () => {
        document.getElementById("modalGestionCategories").style.display = "none";
    });

    document.getElementById("closeModal").addEventListener("click", () => {
        document.getElementById("modalCategorie").style.display = "none";
    });

    setupHamburger();
}
