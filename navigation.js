"use strict";

const menuToggle = document.querySelector(".menu-toggle");
const menu = document.querySelector("#menu-principal");
const mobileLayout = window.matchMedia("(max-width: 64rem)");
const background = document.querySelectorAll("body > main, body > footer, body > .skip-link");

function setMenuOpen(open) {
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  menu.classList.toggle("open", open);
  background.forEach((element) => { element.inert = open; });
}

menuToggle.closest("header").dataset.interactive = "";
menuToggle.hidden = false;
menuToggle.addEventListener("click", () => setMenuOpen(!menu.classList.contains("open")));
menuToggle.closest("header").addEventListener("click", (event) => {
  if (event.target.closest("a") && menu.classList.contains("open")) setMenuOpen(false);
});
mobileLayout.addEventListener("change", () => setMenuOpen(false));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu.classList.contains("open")) {
    setMenuOpen(false);
    menuToggle.focus();
  }
});
