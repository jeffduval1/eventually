// main.js
//test
import { paletteActuelle } from './modules/config.js';
import { appliquerPaletteGlobale } from './modules/palette.js';
import { ouvrirDB, getCategories, ajouterCategorie, deplacerCarteDansCorbeille } from './modules/db/indexedDB.js';
import { afficherCartes, ajouterCarte, getCarteASupprimer } from './modules/cartes.js';
// console.log("📦 ajouterCarte est bien importée :", typeof ajouterCarte);
import { afficherVueParCategories, creerNouvelleCategorie, chargerMenuCategories, afficherGestionCategories, reinitialiserFormulaireNouvelleCategorie } from './modules/categories.js';
import { filtrerParTag, reinitialiserFiltre } from './modules/filters.js';
import {

  initialiserMenuHamburger,
  exporterCartes,
  ouvrirModale,
  ouvrirModaleAjoutCarte,
  fermerModale,
  setupUI
} from './modules/ui.js';
import { afficherCorbeille, restaurerCarte, viderCorbeille, fermerCorbeille  } from './modules/corbeille.js';
import { reinitialiserFormulaireCategorie, preparerModalePourNouvelleCarte } from './modules/ui.js';

window.restaurerCarte = restaurerCarte;
window.viderCorbeille = viderCorbeille;
window.fermerCorbeille = fermerCorbeille;

document.addEventListener('DOMContentLoaded', async () => {
  await ouvrirDB();
  await initialiserDonneesSiVides();
  appliquerPaletteGlobale(paletteActuelle);
  setupUI();
  initialiserMenuHamburger();
  setupUI();

  // Écouteurs globaux
  document.getElementById("btnAfficherFormCategorie")?.addEventListener("click", () => {
    reinitialiserFormulaireCategorie();
    ouvrirModale("modalCategorie");
  });



  document.getElementById("btnGererCategoriesMenu")?.addEventListener("click", () => {
   afficherGestionCategories();
    ouvrirModale("modalGestionCategories");
    const modal = document.getElementById("modalGestionCategories");
    document.getElementById("menuContent").classList.add("hidden");
  });

  document.getElementById("closeGestionModal")?.addEventListener("click", () => {
    fermerModale("modalGestionCategories");
  });

  document.getElementById("closeModal")?.addEventListener("click", () => {
    document.getElementById("modalCategorie").classList.add("hidden");
    reinitialiserFormulaireNouvelleCategorie();
  });
  document.getElementById("btnRetourCategories")?.addEventListener("click", afficherVueParCategories);
  document.getElementById("btnCreerCategorie")?.addEventListener("click", () => {
    // Vérifie si on vient de la modale de création de carte (présence du champ caché)
    const depuisCarte = !!document.getElementById("categorieChoisie");
    creerNouvelleCategorie(depuisCarte);
  });
  

  document.getElementById("btnModeCategories")?.addEventListener("click", afficherVueParCategories);
  // document.getElementById("btnModeCartes")?.addEventListener("click", afficherCartes);
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
    } else {
      menu.classList.add("hidden");
    }
  });
  document.getElementById("btnNouvelleCategorieMenu")?.addEventListener("click", () => {
    fermerMenuHamburger();
    reinitialiserFormulaireCategorie();
    ouvrirModale("modalCategorie");
  });

  document.getElementById("formAjoutCarte")?.addEventListener("submit", (event) => {
    event.preventDefault();
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
    const texte = document.getElementById("texteCategorieCarte");
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
   
  }
});

function fermerMenuHamburger() {
  const menu = document.getElementById("menuContent");
  if (menu) {
    menu.classList.add("hidden");

  }
}
document.getElementById("toggleFormBtn").addEventListener("click", () => {
  preparerModalePourNouvelleCarte();
  chargerMenuCategories(); 
});
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

  chargerMenuCategories();  // ✅ Appel placé au bon moment
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
const boutonOuvrirConfirmation  = document.getElementById('ouvrirConfirmationSuppressionCarteBtn');
const modalConfirmationSuppression = document.getElementById('modalConfirmationSuppression');
const annulerSuppressionCarteBtn = document.getElementById('annulerSuppressionCarteBtn');
const confirmerSuppressionBtn = document.getElementById('confirmerSuppressionBtn');

boutonOuvrirConfirmation ?.addEventListener('click', () => {
  modalConfirmationSuppression.classList.remove('hidden');
});

annulerSuppressionCarteBtn?.addEventListener('click', () => {
  modalConfirmationSuppression.classList.add('hidden');
});

document.getElementById("confirmerSuppressionBtn")?.addEventListener("click", () => {
  const id = getCarteASupprimer();

  if (!id) return;

  // 👇 C’est ICI que tu appelles la bonne fonction
  deplacerCarteDansCorbeille(id).then(() => {
 // ✅ Retirer la carte supprimée de l'interface sans tout recharger
 const carteDOM = document.querySelector(`[data-carte-id="${id}"]`);
 if (carteDOM) carteDOM.remove();
    // 1. Fermer les modales
    document.getElementById("modalConfirmationSuppression")?.classList.add("hidden");
    document.getElementById("modalAjoutCarte")?.classList.add("hidden");

    // 2. Réinitialiser le formulaire
    document.getElementById("formAjoutCarte")?.reset();

    // 3. Vider les champs manuellement
    ["titre", "contenu", "tags"].forEach(id => {
      const champ = document.getElementById(id);
      if (champ) champ.value = "";
    });

  }).catch(error => {
    console.error("❌ Erreur lors de la suppression :", error);
  });
});

