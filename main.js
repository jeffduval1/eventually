// main.js

import { paletteActuelle } from './modules/config.js';
import { appliquerPaletteGlobale } from './modules/palette.js';
import { ouvrirDB, getCategories, ajouterCategorie } from './modules/db/indexedDB.js';
import { afficherCartes, ajouterCarte, supprimerCarteDansCorbeille, getCarteASupprimer } from './modules/cartes.js';
// console.log("📦 ajouterCarte est bien importée :", typeof ajouterCarte);
import { afficherVueParCategories, creerNouvelleCategorie, chargerMenuCategories, afficherGestionCategories } from './modules/categories.js';
import { filtrerParTag, reinitialiserFiltre } from './modules/filters.js';
import {
  afficherCorbeille,
  initialiserMenuHamburger,
  exporterCartes,
  ouvrirModale,
  ouvrirModaleAjoutCarte,
  fermerModale,
  setupUI
} from './modules/ui.js';
import { restaurerCarte, viderCorbeille, fermerCorbeille } from './modules/corbeille.js';
import { reinitialiserFormulaireCategorie } from './modules/ui.js';

window.restaurerCarte = restaurerCarte;
window.viderCorbeille = viderCorbeille;
window.fermerCorbeille = fermerCorbeille;

document.addEventListener('DOMContentLoaded', async () => {
  // console.log('🟢 Initialisation Bee Organized');
  await ouvrirDB();
  await initialiserDonneesSiVides();
  chargerMenuCategories();
  appliquerPaletteGlobale(paletteActuelle);
  afficherVueParCategories();
  initialiserMenuHamburger();
  setupUI();

  // Écouteurs globaux
  document.getElementById("btnAfficherFormCategorie")?.addEventListener("click", () => {
    reinitialiserFormulaireCategorie();
    ouvrirModale("modalCategorie");
  });
  const boutonAjout = document.getElementById("ajoutCarteBtn");
  if (boutonAjout) {
    boutonAjout.addEventListener("click", (event) => {
      event.preventDefault(); // 👈 évite toute propagation inattendue
      ajouterCarte();         // 👈 appelle ta fonction personnalisée
    });
  }


  document.getElementById("btnGererCategoriesMenu")?.addEventListener("click", () => {
    console.log("🟢 Clic détecté : ouverture de la modale de gestion de catégories");
    afficherGestionCategories();
    ouvrirModale("modalGestionCategories");
    console.log("Classes avant suppression :", document.getElementById("modalGestionCategories").classList);
    console.log("Classes après suppression :", document.getElementById("modalGestionCategories").classList);

    const modal = document.getElementById("modalGestionCategories");
    console.log("📌 Affichage modal : ", {
      classList: [...modal.classList],
      display: getComputedStyle(modal).display
    });
    document.getElementById("menuContent").classList.add("hidden");
  });

  document.getElementById("closeGestionModal")?.addEventListener("click", () => {
    fermerModale("modalGestionCategories");
  });

  document.getElementById("closeModal")?.addEventListener("click", () => {
    document.getElementById("modalCategorie").classList.add("hidden");
  });
  document.getElementById("btnRetourCategories")?.addEventListener("click", afficherVueParCategories);
  document.getElementById("btnCreerCategorie")?.addEventListener("click", creerNouvelleCategorie);

  document.getElementById("btnModeCategories")?.addEventListener("click", afficherVueParCategories);
  document.getElementById("btnModeCartes")?.addEventListener("click", afficherCartes);
  document.getElementById("resetFilterBtn")?.addEventListener("click", reinitialiserFiltre);
  document.getElementById("btnAfficherCorbeille")?.addEventListener("click", afficherCorbeille);
  document.getElementById("btnFermerCorbeille")?.addEventListener("click", fermerCorbeille);
  document.getElementById("btnViderCorbeille")?.addEventListener("click", viderCorbeille);
  // Menu hamburger
  document.getElementById("btnHamburger")?.addEventListener("click", () => {
    const menu = document.getElementById("menuContent");
    if (!menu) return;

   
    if (menu.classList.contains("hidden")) {
      menu.classList.remove("hidden");
      console.log("✅ Menu affiché");
    } else {
      menu.classList.add("hidden");
      console.log("✅ Menu caché");
    }
  });
  document.getElementById("btnNouvelleCategorieMenu")?.addEventListener("click", () => {
    fermerMenuHamburger();
    reinitialiserFormulaireCategorie();
    ouvrirModale("modalCategorie");
    console.log("🟢 Modale catégorie affichée");
  });

  document.getElementById("formAjoutCarte")?.addEventListener("submit", (event) => {
    event.preventDefault();
    console.log("✅ Formulaire soumis, appel de ajouterCarte()");
    ajouterCarte();
  });
  document.getElementById("btnExporter")?.addEventListener("click", exporterCartes);

  // 🟢 Ne PAS ré-attacher btnImporter ici — géré dans ui.js

  document.getElementById("btnChangerPalette")?.addEventListener("click", () => {
    const event = new CustomEvent('ouvrirModalePalette');
    window.dispatchEvent(event);
  });

  document.getElementById("btnAPropos")?.addEventListener("click", () => {
    alert("Bee Organized – Version 1.0\nUn outil simple pour structurer vos idées 🐝");
  });
  document.getElementById("btnSupprimerCategorie")?.addEventListener("click", () => {
    document.getElementById("categorieChoisie").value = "";
    document.getElementById("categorieChoisie").dataset.couleur = "";

    const resume = document.getElementById("categorieSelectionnee");
    const texte = document.getElementById("texteCategorie");
    const btn = document.getElementById("btnCategorieOptions");

    if (resume && texte && btn) {
      texte.textContent = "-- Choisir une catégorie --";
      resume.style.backgroundColor = "";
      resume.style.color = "";
      resume.classList.add("hidden");
      btn.textContent = "Choisir une catégorie";
    }
  });

});
document.addEventListener("click", (event) => {
  const menu = document.getElementById("menuContent");
  const bouton = document.getElementById("btnHamburger");

  if (!menu || !bouton) return;

  // Vérifie si le menu est visible
  const isMenuOpen = window.getComputedStyle(menu).display === "block";

  // Si on clique en dehors du menu et du bouton, on le ferme
  if (
    isMenuOpen &&
    !menu.contains(event.target) &&
    !bouton.contains(event.target)
  ) {
    menu.classList.add("hidden");
    console.log("🔒 Menu fermé car clic extérieur");
  }
});
async function initialiserDonneesSiVides() {
  console.log("✅ Données initiales vérifiées – aucune catégorie ajoutée automatiquement");
}
/* // 🔘 Gérer le clic sur "Choisir une catégorie existante"
document.getElementById("btnChoisirExistante")?.addEventListener("click", () => {
  const menu = document.getElementById("listeCategories");
  const modalChoix = document.getElementById("modalChoixCategorie");
  menu?.classList.remove("hidden");
  modalChoix?.classList.add("hidden");
}); */
// 👆 Fermer le menu déroulant des catégories si on clique en dehors
document.addEventListener("click", (event) => {
  const menu = document.getElementById("listeCategories");
  const bouton = document.getElementById("btnChoisirExistante");
  if (!menu || !bouton) return;
  // Si le menu est affiché
  if (
    menu &&
    !menu.classList.contains("hidden")&&
    !menu.contains(event.target) &&
    !bouton.contains(event.target)
  ) {
    menu.classList.add("hidden");
    console.log("🔒 Menu des catégories fermé (clic extérieur)");
  }
});

