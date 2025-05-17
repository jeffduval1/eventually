/**
 * 🏷️ filters.js
 * Gestion des filtres :
 * - Tri des cartes (par date ou titre)
 * - Filtrage par tag simple ou multiple
 * - Filtrage par recherche texte
 * - Réinitialisation des filtres
 */

import { afficherCartes, afficherCartesFiltres } from './cartes.js';

let tagsFiltres = [];
let modeTri = "date-desc"; // Valeur initiale du tri

// 🔽 Changer le tri sélectionné
export function changerTri() {
  const select = document.getElementById("triSelect");
  modeTri = select.value;
  afficherCartes(modeTri);
}

// 🏷️ Filtrage par un tag unique (dropdown)
export function filtrerParTag() {
  const tagChoisi = document.getElementById("tagFilter").value.toLowerCase();
  const transaction = window.db.transaction("regles", "readonly");
  const store = transaction.objectStore("regles");

  store.getAll().onsuccess = function (event) {
    const cartes = event.target.result.filter(carte =>
      carte.tags.map(t => t.toLowerCase()).includes(tagChoisi)
    );
    afficherCartesFiltres(cartes);
  };
}

// 🧩 Filtrage par tags multiples (cases cochées)
export function filtrerParTagsMultiples() {
  const transaction = window.db.transaction("regles", "readonly");
  const store = transaction.objectStore("regles");

  store.getAll().onsuccess = function (event) {
    const cartes = event.target.result.filter(carte =>
      tagsFiltres.length === 0 || tagsFiltres.every(tag => carte.tags.includes(tag))
    );
    afficherCartesFiltres(cartes);
  };
}

// 🔍 Recherche libre dans les tags (champ texte)
export function filtrerCartesParTexte() {
  const recherche = document.getElementById("search").value.toLowerCase();
  const transaction = window.db.transaction("regles", "readonly");
  const store = transaction.objectStore("regles");

  store.getAll().onsuccess = function (event) {
    const cartes = event.target.result.filter(carte =>
      carte.tags.some(tag => tag.toLowerCase().includes(recherche))
    );
    afficherCartesFiltres(cartes);
  };
}

// 🧼 Réinitialisation complète des filtres actifs
export function reinitialiserFiltre() {
  tagsFiltres = [];

  // Réinitialiser les cases à cocher dans le menu déroulant
  const checkboxes = document.querySelectorAll("#tagDropdown input");
  checkboxes.forEach(cb => cb.checked = false);

  // Vider les badges d’étiquettes sélectionnées
  document.getElementById("etiquettes-container").innerHTML = "";

  // Cacher le bouton "Réinitialiser"
  document.getElementById("resetFilterBtn").style.display = "none";

  // Réafficher toutes les cartes avec le tri actif
  afficherCartes(modeTri);
}

// 🏷️ Afficher les étiquettes sélectionnées sous forme de badges
export function mettreAJourEtiquettes() {
  const container = document.getElementById("etiquettes-container");
  container.innerHTML = "";

  const checkboxes = document.querySelectorAll("#tagDropdown input:checked");
  tagsFiltres = Array.from(checkboxes).map(cb => cb.value);

  tagsFiltres.forEach(tag => {
    const badge = document.createElement("span");
    badge.classList.add("etiquette");
    badge.textContent = tag;

    const btnSupprimer = document.createElement("button");
    btnSupprimer.textContent = "❌";
    btnSupprimer.setAttribute("aria-label", `Retirer le tag ${tag}`);
    btnSupprimer.addEventListener("click", () => retirerEtiquette(tag));

    badge.appendChild(btnSupprimer);
    container.appendChild(badge);
  });

  filtrerParTagsMultiples();

  // Afficher ou non le bouton "Réinitialiser"
  const resetBtn = document.getElementById("resetFilterBtn");
  resetBtn.style.display = tagsFiltres.length > 0 ? "block" : "none";
}

// ➖ Retirer une étiquette cliquée
function retirerEtiquette(tag) {
  const checkboxes = document.querySelectorAll("#tagDropdown input");
  checkboxes.forEach(cb => {
    if (cb.value === tag) cb.checked = false;
  });

  mettreAJourEtiquettes();
}
