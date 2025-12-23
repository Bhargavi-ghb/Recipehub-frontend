import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCJ8MmM92bZQ2majwblLdQaEeSpEksozGQ",
  authDomain: "recipehub-dc535.firebaseapp.com",
  projectId: "recipehub-dc535",
  storageBucket: "recipehub-dc535.appspot.com",
  messagingSenderId: "212858617628",
  appId: "1:212858617628:web:fd675ccdec374c4026c4d9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Like & Ratings Storage Helpers
function getLikedRecipes() {
  return JSON.parse(localStorage.getItem("likedRecipes")) || [];
}
function saveLikedRecipes(liked) {
  localStorage.setItem("likedRecipes", JSON.stringify(liked));
}
function isLiked(recipeId) {
  return getLikedRecipes().includes(String(recipeId));
}
function toggleLike(recipeId) {
  let liked = getLikedRecipes();
  if (liked.includes(String(recipeId))) {
    liked = liked.filter(id => id !== String(recipeId));
  } else {
    liked.push(String(recipeId));
  }
  saveLikedRecipes(liked);
  renderRecommendations(currentRecipes);
  renderQuickRecipes(quickRecipes);
}

function getRatings() {
  return JSON.parse(localStorage.getItem("ratings")) || {};
}
function saveRatings(ratings) {
  localStorage.setItem("ratings", JSON.stringify(ratings));
}
function getRating(id) {
  return getRatings()[id] || 0;
}
function setRating(id, rating) {
  const ratings = getRatings();
  ratings[id] = rating;
  saveRatings(ratings);
  renderRecommendations(currentRecipes);
  renderQuickRecipes(quickRecipes);
}

function createStars(recipeId, currentRating) {
  let starsHtml = '';
  for (let i = 1; i <= 5; i++) {
    starsHtml += `<span class="star ${i <= currentRating ? 'filled' : ''}" data-id="${recipeId}" data-rating="${i}">&#9733;</span>`;
  }
  return starsHtml;
}

let currentRecipes = [];
let quickRecipes = [];

// Render Recommended Recipes cards
function renderRecommendations(recipes) {
  const container = document.getElementById("recommendations");
  container.innerHTML = "";
  recipes.forEach(recipe => renderCard(recipe, container));
}

function renderCard(recipe, container) {
  const liked = isLiked(recipe.id);
  const rating = getRating(recipe.id);
  const cardHtml = `
        <div class="col">
          <div class="card shadow-sm h-100 d-flex flex-column">
            <img src="${recipe.image_url}" class="card-img-top" alt="${recipe.title}">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title d-flex justify-content-between align-items-center">
                ${recipe.title}
                <button class="like-btn" aria-label="Toggle Favorite" data-id="${recipe.id}">
                  <i class="bi ${liked ? 'bi-heart-fill' : 'bi-heart'}"></i>
                </button>
              </h5>
              <p class="recipe-author"><strong>By:</strong> ${recipe.user?.name || "Unknown"}</p>
              <p class="card-text">Category: ${recipe.category}</p>
              <p class="card-text flex-grow-1">${recipe.description?.substring(0, 100) || 'Try this recipe today!'}</p>
              <div class="favorite-rating-container mt-2 d-flex align-items-center">
                <div class="rating" data-id="${recipe.id}">
                  ${createStars(recipe.id, rating)}
                </div>
                <a href="recipedetail.html?id=${recipe.id}" class="btn btn-outline-primary btn-sm ms-auto">View Recipe</a>

              </div>
            </div>
          </div>
        </div>
      `;
  container.insertAdjacentHTML("beforeend", cardHtml);

  // Add event listeners to newly added buttons/stars
  container.querySelectorAll(".like-btn").forEach(btn => {
    btn.onclick = () => toggleLike(btn.getAttribute("data-id"));
  });
  container.querySelectorAll(".star").forEach(star => {
    star.onclick = () => setRating(star.getAttribute("data-id"), parseInt(star.getAttribute("data-rating")));
  });
}

