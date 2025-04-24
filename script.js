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
const request = indexedDB.open("MoteurDeRecherche", 4);
let modeTri = "date-desc"; // Mode de tri par défaut
function toggleForm() {
    let modal = document.getElementById("modalAjoutCarte");
    let closeModalBtn = document.getElementById("closeModalAjoutCarte");

    if (!modal) {
        console.error("❌ La modale d'ajout de carte n'a pas été trouvée.");
        return;
    }

    modal.style.display = "block";

    // ✅ Charger les catégories disponibles comme parents
    chargerParentsDisponibles(); 

    closeModalBtn.onclick = function() {
        modal.style.display = "none";
    };

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };
}

document.addEventListener("DOMContentLoaded", function() {
    // ▶ 1. Choisir une catégorie existante
    
document.getElementById("btnChoisirExistante").addEventListener("click", () => {
    document.getElementById("modalChoixCategorie").style.display = "none";

     // Activer le div personnalisé
     const zone = document.getElementById("categorieSelectionnee");
     if (zone) {
         zone.style.display = "block"; // 👈 on le rend visible
         zone.click(); // 👈 on peut simuler un clic si souhaité
     }
 
     // Cacher le champ parent si visible
     document.getElementById("choixParentContainer").style.display = "none";
 });

// ▶ 2. Choisir un parent dans l’arborescence
document.getElementById("btnChoisirParent").addEventListener("click", () => {
    document.getElementById("modalChoixCategorie").style.display = "none";

    // Affiche le champ de choix de parent
    document.getElementById("choixParentContainer").style.display = "block";

    // Réinitialise la sélection de catégorie existante
    const affichage = document.getElementById("categorieSelectionnee");
    const input = document.getElementById("categorieChoisie");

    affichage.textContent = "-- Choisir une catégorie --";
    affichage.style.backgroundColor = "";
    affichage.style.color = "";
    affichage.style.display = "none"; // 👈 Cache complètement le champ
    affichage.style.pointerEvents = "auto";

    input.value = "";
    input.dataset.couleur = "";

    const parentSelect = document.getElementById("parentDirect");
    if (parentSelect) parentSelect.focus();
});

// ▶ 3. Créer une nouvelle catégorie
document.getElementById("btnNouvelleCategorie").addEventListener("click", () => {
    document.getElementById("modalChoixCategorie").style.display = "none";

    // Simule un clic sur le bouton qui ouvre la modale de création de catégorie
    const btn = document.getElementById("btnAfficherFormCategorie");
    if (btn) btn.click();
});
    document.getElementById("btnGererCategories").addEventListener("click", () => {
        document.getElementById("modalGestionCategories").style.display = "block";
        afficherListeGestionCategories();
    });
    
    document.getElementById("closeGestionModal").addEventListener("click", () => {
        document.getElementById("modalGestionCategories").style.display = "none";
    
        // 🔁 Rafraîchir la vue actuelle (catégories ou cartes)
        const boutonActif = document.querySelector(".mode-toggle .active");
        if (boutonActif?.id === "btnModeCategories") {
            afficherVueParCategories();
        } else {
            afficherCartes();
        }
    });
    document.getElementById("btnCategorieOptions").addEventListener("click", () => {
        const parentSelect = document.getElementById("parentDirect");
        document.getElementById("modalChoixCategorie").style.display = "block";
        document.getElementById("closeModalChoixCategorie").addEventListener("click", () => {
            document.getElementById("modalChoixCategorie").style.display = "none";
        });
    
        // 🧼 Réinitialiser le choix de parent
        const parentContainer = document.getElementById("choixParentContainer");
        if (parentContainer) parentContainer.style.display = "none";
    
        parentSelect.value = "";
      
 
     const categorieAffichage = document.getElementById("categorieSelectionnee");
     if (categorieAffichage) {
         categorieAffichage.textContent = "-- Choisir une catégorie --";
         categorieAffichage.style.backgroundColor = "";
         categorieAffichage.style.color = "";
         categorieAffichage.style.pointerEvents = "auto";
     }
 
     const inputCategorie = document.getElementById("categorieChoisie");
     if (inputCategorie) {
         inputCategorie.value = "";
         inputCategorie.dataset.couleur = "";
     }
        // Si un parent est sélectionné, on désactive les deux premiers boutons
       
        const parentNom = parentSelect ? parentSelect.value : "";
        const existante = document.getElementById("btnChoisirExistante");
        const parent = document.getElementById("btnChoisirParent");
        const creer = document.getElementById("btnNouvelleCategorie");
    
        if (parentNom) {
            existante.disabled = true;
            parent.disabled = true;
            creer.disabled = true;
    
            // Ajoute une info-bulle explicative au survol
            [existante, parent, creer].forEach(btn => {
                btn.title = "Désactivé si un parent est sélectionné";
            });
        } else {
            existante.disabled = false;
            parent.disabled = false;
            creer.disabled = false;
            [existante, parent, creer].forEach(btn => (btn.title = ""));
        }
    });
    
   
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
             // Recharger la page pour afficher la nouvelle catégorie

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
    let store = event.target.transaction.objectStore("categories");

    // Vérification si le champ "parent" est déjà présent
    store.openCursor().onsuccess = function(event) {
        let cursor = event.target.result;
        if (cursor) {
            let value = cursor.value;
            if (!("parent" in value)) {
                value.parent = null;
                cursor.update(value);
            }
            cursor.continue();
        }
    };
};

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
request.onsuccess = function(event) {
    db = event.target.result;
    
    
    
    genererOptionsCouleursRestantes();
    chargerMenuCategories();
    // ✅ Charger l'affichage une fois la base disponible
    changerModeAffichage("categories", true);
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

    // 🔎 Récupération des champs
    const inputCategorie = document.getElementById("categorieChoisie");
    const parentSelectionne = document.getElementById("parentDirect") ? document.getElementById("parentDirect").value : null;

    let categorie = inputCategorie.value;
    let couleurCategorie = inputCategorie.dataset.couleur || "#ccc";

    // ⚡ Prioriser la catégorie du parent s'il est sélectionné
    if (parentSelectionne) {
        let transaction = db.transaction("categories", "readonly");
        let store = transaction.objectStore("categories");

        let request = store.get(parentSelectionne);
        request.onsuccess = function () {
            const parentCategorie = request.result;

            if (parentCategorie) {
                console.log(`✅ Parent trouvé : ${parentCategorie.nom}`);
                categorie = parentCategorie.nom;
                couleurCategorie = parentCategorie.couleur;
            }

            // 📦 Enregistrement de la carte
            enregistrerCarte(titre, tags, contenu, categorie, couleurCategorie, parentSelectionne);
        };
        request.onerror = function () {
            console.error("❌ Erreur lors de la récupération du parent.");
        };
    } else {
        // 📦 Enregistrement sans parent
        enregistrerCarte(titre, tags, contenu, categorie, couleurCategorie, null);
    }
}

function enregistrerCarte(titre, tags, contenu, categorie, couleurCategorie, parent) {
    const transaction = db.transaction(["regles"], "readwrite");
    const store = transaction.objectStore("regles");

    const nouvelleRegle = {
        titre,
        tags,
        contenu,
        dateCreation: new Date().toISOString(),
        categorie,
        couleurCategorie,
        parent
    };

    const request = store.add(nouvelleRegle);
request.onsuccess = function () {
    console.log("🎉 Carte ajoutée avec succès !");
    afficherCartes();
    resetFormulaire();

    // 🔽 Fermeture animée de la modale
    const modal = document.getElementById("modalAjoutCarte");
    modal.classList.add("fade-out");

    setTimeout(() => {
        modal.style.display = "none";
        modal.classList.remove("fade-out");
    }, 300); // Durée identique à la transition CSS
};
    request.onerror = function () {
        console.error("❌ Une erreur s'est produite lors de l'ajout de la carte.");
    };
}

function resetFormulaire() {
    document.getElementById("titre").value = "";
    document.getElementById("tags").value = "";
    document.getElementById("contenu").value = "";

    // Réinitialisation des sélections
    const affichage = document.getElementById("categorieSelectionnee");
    const inputCategorie = document.getElementById("categorieChoisie");
    affichage.textContent = "-- Choisir une catégorie --";
    affichage.style = "";
    inputCategorie.value = "";
    inputCategorie.dataset.couleur = "";

    const parentField = document.getElementById("parentDirect");
    if (parentField) {
        parentField.value = ""; // Réinitialiser le parent s'il existe
    }
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
     // Ferme le menu hamburger s'il est ouvert
     const menu = document.getElementById("menuContent");
     menu.style.display = "none";
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
    const selectParent = document.getElementById("parentCategorie");
    select.innerHTML = "";
    selectParent.innerHTML = '<option value="">Aucune (niveau racine)</option>'; // option par défaut

    couleursDisponibles.forEach(couleur => {
        const option = document.createElement("option");
        option.value = couleur;
        option.textContent = getNomCouleur(couleur);
        option.style.backgroundColor = couleur;
        option.style.color = getTextColor(couleur);
        select.appendChild(option);
    });

    // Remplir les options de parent
    let transaction = db.transaction("categories", "readonly");
    let store = transaction.objectStore("categories");
    let request = store.getAll();

    request.onsuccess = function () {
        request.result.forEach(cat => {
            const opt = document.createElement("option");
            opt.value = cat.nom;
            opt.textContent = cat.nom;
            selectParent.appendChild(opt);
        });
    };
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
    const parent = document.getElementById("parentCategorie").value || null;

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

    let request = store.add({ nom, couleur, parent });

    request.onsuccess = function () {
        // 🧼 Nettoyage visuel
        modal.style.display = "none";
        nomInput.value = "";
        couleurSelect.value = "";

        // 🎯 Appliquer la nouvelle catégorie dans la création de carte
        const affichage = document.getElementById("categorieSelectionnee");
        const inputCat = document.getElementById("categorieChoisie");

        affichage.textContent = nom;
        affichage.style.backgroundColor = couleur;
        affichage.style.color = getTextColor(couleur);
        affichage.style.display = "block"; // 👈 Réactiver si caché

        inputCat.value = nom;
        inputCat.dataset.couleur = couleur;

        // 🧼 Réinitialiser le champ parent
        const parentDirect = document.getElementById("parentDirect");
        if (parentDirect) parentDirect.value = "";
        // 🔄 Mettre à jour les menus
        chargerMenuCategories();
        genererOptionsCouleursRestantes();
    };

    request.onerror = function () {
        alert("Cette catégorie existe déjà.");
    };
}


document.getElementById("btnModeCategories").addEventListener("click", () => {
    changerModeAffichage("categories");
});

document.getElementById("btnModeCartes").addEventListener("click", () => {
    changerModeAffichage("cartes");
});


function afficherVueParCategories() {
    const container = document.getElementById("vue-par-categories");
    const cartesContainer = document.getElementById("cartes-container");
    const titreCategorie = document.getElementById("titreCategorieSelectionnee");
    const btnRetour = document.getElementById("btnRetourCategories");

    container.innerHTML = "";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    cartesContainer.style.display = "none";
    btnRetour.style.display = "none";
    if (titreCategorie) {
        titreCategorie.style.display = "none"; // ➡️ Cache le titre si présent
    }

    let transaction = db.transaction("categories", "readonly");
    let store = transaction.objectStore("categories");
    let request = store.getAll();

    request.onsuccess = function () {
        const categories = request.result;

        const parNom = {};
        const racines = [];

        categories.forEach(cat => {
            cat.enfants = [];
            parNom[cat.nom] = cat;
        });

        categories.forEach(cat => {
            if (cat.parent && parNom[cat.parent]) {
                parNom[cat.parent].enfants.push(cat);
            } else {
                racines.push(cat);
            }
        });

        // Fonction récursive pour afficher la catégorie et ses enfants
        function afficherCategorieEtEnfants(categorie, niveau = 0) {
            const div = document.createElement("div");
            div.classList.add("carte-categorie");
            div.style.backgroundColor = categorie.couleur;
            div.style.color = getTextColor(categorie.couleur);
            div.style.marginLeft = `${niveau * 20}px`;
            div.style.marginBottom = "8px";
            div.textContent = categorie.nom;

            div.addEventListener("click", () => {
                afficherCartesParCategorie(categorie.nom);
            });

            container.appendChild(div);

            categorie.enfants.forEach(enfant => {
                afficherCategorieEtEnfants(enfant, niveau + 1);
            });
        }

        racines.forEach(racine => {
            afficherCategorieEtEnfants(racine);
        });
    };

    request.onerror = function () {
        console.error("Erreur lors du chargement des catégories.");
    };
}

function afficherCartesParCategorie(nomCategorie) {
    const cartesContainer = document.getElementById("cartes-container");
    const vueCategories = document.getElementById("vue-par-categories");
    const titreCategorie = document.getElementById("titreCategorieSelectionnee");

    cartesContainer.innerHTML = "";
    cartesContainer.style.display = "block";
    vueCategories.style.display = "none";
    document.getElementById("btnRetourCategories").style.display = "block";

    // Trouver la couleur et les informations de la catégorie
    const transaction = db.transaction(["regles", "categories"], "readonly");
    const store = transaction.objectStore("categories");
    const requestCategorie = store.get(nomCategorie);

    requestCategorie.onsuccess = function () {
        const categorie = requestCategorie.result;

        if (categorie) {
            titreCategorie.textContent = `Catégorie : ${categorie.nom}`;
            document.getElementById("zoneFiltres").style.display = "block";
            titreCategorie.style.display = "block";
            titreCategorie.style.backgroundColor = categorie.couleur;
            titreCategorie.style.color = getTextColor(categorie.couleur);
            titreCategorie.style.padding = "10px";
            titreCategorie.style.borderRadius = "8px";
            titreCategorie.style.marginBottom = "20px";
        }
    };

    // Charger et afficher les cartes de cette catégorie
    const storeRegles = transaction.objectStore("regles");
    const request = storeRegles.getAll();

    request.onsuccess = function () {
        const toutesLesCartes = request.result;
        const cartesFiltrees = toutesLesCartes.filter(carte =>
            carte.categorie && carte.categorie.toLowerCase() === nomCategorie.toLowerCase()
        );

        if (cartesFiltrees.length === 0) {
            cartesContainer.innerHTML = `<p>Aucune carte trouvée pour la catégorie "${nomCategorie}".</p>`;
        } else {
            cartesFiltrees.forEach((carte) => {
                const dateAffichee = carte.dateCreation
                    ? new Date(carte.dateCreation).toLocaleDateString()
                    : "Date inconnue";

                const div = document.createElement("div");
                div.classList.add("carte");
                div.setAttribute("data-id", carte.id);
                div.innerHTML = `
                    <h3>${carte.titre}</h3>
                    <p>${carte.contenu}</p>
                    <p class="tags">Tags : ${carte.tags.join(", ")}</p>
                    <span style="font-size: 12px; color: gray;">Créé le : ${dateAffichee}</span>
                    <button onclick="modifierCarte(${carte.id})">Modifier</button>
                    <button onclick="supprimerCarte(${carte.id})">Supprimer</button>
                `;

                // 🎨 Appliquer la couleur de la catégorie à la bordure des cartes
                div.style.borderLeft = `8px solid ${carte.couleurCategorie || '#ccc'}`;
                cartesContainer.appendChild(div);
            });
        }
    };

    request.onerror = function () {
        console.error("Erreur lors du chargement des cartes !");
        cartesContainer.innerHTML = "<p>Erreur lors de l'affichage des cartes.</p>";
    };
}
function changerModeAffichage(mode, initial = false) {
    console.log("👉 Mode d'affichage demandé :", mode, "| Initial ?", initial);
    const btnCartes = document.getElementById("btnModeCartes");
    const btnCategories = document.getElementById("btnModeCategories");
    const vueCategories = document.getElementById("vue-par-categories");
    const cartesContainer = document.getElementById("cartes-container");
    const btnRetour = document.getElementById("btnRetourCategories");


    if (mode === "cartes") {
        // Cache les filtres si pas de catégorie sélectionnée
        document.getElementById("zoneFiltres").style.display = "block";
        cartesContainer.style.display = "block";
        vueCategories.style.display = "none";
        btnRetour.style.display = "none";
        document.getElementById("titreCategorieSelectionnee").style.display = "none";
        btnCartes.classList.add("active");
    btnCategories.classList.remove("active");

        if (!initial) afficherCartes(); // 🚫 éviter appel initial si déjà fait
    } else if (mode === "categories") {
        cartesContainer.style.display = "none";
        vueCategories.style.display = "flex";
        btnRetour.style.display = "none";
        document.getElementById("zoneFiltres").style.display = "none";
        btnCartes.classList.remove("active");
        btnCategories.classList.add("active");

        afficherVueParCategories();
    }
}
function supprimerCategorie(nomCategorie, couleurCategorie) {
    const confirmation = confirm(`Voulez-vous vraiment supprimer la catégorie "${nomCategorie}" ? Les cartes associées garderont cette étiquette mais elle ne sera plus dans la liste.`);

    if (!confirmation) return;

    let transaction = db.transaction("categories", "readwrite");
    let store = transaction.objectStore("categories");

    let request = store.delete(nomCategorie);
    request.onsuccess = function () {
        // On remet la couleur dans les couleurs disponibles
        if (!couleursDisponibles.includes(couleurCategorie)) {
            couleursDisponibles.push(couleurCategorie);
        }

        // Recharge l'affichage
        chargerMenuCategories();
        genererOptionsCouleursRestantes();

        // Si la catégorie supprimée était sélectionnée, on la désélectionne
        const input = document.getElementById("categorieChoisie");
        const affichage = document.getElementById("categorieSelectionnee");
        if (input.value === nomCategorie) {
            input.value = "";
            input.dataset.couleur = "";
            affichage.textContent = "-- Choisir une catégorie --";
            affichage.style.backgroundColor = "";
            affichage.style.color = "";
        }
    };
}
function afficherListeGestionCategories() {
    const container = document.getElementById("listeGestionCategories");
    container.innerHTML = "";
   
    const transaction = db.transaction("categories", "readonly");
    const store = transaction.objectStore("categories");
    const request = store.getAll();

    request.onsuccess = function () {
        const categories = request.result;
        categories.sort((a, b) => a.nom.localeCompare(b.nom));

        categories.forEach(cat => {
            const ligne = document.createElement("div");
            ligne.style.display = "flex";
            ligne.style.alignItems = "center";
            ligne.style.marginBottom = "6px";
            ligne.style.gap = "8px";
        
            // Conteneur de l'ensemble
ligne.classList.add("ligne-categorie");

// Ligne nom + crayon
const conteneurNom = document.createElement("div");
conteneurNom.classList.add("nom-et-edition");

const nomAffiche = document.createElement("span");
nomAffiche.classList.add("nom-categorie");
nomAffiche.textContent = cat.nom;
nomAffiche.setAttribute("contenteditable", "false");

const btnEditer = document.createElement("button");
btnEditer.textContent = "✏️";
btnEditer.title = "Modifier le nom";
btnEditer.onclick = () => {
  const editable = nomAffiche.getAttribute("contenteditable") === "true";
  nomAffiche.setAttribute("contenteditable", String(!editable));
  nomAffiche.focus();
};

conteneurNom.appendChild(nomAffiche);
conteneurNom.appendChild(btnEditer);
        
            // 🔹 Sélecteur pour modifier la couleur
            const selectCouleur = document.createElement("select");
            selectCouleur.classList.add("select-couleur");
            couleursDisponibles.concat(cat.couleur).forEach(couleur => {
                const option = document.createElement("option");
                option.value = couleur;
                option.textContent = getNomCouleur(couleur);
                option.style.backgroundColor = couleur;
                option.style.color = getTextColor(couleur);
                if (couleur === cat.couleur) option.selected = true;
                selectCouleur.appendChild(option);
            });
        
            const actions = document.createElement("div");
            actions.classList.add("actions-categorie");
            
            const btnSave = document.createElement("button");
            btnSave.textContent = "💾";
            btnSave.title = "Enregistrer";
            btnSave.onclick = () => modifierCategorie(
              cat.nom,
              nomAffiche.textContent.trim(),
              selectCouleur.value
            );
            
            const btnSupprimer = document.createElement("button");
            btnSupprimer.textContent = "🗑";
            btnSupprimer.title = "Supprimer";
            btnSupprimer.onclick = () => supprimerCategorieAvecImpact(cat.nom);
            
            actions.appendChild(btnSave);
            actions.appendChild(btnSupprimer);
        
            // 🔹 Assemblage
            ligne.appendChild(conteneurNom);
            ligne.appendChild(selectCouleur);
            ligne.appendChild(actions);
            container.appendChild(ligne);
        });
    };
}
function modifierCategorie(ancienNom, nouveauNom, nouvelleCouleur) {
    if (!nouveauNom) {
        alert("Le nom de la catégorie ne peut pas être vide.");
        return;
    }

    let transaction = db.transaction(["categories", "regles"], "readwrite");
    let catStore = transaction.objectStore("categories");
    let regleStore = transaction.objectStore("regles");

    // Supprimer l’ancienne catégorie si le nom change
    if (ancienNom !== nouveauNom) {
        catStore.delete(ancienNom);
    }

    // Ajouter ou mettre à jour la nouvelle catégorie
    catStore.put({ nom: nouveauNom, couleur: nouvelleCouleur });

    // Mettre à jour toutes les cartes
    const getAll = regleStore.getAll();
    getAll.onsuccess = function () {
        const cartes = getAll.result.filter(carte => carte.categorie === ancienNom);
        let total = cartes.length;
        let misesAJour = 0;
    
        if (total === 0) {
            terminerMiseAJour();
        } else {
            cartes.forEach(carte => {
                carte.categorie = nouveauNom;
                carte.couleurCategorie = nouvelleCouleur;
    
                const majRequest = regleStore.put(carte);
                majRequest.onsuccess = () => {
                    misesAJour++;
                    if (misesAJour === total) {
                        terminerMiseAJour();
                    }
                };
            });
        }
        function terminerMiseAJour() {
            chargerMenuCategories();
            genererOptionsCouleursRestantes();
            afficherListeGestionCategories();
            afficherCartes(); // ✅ maintenant déclenché au bon moment
        }
    };
    transaction.oncomplete = () => {
        chargerMenuCategories();
        genererOptionsCouleursRestantes();
        afficherListeGestionCategories();
        afficherCartes(); // Recharge les cartes visibles
    };
}
function supprimerCategorieAvecImpact(nomCategorie) {
    if (!confirm(`Supprimer définitivement la catégorie "${nomCategorie}" ? Les cartes associées conserveront ce nom et couleur, mais il ne sera plus modifiable.`)) return;

    let transaction = db.transaction("categories", "readwrite");
    let store = transaction.objectStore("categories");

    store.delete(nomCategorie).onsuccess = function () {
        chargerMenuCategories();
        genererOptionsCouleursRestantes();
        afficherListeGestionCategories();
    };
}
function chargerParentsDisponibles() {
    const select = document.getElementById("parentDirect");
    if (!select) return;

    select.innerHTML = '<option value="">Aucun (niveau racine)</option>'; // Par défaut

    let transaction = db.transaction("categories", "readonly");
    let store = transaction.objectStore("categories");
    let request = store.getAll();

    request.onsuccess = function () {
        request.result.forEach(cat => {
            let option = document.createElement("option");
            option.value = cat.nom;
            option.textContent = cat.nom;
            select.appendChild(option);
        });
    };
}
document.getElementById("parentDirect").addEventListener("change", function () {
    const parentNom = this.value;
    const inputCategorie = document.getElementById("categorieChoisie");
    const affichageCategorie = document.getElementById("categorieSelectionnee");

    if (parentNom) {
        let transaction = db.transaction("categories", "readonly");
        let store = transaction.objectStore("categories");
        let request = store.get(parentNom);

        request.onsuccess = function () {
            const parentCat = request.result;
            if (parentCat) {
                inputCategorie.value = parentCat.nom;
                inputCategorie.dataset.couleur = parentCat.couleur;

                // Cacher complètement le champ d'affichage
                affichageCategorie.style.display = "none";
            }
        };
    } else {
        // Si l'utilisateur revient à "aucun parent", on réaffiche le champ
        inputCategorie.value = "";
        inputCategorie.dataset.couleur = "";
        affichageCategorie.textContent = "-- Choisir une catégorie --";
        affichageCategorie.style.backgroundColor = "";
        affichageCategorie.style.color = "";
        affichageCategorie.style.display = "block";
    }
});
// Afficher/masquer le menu hamburger
document.getElementById("btnHamburger").addEventListener("click", function(event) {
    event.stopPropagation(); // Évite de fermer le menu immédiatement
    const menu = document.getElementById("menuContent");
    menu.style.display = (menu.style.display === "block") ? "none" : "block";
  });
  
  // Fermer si clic en dehors
  document.addEventListener("click", function(event) {
    const menu = document.getElementById("menuContent");
    const btn = document.getElementById("btnHamburger");
    if (!menu.contains(event.target) && event.target !== btn) {
      menu.style.display = "none";
    }
  });
  
  // Placeholder pour les fonctions "Personnalisation" et "À propos"
  function ouvrirPersonnalisation() {
    alert("Personnalisation à venir !");
  }
  
  function ouvrirAPropos() {
    alert("Bee Organized - Version 1.0\nUn outil pour organiser vos idées !");
  }
  