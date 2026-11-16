const demoAmountCentavos = 2_000_000;
const demoHorizon = "twoToFiveYears";
const demoRiskAnswer = "hold";
const simulatedContribution = { amountCentavos: BigInt(demoAmountCentavos), status: "pending" };

const bucketDetails = [
  {
    key: "short",
    name: "Short term",
    explanation: "Money you may need soon. It moves very little, and it is there when you ask for it.",
    color: "short",
  },
  {
    key: "medium",
    name: "Medium term",
    explanation: "Money you can leave for a few years. It moves more, and it has time to recover.",
    color: "medium",
  },
  {
    key: "long",
    name: "Long term",
    explanation: "Money you will not touch. It moves the most, and the years do the work.",
    color: "long",
  },
];

const horizonLabels = {
  underTwoYears: "Under 2 years",
  twoToFiveYears: "2 to 5 years",
  overFiveYears: "Over 5 years",
};

const riskLabels = {
  sell: "I would sell",
  hold: "I would hold",
  investMore: "I would invest more",
};

function getSuggestedPercentages(horizon, riskAnswer) {
  // This is the SPEC's starting mix (Money rule 1); the risk answer adjusts it afterwards (Money rule 2).
  const percentagesByHorizon = {
    underTwoYears: { short: 100, medium: 0, long: 0 },
    twoToFiveYears: { short: 40, medium: 40, long: 20 },
    overFiveYears: { short: 20, medium: 30, long: 50 },
  };

  const percentages = { ...percentagesByHorizon[horizon] };

  // The horizon sets the starting mix; risk shifts it without exceeding the source bucket.
  if (riskAnswer === "sell") {
    const shift = Math.min(20, percentages.long);
    percentages.long -= shift;
    percentages.short += shift;
  } else if (riskAnswer === "investMore") {
    const shift = Math.min(10, percentages.short);
    percentages.short -= shift;
    percentages.long += shift;
  }

  return percentages;
}

function splitAmountIntoBuckets(amountCentavos, percentages) {
  const isValidAmount = typeof amountCentavos === "bigint"
    ? amountCentavos >= 0n
    : Number.isSafeInteger(amountCentavos) && amountCentavos >= 0;
  if (!isValidAmount) {
    throw new RangeError("The amount must be a non-negative whole number of centavos.");
  }

  // Integer centavos avoid fractional-centavo rounding in money calculations.
  const totalCentavos = BigInt(amountCentavos);
  // This calculates each bucket's share; any leftover centavos are assigned below.
  const buckets = bucketDetails.map((bucket) => ({
    ...bucket,
    percentage: percentages[bucket.key],
    amountCentavos: (totalCentavos * BigInt(percentages[bucket.key])) / 100n,
  }));

  // Integer division floors each share; the remainder goes to the largest share, with spec order resolving ties.
  const allocatedCentavos = buckets.reduce((sum, bucket) => sum + bucket.amountCentavos, 0n);
  const remainderCentavos = totalCentavos - allocatedCentavos;
  let remainderBucket = buckets[0];

  for (const bucket of buckets.slice(1)) {
    if (bucket.percentage > remainderBucket.percentage) {
      remainderBucket = bucket;
    }
  }

  remainderBucket.amountCentavos += remainderCentavos;
  return buckets;
}

function formatCentavosAsMXN(amountCentavos) {
  // Division and remainder by 100 separate whole pesos from centavos for display.
  const pesos = amountCentavos / 100n;
  const remainingCentavos = (amountCentavos % 100n).toString().padStart(2, "0");
  const formattedPesos = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(pesos);

  return `MXN $${formattedPesos}.${remainingCentavos}`;
}

