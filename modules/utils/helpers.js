/**
 * 🛠 helpers.js
 * Fonctions utilitaires **pures et réutilisables** sans dépendance au DOM ou au contexte global.
 * - getTextColor(hex) : détermine texte blanc/noir selon couleur.
 * - rgbToHex(rgb) : convertit du RGB en hexadécimal.
 * - getNomCouleur(hex, palette) : retourne le nom d'une couleur d'après une palette fournie.
 */

export function getTextColor(hexColor) {
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? "black" : "white";
}

export function rgbToHex(rgb) {
    if (!rgb) return "#000000";
    const result = rgb.match(/\d+/g);
    if (!result) return "#000000";

    return "#" + result.slice(0, 3).map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join("");
}

export function getNomCouleur(hex, paletteObj) {
    return paletteObj?.[hex] || hex;
}
