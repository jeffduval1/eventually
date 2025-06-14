/**
 * 🗑️ corbeille.js
 * Gestion de la corbeille : affichage, restauration, vidage
 */

import { getTextColor } from './utils/helpers.js';
import { getCartes, getCategorieByNom } from './db/indexedDB.js';
import { db } from './db/indexedDB.js';

export function afficherCorbeille() {
  console.log("la fonction afficher corbeille est appelée");
  const menu = document.getElementById("menuContent");
  if (menu) menu.classList.add("hidden");

  const transaction = db.transaction("corbeille", "readonly");
  const store = transaction.objectStore("corbeille");

  const request = store.getAll();

  request.onsuccess = function () {
    const cartes = request.result;
    cartes.sort((a, b) => new Date(b.dateSuppression) - new Date(a.dateSuppression));

    const container = document.getElementById("cartes-corbeille");
    container.innerHTML = "";

    if (cartes.length === 0) {
      container.innerHTML = "<p>Aucune carte supprimée.</p>";
    } else {
      cartes.forEach(carte => {
        const dateAffichee = carte.dateSuppression
          ? new Date(carte.dateSuppression).toLocaleDateString()
          : "Date inconnue";

        const tagsTxt = Array.isArray(carte.tags) ? carte.tags.join(", ") : "";
        const couleur = carte.couleurCategorie || "#ccc";

        const div = document.createElement("div");
        div.classList.add("carte");
        div.innerHTML = `
          <h3>${carte.titre}</h3>
          <span style="font-size:12px;color:gray;">Supprimée le : ${dateAffichee}</span>
          <p>${carte.contenu}</p>
          <p class="tags">Tags : ${tagsTxt}</p>
          <button class="btn-restaurer" data-id="${carte.id}">Restaurer</button>
        `;
        div.style.borderLeft = `8px solid ${couleur}`;
        container.appendChild(div);
      });

      container.addEventListener("click", e => {
        if (e.target.matches(".btn-restaurer")) {
          const id = Number(e.target.dataset.id);
          restaurerCarte(id);
        }
      });
    }
    const page = document.getElementById("corbeille-page");
    if (page) {
      page.classList.remove("hidden");
      page.style.display = "flex"; // Ou "block", selon ton design
    }
  };
}

export function restaurerCarte(id) {
  const transaction = db.transaction(["regles", "corbeille"], "readwrite");
  const store = transaction.objectStore("regles");
  const trashStore = transaction.objectStore("corbeille");

  const request = trashStore.get(id);
  request.onsuccess = function () {
    const carte = request.result;
    if (carte) {
      delete carte.dateSuppression;
      store.add(carte);
    }

    trashStore.delete(id);
    afficherCorbeille();
  };
}

export function viderCorbeille() {
  const confirmation = confirm("Voulez-vous vraiment supprimer définitivement toutes les cartes ?");
  if (!confirmation) return;

  const transaction = db.transaction("corbeille", "readwrite");
  const store = transaction.objectStore("corbeille");

  store.clear().onsuccess = function () {
    afficherCorbeille();
  };
}

export function fermerCorbeille() {
  document.getElementById("corbeille-page").classList.add("hidden");
}

// Pour rendre accessibles depuis le HTML
window.restaurerCarte = restaurerCarte;
