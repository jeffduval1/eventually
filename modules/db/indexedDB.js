/**
 * 🗄️ indexedDB.js
 * Gestion de la base de données locale (IndexedDB)
 * - Connexion et ouverture de la DB
 * - Fonctions de lecture (getAll, getById)
 * - Fonctions d’écriture (add, update, delete)
 * - Utilitaires pour catégories et cartes
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
            console.log("✅ IndexedDB prêt");
            resolve(db);
        };

        request.onerror = function (event) {
            console.error("❌ Échec d'ouverture d'IndexedDB :", event.target.error);
            reject(event.target.error);
        };
    });
}

// 🔎 Obtenir toutes les catégories
export function getCategories() {
    return lireStore("categories");
}

// 🔎 Obtenir une catégorie par nom
export function getCategorieByNom(nom) {
    return lireParCle("categories", nom);
}

// 🔎 Obtenir toutes les cartes
export function getCartes() {
    return lireStore("regles");
}

// 🔎 Obtenir une carte par ID
export function getCarteById(id) {
    return lireParCle("regles", id);
}

// ➕ Ajouter une catégorie
export function ajouterCategorie(categorie) {
    return ecrireDansStore("categories", categorie, "add");
}

// ➕ Ajouter une carte
export function ajouterCarte(carte) {
    return ecrireDansStore("regles", carte, "add");
}

// 🔄 Mettre à jour une catégorie
export function modifierCategorie(categorie) {
    return ecrireDansStore("categories", categorie, "put");
}

// 🔄 Mettre à jour une carte
export function modifierCarte(carte) {
    return ecrireDansStore("regles", carte, "put");
}

// ❌ Supprimer une catégorie
export function supprimerCategorie(nom) {
    return supprimerDansStore("categories", nom);
}

// ❌ Supprimer une carte
export function supprimerCarte(id) {
    return supprimerDansStore("regles", id);
}

// 📦 Exporter toutes les cartes
export function exporterCartes() {
    return getCartes().then(cartes => {
        const blob = new Blob([JSON.stringify(cartes, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "cartes_backup.json";
        a.click();
    });
}

// 📦 Importer des cartes depuis JSON
export function importerCartes(fichier) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            const cartes = JSON.parse(event.target.result);
            const transaction = db.transaction("regles", "readwrite");
            const store = transaction.objectStore("regles");

            cartes.forEach(carte => store.put(carte));
            resolve();
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsText(fichier);
    });
}

// 🔧 Utilitaires internes
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
export { db };