function fermerMenuHamburger() {
  const menu = document.getElementById("menuContent");
  if (menu) {
    menu.classList.add("hidden");
    console.log("✔️ Menu hamburger fermé");
  }
}
document.getElementById("toggleFormBtn")?.addEventListener("click", ouvrirModaleAjoutCarte);
// 🔀 Gestion du choix de type de catégorie dans la modale d'ajout de carte
document.getElementById("btnCategorieOptions")?.addEventListener("click", () => {
  const zoneChoix = document.getElementById("zoneChoixCategorie");
  if (zoneChoix) zoneChoix.style.display = "block"; // Affiche les 3 options si elles sont cachées
});

// ➕ Choisir une catégorie existante
document.getElementById("choixCategorieExistanteBtn")?.addEventListener("click", () => {
  document.getElementById("listeCategories").classList.remove("hidden");
  document.getElementById("parentCategorie").classList.add("hidden");
  document.getElementById("nouvelleCategorieNom").classList.add("hidden");
  document.getElementById("nouvelleCouleur").classList.add("hidden");
});

// 🧭 Choisir un parent de catégorie
document.getElementById("choixParentCategorieBtn")?.addEventListener("click", () => {
  document.getElementById("parentCategorie").classList.remove("hidden");
  document.getElementById("listeCategories").classList.add("hidden");
  document.getElementById("nouvelleCategorieNom").classList.add("hidden");
  document.getElementById("nouvelleCouleur").classList.add("hidden");
});

