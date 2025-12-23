const container = document.getElementById("mealPlansContainer");
const darkSwitch = document.getElementById("darkModeSwitch");
const shoppingListBtn = document.getElementById("shoppingListBtn");
const weekSelector = document.getElementById("weekSelector");
const recipeCount = document.getElementById("recipeCount");

const userId = localStorage.getItem("userId");

const dayOffsets = {
    SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3,
    THURSDAY: 4, FRIDAY: 5, SATURDAY: 6
};

function getDateForDay(weekStartStr, day) {
    const baseDate = new Date(weekStartStr + "T00:00:00");
    if (!(day in dayOffsets)) return "Unknown Date";
    baseDate.setDate(baseDate.getDate() + dayOffsets[day]);
    const dd = String(baseDate.getDate()).padStart(2, "0");
    const mm = String(baseDate.getMonth() + 1).padStart(2, "0");
    const yyyy = baseDate.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

function formatWeekRange(startStr) {
    const startDate = new Date(startStr + "T00:00:00");
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    const dd = d => String(d.getDate()).padStart(2, '0');
    const mm = d => String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d => d.getFullYear();
    return `${dd(startDate)}/${mm(startDate)}/${yyyy(startDate)} - ${dd(endDate)}/${mm(endDate)}/${yyyy(endDate)}`;
}

function groupByExactDate(meals) {
    const grouped = {};
    meals.forEach(item => {
        const date = getDateForDay(item.mealplan.weekStart, item.day);
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(item);
    });
    return grouped;
}
function renderMeals(meals, filterDay = "") {
    container.innerHTML = "";

    // Filter meals by day first (if any day filter is applied)
    const filteredMeals = filterDay ? meals.filter(m => m.day === filterDay) : meals;

    // Group filtered meals by exact date
    const groupedByDate = groupByExactDate(filteredMeals);

    // Count total meals after filtering
    let total = filteredMeals.length;

    if (total === 0) {
        // No meals at all after filtering day/week
        container.innerHTML = `<p class="text-center text-muted fs-5 mt-5">No recipes added yet.</p>`;
        recipeCount.textContent = "Total Recipes for this week: 0";
        return;
    }

    // Render meals grouped by date
    for (const date in groupedByDate) {
        const section = document.createElement("div");
        section.className = "mb-3";
        section.innerHTML = `<div class="week-label">${date}</div>`;

        const row = document.createElement("div");
        row.className = "row g-3";

        groupedByDate[date].forEach(m => {
            const col = document.createElement("div");
            col.className = "col-md-4";
            const darkModeClass = document.body.classList.contains("dark-mode") ? "dark-mode" : "";

            col.innerHTML = `
        <div class="card meal-card ${darkModeClass}">
          <img src="${m.recipe.image_url}" class="card-img-top" alt="${m.recipe.title}">
          <div class="card-body">
            <h5 class="card-title">${m.recipe.title}</h5>
            <p><strong>Day:</strong> ${m.day}</p>
            <button class="btn btn-sm btn-danger" onclick="deleteMeal(${m.id})">
              <i class="bi bi-trash"></i> Delete
            </button>
          </div>
        </div>
      `;
            row.appendChild(col);
        });

        section.appendChild(row);
        container.appendChild(section);
    }

    recipeCount.textContent = `Total Recipes for this week: ${total}`;
}


async function fetchMeals() {
    if (!userId) return alert("User not logged in.");
    container.innerHTML = "<p>Loading meals...</p>";

    try {
        const res = await fetch(`https://recipehub-backend-1.onrender.com/mealplanrecipes/user/${userId}`);
        if (!res.ok) throw new Error("Failed to fetch meal plans");
        const data = await res.json();
        window.allMeals = data;

        const uniqueWeeks = [...new Set(data.map(m => m.mealplan.weekStart))].sort();
        if (uniqueWeeks.length === 0) {
            container.innerHTML = "<p>No meals found.</p>";
            shoppingListBtn.style.display = "none";
            return;
        }

        const weekLabels = uniqueWeeks.map((week, index) => ({
            weekStart: week,
            label: `Week ${index + 1} (${formatWeekRange(week)})`
        }));

        weekSelector.innerHTML = weekLabels
            .map(w => `<option value="${w.weekStart}">${w.label}</option>`)
            .join("");

        weekSelector.onchange = () => {
            const selectedWeek = weekSelector.value;
            const filtered = data.filter(m => m.mealplan.weekStart === selectedWeek);
            document.querySelectorAll(".day-filter button").forEach(b => b.classList.remove("active"));
            document.querySelector(".day-filter button[data-day='']").classList.add("active");
            renderMeals(filtered);

            const weekLabel = weekLabels.find(w => w.weekStart === selectedWeek)?.label || "Week";
            shoppingListBtn.style.display = "inline-block";
            shoppingListBtn.innerHTML = `<i class="bi bi-list-check"></i> View Shopping List for ${weekLabel}`;
            shoppingListBtn.onclick = () => {
                const url = `shoppinglist.html?userId=${userId}&weekStart=${selectedWeek}`;
                window.location.href = url;
            };
        };

        weekSelector.dispatchEvent(new Event("change"));
    } catch (err) {
        container.innerHTML = `<p class="text-danger">Error: ${err.message}</p>`;
        shoppingListBtn.style.display = "none";
    }
}

async function deleteMeal(id) {
    if (!confirm("Delete this recipe?")) return;
    try {
        const res = await fetch(`https://recipehub-backend-1.onrender.com/mealplanrecipes/delete/${id}`, {
            method: "DELETE"
        });
        if (!res.ok) throw new Error("Delete failed");
        await fetchMeals();
    } catch (err) {
        alert("Error: " + err.message);
    }
}

document.querySelectorAll(".day-filter button").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".day-filter button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const filterDay = btn.dataset.day;
        const selectedWeek = weekSelector.value;
        const filteredMeals = window.allMeals.filter(m => m.mealplan.weekStart === selectedWeek);
        renderMeals(filteredMeals, filterDay);
    });
});

fetchMeals();