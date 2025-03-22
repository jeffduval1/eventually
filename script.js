let db;
let couleursDisponibles = [
    "#E53935", "#D32F2F", "#FB8C00", "#FDD835", "#FBC02D", "#C0CA33",
    "#43A047", "#2E7D32", "#00ACC1", "#00897B", "#29B6F6", "#1E88E5",
    "#1565C0", "#3949AB", "#5C6BC0", "#AB47BC", "#7B1FA2", "#D81B60",
    "#F06292", "#FF7043", "#A1887F", "#546E7A", "#B0BEC5", "#263238",
    "#FFE082", "#AED581", "#4FC3F7", "#B39DDB", "#8D6E63", "#FFD54F"
];
const nomCouleurs = {
    "#E53935": "Rouge vif",
    "#D32F2F": "Rouge foncé",
    "#FB8C00": "Orange",
    "#FDD835": "Jaune citron",
    "#FBC02D": "Jaune doré",
    "#C0CA33": "Vert lime",
    "#43A047": "Vert",
    "#2E7D32": "Vert foncé",
    "#00ACC1": "Bleu sarcelle",
    "#00897B": "Bleu-vert foncé",
    "#29B6F6": "Bleu clair",
    "#1E88E5": "Bleu moyen",
    "#1565C0": "Bleu foncé",
    "#3949AB": "Indigo",
    "#5C6BC0": "Indigo clair",
    "#AB47BC": "Violet",
    "#7B1FA2": "Violet foncé",
    "#D81B60": "Rose framboise",
    "#F06292": "Rose clair",
    "#FF7043": "Orange saumon",
    "#A1887F": "Brun taupe",
    "#546E7A": "Bleu gris",
    "#B0BEC5": "Gris clair",
    "#263238": "Gris anthracite",
    "#FFE082": "Jaune pastel",
    "#AED581": "Vert pastel",
    "#4FC3F7": "Bleu pastel",
    "#B39DDB": "Lavande",
    "#8D6E63": "Brun chaud",
    "#FFD54F": "Jaune miel"
};
// 🚀 Ouvrir ou créer la base IndexedDB
const request = indexedDB.open("MoteurDeRecherche", 3); // 🔹 Change la version de 1 à 2
let modeTri = "date-desc"; // Mode de tri par défaut


