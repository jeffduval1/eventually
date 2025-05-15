/**
 * 🛠️ config.js
 * Configuration centrale de Bee Organized
 * - Définition des palettes de couleurs
 * - Noms des couleurs par palette
 * - Variable de la palette active
 */

// 🌈 Liste des palettes disponibles (aperçu rapide)
export const palettes = [
  { nom: "Royal Dusk", id: "royalDusk", couleurs: ["#BF5700", "#5B2234", "#8C6BB1"] },
  { nom: "Solstice Clair", id: "solsticeClair", couleurs: ["#FFE177", "#F8C4C0", "#A7D8F0"] },
  { nom: "Carnaval Électrique", id: "carnavalElectrique", couleurs: ["#FF3F3F", "#FFD700", "#00E676"] },
  { nom: "Honey Luxe", id: "honeyLuxe", couleurs: ["#FB8C00", "#8D6E63", "#FFF3E0"] },
  { nom: "Terra Forte", id: "terraForte", couleurs: ["#D2691E", "#5A3E36", "#C2B280"] },
  { nom: "Éclats Fruités", id: "eclatsFruites", couleurs: ["#FF6F61", "#64B5F6", "#81C784"] },
  { nom: "Sunset Bloom", id: "sunsetBloom", couleurs: ["#FB8C00", "#F48FB1", "#263238"] },
  { nom: "Mélodie Nocturne", id: "melodieNocturne", couleurs: ["#1B263B", "#3D2C8D", "#627C85"] },
  { nom: "Vintage Books", id: "vintageBooks", couleurs: ["#A1887F", "#FFCC80", "#263238"] },
  { nom: "Palette à Jeff", id: "jeff", couleurs: ["#1D3461", "#F26419", "#95BF74"] }
];

// 🎨 Noms des couleurs pour chaque palette (détaillés)
const royalDuskPalette = { 
  "#1C1C1C": "Noir profond",
  "#3E2723": "Chocolat noir",
  "#5B2234": "Bourgogne profond",
  "#8C6BB1": "Violet chic",
  "#BF5700": "Orange brûlé",
  "#D99E30": "Or ancien",
  "#C49E60": "Bronze doux",
  "#B0BEC5": "Gris argenté",
  "#ECE5D8": "Crème soyeux",
  "#FFD700": "Jaune or",
  "#6B8E23": "Vert olive riche",
  "#4E5D4E": "Vert fumé",
  "#263238": "Bleu-gris ardoise",
  "#546E7A": "Bleu-gris tempête",
  "#7A4D7B": "Mauve brumeux",
  "#A1887F": "Brun taupe",
  "#D7CCC8": "Brun doux",
  "#9E9E9E": "Gris moyen",
  "#FFF8E1": "Ivoire léger",
  "#212121": "Charbon"
};
const carnavalElectriquePalette = { 
  "#FF3F3F": "Rouge cerise",
    "#FF6F61": "Corail vif",
    "#FFB74D": "Orange tropical",
    "#FFD700": "Jaune éclatant",
    "#F9A825": "Or soleil",
    "#C6FF00": "Vert fluo citron",
    "#00E676": "Vert menthe électrique",
    "#00C853": "Émeraude vive",
    "#00B8D4": "Turquoise néon",
    "#1DE9B6": "Aqua punch",
    "#40C4FF": "Bleu givré",
    "#2979FF": "Bleu vif",
    "#7C4DFF": "Violet électrique",
    "#E040FB": "Magenta laser",
    "#FF5722": "Orange électrique",
    "#FF80AB": "Rose néon",
    "#D500F9": "Violet pop",
    "#FF4081": "Fuchsia dynamite",
    "#FFAB00": "Orange lumière",
    "#FF00FF": "Magenta pur néon"
};
const honeyLuxePalette = { 
  "#1A1A1A": "Noir profond",
  "#333333": "Gris anthracite",
  "#4F4F4F": "Gris fusain",
  "#BDBDBD": "Gris soie",
  "#FFFFFF": "Blanc pur",
  "#FFD700": "Or",
  "#FFB300": "Ambre royal",
  "#FFC107": "Miel doré",
  "#F57F17": "Orange safran",
  "#E65100": "Orange brûlée",
  "#D84315": "Rouille",
  "#C0A16B": "Champagne",
  "#A1887F": "Brun taupe",
  "#8D6E63": "Brun moka",
  "#6D4C41": "Chocolat",
  "#4E342E": "Cacao",
  "#3E2723": "Bois foncé",
  "#BF9B30": "Or vieilli",
  "#F5F5DC": "Beige lin",
  "#FFF8E1": "Ivoire doux"
 };
