/**
 * 🗄️ indexedDB.js
 * Gestion de la base de données locale (IndexedDB)
 * - Connexion et ouverture de la DB
 * - Fonctions de lecture (getAll, getById)
 * - Fonctions d’écriture (add, update, delete)
 * - Utilitaires pour catégories et cartes
 */

let db = null;
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
            window.db = db; // Pour accès global simplifié
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
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("categories", "readonly");
        const store = transaction.objectStore("categories");

        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// 🔎 Obtenir une catégorie par nom
export function getCategorieByNom(nom) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("categories", "readonly");
        const store = transaction.objectStore("categories");

        const request = store.get(nom);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// 🔎 Obtenir toutes les cartes
export function getCartes() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("regles", "readonly");
        const store = transaction.objectStore("regles");

        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// 🔎 Obtenir une carte par ID
export function getCarteById(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("regles", "readonly");
        const store = transaction.objectStore("regles");

        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// ➕ Ajouter une catégorie
export function ajouterCategorie(categorie) {
    const transaction = db.transaction("categories", "readwrite");
    const store = transaction.objectStore("categories");

    const request = store.add(categorie);
    request.onerror = (e) => console.error("❌ Ajout catégorie échoué", e);
}

// ➕ Ajouter une carte
export function ajouterCarte(carte) {
    const transaction = db.transaction("regles", "readwrite");
    const store = transaction.objectStore("regles");

    const request = store.add(carte);
    request.onerror = (e) => console.error("❌ Ajout carte échoué", e);
}

// 🔄 Mettre à jour une catégorie
export function modifierCategorie(categorie) {
    const transaction = db.transaction("categories", "readwrite");
    const store = transaction.objectStore("categories");

    store.put(categorie);
}

// 🔄 Mettre à jour une carte
export function modifierCarte(carte) {
    const transaction = db.transaction("regles", "readwrite");
    const store = transaction.objectStore("regles");

    store.put(carte);
}

// ❌ Supprimer une catégorie
export function supprimerCategorie(nom) {
    const transaction = db.transaction("categories", "readwrite");
    const store = transaction.objectStore("categories");

    store.delete(nom);
}

// ❌ Supprimer une carte
export function supprimerCarte(id) {
    const transaction = db.transaction("regles", "readwrite");
    const store = transaction.objectStore("regles");

    store.delete(id);
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