document.addEventListener("DOMContentLoaded", function() {
    function chargerMenuCategories() {
        const menu = document.getElementById("listeCategories");
        const affichage = document.getElementById("categorieSelectionnee");
        const input = document.getElementById("categorieChoisie");
    
        // Nettoyer le menu
        menu.innerHTML = "";
    
        let transaction = db.transaction("categories", "readonly");
        let store = transaction.objectStore("categories");
        let request = store.getAll();
    
        request.onsuccess = function () {
            const categories = request.result;
    
            categories.sort((a, b) => a.nom.localeCompare(b.nom));
            categories.forEach(cat => {
                let div = document.createElement("div");
                div.textContent = cat.nom;
                div.style.backgroundColor = cat.couleur;
                div.style.color = getTextColor(cat.couleur);
    
                div.addEventListener("click", () => {
                    affichage.textContent = cat.nom;
                    affichage.style.backgroundColor = cat.couleur;
                    affichage.style.color = getTextColor(cat.couleur);
                    input.value = cat.nom;
                    input.dataset.couleur = cat.couleur;
                    menu.style.display = "none";
                });
    
                menu.appendChild(div);
            });
        };
    }
    
    // Cliquer sur le champ ouvre/ferme le menu
    document.getElementById("categorieSelectionnee").addEventListener("click", () => {
        const menu = document.getElementById("listeCategories");
        menu.style.display = menu.style.display === "block" ? "none" : "block";
    });
    
     // 🔹 Ouverture de la modale
  document.getElementById("btnAfficherFormCategorie").addEventListener("click", () => {
    genererOptionsCouleursRestantes(); // 🔹 Mise à jour du menu déroulant
    document.getElementById("modalCategorie").style.display = "block";
  });

  // 🔹 Fermeture via le bouton croix
  document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("modalCategorie").style.display = "none";
  });

  // 🔹 Fermeture en cliquant à l'extérieur du contenu
  window.addEventListener("click", function(event) {
    const modal = document.getElementById("modalCategorie");
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
    

    
    window.addEventListener("click", function(event) {
        const modal = document.getElementById("modalCategorie");
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    document.getElementById("btnCreerCategorie").addEventListener("click", creerNouvelleCategorie);
    function genererOptionsCouleurs() {
        const select = document.getElementById("couleurCategorie");
        select.innerHTML = "";
    
        couleursDisponibles.forEach(couleur => {
            const option = document.createElement("option");
            option.value = couleur;
            option.textContent = couleur;
            option.style.backgroundColor = couleur;
            option.style.color = getTextColor(couleur);
            select.appendChild(option);
        });
    }
    
   
    

    let tagFilter = document.getElementById("tagFilter");
    if (tagFilter) {
        tagFilter.addEventListener("change", function() {
            filtrerParTag();
        });
    } else {
        console.error("🔴 Erreur : L'élément 'tagFilter' est introuvable !");
    }
});

request.onupgradeneeded = function(event) {
    db = event.target.result;

    if (!db.objectStoreNames.contains("regles")) {
        let store = db.createObjectStore("regles", { keyPath: "id", autoIncrement: true });
        store.createIndex("tags", "tags", { multiEntry: true });
    }

    if (!db.objectStoreNames.contains("corbeille")) {
        db.createObjectStore("corbeille", { keyPath: "id", autoIncrement: true });
    }

    // 🔹 Le bloc qu’il faut vérifier
    if (!db.objectStoreNames.contains("categories")) {
        let catStore = db.createObjectStore("categories", { keyPath: "nom" });
        catStore.createIndex("nom", "nom", { unique: true });
    }
};


request.onsuccess = function(event) {
    db = event.target.result;
    
    
    chargerCategoriesExistantes(); // 🔹 Ajout de l’appel manquant !
    afficherCartes(); // Charger les règles au démarrage
    genererOptionsCouleursRestantes();
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

    // 🔄 Récupération de la catégorie depuis le champ caché
    const inputCategorie = document.getElementById("categorieChoisie");
    if (!inputCategorie) {
        console.warn("⚠️ Le champ caché de catégorie est introuvable.");
        return;
    }

    let categorie = inputCategorie.value;
    let couleurCategorie = inputCategorie.dataset.couleur || "#ccc";
    let dateCreation = new Date().toISOString();

    let transaction = db.transaction(["regles", "categories"], "readwrite");
    let store = transaction.objectStore("regles");
    let catStore = transaction.objectStore("categories");

    let nouvelleRegle = {
        titre,
        tags,
        contenu,
        dateCreation,
        categorie,
        couleurCategorie
    };

    // Vérifie si la catégorie existe déjà
    let getCategorie = catStore.get(categorie);
    getCategorie.onsuccess = function () {
        if (!getCategorie.result && categorie) {
            let nouvelleCategorie = { nom: categorie, couleur: couleurCategorie };
            catStore.add(nouvelleCategorie);
        }
    };

    let request = store.add(nouvelleRegle);
    request.onsuccess = function () {
        afficherCartes();

        // Réinitialiser les champs
        document.getElementById("titre").value = "";
        document.getElementById("tags").value = "";
        document.getElementById("contenu").value = "";

        document.getElementById("categorieSelectionnee").textContent = "-- Choisir une catégorie --";
        document.getElementById("categorieSelectionnee").style = "";
        inputCategorie.value = "";
        inputCategorie.dataset.couleur = "";

        document.getElementById("ajoutCarteContainer").style.display = "none";
        document.getElementById("toggleFormBtn").style.display = "block";
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
            div.setAttribute("data-id", carte.id);
            div.innerHTML = `            
    <div style="display: flex; justify-content: space-between;">
        <h3>${carte.titre}</h3>
        <span style="font-size: 12px; color: gray;">${dateAffichee}</span>
    </div>
    <div class="badge-categorie" 
         style="background-color:${carte.couleurCategorie || "#ccc"}; 
                color:${getTextColor(carte.couleurCategorie || "#ccc")};
                padding: 4px 8px;
                border-radius: 4px;
                display: inline-block;
                margin: 4px 0;">
        ${carte.categorie || 'Sans catégorie'}
    </div>
    <p>${carte.contenu}</p>
    <p class="tags">Tags : ${carte.tags.join(", ")}</p>
    <button onclick="modifierCarte(${carte.id})">Modifier</button>
    <button onclick="supprimerCarte(${carte.id})">Supprimer</button>
`;

            container.appendChild(div);

            carte.tags.forEach(tag => tagsUniques.add(tag));
            div.style.borderLeft = `8px solid ${carte.couleurCategorie || '#ccc'}`;
           
   

        });

        mettreAJourTags([...tagsUniques]);
    };
}



