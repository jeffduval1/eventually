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
    if (!db) {
        console.error("⚠️ IndexedDB n'est pas encore chargé !");
        return;
    }

    let titre = document.getElementById("titre").value;
    let tagsInput = document.getElementById("tags").value;
    let contenu = document.getElementById("contenu").value;

    if (!titre || !contenu) {
        alert("Veuillez remplir le titre et le contenu !");
        return;
    }

    let tags = tagsInput ? tagsInput.toLowerCase().split(',').map(tag => tag.trim()) : [];

    let transaction = db.transaction("regles", "readwrite");
    let store = transaction.objectStore("regles");

    let dateCreation = new Date().toISOString(); // 🔹 Stocke la date en format ISO

    let nouvelleRegle = { titre, tags, contenu, dateCreation };

    let request = store.add(nouvelleRegle);
    request.onsuccess = function() {
        afficherCartes();

        // 🔹 Cacher le formulaire et réafficher le bouton "Créer une nouvelle carte"
        document.getElementById("ajoutCarteContainer").style.display = "none";
        document.getElementById("toggleFormBtn").style.display = "block";

        // 🔹 Réinitialiser les champs
        document.getElementById("titre").value = "";
        document.getElementById("tags").value = "";
        document.getElementById("contenu").value = "";
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
            let dateAffichee = carte.dateCreation ? new Date(carte.dateCreation).toLocaleDateString() : "Date inconnue";

            let div = document.createElement("div");
            div.classList.add("carte");
            div.innerHTML = `
                <div style="display: flex; justify-content: space-between;">
                    <h3>${carte.titre}</h3>
                    <span style="font-size: 12px; color: gray;">${dateAffichee}</span>
                </div>
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
    let container = document.getElementById("tagDropdown");
    if (!container) return;

    container.innerHTML = "";

    tags.forEach(tag => {
        let label = document.createElement("label");

        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = tag;
        checkbox.onchange = mettreAJourEtiquettes;

        label.appendChild(checkbox);
        label.append(` ${tag}`);
        container.appendChild(label);
    });
}

function toggleDropdown() {
    let dropdown = document.getElementById("tagDropdown");
    if (!dropdown) return;

    dropdown.classList.toggle("show");

    // Si le menu est ouvert, on ajoute un écouteur d'événements pour le fermer en cliquant ailleurs
    if (dropdown.classList.contains("show")) {
        document.addEventListener("click", closeDropdownOnClickOutside);
    } else {
        document.removeEventListener("click", closeDropdownOnClickOutside);
    }
}



function ajouterEtiquette() {
    let select = document.getElementById("tagFilter");
    let tagChoisi = select.value.toLowerCase().trim();

    if (!tagChoisi || tagsFiltres.includes(tagChoisi)) return; // Évite les doublons

    tagsFiltres.push(tagChoisi);
    mettreAJourEtiquettes();
    filtrerParTags();
}
let tagsFiltres = []; // Liste des tags sélectionnés
function mettreAJourEtiquettes() {
    let container = document.getElementById("etiquettes-container");
    container.innerHTML = "";

    let checkboxes = document.querySelectorAll("#tagDropdown input:checked");
    tagsFiltres = Array.from(checkboxes).map(checkbox => checkbox.value);

    tagsFiltres.forEach(tag => {
        let badge = document.createElement("span");
        badge.classList.add("etiquette");
        badge.textContent = tag;

        let boutonSupprimer = document.createElement("button");
        boutonSupprimer.textContent = "❌";
        boutonSupprimer.onclick = () => retirerEtiquette(tag);

        badge.appendChild(boutonSupprimer);
        container.appendChild(badge);
    });

    filtrerParTags();

    let resetBtn = document.getElementById("resetFilterBtn");
    if (resetBtn) {
        resetBtn.style.display = tagsFiltres.length > 0 ? "block" : "none";
    }
}
function filtrerParTags() {
    let transaction = db.transaction("regles", "readonly");
    let store = transaction.objectStore("regles");

    let request = store.getAll();
    request.onsuccess = function() {
        let cartes = request.result.filter(carte =>
            tagsFiltres.length === 0 || carte.tags.some(tag => tagsFiltres.includes(tag))
        );

        afficherCartesFiltres(cartes);
    };
}


function retirerEtiquette(tag) {

        let checkboxes = document.querySelectorAll("#tagDropdown input");
        checkboxes.forEach(checkbox => {
            if (checkbox.value === tag) {
                checkbox.checked = false;
            }
        });
    
        mettreAJourEtiquettes();
    }
    
    function reinitialiserFiltre() {
        let checkboxes = document.querySelectorAll("#tagDropdown input");
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    
        tagsFiltres = []; // 🔹 Vide immédiatement la liste des tags sélectionnés
    
        document.getElementById("etiquettes-container").innerHTML = "";
    
        afficherCartes();
    
        let resetBtn = document.getElementById("resetFilterBtn");
        if (resetBtn) {
            resetBtn.style.display = "none";
        }
    }
    function closeDropdownOnClickOutside(event) {
        let dropdown = document.getElementById("tagDropdown");
        let button = document.querySelector(".dropdown-btn"); // Remplace par l'ID de ton bouton si nécessaire
    
        if (dropdown && !dropdown.contains(event.target) && !button.contains(event.target)) {
            dropdown.classList.remove("show");
            document.removeEventListener("click", closeDropdownOnClickOutside);
        }
    }
    function toggleForm() {
        let formContainer = document.getElementById("ajoutCarteContainer");
        let toggleBtn = document.getElementById("toggleFormBtn");
    
        if (formContainer.style.display === "none") {
            formContainer.style.display = "block";
            toggleBtn.style.display = "none"; // Cacher le bouton après ouverture
        }
    }
    