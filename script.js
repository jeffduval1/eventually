let db;

// 🚀 Ouvrir ou créer la base IndexedDB
const request = indexedDB.open("MoteurDeRecherche", 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    let store = db.createObjectStore("regles", { keyPath: "id", autoIncrement: true });
    store.createIndex("tags", "tags", { multiEntry: true });
};

request.onsuccess = function(event) {
    db = event.target.result;
    afficherCartes(); // Charger les règles au démarrage
};

request.onerror = function() {
    console.error("Erreur d'accès à IndexedDB !");
};

// ➕ Ajouter une règle
function ajouterCarte() {
    let titre = document.getElementById("titre").value;
    let tags = document.getElementById("tags").value.toLowerCase().split(',').map(tag => tag.trim());
    let contenu = document.getElementById("contenu").value;

    if (!titre || !contenu) {
        alert("Veuillez remplir le titre et le contenu !");
        return;
    }

    let transaction = db.transaction("regles", "readwrite");
    let store = transaction.objectStore("regles");

    let nouvelleRegle = { titre, tags, contenu };

    let request = store.add(nouvelleRegle);
    request.onsuccess = function() {
        afficherCartes();
    };

    document.getElementById("titre").value = "";
    document.getElementById("tags").value = "";
    document.getElementById("contenu").value = "";
}

// 📖 Afficher toutes les règles
function afficherCartes() {
    let transaction = db.transaction("regles", "readonly");
    let store = transaction.objectStore("regles");

    let request = store.getAll();
    request.onsuccess = function() {
        let cartes = request.result;
        let container = document.getElementById("cartes-container");
        container.innerHTML = "";

        let tagsUniques = new Set();

        cartes.forEach((carte) => {
            let div = document.createElement("div");
            div.classList.add("carte");
            div.innerHTML = `
                <h3>${carte.titre}</h3>
                <p>${carte.contenu}</p>
                <p class="tags">Tags : ${carte.tags.join(", ")}</p>
                <button onclick="supprimerCarte(${carte.id})">Supprimer</button>
            `;
            container.appendChild(div);

            carte.tags.forEach(tag => tagsUniques.add(tag));
        });

        mettreAJourTags([...tagsUniques]);
    };
}

// 🔎 Filtrer les cartes par tag
function filtrerParTag() {
    let tagChoisi = document.getElementById("tagFilter").value.toLowerCase();
    let transaction = db.transaction("regles", "readonly");
    let store = transaction.objectStore("regles");
    let index = store.index("tags");

    let request = index.getAll(tagChoisi);
    request.onsuccess = function() {
        afficherCartesFiltres(request.result);
    };
}

function afficherCartesFiltres(cartes) {
    let container = document.getElementById("cartes-container");
    container.innerHTML = "";

    cartes.forEach((carte) => {
        let div = document.createElement("div");
        div.classList.add("carte");
        div.innerHTML = `
            <h3>${carte.titre}</h3>
            <p>${carte.contenu}</p>
            <p class="tags">Tags : ${carte.tags.join(", ")}</p>
            <button onclick="supprimerCarte(${carte.id})">Supprimer</button>
        `;
        container.appendChild(div);
    });
}

// 🔍 Filtrer en tapant un tag
function filtrerCartes() {
    let recherche = document.getElementById("search").value.toLowerCase();
    let transaction = db.transaction("regles", "readonly");
    let store = transaction.objectStore("regles");

    let request = store.getAll();
    request.onsuccess = function() {
        let cartes = request.result.filter(carte => 
            carte.tags.some(tag => tag.includes(recherche))
        );
        afficherCartesFiltres(cartes);
    };
}

// ❌ Supprimer une règle
function supprimerCarte(id) {
    let transaction = db.transaction("regles", "readwrite");
    let store = transaction.objectStore("regles");

    let request = store.delete(id);
    request.onsuccess = function() {
        afficherCartes();
    };
}

// 📌 Mettre à jour la liste des tags
function mettreAJourTags(tags) {
    let select = document.getElementById("tagFilter");
    select.innerHTML = '<option value="">-- Filtrer par tag --</option>';

    tags.forEach(tag => {
        let option = document.createElement("option");
        option.value = tag;
        option.textContent = tag;
        select.appendChild(option);
    });
}