// 🔎 Filtrer les cartes par tag
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
        let carteDiv = document.querySelector(`.carte[data-id="${id}"]`);

        // Crée un petit formulaire inline
        carteDiv.innerHTML = `
            <input type="text" id="edit-titre-${id}" value="${carte.titre}">
            <input type="text" id="edit-tags-${id}" value="${carte.tags.join(", ")}">
            <input type="text" id="edit-categorie-${id}" value="${carte.categorie || ""}">
            <select id="edit-couleur-${id}">
                ${couleursDisponibles.map(c => 
                    `<option value="${c}" ${carte.couleurCategorie === c ? "selected" : ""} style="background:${c};color:${getTextColor(c)}">${c}</option>`
                ).join("")}
            </select>
            <textarea id="edit-contenu-${id}">${carte.contenu}</textarea>
            <button onclick="enregistrerModificationInline(${id})">Enregistrer</button>
            <button onclick="afficherCartes()">Annuler</button>
        `;
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
            tagsFiltres.length === 0 || tagsFiltres.every(tag => carte.tags.includes(tag))
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
function mettreAJourTags(tags) {
    console.log("Tags mis à jour :", tags); // 🔹 Debugging
    let select = document.getElementById("tagFilter");
    select.innerHTML = ""; // 🔹 Nettoie la liste avant de la recharger

    // Ajoute une option par défaut
    let optionDefaut = document.createElement("option");
    optionDefaut.value = "";
    optionDefaut.textContent = "Sélectionner un tag";
    select.appendChild(optionDefaut);

    // Ajoute chaque tag unique
    tags.forEach(tag => {
        let option = document.createElement("option");
        option.value = tag;
        option.textContent = tag;
        select.appendChild(option);
    });
}
function toggleDropdown() {
    let dropdown = document.getElementById("tagDropdown");

    if (dropdown) {
        dropdown.classList.toggle("show");

        if (dropdown.classList.contains("show")) {
            // Fermer le menu si on clique en dehors
            document.addEventListener("click", closeDropdownOnClickOutside);
        } else {
            document.removeEventListener("click", closeDropdownOnClickOutside);
        }
    } else {
        console.error("🔴 Erreur : L'élément 'tagDropdown' est introuvable !");
    }
}
function enregistrerModificationInline(id) {
    let titre = document.getElementById(`edit-titre-${id}`).value;
    let tagsInput = document.getElementById(`edit-tags-${id}`).value;
    let categorie = document.getElementById(`edit-categorie-${id}`).value;
    let couleurCategorie = document.getElementById(`edit-couleur-${id}`).value;
    let contenu = document.getElementById(`edit-contenu-${id}`).value;

    if (!titre || !contenu) {
        alert("Veuillez remplir le titre et le contenu !");
        return;
    }

    let tags = tagsInput ? tagsInput.toLowerCase().split(',').map(t => t.trim()) : [];

    let transaction = db.transaction(["regles", "categories"], "readwrite");
    let store = transaction.objectStore("regles");
    let catStore = transaction.objectStore("categories");

    let request = store.get(id);
    request.onsuccess = function() {
        let carte = request.result;
        carte.titre = titre;
        carte.tags = tags;
        carte.contenu = contenu;
        carte.categorie = categorie;
        carte.couleurCategorie = couleurCategorie;

        // Enregistre la catégorie si elle est nouvelle
        if (categorie) {
            let catRequest = catStore.get(categorie);
            catRequest.onsuccess = function() {
                if (!catRequest.result) {
                    catStore.add({ nom: categorie, couleur: couleurCategorie });
                }
            };
        }

        store.put(carte).onsuccess = function() {
            afficherCartes(); // Recharge après modification
        };
    };
}
function chargerCategoriesExistantes() {
    let transaction = db.transaction("categories", "readonly");
    let store = transaction.objectStore("categories");
    let request = store.getAll();

    request.onsuccess = function () {
        let categories = request.result;
        const inputCategorie = document.getElementById("categorieChoisie");
        select.innerHTML = "";

        let defaut = document.createElement("option");
        defaut.value = "";
        defaut.textContent = "-- Choisir une catégorie --";
        defaut.style.backgroundColor = "white";
        defaut.style.color = "black";
        select.appendChild(defaut);
        categories.sort((a, b) => a.nom.localeCompare(b.nom));
        categories.forEach(cat => {
            let option = document.createElement("option");
            option.value = cat.nom;
            option.textContent = cat.nom;
            option.dataset.couleur = cat.couleur;
            option.style.backgroundColor = cat.couleur;
            option.style.color = getTextColor(cat.couleur);
            select.appendChild(option);

            // Supprimer la couleur de la liste des couleurs disponibles
            couleursDisponibles = couleursDisponibles.filter(c => c !== cat.couleur);
        });

        // Appliquer immédiatement la couleur au menu s’il y a une sélection
        select.addEventListener("change", function () {
            const selected = this.selectedOptions[0];
            const couleur = selected.dataset.couleur || "#fff";
            this.style.backgroundColor = couleur;
            this.style.color = getTextColor(couleur);
        });
    };
}
function genererOptionsCouleursRestantes() {
    const select = document.getElementById("nouvelleCouleur");
    select.innerHTML = "";

    couleursDisponibles.forEach(couleur => {
        const option = document.createElement("option");
        option.value = couleur;
        option.textContent = getNomCouleur(couleur); // 🔹 Affiche un nom lisible
        option.style.backgroundColor = couleur;
        option.style.color = getTextColor(couleur);
        select.appendChild(option);
    });

    // 🔄 Mettre à jour le style du <select> quand une option est choisie
    select.addEventListener("change", function () {
        const couleur = this.value;
        this.style.backgroundColor = couleur;
        this.style.color = getTextColor(couleur);
    });

    // 🖌️ Appliquer la couleur de la première option sélectionnée
    if (select.value) {
        select.style.backgroundColor = select.value;
        select.style.color = getTextColor(select.value);
    }
}


