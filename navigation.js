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

document.body.insertAdjacentHTML("beforeend", `
  <a class="whatsapp-launcher"
    href="https://api.whatsapp.com/message/P5RVRV7B3XENP1?autoload=1&amp;app_absent=0"
    target="_blank" rel="noopener noreferrer" aria-label="Escríbenos por WhatsApp">
    <svg viewBox="0 0 16 16" width="22" height="22" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994.001C3.627.001.068 3.56.064 7.927c0 1.399.366 2.76 1.057 3.965L.001 16l4.204-1.102a7.9 7.9 0 0 0 3.789.965h.004c4.368 0 7.926-3.557 7.93-7.927a7.898 7.898 0 0 0-2.327-5.61zM7.994 14.52a6.6 6.6 0 0 1-3.356-.918l-.24-.143-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.01-3.507c0-3.628 2.959-6.586 6.594-6.586a6.56 6.56 0 0 1 4.66 1.933 6.56 6.56 0 0 1 1.927 4.66c-.004 3.638-2.962 6.591-6.59 6.591z"/>
      <path d="M11.613 9.574c-.197-.1-1.17-.578-1.352-.644-.181-.066-.313-.1-.445.1-.132.197-.511.643-.627.775-.115.132-.23.149-.428.05-.198-.1-.835-.308-1.59-.982-.588-.524-.984-1.172-1.1-1.37-.115-.197-.012-.304.087-.403.089-.088.198-.23.297-.346.1-.116.132-.198.198-.33.066-.132.033-.247-.017-.346-.05-.1-.445-1.073-.61-1.469-.161-.386-.325-.334-.446-.34-.116-.006-.247-.008-.38-.008-.131 0-.346.05-.527.247-.181.198-.692.676-.692 1.65 0 .972.709 1.913.808 2.045.099.132 1.395 2.13 3.38 2.987.472.204.84.326 1.127.416.473.15.903.129 1.243.078.38-.057 1.17-.479 1.335-.94.165-.462.165-.858.116-.941-.05-.083-.181-.132-.38-.23z"/>
    </svg>
    <span>Escríbenos</span>
  </a>`);