function renderAllocation() {
  const percentages = getSuggestedPercentages(demoHorizon, demoRiskAnswer);
  const allocationAmountCentavos = simulatedContribution.status === "confirmed"
    ? simulatedContribution.amountCentavos
    : BigInt(demoAmountCentavos);
  const buckets = splitAmountIntoBuckets(allocationAmountCentavos, percentages);

  document.querySelector("#scenario-amount").textContent = formatCentavosAsMXN(allocationAmountCentavos);
  document.querySelector("#scenario-horizon").textContent = horizonLabels[demoHorizon];
  document.querySelector("#scenario-risk").textContent = riskLabels[demoRiskAnswer];
  document.querySelector("#allocation-total-label").textContent = simulatedContribution.status === "confirmed"
    ? "Total confirmed amount"
    : "Total suggested amount";
  document.querySelector("#allocation-total").textContent = formatCentavosAsMXN(allocationAmountCentavos);

  const bucketList = document.querySelector("#bucket-list");
  bucketList.replaceChildren();
  for (const bucket of buckets) {
    const article = document.createElement("article");
    article.className = "bucket";
    article.style.setProperty("--bucket-color", `var(--${bucket.color})`);

    const copy = document.createElement("div");
    copy.className = "bucket-copy";

    const heading = document.createElement("h3");
    heading.textContent = bucket.name;

    const explanation = document.createElement("p");
    explanation.textContent = bucket.explanation;
    copy.append(heading, explanation);

    const numbers = document.createElement("div");
    numbers.className = "bucket-numbers";

    const amount = document.createElement("strong");
    amount.textContent = formatCentavosAsMXN(bucket.amountCentavos);

    const percentage = document.createElement("span");
    percentage.textContent = `${bucket.percentage}%`;
    numbers.append(amount, percentage);

    const track = document.createElement("div");
    track.className = "share-track";
    track.setAttribute("role", "img");
    track.setAttribute("aria-label", `${bucket.percentage}% allocated to ${bucket.name.toLowerCase()}`);
    track.style.setProperty("--share", `${bucket.percentage}%`);
    const fill = document.createElement("span");
    track.append(fill);

    article.append(copy, numbers, track);
    bucketList.append(article);
  }
}

renderAllocation();

const contributionForm = document.querySelector("#contribution-form");
const contributionAmountInput = document.querySelector("#contribution-amount");
const contributionStatus = document.querySelector("#contribution-status");
const confirmContributionButton = contributionForm.querySelector("button[type='submit']");

contributionAmountInput.value = String(simulatedContribution.amountCentavos);
contributionForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const amountText = contributionAmountInput.value.trim();
  if (!/^\d+$/.test(amountText)) {
    contributionStatus.textContent = "Enter a positive whole number of centavos. The contribution remains pending.";
    return;
  }

  const amountCentavos = BigInt(amountText);
  if (amountCentavos <= 0n) {
    contributionStatus.textContent = "Enter a positive amount. The contribution remains pending.";
    return;
  }

  simulatedContribution.amountCentavos = amountCentavos;
  simulatedContribution.status = "confirmed";
  renderAllocation();
  contributionAmountInput.disabled = true;
  confirmContributionButton.disabled = true;
  contributionStatus.textContent = `Confirmed in this demo for ${formatCentavosAsMXN(amountCentavos)}. The buckets above now use this amount. No real transfer occurred.`;
});

const allocationSection = document.querySelector(".allocation");
const executionGuide = document.querySelector("#execution-guide");
const guideScreens = [...document.querySelectorAll(".guide-screen")];
const guideStepCount = document.querySelector("#guide-step-count");
let currentGuideStep = 0;

function showGuideStep(stepIndex) {
  currentGuideStep = stepIndex;
  guideScreens.forEach((screen, index) => {
    screen.hidden = index !== currentGuideStep;
  });
  guideStepCount.textContent = `Step ${currentGuideStep + 1} of ${guideScreens.length}`;
  document.querySelector("#guide-previous").textContent = currentGuideStep === 0
    ? "Back to suggested allocation"
    : "Previous";
  document.querySelector("#guide-next").hidden = currentGuideStep === guideScreens.length - 1;
  document.querySelector("#guide-return").hidden = currentGuideStep !== guideScreens.length - 1;
  guideScreens[currentGuideStep].querySelector("h2").focus();
}

function returnToAllocation() {
  executionGuide.hidden = true;
  allocationSection.hidden = false;
  document.querySelector("#page-title").focus();
}

document.querySelector("#open-guide").addEventListener("click", () => {
  allocationSection.hidden = true;
  executionGuide.hidden = false;
  document.querySelector("#guide-amount").textContent = formatCentavosAsMXN(BigInt(demoAmountCentavos));
  document.querySelector("#guide-horizon").textContent = horizonLabels[demoHorizon];
  document.querySelector("#guide-title").focus();
  showGuideStep(0);
});

document.querySelector("#guide-previous").addEventListener("click", () => {
  if (currentGuideStep === 0) {
    returnToAllocation();
    return;
  }
  showGuideStep(currentGuideStep - 1);
});

document.querySelector("#guide-next").addEventListener("click", () => {
  showGuideStep(currentGuideStep + 1);
});

document.querySelector("#guide-return").addEventListener("click", returnToAllocation);