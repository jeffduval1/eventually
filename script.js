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
    const btnCartes = document.getElementById("btnModeCartes");
const btnCategories = document.getElementById("btnModeCategories");
if (btnCartes) {
    btnCartes.addEventListener("click", () => changerModeAffichage("cartes"));
} else {
    console.warn("❗ Bouton #btnModeCartes non trouvé");
}

if (btnCategories) {
    btnCategories.addEventListener("click", () => changerModeAffichage("categories"));
} else {
    console.warn("❗ Bouton #btnModeCategories non trouvé");
}

    // Cliquer sur le champ ouvre/ferme le menu
    document.getElementById("categorieSelectionnee").addEventListener("click", (e) => {
        e.stopPropagation(); // Empêche que le clic ferme immédiatement le menu
        const menu = document.getElementById("listeCategories");
        const isVisible = menu.style.display === "block";
    
        // Ferme tous les autres menus ouverts, par sécurité
        document.querySelectorAll(".liste-categories").forEach(m => m.style.display = "none");
    
        if (!isVisible) {
            menu.style.display = "block";
    
            // 👂 Ajoute un écouteur une seule fois pour gérer la fermeture
            setTimeout(() => {
                document.addEventListener("click", closeCategoryMenuOnClickOutside, { once: true });
            }, 0);
        } else {
            menu.style.display = "none";
        }
    });

    function closeCategoryMenuOnClickOutside(event) {
        const menu = document.getElementById("listeCategories");
        const bouton = document.getElementById("categorieSelectionnee");
    
        if (!menu.contains(event.target) && !bouton.contains(event.target)) {
            menu.style.display = "none";
        }
    }
    
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
    
    
    
    genererOptionsCouleursRestantes();
    chargerMenuCategories();
    // ✅ Charger l'affichage une fois la base disponible
    changerModeAffichage("categories");
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
    // Réinitialiser les champs
    document.getElementById("titre").value = "";
    document.getElementById("tags").value = "";
    document.getElementById("contenu").value = "";
    document.getElementById("carteId").value = "";

    // Réinitialiser le menu de catégorie
    const affichage = document.getElementById("categorieSelectionnee");
    const inputCat = document.getElementById("categorieChoisie");
    affichage.textContent = "-- Choisir une catégorie --";
    affichage.style = "";
    inputCat.value = "";
    inputCat.dataset.couleur = "";

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
window.toggleForm = function toggleForm() {
    let formContainer = document.getElementById("ajoutCarteContainer");
    let toggleBtn = document.getElementById("toggleFormBtn");
    let annulerBtn = document.getElementById("annulerModifBtn");

    if (formContainer.style.display === "none") {
        formContainer.style.display = "block";
        toggleBtn.style.display = "none";
        annulerBtn.style.display = "inline-block"; // ✅ on l'affiche

        // Charger les catégories dans le menu personnalisé
        chargerMenuCategories();
    }
}


function activerMode(mode) {
    const btnCategories = document.getElementById("btnModeCategories");
    const btnCartes = document.getElementById("btnModeCartes");
    const vueParCategories = document.getElementById("vue-par-categories");
    const cartesContainer = document.getElementById("cartes-container");
  
    if (mode === "categories") {
      btnCategories.classList.add("active");
      btnCartes.classList.remove("active");
      afficherVueParCategories();
    } else {
      btnCartes.classList.add("active");
      btnCategories.classList.remove("active");
      vueParCategories.style.display = "none";
      afficherCartes(); // Affichage normal
    }
  }
document.getElementById("btnModeCategories").addEventListener("click", function() {
    activerMode("categories");
});

document.getElementById("btnModeCartes").addEventListener("click", function() {
    activerMode("cartes");
});
function afficherVueParCategories() {
    const container = document.getElementById("vue-par-categories");
    const cartesContainer = document.getElementById("cartes-container");
  
    container.innerHTML = ""; // Vide le contenu
    container.style.display = "flex";
    cartesContainer.style.display = "none"; // Cache la vue normale
  
    const transaction = db.transaction("categories", "readonly");
    const store = transaction.objectStore("categories");
    const request = store.getAll();
  
    request.onsuccess = function () {
      const categories = request.result;
  
      if (categories.length === 0) {
        container.innerHTML = "<p>Aucune catégorie trouvée.</p>";
        return;
      }
  
      categories.forEach(cat => {
        const div = document.createElement("div");
        div.classList.add("carte-categorie");
        div.style.backgroundColor = cat.couleur;
        div.style.color = getTextColor(cat.couleur);
        div.textContent = cat.nom;
  
        div.addEventListener("click", () => {
          afficherCartesParCategorie(cat.nom);
        });
  
        container.appendChild(div);
      });
    };
  }
  function afficherCartesParCategorie(nomCategorie) {
    const cartesContainer = document.getElementById("cartes-container");
    const vueCategories = document.getElementById("vue-par-categories");

    cartesContainer.innerHTML = "";
    cartesContainer.style.display = "block";
    vueCategories.style.display = "none";
    document.getElementById("btnRetourCategories").style.display = "block";
    const transaction = db.transaction("regles", "readonly");
    const store = transaction.objectStore("regles");
    const request = store.getAll();

    request.onsuccess = function () {
        const toutesLesCartes = request.result;

        const cartesFiltrees = toutesLesCartes.filter(carte =>
            carte.categorie && carte.categorie.toLowerCase() === nomCategorie.toLowerCase()
        );

        if (cartesFiltrees.length === 0) {
            cartesContainer.innerHTML = `<p>Aucune carte trouvée pour la catégorie "${nomCategorie}".</p>`;
        } else {
            afficherCartesFiltres(cartesFiltrees);
        }
    };

    request.onerror = function () {
        console.error("Erreur lors du chargement des cartes !");
        cartesContainer.innerHTML = "<p>Erreur lors de l'affichage des cartes.</p>";
    };
}
function changerModeAffichage(mode) {
    const btnCartes = document.getElementById("btnModeCartes");
const btnCategories = document.getElementById("btnModeCategories");
    const vueCategories = document.getElementById("vue-par-categories");
    const cartesContainer = document.getElementById("cartes-container");
    const btnRetour = document.getElementById("btnRetourCategories");

    if (mode === "cartes") {
        document.getElementById("cartes-container").style.display = "block";
        // document.getElementById("categories-container").style.display = "none";
        btnCartes.classList.add("actif");
        btnCategories.classList.remove("actif");
        afficherCartes(); // 🔥 Important

        // Mise à jour des styles boutons
        btnCartes.classList.add("actif");
        btnCategories.classList.remove("actif");
    } else if (mode === "categories") {
        cartesContainer.style.display = "none";
        vueCategories.style.display = "flex";
        btnRetour.style.display = "none";

        btnCartes.classList.remove("actif");
        btnCategories.classList.add("actif");

        // ✅ Recharge les catégories visuellement
        afficherVueParCategories();
    }
}
