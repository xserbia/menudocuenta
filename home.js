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

const steps = [
  ["Tu perfil define el punto de partida", "Antes de invertir, EMC necesita entender para qué estás invirtiendo, por cuánto tiempo y cuánto riesgo estás dispuesto a asumir.", "Perfil de riesgo", "El objetivo no es predecir el mercado. Es comenzar con una estrategia alineada con tu situación y tus objetivos financieros."],
  ["Un portafolio acorde con tu perfil", "EMC recomienda un portafolio según tus objetivos, horizonte y tolerancia al riesgo.", "Asignación del portafolio", "El portafolio combina inversiones de acuerdo con el modelo seleccionado."],
  ["Tus aportes se ponen a trabajar", "Cuando hay efectivo disponible en tu cuenta, la inversión se realiza durante el ciclo correspondiente.", "Inversión automática", "Puedes hacer aportes individuales o programar aportes recurrentes."],
  ["EMC monitorea tu portafolio", "EMC revisa el portafolio según la estrategia del modelo seleccionado.", "Monitoreo", "Si cambian tus objetivos o tu tolerancia al riesgo, actualiza tu información en la app."],
  ["El portafolio se ajusta con el tiempo", "Los movimientos del mercado pueden cambiar el peso de las inversiones de tu portafolio.", "Rebalanceo", "Cuando corresponde, EMC ajusta la distribución para acercarla a la estrategia del modelo."],
  ["Los dividendos pueden volver a invertirse", "Los dividendos que recibas se incorporan al efectivo disponible para reinvertir.", "Reinversión de dividendos", "La reinversión puede contribuir al crecimiento, que depende de los resultados de las inversiones."],
  ["Consulta tus inversiones desde la app", "Puedes ver el saldo de tu cuenta y el seguimiento de tus inversiones.", "Seguimiento", "En la app puedes revisar tu actividad y ajustar tu información si cambian tus metas."]
];

const stepButtons = [...document.querySelectorAll("[data-step]")];
const stepDots = [...document.querySelectorAll(".step-dots i")];
const stepPanel = document.querySelector("#step-panel");
const stepTitle = document.querySelector("#step-title");
const stepDescription = document.querySelector("#step-description");
const stepNoteTitle = document.querySelector("#step-note-title");
const stepNoteText = document.querySelector("#step-note-text");

stepButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    const [title, description, noteTitle, noteText] = steps[index];
    stepButtons.forEach((item, position) => {
      item.setAttribute("aria-pressed", String(position === index));
      stepDots[position].classList.toggle("active", position === index);
    });
    stepTitle.textContent = title;
    stepDescription.textContent = description;
    stepNoteTitle.textContent = `Paso ${index + 1} · ${noteTitle}`;
    stepNoteText.textContent = noteText;
    if (stepPanel.getBoundingClientRect().top > window.innerHeight - 100) {
      stepPanel.scrollIntoView({ block: "nearest" });
    }
  });
});

function projectBalance(initial, contribution, frequency, years, annualRate) {
  const rate = annualRate / frequency;
  let balance = initial;
  const projection = [];

  for (let year = 1; year <= years; year += 1) {
    for (let period = 0; period < frequency; period += 1) {
      balance = balance * (1 + rate) + contribution;
    }
    projection.push({ year, balance, principal: initial + contribution * frequency * year });
  }

  return projection;
}

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const form = document.querySelector("#compound-form");
const chart = document.querySelector("#compound-chart");
const chartNote = document.querySelector("#chart-note");

function showProjection() {
  const values = new FormData(form);
  const projection = projectBalance(Number(values.get("initial")), Number(values.get("contribution")),
    Number(values.get("frequency")), Number(values.get("years")), Number(values.get("rate")) / 100);
  const final = projection.at(-1);
  document.querySelector("#balance").textContent = money.format(final.balance);
  document.querySelector("#contributions").textContent = money.format(final.principal);
  document.querySelector("#growth").textContent = money.format(final.balance - final.principal);

  const maxBalance = Math.max(1, ...projection.map((row) => row.balance));
  const bars = projection.map(({ year, balance, principal }) => {
    const label = `Año ${year} · Saldo ${money.format(balance)} · Aportes ${money.format(principal)} · Crecimiento ${money.format(balance - principal)}`;
    const button = document.createElement("button");
    const bar = document.createElement("span");
    button.type = "button";
    button.setAttribute("aria-label", label);
    button.title = label;
    bar.style.height = `${balance / maxBalance * 100}%`;
    bar.style.setProperty("--principal", `${balance > 0 ? Math.min(100, principal / balance * 100) : 0}%`);
    button.append(bar);
    button.addEventListener("focus", () => { chartNote.textContent = label; });
    button.addEventListener("click", () => { chartNote.textContent = label; });
    return button;
  });

  chart.replaceChildren(...bars);
  chartNote.textContent = "Selecciona una barra para ver el desglose anual.";
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  showProjection();
});
showProjection();
