const API_URL = "https://careernest-7uhu.onrender.com/api";

const themeButton = document.getElementById("themeToggle");

function applyTheme() {
    const savedTheme = localStorage.getItem("careerNestTheme") || "light";

    document.body.classList.toggle("dark-mode", savedTheme === "dark");

    if (themeButton) {
        themeButton.textContent = savedTheme === "dark" ? "☀️" : "🌙";
    }
}

applyTheme();

if (themeButton) {
    themeButton.addEventListener("click", () => {
        const isDark = document.body.classList.toggle("dark-mode");

        localStorage.setItem(
            "careerNestTheme",
            isDark ? "dark" : "light"
        );

        applyTheme();
    });
}