const solsticeClairPalette = { 
  "#FFE177": "Limonade dorée",
  "#F8C4C0": "Rose coquillage",
  "#A7D8F0": "Bleu horizon",
  "#B9E4D4": "Menthe givrée",
  "#FCE8D8": "Ivoire pêche",
  "#DDF28F": "Citron doux",
  "#F9CBA4": "Sorbet pêche",
  "#D6D2C4": "Lichen pierre",
  "#DDECF7": "Bleu porcelaine",
  "#E39A81": "Argile rose",
  "#A5B8A3": "Sauge argentée",
  "#FFF3B0": "Bouton d’or pâle",
  "#B7C7CD": "Brume matinale",
  "#E0B8A1": "Argile claire",
  "#F5C96A": "Miel floral",
  "#C3A38A": "Cacao lait",
  "#BBDBE3": "Ciel lavé",
  "#F7B5A0": "Rosé agrume",
  "#DDD4C4": "Sable fin",
  "#C9DDB8": "Feuille tendre"
 };
const terraFortePalette = { 
   // "#7F4F24": "Terre brûlée",
   "#A68A64": "Argile grise",
   "#DDB892": "Sable rosé",
   "#BC6C25": "Cuivre sec",
   "#99582A": "Noisette",
   "#FFE6A7": "Lin pâle",
   "#6A994E": "Vert olivier",
   "#386641": "Feuille sombre",
   "#283618": "Écorce",
   "#F5CB5C": "Moutarde douce",
   "#A98467": "Cannelle douce",
   "#7DA27E": "Vert mousse fraîche",
   "#582F0E": "Châtaigne foncée",
   "#C1A57B": "Sable ancien",
   "#D6AD60": "Or poussiéreux",
   "#B5A642": "Olive dorée",
   "#5F6F52": "Sauge brûmée",
   "#8B6B4A": "Caramel éteint",
   "#8AA7B3": "Bleu pierre",  
   // "#997B66": "Beige cacao",
   "#726953": "Brume forestière",
   "#433520": "Bois ancien"
 };
const eclatsFruitesPalette = { 
  "#FF6F61": "Framboise éclatante",
  "#FF8A65": "Mandarine douce",
  "#FFD180": "Pêche pastel",
  "#FFAB91": "Melon d'été",
  "#F48FB1": "Rose goyave",
  "#F8BBD0": "Rose pétale",
  "#81D4FA": "Bleu ciel doux",
  "#B2EBF2": "Menthe givrée",
  "#4FC3F7": "Bleu cristal",
  "#4DD0E1": "Turquoise givré",
  "#81C784": "Vert kiwi",
  "#AED581": "Pomme verte",
  "#DCE775": "Citron doux",
  "#FFF176": "Jaune éclat",
  "#FFD54F": "Mangue dorée",
  "#E6EE9C": "Poire lumineuse",
  "#FFECB3": "Vanille légère",
  "#FFF8E1": "Ivoire crème",
  "#F5F5F5": "Blanc mat",
  "#D7CCC8": "Sable clair"
 };
