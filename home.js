"use strict";

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
