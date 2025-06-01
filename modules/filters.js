/**
 * 🏷️ filters.js
 * Gestion des filtres :
 * - Tri des cartes
 * - Filtrage par tag (simple/multiple)
 * - Recherche par texte
 * - Réinitialisation
 */

import { afficherCartes, afficherCartesFiltres } from './cartes.js';
import { getCartes } from './db/indexedDB.js';

let tagsFiltres = [];
let modeTri = "date-desc";

// 🔽 Changer le tri sélectionné
export function changerTri() {
  const select = document.getElementById("triSelect");
  modeTri = select.value;
  afficherCartes(modeTri);
}

// 🏷️ Filtrage par un tag unique (dropdown)
export function filtrerParTag() {
  const tagChoisi = document.getElementById("tagFilter").value.toLowerCase();

  getCartes().then(cartes => {
    const filtrées = cartes.filter(carte =>
      carte.tags.map(t => t.toLowerCase()).includes(tagChoisi)
    );
    afficherCartesFiltres(filtrées);
  });
}

// 🧩 Filtrage par tags multiples (cases cochées)
export function filtrerParTagsMultiples() {
  getCartes().then(cartes => {
    const filtrées = cartes.filter(carte =>
      tagsFiltres.length === 0 || tagsFiltres.every(tag => carte.tags.includes(tag))
    );
    afficherCartesFiltres(filtrées);
  });
}

// 🔍 Recherche libre dans les tags (champ texte)
export function filtrerCartesParTexte() {
  const recherche = document.getElementById("search").value.toLowerCase();

  getCartes().then(cartes => {
    const filtrées = cartes.filter(carte =>
      carte.tags.some(tag => tag.toLowerCase().includes(recherche))
    );
    afficherCartesFiltres(filtrées);
  });
}

// 🧼 Réinitialisation complète des filtres actifs
export function reinitialiserFiltre() {
  tagsFiltres = [];

  const checkboxes = document.querySelectorAll("#tagDropdown input");
  checkboxes.forEach(cb => cb.checked = false);

  document.getElementById("etiquettes-container").innerHTML = "";
  document.getElementById("resetFilterBtn").classList.add("hidden");

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