const sunsetBloomPalette = { 
  "#FFF3E0": "Pêche pastel",
    "#FFE0B2": "Abricot doux",
    "#FFCC80": "Mandarine pâle",
    "#FFB74D": "Mandarine",
    "#FFA726": "Orange floraison",
    "#FF9800": "Orange vibrant",
    "#FB8C00": "Orange brûlé",
    "#F57C00": "Orange coucher de soleil",
    "#EF6C00": "Orange terre cuite",
    "#E65100": "Orange profond",
    "#F8BBD0": "Rose pétale",
    "#F48FB1": "Rose tendre",
    "#F06292": "Rose vif",
    "#EC407A": "Rose bougainvillier",
    "#E91E63": "Rose fuchsia",
    "#D81B60": "Rose framboise",
    "#C2185B": "Rose magenta",
    "#AD1457": "Rose foncé",
    "#880E4F": "Rose aubergine",
    "#FFEBEE": "Rosé pastel"
 };
const melodieNocturnePalette = { 
  "#1B263B": "Bleu minuit",
    "#27374D": "Bleu crépuscule",
    "#526D82": "Brume acier",
    "#9DB2BF": "Bleu de lune",
    "#DDE6ED": "Argent de nuit",
    "#3D2C8D": "Violet cosmique",
    "#5C5470": "Violet fumé",
    "#8D8DAA": "Gris lilas",
    "#B9B4C7": "Brume violette",
    "#EBE3D5": "Sable lunaire",
    "#2C3333": "Vert de minuit",
    "#395B64": "Vert givré",
    "#627C85": "Bleu-forêt",
    "#A5C9CA": "Brouillard glacé",
    "#E7F6F2": "Blanc givré",
    "#6B4226": "Chocolat noir",
    "#9E6F41": "Cuir vieilli",
    "#C8AD7F": "Sable doré",
    "#F1E0C5": "Ivoire antique",
    "#FFFFFF": "Lueur blanche"
 };
const vintageBooksPalette = { 
  "#FFF8E1": "Ivoire doux",
  "#FFE0B2": "Crème vanille",
  "#FFD180": "Sable doré",
  "#FFCC80": "Blé ancien",
  "#FFB74D": "Caramel",
  "#FFA726": "Miel brun",
  "#FF8F00": "Ambre",
  "#EF6C00": "Tabac",
  "#D84315": "Rouille",
  "#A1887F": "Brun parchemin",
  "#8D6E63": "Brun cuir",
  "#6D4C41": "Brun ancien",
  "#4E342E": "Brun bibliothèque",
  "#3E2723": "Brun profond",
  "#C5E1A5": "Vert sauge",
  "#AED581": "Vert olive pâle",
  "#9CCC65": "Vert olive",
  "#7CB342": "Vert mousse",
  "#558B2F": "Vert cèdre",
  "#33691E": "Vert forêt"
 };
const jeffPalette = { 
  "#1D3461": "Delft Blue",
    "#404E7C": "YInMn Blue",
    "#4E8098": "Air Force Blue",
    "#B3C5D7": "Powder Blue",
    "#AED4E6": "Colombia Blue",
    "#0A2472": "Royal Blue",
    "#750D37": "Claret",
    "#B6465F": "Raspberry Rose",
    "#F26419": "Orange Pantone",
    "#FFF07C": "Maize",
    "#FCE694": "Jasmine",
    "#EAC435": "Saffron",
    "#DDE8B9": "Tea Green",
    "#63C132": "Kelly Green",
    "#95BF74": "Pistachio",
    "#139A43": "Pigment Green",
    "#574F2A": "Café Noir",
    "#5D5F71": "Payne’s Gray",
    "#E8E9F3": "Ghost White",
    "#A499B3": "Rose Quartz"
 };

// 🗂️ Assemblage central des palettes par ID
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

// 🛠️ Fonction pour changer dynamiquement la palette active
export function setPaletteActuelle(id) {
  if (nomsCouleursParPalette[id]) {
    paletteActuelle = id;
    console.log("🎨 Palette actuelle changée :", id);
  } else {
    console.warn("❌ Palette inconnue :", id);
  }
}
