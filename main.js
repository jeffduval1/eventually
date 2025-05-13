// 📁 main.js

// --- Config & Helpers ---
import { paletteActuelle, nomsCouleursParPalette } from './modules/config.js';
import { getTextColor, getNomCouleur, rgbToHex } from './modules/utils/helpers.js';

// --- DB ---
import { ouvrirDB } from './modules/db/indexedDB.js';

// --- Modules principaux ---
import { afficherCartes, ajouterCarte } from './modules/cartes.js';
import { afficherVueParCategories, creerNouvelleCategorie } from './modules/categories.js';
import { appliquerPaletteGlobale } from './modules/palette.js';
import { afficherCorbeille, fermerCorbeille, viderCorbeille } from './modules/ui.js';
import { reinitialiserFiltre } from './modules/filters.js';

// --- Lancer l'application ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🟢 Initialisation de Bee Organized');

    await ouvrirDB();

    afficherVueParCategories();
    appliquerPaletteGlobale();

    // === Écouteurs d’événements globaux ===

    // --- Catégories ---
    document.getElementById("btnAfficherFormCategorie").addEventListener("click", () => {
        document.getElementById("modalCategorie").style.display = "block";
    });

    document.getElementById("btnGererCategories").addEventListener("click", () => {
        document.getElementById("modalGestionCategories").style.display = "block";
    });

    document.getElementById("btnRetourCategories").addEventListener("click", afficherVueParCategories);

    document.getElementById("btnCreerCategorie").addEventListener("click", creerNouvelleCategorie);

    // --- Cartes ---
    document.getElementById("ajoutCarteBtn").addEventListener("click", ajouterCarte);

    // --- Mode d'affichage ---
    document.getElementById("btnModeCategories").addEventListener("click", afficherVueParCategories);
    document.getElementById("btnModeCartes").addEventListener("click", afficherCartes);

    // --- Filtres ---
    document.getElementById("resetFilterBtn").addEventListener("click", reinitialiserFiltre);

    // --- Corbeille ---
    const btnCorbeille = document.getElementById("btnAfficherCorbeille");
    if (btnCorbeille) {
        btnCorbeille.addEventListener("click", afficherCorbeille);
    }

    const btnViderCorbeille = document.getElementById("btnViderCorbeille");
    if (btnViderCorbeille) {
        btnViderCorbeille.addEventListener("click", viderCorbeille);
    }

    const btnFermerCorbeille = document.getElementById("btnFermerCorbeille");
    if (btnFermerCorbeille) {
        btnFermerCorbeille.addEventListener("click", fermerCorbeille);
    }

    console.log('✅ Bee Organized prêt !');
});