function getTextColor(hexColor) {
    const r = parseInt(hexColor.substr(1,2), 16);
    const g = parseInt(hexColor.substr(3,2), 16);
    const b = parseInt(hexColor.substr(5,2), 16);
    const luminance = (0.299*r + 0.587*g + 0.114*b) / 255;
    return luminance > 0.6 ? "black" : "white";
}
function getNomCouleur(hex) {
    const noms = {
        "#E53935": "Rouge vif",
        "#D32F2F": "Rouge foncé",
        "#FB8C00": "Orange",
        "#FDD835": "Jaune vif",
        "#FBC02D": "Jaune doré",
        "#C0CA33": "Vert citron",
        "#43A047": "Vert",
        "#2E7D32": "Vert foncé",
        "#00ACC1": "Turquoise",
        "#00897B": "Vert-bleu",
        "#29B6F6": "Bleu ciel",
        "#1E88E5": "Bleu",
        "#1565C0": "Bleu foncé",
        "#3949AB": "Indigo",
        "#5C6BC0": "Lavande",
        "#AB47BC": "Violet",
        "#7B1FA2": "Violet profond",
        "#D81B60": "Rose fuchsia",
        "#F06292": "Rose clair",
        "#FF7043": "Orange saumon",
        "#A1887F": "Brun doux",
        "#546E7A": "Gris-bleu",
        "#B0BEC5": "Gris clair",
        "#263238": "Gris très foncé",
        "#FFE082": "Jaune pâle",
        "#AED581": "Vert doux",
        "#4FC3F7": "Bleu clair",
        "#B39DDB": "Mauve doux",
        "#8D6E63": "Brun",
        "#FFD54F": "Jaune soleil"
    };
    return noms[hex] || hex;
}

