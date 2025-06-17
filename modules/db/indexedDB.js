/**
 * 🗄️ indexedDB.js
 * Gestion de la base de données locale (IndexedDB)
 * - Connexion et ouverture
 * - Lecture / Écriture / Suppression
 * - Export / Import de cartes
 */

let db;
const DB_NAME = "MoteurDeRecherche";
const DB_VERSION = 4;

export async function ouvrirDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = function (event) {
      db = event.target.result;

      if (!db.objectStoreNames.contains("categories")) {
        db.createObjectStore("categories", { keyPath: "nom" });
      }

      if (!db.objectStoreNames.contains("regles")) {
        db.createObjectStore("regles", { keyPath: "id", autoIncrement: true });
      }

      if (!db.objectStoreNames.contains("corbeille")) {
        db.createObjectStore("corbeille", { keyPath: "id" });
      }
    };

    request.onsuccess = function (event) {
      db = event.target.result;
      resolve(db);
    };

    request.onerror = function (event) {
      console.error("❌ Échec d’ouverture IndexedDB :", event.target.error);
      reject(event.target.error);
    };
  });
}
export function importerCategories(fichier) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (event) {
      try {
        const categories = JSON.parse(event.target.result);
        if (!Array.isArray(categories)) throw new Error("Le fichier n’est pas une liste valide de catégories.");

        const transaction = db.transaction("categories", "readwrite");
        const store = transaction.objectStore("categories");

        categories.forEach(categorie => store.put(categorie));
        resolve();
      } catch (e) {
        reject(e);
      }
    };

    reader.onerror = function (e) {
      reject(new Error("Erreur de lecture du fichier."));
    };

    reader.readAsText(fichier);
  });
}
// 🔍 Lecture : catégories
export function getCategories() {
  return lireStore("categories");
}

export function getCategorieByNom(nom, couleur) {
  return lireParCle("categories", nom);
}

// 🔍 Lecture : cartes
export function getCartes() {
  return lireStore("regles");
}

export function getCarteById(id) {
  return lireParCle("regles", id);
}

// ➕ Ajout
export function ajouterCategorie(categorie) {
  return ecrireDansStore("categories", categorie, "add");
}

export function ajouterCarte(carte) {
  return ecrireDansStore("regles", carte, "add");
}

// 🔄 Modification
export function modifierCategorie(categorie) {
  return ecrireDansStore("categories", categorie, "put");
}

export function modifierCarte(carte) {
  console.log("🛠 Mise à jour de la carte ID :", carte.id);
  return ecrireDansStore("regles", carte, "put");
}

// ❌ Suppression
export function supprimerCategorie(nom) {
  return supprimerDansStore("categories", nom);
}

export function supprimerCarte(id) {
  return supprimerDansStore("regles", id);
}

// 📤 Exporter les cartes en JSON téléchargeable
export function exporterCartes() {
  return getCartes().then(cartes => {
    const blob = new Blob([JSON.stringify(cartes, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cartes_backup.json";
    a.click();
    URL.revokeObjectURL(url); // 🧼 Nettoyage de l'URL après téléchargement
  });
}

// 📥 Importer un fichier JSON de cartes
export function importerCartes(fichier) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (event) {
      try {
        const cartes = JSON.parse(event.target.result);
        if (!Array.isArray(cartes)) throw new Error("Le fichier n’est pas une liste valide de cartes.");

        const transaction = db.transaction("regles", "readwrite");
        const store = transaction.objectStore("regles");

        cartes.forEach(carte => store.put(carte));
        resolve();
      } catch (e) {
        reject(e);
      }
    };

    reader.onerror = function (e) {
      reject(new Error("Erreur de lecture du fichier."));
    };

    // ✅ Ajoute cette ligne pour démarrer la lecture
    reader.readAsText(fichier);
  });
}


// 🛠 Fonctions internes génériques
function lireStore(nomStore) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(nomStore, "readonly");
    const store = transaction.objectStore(nomStore);

    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function lireParCle(nomStore, cle) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(nomStore, "readonly");
    const store = transaction.objectStore(nomStore);
    const request = store.get(cle);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function ecrireDansStore(nomStore, objet, methode = "put") {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(nomStore, "readwrite");
    const store = transaction.objectStore(nomStore);
    const request = methode === "add" ? store.add(objet) : store.put(objet);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function supprimerDansStore(nomStore, cle) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(nomStore, "readwrite");
    const store = transaction.objectStore(nomStore);
    const request = store.delete(cle);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
export function deplacerCarteDansCorbeille(id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["regles", "corbeille"], "readwrite");
    const storeCartes = transaction.objectStore("regles");
    const storeCorbeille = transaction.objectStore("corbeille");

    const request = storeCartes.get(id);

    request.onsuccess = function () {
      const carte = request.result;
      if (carte) {
        carte.dateSuppression = Date.now(); // ⏳ Marquer la date de suppression
        storeCorbeille.put(carte);          // 🗑️ Ajouter à la corbeille
        storeCartes.delete(id);             // ❌ Supprimer des cartes
        resolve();
      } else {
        reject(new Error("Carte introuvable"));
      }
    };

    request.onerror = function () {
      reject(request.error);
    };
  });
}

export { db };
