document.addEventListener("DOMContentLoaded", function () {
  const menuButton = document.getElementById("menuToggle");
  const sideMenu = document.getElementById("sideMenu");
  const overlay = document.getElementById("sideOverlay");

  function openMenu() {
    menuButton?.setAttribute("aria-expanded", "true");
    if (sideMenu) sideMenu.inert = false;
    if (sideMenu) sideMenu.classList.add("open");
    if (overlay) overlay.classList.add("open");
    document.body.classList.add("menu-open");
  }

  function closeMenu() {
    menuButton?.setAttribute("aria-expanded", "false");
    if (sideMenu) sideMenu.inert = true;
    menuButton?.focus();
    if (sideMenu) sideMenu.classList.remove("open");
    if (overlay) overlay.classList.remove("open");
    document.body.classList.remove("menu-open");
  }

  if (sideMenu) sideMenu.inert = true;
  if (menuButton) {
    menuButton.addEventListener("click", function () {
      if (sideMenu && sideMenu.classList.contains("open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (overlay) overlay.addEventListener("click", closeMenu);

  document.querySelectorAll(".side-nav a, .side-secondary-link, .side-primary-link").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMenu();
  });
});
