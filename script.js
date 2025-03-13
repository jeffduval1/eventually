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

// ➕ Ajouter OU Modifier une règle
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
        resetForm(); // S'assure que le formulaire est bien réinitialisé après l'ajout
    };
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
                <button onclick="modifierCarte(${carte.id})">Modifier</button>
                <button onclick="supprimerCarte(${carte.id})">Supprimer</button>
            `;
            container.appendChild(div);

            carte.tags.forEach(tag => tagsUniques.add(tag));
        });

        mettreAJourTags([...tagsUniques]);
    };
}
// 📌 Afficher les cartes filtrées
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
            <button onclick="modifierCarte(${carte.id})">Modifier</button>
            <button onclick="supprimerCarte(${carte.id})">Supprimer</button>
        `;
        container.appendChild(div);
    });
}
// 🔎 Filtrer les cartes par tag sélectionné
function filtrerParTag() {
    let tagChoisi = document.getElementById("tagFilter").value.toLowerCase();
    let transaction = db.transaction("regles", "readonly");
    let store = transaction.objectStore("regles");

    let request = store.getAll();
    request.onsuccess = function() {
        let cartes = request.result.filter(carte => carte.tags.includes(tagChoisi));
        afficherCartesFiltres(cartes);
    };
}
// ✏️ Modifier une règle
function modifierCarte(id) {
    let transaction = db.transaction("regles", "readonly");
    let store = transaction.objectStore("regles");

    let request = store.get(id);
    request.onsuccess = function() {
        let carte = request.result;
        document.getElementById("titre").value = carte.titre;
        document.getElementById("tags").value = carte.tags.join(", ");
        document.getElementById("contenu").value = carte.contenu;
        document.getElementById("carte-id").value = carte.id; // Stocke l'ID pour la modification

        document.getElementById("ajouter-modifier").style.display = "none";
        document.getElementById("enregistrer-modification").style.display = "inline-block";
    };
}
function enregistrerModification() {
    let id = Number(document.getElementById("carte-id").value);
    let titre = document.getElementById("titre").value;
    let tags = document.getElementById("tags").value.toLowerCase().split(',').map(tag => tag.trim());
    let contenu = document.getElementById("contenu").value;

    if (!titre || !contenu) {
        alert("Veuillez remplir le titre et le contenu !");
        return;
    }

    let transaction = db.transaction("regles", "readwrite");
    let store = transaction.objectStore("regles");

    let request = store.put({ id, titre, tags, contenu });
    request.onsuccess = function() {
        afficherCartes();
        resetForm();
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

// 📌 Réinitialiser le formulaire après ajout/modification
function resetForm() {
    document.getElementById("carte-id").value = ""; // Réinitialise l'ID
    document.getElementById("titre").value = "";
    document.getElementById("tags").value = "";
    document.getElementById("contenu").value = "";
   // Réafficher "Ajouter" et cacher "Enregistrer modifications"
   document.getElementById("ajouter-modifier").style.display = "inline-block";
   document.getElementById("enregistrer-modification").style.display = "none";
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
