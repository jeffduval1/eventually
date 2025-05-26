// main.js

import { paletteActuelle } from './modules/config.js';
import { appliquerPaletteGlobale } from './modules/palette.js';
import { ouvrirDB, getCategories, ajouterCategorie } from './modules/db/indexedDB.js';
import { afficherCartes, ajouterCarte } from './modules/cartes.js';
// console.log("📦 ajouterCarte est bien importée :", typeof ajouterCarte);
import { afficherVueParCategories, creerNouvelleCategorie, chargerMenuCategories, afficherGestionCategories } from './modules/categories.js';
import { filtrerParTag, reinitialiserFiltre } from './modules/filters.js';
import {
  afficherCorbeille,
  initialiserMenuHamburger,
  exporterCartes,
  ouvrirModale,
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
    document.getElementById("modalCategorie").style.display = "block";
  });

  /* document.getElementById("btnGererCategories")?.addEventListener("click", () => {
    document.getElementById("modalGestionCategories").style.display = "block";
  }); */
  document.getElementById("btnGererCategoriesMenu")?.addEventListener("click", () => {
    console.log("🟢 Clic détecté : ouverture de la modale de gestion de catégories");
    afficherGestionCategories();
    ouvrirModale("modalGestionCategories");
    console.log("Classes avant suppression :", document.getElementById("modalGestionCategories").classList);
document.getElementById("modalGestionCategories").classList.remove("hidden");
console.log("Classes après suppression :", document.getElementById("modalGestionCategories").classList);

    const modal = document.getElementById("modalGestionCategories");
    console.log("📌 Affichage modal : ", {
      classList: [...modal.classList],
      display: getComputedStyle(modal).display
    });
    document.getElementById("menuContent").style.display = "none";
  });
  
  document.getElementById("closeGestionModal")?.addEventListener("click", () => {
    fermerModale("modalGestionCategories");
  });
 
  document.getElementById("closeModal")?.addEventListener("click", () => {
    document.getElementById("modalCategorie").style.display = "none";
  });
  document.getElementById("btnRetourCategories")?.addEventListener("click", afficherVueParCategories);
  document.getElementById("btnCreerCategorie")?.addEventListener("click", creerNouvelleCategorie);
  document.getElementById("ajoutCarteBtn")?.addEventListener("click", ajouterCarte);
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
  
    const current = window.getComputedStyle(menu).display;
    if (current === "none") {
      menu.style.display = "block";
      console.log("✅ Menu affiché");
    } else {
      menu.style.display = "none";
      console.log("✅ Menu caché");
    }
  });
  document.getElementById("btnNouvelleCategorieMenu")?.addEventListener("click", () => {
    fermerMenuHamburger();
    reinitialiserFormulaireCategorie();
    document.getElementById("modalCategorie").style.display = "block";
    console.log("🟢 Modale catégorie affichée");
  });

  document.getElementById("closeGestionModal")?.addEventListener("click", () => {
    document.getElementById("modalGestionCategories").classList.add("hidden");
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
      resume.style.display = "none";
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
    menu.style.display = "none";
    console.log("🔒 Menu fermé car clic extérieur");
  }
});
async function initialiserDonneesSiVides() {
  console.log("✅ Données initiales vérifiées – aucune catégorie ajoutée automatiquement");
}
// 🔘 Gérer le clic sur "Choisir une catégorie existante"
document.getElementById("btnChoisirExistante")?.addEventListener("click", () => {
  const menu = document.getElementById("listeCategories");
  const modalChoix = document.getElementById("modalChoixCategorie");

  if (menu) menu.style.display = "block";      // Affiche le menu déroulant
  if (modalChoix) modalChoix.style.display = "none"; // Cache la modale de choix
});
// 👆 Fermer le menu déroulant des catégories si on clique en dehors
document.addEventListener("click", (event) => {
  const menu = document.getElementById("listeCategories");
  const bouton = document.getElementById("btnChoisirExistante");

  // Si le menu est affiché
  if (
    menu &&
    menu.style.display === "block" &&
    !menu.contains(event.target) &&
    !bouton.contains(event.target)
  ) {
    menu.style.display = "none";
    console.log("🔒 Menu des catégories fermé (clic extérieur)");
  }
});

function fermerMenuHamburger() {
  const menu = document.getElementById("menuContent");
  if (menu) {
    menu.style.display = "none";
    console.log("✔️ Menu hamburger fermé");
  }
}
document.getElementById("toggleFormBtn")?.addEventListener("click", () => {
  console.log("🟡 Clic sur le bouton d’ajout de carte");
  document.getElementById("modalAjoutCarte").style.display = "block";
});
// 🔀 Gestion du choix de type de catégorie dans la modale d'ajout de carte
document.getElementById("btnCategorieOptions")?.addEventListener("click", () => {
  const zoneChoix = document.getElementById("zoneChoixCategorie");
  if (zoneChoix) zoneChoix.style.display = "block"; // Affiche les 3 options si elles sont cachées
});

// ➕ Choisir une catégorie existante
document.getElementById("choixCategorieExistanteBtn")?.addEventListener("click", () => {
  document.getElementById("listeCategories").style.display = "block";
  document.getElementById("parentCategorie").style.display = "none";
  document.getElementById("nouvelleCategorieNom").style.display = "none";
  document.getElementById("nouvelleCouleur").style.display = "none";
});

// 🧭 Choisir un parent de catégorie
document.getElementById("choixParentCategorieBtn")?.addEventListener("click", () => {
  document.getElementById("parentCategorie").style.display = "block";
  document.getElementById("listeCategories").style.display = "none";
  document.getElementById("nouvelleCategorieNom").style.display = "none";
  document.getElementById("nouvelleCouleur").style.display = "none";
});

// 🆕 Créer une nouvelle catégorie
document.getElementById("creerNouvelleCategorieBtn")?.addEventListener("click", () => {
  document.getElementById("nouvelleCategorieNom").style.display = "block";
  document.getElementById("nouvelleCouleur").style.display = "block";
  document.getElementById("listeCategories").style.display = "none";
  document.getElementById("parentCategorie").style.display = "none";
});
// Ouvrir la modale de choix au clic sur le bouton
document.getElementById("btnCategorieOptions")?.addEventListener("click", () => {
  document.getElementById("modalChoixTypeCategorie").style.display = "block";
});

// Fermer la modale
document.getElementById("fermerChoixTypeCategorie")?.addEventListener("click", () => {
  document.getElementById("modalChoixTypeCategorie").style.display = "none";
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
  document.getElementById("listeCategories").style.display = "block";
  document.getElementById("modalChoixTypeCategorie").style.display = "none";
});

document.getElementById("creerNouvelleCategorieCarte")?.addEventListener("click", () => {
  document.getElementById("modalCategorie").style.display = "block";
  document.getElementById("modalChoixTypeCategorie").style.display = "none";
});

document.getElementById("choisirCategorieParent")?.addEventListener("click", () => {
  alert("Fonctionnalité à venir : choix de catégorie parent");
  document.getElementById("modalChoixTypeCategorie").style.display = "none";
});
window.addEventListener("click", (event) => {
  const modale = document.getElementById("modalGestionCategories");
  const contenu = document.querySelector("#modalGestionCategories .modal-content");
  if (
    modale &&
    contenu &&
    !modale.classList.contains("hidden") &&
    !contenu.contains(event.target)
  ) {
    modale.classList.add("hidden");
  }
});
document.getElementById("closeGestionModal")?.addEventListener("click", () => {
  console.log("❌ Clic sur le bouton X de fermeture");
  document.getElementById("modalGestionCategories").classList.add("hidden");
});