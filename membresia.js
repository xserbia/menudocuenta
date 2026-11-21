"use strict";

const billingChoices = document.querySelector(".billing");
const billingStatus = document.querySelector("#billing-status");
const planCards = [...document.querySelectorAll("[data-plan]")];
const amount = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const cents = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function updatePrices() {
  const annual = billingChoices.querySelector("input:checked").value === "annual";
  const summary = [];

  for (const card of planCards) {
    const monthlyPrice = Number(card.dataset.monthly);
    const annualPrice = Number(card.dataset.annual);
    const price = amount.format((annual ? annualPrice : monthlyPrice) / 100);
    const period = annual ? "año" : "mes";
    const saving = card.querySelector("[data-saving]");
    card.querySelector("[data-price]").textContent = price;
    card.querySelector("[data-period]").textContent = "/ " + period;
    card.querySelector("[data-billing-note]").textContent = annual
      ? "Un cargo al año. Equivale a US$" + cents.format(annualPrice / 1200) + " al mes."
      : "También disponible por US$" + cents.format(annualPrice / 100) + " al año.";
    saving.textContent = "Ahorras US$" + cents.format((monthlyPrice * 12 - annualPrice) / 100) + " frente a 12 pagos mensuales.";
    saving.hidden = !annual;
    summary.push(card.dataset.plan + " US$" + price + " por " + period);
  }

  billingStatus.textContent = summary.join(". ") + ".";
}

billingChoices.hidden = false;
billingChoices.addEventListener("change", updatePrices);
updatePrices();
