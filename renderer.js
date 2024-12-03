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
  const response = await fetch(`${apiUrl}/search${query ? `?name=${query}` : ""}`);
  const documents = await response.json();

  if (documents.error) {
    alert(documents.error);
    return;
  }

  renderDocuments(documents);
}

// Rechercher des documents
function searchDocuments() {
  const query = document.getElementById("search-bar").value;
  getDocuments(query);
}

function renderDocuments(documents) {
    const content = document.getElementById("content");
    content.innerHTML = `
      <h1>Documents</h1>
      <input id="search-bar" type="text" placeholder="Search documents..." />
      <button onclick="searchDocuments()">Search</button>
      <div id="document-list"></div>
    `;
  
    const documentList = document.getElementById("document-list");
    documents.forEach((doc) => {
      documentList.innerHTML += `
        <div class="document-item">
          <span>${doc.name}</span>
          <button onclick="viewDocument('${doc.name}')">View</button>
          <button onclick="downloadDocument(${doc.id})">Download</button>
          <button onclick="addFavorite('${doc.name}')">Add to Favorites</button>
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
        <button onclick="deleteFavorite('${fav.filename}')">Remove</button>
      </div>
    `;
  });
}
