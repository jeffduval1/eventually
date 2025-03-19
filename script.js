let db;

// 🚀 Ouvrir ou créer la base IndexedDB
const request = indexedDB.open("MoteurDeRecherche", 2); // 🔹 Change la version de 1 à 2
let modeTri = "date-desc"; // Mode de tri par défaut


request.onupgradeneeded = function(event) {
    db = event.target.result;
    
    // 📌 Vérifier si l’objectStore "regles" existe déjà
    if (!db.objectStoreNames.contains("regles")) {
        let store = db.createObjectStore("regles", { keyPath: "id", autoIncrement: true });
        store.createIndex("tags", "tags", { multiEntry: true });
    }

    // 📌 Nouvelle objectStore pour la corbeille
    if (!db.objectStoreNames.contains("corbeille")) {
        let trashStore = db.createObjectStore("corbeille", { keyPath: "id", autoIncrement: true });
    }
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

        // 🎯 Appliquer le tri selon le mode choisi
        cartes.sort((a, b) => {
            let dateA = new Date(a.dateCreation).getTime();
            let dateB = new Date(b.dateCreation).getTime();
            let titreA = a.titre.toLowerCase();
            let titreB = b.titre.toLowerCase();

            switch (modeTri) {
                case "date-desc":
                    return dateB - dateA; // Plus récent en premier
                case "date-asc":
                    return dateA - dateB; // Plus ancien en premier
                case "titre-asc":
                    return titreA.localeCompare(titreB); // A → Z
                case "titre-desc":
                    return titreB.localeCompare(titreA); // Z → A
                default:
                    return dateB - dateA; // Par défaut, du plus récent au plus ancien
            }
        });

        let container = document.getElementById("cartes-container");
        container.innerHTML = "";

        let tagsUniques = new Set();

        cartes.forEach((carte) => {
            let dateAffichee = carte.dateCreation 
                ? new Date(carte.dateCreation).toLocaleDateString() 
                : "Date inconnue";

            let div = document.createElement("div");
            div.classList.add("carte");
            div.innerHTML = `
                <div style="display: flex; justify-content: space-between;">
                    <h3>${carte.titre}</h3>
                    <span style="font-size: 12px; color: gray;">${dateAffichee}</span>
                </div>
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
        let dateAffichee = carte.dateCreation 
            ? new Date(carte.dateCreation).toLocaleDateString() 
            : "Date inconnue"; // ✅ Définition correcte

        let div = document.createElement("div");
        div.classList.add("carte");
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between;">
                <h3>${carte.titre}</h3>
                <span style="font-size: 12px; color: gray;">${dateAffichee}</span>
            </div>
            <p>${carte.contenu}</p>
            <p class="tags">Tags : ${carte.tags.join(", ")}</p>
            <button onclick="modifierCarte(${carte.id})">Modifier</button>
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
function modifierCarte(id) {
    let transaction = db.transaction("regles", "readonly");
    let store = transaction.objectStore("regles");

    let request = store.get(id);
    request.onsuccess = function() {
        let carte = request.result;

        // Remplir le formulaire avec les valeurs actuelles
        document.getElementById("titre").value = carte.titre;
        document.getElementById("tags").value = carte.tags.join(", ");
        document.getElementById("contenu").value = carte.contenu;

        // Stocker l'ID pour la mise à jour
        document.getElementById("carteId").value = carte.id;

        // Afficher le formulaire
        document.getElementById("ajoutCarteContainer").style.display = "block";
        document.getElementById("toggleFormBtn").style.display = "none";

        // Modifier le bouton d'ajout pour qu'il mette à jour au lieu d'ajouter
        let bouton = document.getElementById("ajoutCarteBtn");
        bouton.textContent = "Enregistrer les informations";
        bouton.onclick = enregistrerModification;

        // Afficher le bouton "Annuler"
        document.getElementById("annulerModifBtn").style.display = "inline-block";
    };
}
function enregistrerModification() {
    let id = parseInt(document.getElementById("carteId").value);
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

    let request = store.get(id);
    request.onsuccess = function() {
        let carte = request.result;
        carte.titre = titre;
        carte.tags = tags;
        carte.contenu = contenu;

        let updateRequest = store.put(carte);
        updateRequest.onsuccess = function() {
            afficherCartes();
            annulerModification(); // Réinitialiser le formulaire après modification
        };
    };
}
function annulerModification() {
    // Réinitialiser les champs du formulaire
    document.getElementById("titre").value = "";
    document.getElementById("tags").value = "";
    document.getElementById("contenu").value = "";
    document.getElementById("carteId").value = "";

    // Remettre le bouton à "Ajouter"
    let bouton = document.getElementById("ajoutCarteBtn");
    bouton.textContent = "Ajouter";
    bouton.onclick = ajouterCarte;

    // Cacher le formulaire et réafficher le bouton principal
    document.getElementById("ajoutCarteContainer").style.display = "none";
    document.getElementById("toggleFormBtn").style.display = "block";

    // Cacher le bouton "Annuler"
    document.getElementById("annulerModifBtn").style.display = "none";
}

// ❌ Supprimer une règle
function supprimerCarte(id) {
    let transaction = db.transaction(["regles", "corbeille"], "readwrite");
    let store = transaction.objectStore("regles");
    let trashStore = transaction.objectStore("corbeille");

    let request = store.get(id);
    request.onsuccess = function() {
        let carte = request.result;
        if (carte) {
            carte.dateSuppression = new Date().toISOString(); // 🔹 Ajoute la date de suppression
            trashStore.add(carte); // Déplace dans la corbeille
        }

        store.delete(id); // Supprime de la base active
        afficherCartes(); // Met à jour l'affichage
    };
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
    // 🚀 Exporter les cartes en JSON
function exporterCartes() {
    let transaction = db.transaction("regles", "readonly");
    let store = transaction.objectStore("regles");

    let request = store.getAll();
    request.onsuccess = function() {
        let cartes = request.result;
        let blob = new Blob([JSON.stringify(cartes, null, 2)], { type: "application/json" });

        let a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "cartes_backup.json";
        a.click();
    };
}

// 🚀 Importer des cartes depuis un fichier JSON
function importerCartes() {
    document.getElementById("importFile").click();
}

// 🚀 Charger un fichier et ajouter les cartes dans IndexedDB
function chargerFichierImport() {
    let file = document.getElementById("importFile").files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = function(event) {
        let cartes = JSON.parse(event.target.result);
        
        let transaction = db.transaction("regles", "readwrite");
        let store = transaction.objectStore("regles");

        cartes.forEach(carte => {
            store.put(carte);
        });

        afficherCartes(); // Met à jour l'affichage après l'import
    };
    reader.readAsText(file);
}
function changerTri() {
    let select = document.getElementById("triSelect");
    modeTri = select.value; // Récupère la valeur sélectionnée
    afficherCartes(); // Recharge les cartes avec le nouvel ordre
}
function afficherCorbeille() {
    let transaction = db.transaction("corbeille", "readonly");
    let store = transaction.objectStore("corbeille");

    let request = store.getAll();
    request.onsuccess = function() {
        let cartes = request.result;

        // 🔽 Tri des cartes du plus récent au plus ancien
        cartes.sort((a, b) => new Date(b.dateSuppression) - new Date(a.dateSuppression));

        let container = document.getElementById("cartes-corbeille");
        container.innerHTML = ""; // Nettoyer l'affichage précédent

        if (cartes.length === 0) {
            container.innerHTML = "<p>Aucune carte supprimée.</p>";
        } else {
            cartes.forEach((carte) => {
                let dateAffichee = carte.dateSuppression
                    ? new Date(carte.dateSuppression).toLocaleDateString()
                    : "Date inconnue";

                let div = document.createElement("div");
                div.classList.add("carte");
                div.innerHTML = `
                    <h3>${carte.titre}</h3>
                    <span style="font-size: 12px; color: gray;">Supprimé le : ${dateAffichee}</span>
                    <p>${carte.contenu}</p>
                    <p class="tags">Tags : ${carte.tags.join(", ")}</p>
                    <button onclick="restaurerCarte(${carte.id})">Restaurer</button>
                `;
                container.appendChild(div);
            });
        }

        // 🌟 Afficher la page en plein écran
        document.getElementById("corbeille-page").style.display = "flex";
    };
}
function restaurerCarte(id) {
    let transaction = db.transaction(["regles", "corbeille"], "readwrite");
    let store = transaction.objectStore("regles");
    let trashStore = transaction.objectStore("corbeille");

    let request = trashStore.get(id);
    request.onsuccess = function() {
        let carte = request.result;
        if (carte) {
            delete carte.dateSuppression; // 🔹 Retirer la date de suppression
            store.add(carte); // Ajouter à la base principale
        }

        trashStore.delete(id); // Supprimer de la corbeille
        afficherCorbeille(); // Mettre à jour l'affichage de la corbeille
        afficherCartes(); // Mettre à jour les cartes actives
    };
}
function viderCorbeille() {
    let confirmation = confirm("Voulez-vous vraiment supprimer définitivement toutes les cartes ?");
    if (!confirmation) return;

    let transaction = db.transaction("corbeille", "readwrite");
    let store = transaction.objectStore("corbeille");

    let request = store.clear(); // Supprime tout
    request.onsuccess = function() {
        afficherCorbeille(); // Met à jour l'affichage
    };
}
function fermerCorbeille() {
    document.getElementById("corbeille-page").style.display = "none";
}