// 🆕 Créer une nouvelle catégorie
document.getElementById("creerNouvelleCategorieBtn")?.addEventListener("click", () => {
  document.getElementById("nouvelleCategorieNom").classList.remove("hidden");
  document.getElementById("nouvelleCouleur").classList.remove("hidden");
  document.getElementById("listeCategories").classList.add("hidden");
  document.getElementById("parentCategorie").classList.add("hidden");
});
// Ouvrir la modale de choix au clic sur le bouton
document.getElementById("btnCategorieOptions")?.addEventListener("click", () => {
  document.getElementById("modalChoixTypeCategorie").classList.remove("hidden");
});

// Fermer la modale
document.getElementById("fermerChoixTypeCategorie")?.addEventListener("click", () => {
  document.getElementById("modalChoixTypeCategorie").classList.add("hidden");
});

// Clic en dehors de la modale pour la fermer
document.addEventListener("click", (event) => {
  const modal = document.getElementById("modalChoixTypeCategorie");
  const bouton = document.getElementById("btnCategorieOptions");
  if (!modal || !bouton) return;

  if (!modal.classList.contains("hidden") &&
    !modal.contains(event.target) &&
    !bouton.contains(event.target)) {
    modal.classList.add("hidden");
  }
});

// Actions des trois boutons de choix
document.getElementById("choisirCategorieExistante")?.addEventListener("click", () => {
  document.getElementById("listeCategories").classList.remove("hidden");
  document.getElementById("modalChoixTypeCategorie").classList.add("hidden");
});

document.getElementById("creerNouvelleCategorieCarte")?.addEventListener("click", () => {
  ouvrirModale("modalCategorie");
  document.getElementById("modalChoixTypeCategorie").classList.add("hidden");
});

document.getElementById("choisirCategorieParent")?.addEventListener("click", () => {
  console.log("🧭 Clic sur 'Choisir un parent de catégorie'"); // ← AJOUT TEMPORAIRE
  // Affiche seulement la section du parent
  document.getElementById("parentCategorie").classList.remove("hidden");

  // Cache les autres
  document.getElementById("listeCategories").classList.add("hidden");
  document.getElementById("nouvelleCategorieNom").classList.add("hidden");
  document.getElementById("nouvelleCouleur").classList.add("hidden");

  // Ferme la modale de choix
  document.getElementById("modalChoixTypeCategorie").classList.add("hidden");
});

/* Fermeture de la modale de création de cartes */
document.getElementById("closeAjoutCarteModal")?.addEventListener("click", () => {
  document.getElementById("modalAjoutCarte").classList.add("hidden");
});
const ouvrirConfirmationSuppressionCarteBtn = document.getElementById('ouvrirConfirmationSuppressionCarteBtn');
const modalConfirmationSuppression = document.getElementById('modalConfirmationSuppression');
const annulerSuppressionCarteBtn = document.getElementById('annulerSuppressionCarteBtn');
const confirmerSuppressionCarteBtn = document.getElementById('confirmerSuppressionCarteBtn');

ouvrirConfirmationSuppressionCarteBtn?.addEventListener('click', () => {
  console.log("🟥 Bouton suppression dans modale de carte cliqué");
  modalConfirmationSuppression.classList.remove('hidden');
});

annulerSuppressionCarteBtn?.addEventListener('click', () => {
  console.log("↩️ Annulation suppression");
  modalConfirmationSuppression.classList.add('hidden');
});

confirmerSuppressionCarteBtn?.addEventListener('click', () => {
  const id = getCarteASupprimer?.();
  console.log("✅ Suppression confirmée. ID à supprimer :", id);
  if (id) {
    supprimerCarteDansCorbeille(id);
    modalConfirmationSuppression.classList.add('hidden');
    document.getElementById("modalAjoutCarte").classList.add("hidden");
    afficherCartes();
  } else {
    console.warn("⚠️ Aucun ID de carte à supprimer.");
  }
});