function creerNouvelleCategorie() {
    const nomInput = document.getElementById("nouvelleCategorieNom");
    const couleurSelect = document.getElementById("nouvelleCouleur");
    const modal = document.getElementById("modalCategorie");

    if (!nomInput || !couleurSelect || !modal) {
        console.error("❌ Un ou plusieurs éléments du DOM sont introuvables.");
        return;
    }

    const nom = nomInput.value.trim();
    const couleur = couleurSelect.value;

    if (!nom || !couleur) {
        alert("Veuillez nommer la catégorie et choisir une couleur.");
        return;
    }

    let transaction = db.transaction("categories", "readwrite");
    let store = transaction.objectStore("categories");

    let request = store.add({ nom, couleur });

    request.onsuccess = function () {
        couleursDisponibles = couleursDisponibles.filter(c => c !== couleur);
        genererOptionsCouleursRestantes();
        chargerMenuCategories(); // 🔁 Recharge le menu personnalisé

        // Appliquer la catégorie sélectionnée visuellement
        document.getElementById("categorieSelectionnee").textContent = nom;
        document.getElementById("categorieSelectionnee").style.backgroundColor = couleur;
        document.getElementById("categorieSelectionnee").style.color = getTextColor(couleur);

        // Stocker dans le champ caché
        const inputCat = document.getElementById("categorieChoisie");
        inputCat.value = nom;
        inputCat.dataset.couleur = couleur;

        modal.style.display = "none";
        nomInput.value = "";
        couleurSelect.value = "";
    };

    request.onerror = function () {
        alert("Cette catégorie existe déjà.");
    };
}
function chargerMenuCategories() {
    const menu = document.getElementById("listeCategories");
    const affichage = document.getElementById("categorieSelectionnee");
    const input = document.getElementById("categorieChoisie");

    if (!menu || !affichage || !input) {
        console.warn("⚠️ Eléments du menu de catégorie manquants.");
        return;
    }

    menu.innerHTML = "";

    let transaction = db.transaction("categories", "readonly");
    let store = transaction.objectStore("categories");
    let request = store.getAll();

    request.onsuccess = function () {
        const categories = request.result;
        categories.sort((a, b) => a.nom.localeCompare(b.nom));

        categories.forEach(cat => {
            let div = document.createElement("div");
            div.textContent = cat.nom;
            div.style.backgroundColor = cat.couleur;
            div.style.color = getTextColor(cat.couleur);
            div.style.padding = "6px";
            div.style.cursor = "pointer";

            div.addEventListener("click", () => {
                affichage.textContent = cat.nom;
                affichage.style.backgroundColor = cat.couleur;
                affichage.style.color = getTextColor(cat.couleur);
                input.value = cat.nom;
                input.dataset.couleur = cat.couleur;
                menu.style.display = "none";
            });

            menu.appendChild(div);
        });
    };
}
