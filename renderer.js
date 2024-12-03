const apiUrl = "http://localhost:3000"; // Votre API

// Vérifie si un utilisateur est connecté
document.addEventListener("DOMContentLoaded", () => {
  const username = localStorage.getItem("username");
  if (username) {
    showMainContent();
  } else {
    showLoginPage();
  }
});

// Afficher la page de connexion
function showLoginPage() {
  document.getElementById("login-page").style.display = "block";
  document.getElementById("main-content").style.display = "none";
}

// Afficher le contenu principal
function showMainContent() {
  document.getElementById("login-page").style.display = "none";
  document.getElementById("main-content").style.display = "block";
  navigateTo("documents");
}

// Gestion du formulaire de connexion
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  if (username.trim()) {
    localStorage.setItem("username", username);
    showMainContent();
  }
});

// Déconnexion
function logout() {
  localStorage.removeItem("username");
  showLoginPage();
}

// Navigation entre les pages
function navigateTo(page) {
  if (page === "documents") {
    getDocuments();
  } else if (page === "favorites") {
    getFavorites();
  }
}

// Récupérer les documents
async function getDocuments(query = "") {
  const response = await fetch(`${apiUrl}/search`); //${query ? `?name=${query}` : ""}
  const documents = await response.json();

  if (documents.error) {
    alert(documents.error);
    return;
  }
  console.log(query);
  console.log(documents);
  const filteredDocuments = documents.filter(doc => doc.name.toLowerCase().includes(query));
  console.log(filteredDocuments);
  renderDocuments(filteredDocuments);
}

// Rechercher des documents
function searchDocuments() {
  const query = document.getElementById("search-bar").value;
  console.log(query);
  getDocuments(query);
}

function renderDocuments(documents) {
    const content = document.getElementById("content");
    content.innerHTML = `
      <h1>Documents</h1>
      <input style="border: 0px;" id="search-bar" type="text" placeholder="Search documents..." />
      <button style="background-color: #4fc557; color: #fff; border-radius: 8px;" onclick="searchDocuments()">Search</button>
      <div id="document-list"></div>
    `;
  
    const documentList = document.getElementById("document-list");
    documents.forEach((doc) => {
      documentList.innerHTML += `
        <div class="document-item" style=" display: flex; justify-content: center; gap: 0.5rem; padding: 1rem;">
          <span style="min-width: 100px;">${doc.name}</span>
          <button style="background-color: rgb(10, 143, 148); color: #fff; border-radius: 8px;" onclick="viewDocument('${doc.name}')">View</button>
          <button style="background-color:green; color: #fff; border-radius: 8px;" onclick="downloadDocument(${doc.id})">Download</button>
          <button style="background-color: rgb(196, 196, 28); color: #fff; border-radius: 8px;" onclick="addFavorite('${doc.name}')">Add to Favorites</button>
        </div>
      `;
    });
  }

// Afficher un document
function viewDocument(filename) {
  const url = `${apiUrl}/search?name=${filename}`;
  window.open(url, "_blank");
}

// Télécharger un document via l'ID
function downloadDocument(docId) {
    const url = `${apiUrl}/document/${docId}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = ""; // Le nom du fichier sera déterminé par l'en-tête Content-Disposition
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

// Récupérer les favoris
async function getFavorites() {
  const username = localStorage.getItem("username");
  const response = await fetch(`${apiUrl}/favorites/${username}`);
  const favorites = await response.json();

  if (favorites.error) {
    alert(favorites.error);
    return;
  }

  renderFavorites(favorites);
}

// Ajouter un favori
async function addFavorite(name) {
  const username = localStorage.getItem("username");
  const filename = name + '.html';
  const response = await fetch(`${apiUrl}/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, filename }),
  });

  const result = await response.json();
  if (result.error) {
    alert(result.error);
  } else {
    alert("Favorite added successfully!");
  }
}

// Supprimer un favori
async function deleteFavorite(filename) {
  const username = localStorage.getItem("username");
  const response = await fetch(`${apiUrl}/favorites`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, filename }),
  });

  const result = await response.json();
  if (result.error) {
    alert(result.error);
  } else {
    alert("Favorite deleted successfully!");
    getFavorites();
  }
}

// Render les favoris
function renderFavorites(favorites) {
  const content = document.getElementById("content");
  content.innerHTML = "<h1>Favorites</h1>";
  favorites.forEach((fav) => {
    content.innerHTML += `
      <div class="favorite-item">
        <span>${fav.filename}</span>
        <button style="background-color: rgb(160, 13, 13); color: white; border-radius: 8px;" onclick="deleteFavorite('${fav.filename}')">Remove</button>
      </div>
    `;
  });
}
