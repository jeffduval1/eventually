// Config
import { paletteActuelle, nomsCouleursParPalette, setPaletteActuelle } from './modules/config.js';

// Helpers
import { getTextColor, getNomCouleur, rgbToHex } from './modules/utils/helpers.js';

// DB
import { ouvrirDB } from './modules/db/indexedDB.js';

// Modules principaux
import { afficherCartes, afficherCartesParCategorie, ajouterCarte } from './modules/modules/cartes.js';
import { afficherVueParCategories, creerNouvelleCategorie } from './modules/modules/categories.js';
import { appliquerPaletteGlobale, changerPalette } from './modules/modules/palette.js';
import { filtrerParTag, reinitialiserFiltre } from './modules/modules/filters.js';
import { afficherCorbeille, fermerCorbeille, viderCorbeille } from './modules/modules/ui.js';

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🟢 Initialisation Bee Organized');
    await ouvrirDB();

    appliquerPaletteGlobale();
    afficherVueParCategories();

    // Écouteurs globaux
    document.getElementById("btnAfficherFormCategorie").addEventListener("click", () => {
        document.getElementById("modalCategorie").style.display = "block";
    });
    document.getElementById("btnGererCategories").addEventListener("click", () => {
        document.getElementById("modalGestionCategories").style.display = "block";
    });
    document.getElementById("btnRetourCategories").addEventListener("click", afficherVueParCategories);
    document.getElementById("btnCreerCategorie").addEventListener("click", creerNouvelleCategorie);
    document.getElementById("ajoutCarteBtn").addEventListener("click", ajouterCarte);
    document.getElementById("btnModeCategories").addEventListener("click", afficherVueParCategories);
    document.getElementById("btnModeCartes").addEventListener("click", afficherCartes);
    document.getElementById("resetFilterBtn").addEventListener("click", reinitialiserFiltre);
    document.getElementById("btnAfficherCorbeille").addEventListener("click", afficherCorbeille);
});
