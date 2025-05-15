/**
 * 🛠 helpers.js
 * Fonctions utilitaires **pures et réutilisables** sans dépendance au DOM.
 * - getTextColor(hex) : détermine texte blanc/noir selon couleur.
 * - rgbToHex(rgb) : convertit du RGB en hexadécimal.
 * - getNomCouleur(hex, palette) : retourne le nom d'une couleur.
 * ❗️ Ce fichier doit rester indépendant (pas de manipulation DOM, pas de globales).
 */

import { nomsCouleursParPalette, paletteActuelle } from '../config.js';
export function getCouleursDisponibles() {
    return Object.keys(nomsCouleursParPalette[paletteActuelle]);
}
export function getTextColor(hexColor) {
    const r = parseInt(hexColor.substr(1,2), 16);
    const g = parseInt(hexColor.substr(3,2), 16);
    const b = parseInt(hexColor.substr(5,2), 16);
    const luminance = (0.299*r + 0.587*g + 0.114*b) / 255;
    return luminance > 0.6 ? "black" : "white";
}

export function rgbToHex(rgb) {
    if (!rgb) return "#000000"; // 🔹 Sécurité
    const result = rgb.match(/\d+/g);
    if (!result) return "#000000"; // 🔹 Sécurité

    return "#" + result.slice(0, 3).map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join("");
}

export function getNomCouleur(hex, palette = "royalDusk") {
    const paletteObj = nomsCouleursParPalette[palette] || {};
    return paletteObj[hex] || hex;
  }

// 🚀 Ouvrir ou créer la base IndexedDB
const request = indexedDB.open("MoteurDeRecherche", 4);
let modeTri = "date-desc"; // Mode de tri par défaut
function toggleForm() {
    let modal = document.getElementById("modalAjoutCarte");
    let closeModalBtn = document.getElementById("closeModalAjoutCarte");

    if (!modal) {
        console.error("❌ La modale d'ajout de carte n'a pas été trouvée.");
        return;
    }

    modal.style.display = "block";

    // ✅ Charger les catégories disponibles comme parents
    chargerParentsDisponibles(); 

    closeModalBtn.onclick = function() {
        modal.style.display = "none";
    };

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };
}