// Render Quick Recipes Carousel
function renderQuickRecipes(recipes) {
  const container = document.getElementById("quickRecipeCarouselInner");
  container.innerHTML = "";

  const cardsPerSlide = 3;
  for (let i = 0; i < recipes.length; i += cardsPerSlide) {
    const slideRecipes = recipes.slice(i, i + cardsPerSlide);
    const isActive = i === 0 ? "active" : "";

    const slide = document.createElement("div");
    slide.className = `carousel-item ${isActive}`;
    slide.innerHTML = `
          <div class="row justify-content-center">
            ${slideRecipes
        .map((recipe) => {
          const liked = isLiked(recipe.id);
          const rating = getRating(recipe.id);
          return `
                  <div class="col-md-4 mb-3">
                    <div class="card shadow-sm h-100">
                      <img src="${recipe.image_url}" class="card-img-top" alt="${recipe.title}">
                      <div class="card-body d-flex flex-column">
                        <h5 class="card-title d-flex justify-content-between align-items-center">
                          ${recipe.title}
                          <button class="like-btn" aria-label="Toggle Favorite" data-id="${recipe.id}">
                            <i class="bi ${liked ? 'bi-heart-fill' : 'bi-heart'}"></i>
                          </button>
                        </h5>
                        <p class="recipe-author"><strong>By:</strong> ${recipe.user?.name || "Unknown"}</p>

                        <p class="card-text">Category: ${recipe.category}</p>
                        <p class="card-text flex-grow-2">${recipe.description?.substring(0, 100) || 'Try this quick recipe today!'}</p>
                        <div class="favorite-rating-container mt-2 d-flex align-items-center">
                          <div class="rating" data-id="${recipe.id}">
                            ${createStars(recipe.id, rating)}
                          </div>
                        <a href="recipedetail.html?id=${recipe.id}" class="btn btn-outline-primary btn-sm ms-auto">View Recipe</a>
                        </div>
                      </div>
                    </div>
                  </div>
                `;
        })
        .join("")}
          </div>
        `;
    container.appendChild(slide);
  }

  // Bind events for new stars and hearts
  container.querySelectorAll(".like-btn").forEach((btn) => {
    btn.onclick = () => toggleLike(btn.getAttribute("data-id"));
  });

  container.querySelectorAll(".star").forEach((star) => {
    star.onclick = () =>
      setRating(star.getAttribute("data-id"), parseInt(star.getAttribute("data-rating")));
  });
}

// Load user profile from backend using userId stored in localStorage
async function loadUserProfile() {
  const userId = localStorage.getItem("userId");
  if (!userId) return (window.location.href = "login.html");

  document.getElementById("spinner").style.display = "block";
  try {
    const res = await fetch(`https://recipehub-backend-1.onrender.com/Users/getiduser/${userId}`);
    if (!res.ok) throw new Error("Failed to fetch user");
    const user = await res.json();
    document.getElementById("welcomeMsg").textContent = `Welcome, ${user.name || "User"}!`;
    document.getElementById("greeting").textContent = `Hello ${user.name || "User"}, explore your personalized dashboard below.`;
    // Set username in the navbar/profile section
    document.getElementById("username").textContent = user.name || "User";

  } catch {
    localStorage.removeItem("userId");
    window.location.href = "login.html";
  } finally {
    document.getElementById("spinner").style.display = "none";
  }
}

// Load recommended recipes
async function loadRecommendedRecipes() {
  try {
    const res = await fetch("https://recipehub-backend-1.onrender.com/Recipes/getRecipes");
    if (!res.ok) throw new Error("Failed to fetch recipes");
    const data = await res.json();
    currentRecipes = data.sort(() => 0.5 - Math.random()).slice(0, 4);
    renderRecommendations(currentRecipes);
  } catch {
    document.getElementById("recommendations").innerHTML = `<p class="text-danger">Could not load recommended recipes.</p>`;
  }
}

// Load quick recipes (<=30 min)
async function loadQuickRecipes() {
  try {
    const res = await fetch("https://recipehub-backend-1.onrender.com/Recipes/getRecipes");
    if (!res.ok) throw new Error("Failed to fetch quick recipes");
    const data = await res.json();
    quickRecipes = data.filter(r => r.total_time <= 30).slice(0, 12);
    renderQuickRecipes(quickRecipes);
  } catch {
    document.getElementById("quickRecipeCarouselInner").innerHTML = `<p class="text-danger">Could not load quick recipes.</p>`;
  }
}

const tips = [
  "💧 Drink at least 8 glasses of water a day.",
  "🥗 Eat a rainbow of vegetables every day.",
  "🧘 Practice mindful eating — slow down at meals.",
  "🍎 Choose whole fruits over fruit juices.",
  "🥣 Don't skip breakfast — fuel your morning."
];
const today = new Date().getDate();
document.getElementById("dailyTip").innerText = tips[today % tips.length];

// Setup logout button to sign out Firebase user and clear local/session storage
function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      localStorage.removeItem("userId");
      sessionStorage.clear();
      window.location.href = "login.html";
    } catch (error) {
      alert("Error logging out: " + error.message);
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
    const savedAvatar = localStorage.getItem("avatarImage");
    const avatarElement = document.getElementById("profileAvatar");
    if (savedAvatar && avatarElement) {
      avatarElement.src = savedAvatar;
    }
  });

window.onload = () => {
  loadUserProfile();
  loadRecommendedRecipes();
  loadQuickRecipes();
  setupLogout();

};


 