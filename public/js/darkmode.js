function applySavedTheme() {
  const savedTheme = localStorage.getItem("profilequest-theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  }
}

function updateThemeButtonText() {
  const button = document.getElementById("themeToggle");
  if (!button) return;
  button.textContent = document.body.classList.contains("dark-mode") ? "☀️ Light Mode" : "🌙 Dark Mode";
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  const newTheme = document.body.classList.contains("dark-mode") ? "dark" : "light";
  localStorage.setItem("profilequest-theme", newTheme);
  updateThemeButtonText();
}

applySavedTheme();

document.addEventListener("DOMContentLoaded", function () {
  updateThemeButtonText();
  const button = document.getElementById("themeToggle");
  if (button) {
    button.addEventListener("click", toggleTheme);
  }
});
