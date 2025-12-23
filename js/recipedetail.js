let selectedDay = null;

    const dayMap = {
      "Su": "SUNDAY",
      "M": "MONDAY",
      "T": "TUESDAY",
      "W": "WEDNESDAY",
      "Th": "THURSDAY",
      "F": "FRIDAY",
      "S": "SATURDAY"
    };

    function getQueryParam(param) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    }

    const recipeId = getQueryParam('id');

    if (!recipeId) {
      document.getElementById('recipeDetails').innerHTML = '<p>No recipe selected.</p>';
    } else {
      fetch(`https://recipehub-backend-1.onrender.com/Recipes/getRecipeById/${recipeId}`)
        .then(response => {
          if (!response.ok) throw new Error('Recipe not found');
          return response.json();
        })
        .then(recipe => {
          const container = document.getElementById('recipeDetails');
          container.innerHTML = `
            <img src="${recipe.image_url}" alt="${recipe.title}" />
            <h2>${recipe.title}</h2>

            <div id="ratingStars" style="font-size: 1.5rem; color: gold; cursor: pointer;">
              <i class="bi bi-star" data-value="1"></i>
              <i class="bi bi-star" data-value="2"></i>
              <i class="bi bi-star" data-value="3"></i>
              <i class="bi bi-star" data-value="4"></i>
              <i class="bi bi-star" data-value="5"></i>
            </div>
            <p id="ratingMessage" style="font-style: italic; color: #666;"></p>


            <div class="d-flex justify-content-center gap-3 mb-3">
              <button class="btn btn-outline-primary" onclick="shareRecipe('${recipe.title}', '${recipe.image_url}')">
                <i class="bi bi-share"></i> Share
              </button>
              <button class="btn btn-outline-secondary" onclick="printRecipe()">
                <i class="bi bi-printer"></i> Print
              </button>
              <button id="likeBtn" class="btn btn-outline-danger" onclick="likeRecipe(this)">
                <i class="bi bi-heart"></i> Like
              </button>
            </div>

            <p><strong>Category:</strong> ${recipe.category}</p>
            <p><strong>Preparation Time:</strong> ${recipe.prep_time} minutes</p>
            <p><strong>Cooking Time:</strong> ${recipe.cook_time} minutes</p>
            <p><strong>Total Time:</strong> ${Number(recipe.prep_time) + Number(recipe.cook_time)} minutes</p>
            <h3>Description</h3>
            <p>${recipe.description}</p>
            <h3>Ingredients</h3>
            <p>${recipe.ingredients}</p>
            <h3>Instructions</h3>
            <p class="instructions">${recipe.instructions}</p>
            <a class="back-button" href="recipe.html">← Back to Recipe List</a>
          `;

           initRating(recipeId);
        })
        .catch(error => {
          console.error('Error fetching recipe details:', error);
          document.getElementById('recipeDetails').innerHTML = '<p>Failed to load recipe details.</p>';
        });
    }

    const toggle = document.getElementById('planToggle');
    const mealOptions = document.getElementById('mealOptions');
    toggle.addEventListener('change', () => {
      mealOptions.style.display = toggle.checked ? 'block' : 'none';
    });

    const buttons = document.querySelectorAll('.weekday-button');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const shortDay = btn.textContent.trim();
        selectedDay = dayMap[shortDay];
        console.log("Selected day:", selectedDay);
      });
    });

    const weekSelect = document.getElementById("weekSelect");
    const startDateInput = document.getElementById("startDate");
    const endDateInput = document.getElementById("endDate");

    function getStartOfWeek(date) {
      // Sunday as the first day of the week
      const day = date.getDay(); // 0 (Sun) - 6 (Sat)
      const diff = date.getDate() - day;
      return new Date(date.getFullYear(), date.getMonth(), diff);
    }

    weekSelect.addEventListener("change", () => {
      const selectedWeekOffset = parseInt(weekSelect.value);
      if (isNaN(selectedWeekOffset)) {
        startDateInput.value = "";
        endDateInput.value = "";
        return;
      }

      const today = new Date();
      const startOfThisWeek = getStartOfWeek(new Date(today));
      const startOfSelectedWeek = new Date(startOfThisWeek);
      startOfSelectedWeek.setDate(startOfThisWeek.getDate() + (7 * selectedWeekOffset));

      const yyyy = startOfSelectedWeek.getFullYear();
      const mm = String(startOfSelectedWeek.getMonth() + 1).padStart(2, '0');
      const dd = String(startOfSelectedWeek.getDate()).padStart(2, '0');
      startDateInput.value = `${yyyy}-${mm}-${dd}`;

      const endOfSelectedWeek = new Date(startOfSelectedWeek);
      endOfSelectedWeek.setDate(startOfSelectedWeek.getDate() + 6);

      const eyyyy = endOfSelectedWeek.getFullYear();
      const emm = String(endOfSelectedWeek.getMonth() + 1).padStart(2, '0');
      const edd = String(endOfSelectedWeek.getDate()).padStart(2, '0');
      endDateInput.value = `${eyyyy}-${emm}-${edd}`;
    });

    function shareRecipe(title, imageUrl) {
      if (navigator.share) {
        navigator.share({
          title: title,
          text: "Check out this recipe!",
          url: window.location.href,
        }).catch(err => console.error("Error sharing:", err));
      } else {
        alert("Sharing is not supported in your browser.");
      }
    }

   function printRecipe() {
  window.print();
}
    function likeRecipe(button) {
      const icon = button.querySelector("i");
      icon.classList.toggle("bi-heart");
      icon.classList.toggle("bi-heart-fill");
      button.classList.toggle("btn-outline-danger");
      button.classList.toggle("btn-danger");
    }


    function likeRecipe(button) {
      const icon = button.querySelector("i");
      icon.classList.toggle("bi-heart");
      icon.classList.toggle("bi-heart-fill");
      button.classList.toggle("btn-outline-danger");
      button.classList.toggle("btn-danger");

      // Get recipe title from the page
      const recipeTitle = document.querySelector('#recipeDetails h2').textContent;

      // Get recipe ID from query param
      const recipeId = getQueryParam('id');

      // Get liked recipes from localStorage or empty array
      let likedRecipes = JSON.parse(localStorage.getItem('likedRecipes')) || [];

      // Check if this recipe is already liked
      const index = likedRecipes.findIndex(r => r.id === recipeId);

      if (index === -1) {
        // Add to likedRecipes
        likedRecipes.push({recipeId});
      } else {
        // Remove from likedRecipes
        likedRecipes.splice(index, 1);
      }

      // Save updated array back to localStorage
      localStorage.setItem('likedRecipes', JSON.stringify(likedRecipes));
    }


    // Initialize rating stars functionality
    function initRating(recipeId) {
      const stars = document.querySelectorAll('#ratingStars i');
      const ratingMessage = document.getElementById('ratingMessage');

      // Load existing rating from localStorage
      let ratings = JSON.parse(localStorage.getItem('ratings')) || {};
      let currentRating = ratings[recipeId] || 0;

      // Highlight stars according to saved rating
      highlightStars(currentRating);

      stars.forEach(star => {
        star.addEventListener('click', () => {
          const rating = parseInt(star.getAttribute('data-value'));
          ratings[recipeId] = rating;
          localStorage.setItem('ratings', JSON.stringify(ratings));
          highlightStars(rating);
          ratingMessage.textContent = `You rated this recipe ${rating} star${rating > 1 ? 's' : ''}.`;
        });
      });

      function highlightStars(rating) {
        stars.forEach(star => {
          const starValue = parseInt(star.getAttribute('data-value'));
          if (starValue <= rating) {
            star.classList.remove('bi-star');
            star.classList.add('bi-star-fill');
          } else {
            star.classList.remove('bi-star-fill');
            star.classList.add('bi-star');
          }
        });
      }

      if (currentRating > 0) {
        ratingMessage.textContent = `You rated this recipe ${currentRating} star${currentRating > 1 ? 's' : ''}.`;
      }
    }



    async function submitMealPlan() {
      const submitBtn = document.getElementById('submitMealPlanBtn');
      const userId = localStorage.getItem("userId");
      const startDate = startDateInput.value;
      const endDate = endDateInput.value;

      if (!userId) {
        alert("User not logged in. Please login first.");
        return;
      }

      if (!selectedDay) {
        alert("Please select a day of the week.");
        return;
      }

      if (!startDate || !endDate) {
        alert("Please select a week.");
        return;
      }

      if (startDate > endDate) {
        alert("Start date cannot be after end date.");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="bi bi-hourglass-split"></i> Saving...`;

      const mealPlanData = {
        weekStart: startDate,
        weekEnd: endDate
      };

      try {
        const mealPlanResponse = await fetch(`https://recipehub-backend-1.onrender.com/mealplans/save/${userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mealPlanData)
        });

        if (!mealPlanResponse.ok) {
          const errorText = await mealPlanResponse.text();
          throw new Error(errorText || "Failed to save Meal Plan.");
        }

        const savedMealPlan = await mealPlanResponse.json();
        const mealplanId = savedMealPlan.id;

        const mapResponse = await fetch(`https://recipehub-backend-1.onrender.com/mealplanrecipes/save/${mealplanId}/${recipeId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ day: selectedDay })
        });

        if (!mapResponse.ok) throw new Error("Failed to map recipe to meal plan.");

        alert("Recipe successfully added to your Meal Plan!");
      } catch (error) {
        console.error("Error submitting meal plan:", error);
        alert("Error: " + error.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="bi bi-check-circle"></i> Submit Meal Plan`;
      }
    }