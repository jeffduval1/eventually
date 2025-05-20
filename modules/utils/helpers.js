/**
 * 🛠 helpers.js
 * Fonctions utilitaires **pures et réutilisables** sans dépendance au DOM.
 * - getTextColor(hex) : "white" ou "black" selon la lisibilité sur fond coloré
 * - rgbToHex(rgb) : convertit "rgb(r,g,b)" → "#rrggbb"
 * - getNomCouleur(hex, palette) : donne le nom de la couleur si présent dans une palette
 */

/**
 * Retourne "black" ou "white" selon la couleur de fond fournie en hexadécimal
 * @param {string} hexColor - ex. "#ffffff"
 * @returns {string} - "black" ou "white"
 */
export function getTextColor(hexColor) {
  if (!/^#([0-9A-Fa-f]{6})$/.test(hexColor)) return "black";

  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.6 ? "black" : "white";
}

/**
 * Convertit une chaîne RGB du style "rgb(255, 255, 255)" en "#ffffff"
 * @param {string} rgb - chaîne RGB standard
 * @returns {string} - code hexadécimal correspondant
 */
export function rgbToHex(rgb) {
  if (!rgb || typeof rgb !== "string") return "#000000";

  const matches = rgb.match(/\d+/g);
  if (!matches || matches.length < 3) return "#000000";

  return (
    "#" +
    matches.slice(0, 3).map(val => {
      const hex = parseInt(val, 10).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("")
  );
}

/**
 * Retourne le nom associé à une couleur dans une palette, sinon retourne le code brut
 * @param {string} hex - code couleur ex. "#FFA726"
 * @param {object} paletteObj - objet palette ex. { "#FFA726": "Orange vibrant", ... }
 * @returns {string}
 */
export function getNomCouleur(hex, paletteObj) {
  if (!paletteObj || typeof paletteObj !== "object") return hex;
  return paletteObj[hex] || hex;
}
