# 🛠️ Rétablissement de l’application – Niveau 0

## 1. Initialisation de l’application
- [ ] `ouvrirDB()` appelée au bon moment
- [ ] Chargement des catégories (`chargerMenuCategories`)
- [ ] Chargement initial des cartes (`afficherCartes` ou `afficherCartesParCategorie`)
- [ ] Affichage de la palette active

## 2. Gestion des catégories
- [ ] Ajout d’une catégorie
- [ ] Choix d’une catégorie (menu + modale)
- [ ] Ajout d’une sous-catégorie avec parent
- [ ] Rendu des catégories (liste + arborescence)
- [ ] Dégradé parent-enfant appliqué
- [ ] Modification (nom / couleur) → MAJ cartes liées
- [ ] Suppression d’une catégorie → MAJ interface

## 3. Gestion des cartes
- [ ] Ajout via modale ou bouton contextuel
- [ ] Lecture correcte des champs
- [ ] Affectation automatique de la catégorie en cours
- [ ] Affichage des cartes avec bon style
- [ ] Modification inline (titre, contenu, tags, couleur, catégorie)
- [ ] Suppression (envoi vers corbeille)
- [ ] Restauration depuis corbeille
- [ ] Vidage complet de la corbeille

## 4. Affichage et interaction
- [ ] Commutation vue cartes / catégories (`changerModeAffichage`)
- [ ] Tri (titre, date)
- [ ] Filtrage par tags
- [ ] Barre de recherche
- [ ] Affichage conditionnel des filtres (si catégorie sélectionnée)

## 5. Palettes de couleurs
- [ ] Boutons de changement fonctionnels
- [ ] Mise à jour couleurs via index dans `paletteActuelle`
- [ ] Affichage des noms via `getNomCouleur`
- [ ] Aperçu 3 couleurs visible

## 6. Import / Export
- [ ] Export JSON de toutes les cartes
- [ ] Import JSON fonctionnel (lecture + injection)

## 7. Menu hamburger
- [ ] Toggle du menu
- [ ] Tous les boutons fonctionnels

## 8. Tests unitaires
- [ ] `tests.js` fonctionnel
- [ ] Tests valides pour `getTextColor`, `rgbToHex`, `getNomCouleur`
- [ ] Possibilité d’ajouter plus de tests

