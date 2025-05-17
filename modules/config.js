/**
 * ⚙️ config.js
 * Configuration centrale de Bee Organized
 * - Liste des palettes disponibles
 * - Noms des couleurs par palette
 * - Palette active + setter exporté
 */

import {
  royalDuskPalette,
  carnavalElectriquePalette,
  honeyLuxePalette,
  solsticeClairPalette,
  terraFortePalette,
  eclatsFruitesPalette,
  sunsetBloomPalette,
  melodieNocturnePalette,
  vintageBooksPalette,
  jeffPalette
} from './palettesData.js';

// 🌈 Liste des palettes disponibles
export const palettes = [
  { nom: "Royal Dusk", id: "royalDusk", couleurs: Object.keys(royalDuskPalette) },
  { nom: "Solstice Clair", id: "solsticeClair", couleurs: Object.keys(solsticeClairPalette) },
  { nom: "Carnaval Électrique", id: "carnavalElectrique", couleurs: Object.keys(carnavalElectriquePalette) },
  { nom: "Honey Luxe", id: "honeyLuxe", couleurs: Object.keys(honeyLuxePalette) },
  { nom: "Terra Forte", id: "terraForte", couleurs: Object.keys(terraFortePalette) },
  { nom: "Éclats Fruités", id: "eclatsFruites", couleurs: Object.keys(eclatsFruitesPalette) },
  { nom: "Sunset Bloom", id: "sunsetBloom", couleurs: Object.keys(sunsetBloomPalette) },
  { nom: "Mélodie Nocturne", id: "melodieNocturne", couleurs: Object.keys(melodieNocturnePalette) },
  { nom: "Vintage Books", id: "vintageBooks", couleurs: Object.keys(vintageBooksPalette) },
  { nom: "Palette à Jeff", id: "jeff", couleurs: Object.keys(jeffPalette) }
];

// 🏷️ Noms des couleurs pour chaque palette
export const nomsCouleursParPalette = {
  royalDusk: royalDuskPalette,
  carnavalElectrique: carnavalElectriquePalette,
  honeyLuxe: honeyLuxePalette,
  solsticeClair: solsticeClairPalette,
  terraForte: terraFortePalette,
  eclatsFruites: eclatsFruitesPalette,
  sunsetBloom: sunsetBloomPalette,
  melodieNocturne: melodieNocturnePalette,
  vintageBooks: vintageBooksPalette,
  jeff: jeffPalette
};

// 🎯 Palette active par défaut
export let paletteActuelle = "royalDusk";

// ✅ Setter pour changer la palette active dynamiquement
export function setPaletteActuelle(id) {
  paletteActuelle = id;
}
