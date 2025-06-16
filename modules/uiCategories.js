// uiCategorie.js
import { getTextColor } from "./utils/helpers.js";

export function mettreAJourResumeCategorie({ nom, couleur }) {
  const champ    = document.getElementById("categorieChoisie");
  const resume   = document.getElementById("categorieSelectionnee");
  const texte    = document.getElementById("texteCategorieCarte");
  const btnChoix = document.getElementById("btnCategorieOptions");

  // 1) Mettre à jour le champ caché
  champ.value          = nom || "";
  champ.dataset.couleur = couleur || "";

  // 2) Bulle de résumé
  if (nom) {
    resume.classList.remove("hidden");
    resume.style.display        = "flex";
    resume.style.backgroundColor = couleur;
    resume.style.color           = getTextColor(couleur);
    texte.textContent            = nom;
  } else {
    resume.classList.add("hidden");
    texte.textContent = "-- Choisir une catégorie --";
    resume.removeAttribute("style");
  }

  // 3) Libellé du bouton
  btnChoix.textContent = nom ? "Changer de catégorie" : "Choisir une catégorie";
}
