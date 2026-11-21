let targetReserveCentavos = null;
let liquidCashCentavos = null;
let monthlyIncomeCentavos = null;
let monthlySetAsideCentavos = null;
let purposeAnswer = "";
let selectedHorizon = "";
let selectedRiskAnswer = "";
const simulatedContribution = { amountCentavos: null, status: "pending" };

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

const projectionMonths = [12, 36, 60];
const growthFactorScale = 1_000_000_000_000n;
const annualRates = {
  short: 0.07,
  medium: 0.09,
  long: 0.12,
  bank: 0,
};

function deriveMonthlyGrowthFactor(annualRate) {
  // Convert the annual rate to its gross monthly multiplier, then scale it once so balance growth never uses floating point.
  const monthlyGrowthFactor = (1 + annualRate) ** (1 / 12);
  return BigInt(Math.round(monthlyGrowthFactor * Number(growthFactorScale)));
}

const monthlyGrowthFactors = {
  short: deriveMonthlyGrowthFactor(annualRates.short),
  medium: deriveMonthlyGrowthFactor(annualRates.medium),
  long: deriveMonthlyGrowthFactor(annualRates.long),
  bank: deriveMonthlyGrowthFactor(annualRates.bank),
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

function projectBalances(confirmedAmountCentavos, percentages) {
  const monthlyContributions = splitAmountIntoBuckets(confirmedAmountCentavos, percentages);
  const balances = { short: 0n, medium: 0n, long: 0n, bank: 0n };
  const results = { short: {}, medium: {}, long: {}, bank: {} };

  for (let month = 1; month <= projectionMonths.at(-1); month += 1) {
    for (const bucket of bucketDetails) {
      // Round each bucket's fixed-point growth to the nearest centavo before adding this month's contribution.
      balances[bucket.key] = (balances[bucket.key] * monthlyGrowthFactors[bucket.key] + growthFactorScale / 2n)
        / growthFactorScale;
      balances[bucket.key] += monthlyContributions.find((contribution) => contribution.key === bucket.key).amountCentavos;
    }

    // The bank earns 0%; add the same month's full contribution after growth, as the spec requires.
    balances.bank = (balances.bank * monthlyGrowthFactors.bank + growthFactorScale / 2n) / growthFactorScale;
    balances.bank += BigInt(confirmedAmountCentavos);

    if (projectionMonths.includes(month)) {
      for (const key of Object.keys(balances)) {
        results[key][month] = balances[key];
      }
    }
  }

  return results;
}

function renderProjection(confirmedAmountCentavos) {
  const percentages = getSuggestedPercentages(selectedHorizon, selectedRiskAnswer);
  const results = projectBalances(confirmedAmountCentavos, percentages);

  for (const key of Object.keys(results)) {
    for (const month of projectionMonths) {
      document.querySelector(`#projection-${key}-${month}`).textContent = formatCentavosAsMXN(results[key][month]);
    }
  }

  document.querySelector("#projection-section").hidden = false;
}

function formatCentavosAsMXN(amountCentavos) {
  // Division and remainder by 100 separate whole pesos from centavos for display.
  const pesos = amountCentavos / 100n;
  const remainingCentavos = (amountCentavos % 100n).toString().padStart(2, "0");
  const formattedPesos = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(pesos);

  return `MXN $${formattedPesos}.${remainingCentavos}`;
}

function formatCentavosAsPesoInput(amountCentavos) {
  // Separate integer pesos and centavos so the prefilled peso input round-trips through the shared parser exactly.
  const pesos = amountCentavos / 100n;
  const centavos = (amountCentavos % 100n).toString().padStart(2, "0");
  return `${pesos}.${centavos}`;
}

function parsePesosAsCentavos(amountText) {
  const cleanedAmount = amountText.trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(cleanedAmount)) {
    return null;
  }

  const [pesosText, centavosText = ""] = cleanedAmount.split(".");
  // Convert the typed pesos and optional decimal digits directly to integer centavos without floating-point money math.
  return BigInt(pesosText) * 100n + BigInt(centavosText.padEnd(2, "0") || "0");
}

function parseWholeNumber(numberText) {
  const cleanedText = numberText.trim();
  if (!/^\d+$/.test(cleanedText)) {
    return null;
  }
  return BigInt(cleanedText);
}

function parseVacancyMonthsAsTenths(numberText) {
  const cleanedText = numberText.trim();
  if (!/^\d+(?:\.\d)?$/.test(cleanedText)) {
    return null;
  }

  const [wholeText, tenthText = ""] = cleanedText.split(".");
  // Vacancy months is a plain quantity in tenths of a month, not money, so it stays integer arithmetic.
  return BigInt(wholeText) * 10n + BigInt(tenthText || "0");
}

function roundPositiveQuotient(numeratorCentavos, divisor) {
  // Round an exact integer-centavo division to the nearest centavo; a remainder at least half of the divisor rounds up.
  if (numeratorCentavos < 0n) {
    throw new RangeError("The division numerator must not be negative.");
  }
  if (divisor <= 0n) {
    throw new RangeError("The division divisor must be greater than zero.");
  }
  const quotient = numeratorCentavos / divisor;
  const remainder = numeratorCentavos % divisor;
  return remainder * 2n >= divisor ? quotient + 1n : quotient;
}

function calculateReserve(monthlyRentCentavos, unitCount, vacancyTenths, repairPercentage, propertyTaxCentavos) {
  // Guard the unit count first because it divides total monthly rent to find the average rent for one unit.
  if (unitCount < 1n) {
    throw new RangeError("The number of rental units must be at least 1.");
  }

  // Vacancy allowance = vacancy months × average monthly rent per unit; vacancy tenths are divided only at this final centavo rounding step.
  const vacancyAllowanceCentavos = roundPositiveQuotient(
    monthlyRentCentavos * vacancyTenths,
    unitCount * 10n,
  );

  // Repair allowance = the editable whole percentage of ANNUAL rent. Annual rent is total monthly rent × 12.
  const annualRentCentavos = monthlyRentCentavos * 12n;
  const repairAllowanceCentavos = roundPositiveQuotient(
    annualRentCentavos * repairPercentage,
    100n,
  );

  const targetCentavos = vacancyAllowanceCentavos + repairAllowanceCentavos + propertyTaxCentavos;
  return { vacancyAllowanceCentavos, repairAllowanceCentavos, propertyTaxCentavos, targetCentavos };
}

const reserveSizeStep = document.querySelector("#reserve-size-step");
const reserveLocateStep = document.querySelector("#reserve-locate-step");
const reserveSizeForm = document.querySelector("#reserve-size-form");
const reserveSizeError = document.querySelector("#reserve-size-error");

reserveSizeForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const unitCount = parseWholeNumber(document.querySelector("#unit-count").value);
  const monthlyRent = parsePesosAsCentavos(document.querySelector("#total-monthly-rent").value);
  const propertyTax = parsePesosAsCentavos(document.querySelector("#annual-property-tax").value);
  const vacancyText = document.querySelector("#vacancy-months").value.trim();
  const repairText = document.querySelector("#repair-percentage").value.trim();
  const vacancyTenths = parseVacancyMonthsAsTenths(vacancyText);
  const repairPercentage = parseWholeNumber(repairText);

  if (unitCount === null || monthlyRent === null || propertyTax === null || vacancyTenths === null || repairPercentage === null) {
    reserveSizeError.textContent = "Enter whole numbers for units and repair percentage. Enter vacancy months with no more than one decimal place. Enter every money amount in pesos with no more than two decimal places.";
    reserveSizeError.hidden = false;
    return;
  }

  if (unitCount < 1n) {
    reserveSizeError.textContent = "Enter at least 1 rental unit. The unit count must be valid before it is used to divide the rent.";
    reserveSizeError.hidden = false;
    return;
  }

  if (monthlyRent < 0n || propertyTax < 0n || vacancyTenths < 0n || repairPercentage < 0n) {
    reserveSizeError.textContent = "Amounts and counts cannot be negative.";
    reserveSizeError.hidden = false;
    return;
  }

  const reserve = calculateReserve(monthlyRent, unitCount, vacancyTenths, repairPercentage, propertyTax);
  targetReserveCentavos = reserve.targetCentavos;

  document.querySelector("#vacancy-allowance").textContent = formatCentavosAsMXN(reserve.vacancyAllowanceCentavos);
  document.querySelector("#repair-allowance").textContent = formatCentavosAsMXN(reserve.repairAllowanceCentavos);
  document.querySelector("#property-tax-allowance").textContent = formatCentavosAsMXN(reserve.propertyTaxCentavos);
  document.querySelector("#target-reserve").textContent = formatCentavosAsMXN(reserve.targetCentavos);
  reserveSizeError.hidden = true;
  document.querySelector("#reserve-size-result").hidden = false;
  document.querySelector("#continue-to-locate").focus();
});

document.querySelector("#continue-to-locate").addEventListener("click", () => {
  reserveSizeStep.hidden = true;
  reserveLocateStep.hidden = false;
  document.querySelector("#reserve-locate-title").focus();
});

document.querySelector("#reserve-locate-back").addEventListener("click", () => {
  reserveLocateStep.hidden = true;
  reserveSizeStep.hidden = false;
  document.querySelector("#reserve-size-title").focus();
});

const reserveLocateForm = document.querySelector("#reserve-locate-form");
const reserveLocateError = document.querySelector("#reserve-locate-error");

reserveLocateForm.addEventListener("submit", (event) => {
  event.preventDefault();
  liquidCashCentavos = parsePesosAsCentavos(document.querySelector("#liquid-cash").value);

  if (liquidCashCentavos === null) {
    reserveLocateError.textContent = "Enter the liquid cash in pesos, using no more than two decimal places.";
    reserveLocateError.hidden = false;
    return;
  }

  if (liquidCashCentavos < 0n) {
    reserveLocateError.textContent = "Liquid cash cannot be negative.";
    reserveLocateError.hidden = false;
    return;
  }

  reserveLocateError.hidden = true;
  const comparison = document.querySelector("#reserve-comparison");
  const title = document.querySelector("#reserve-comparison-title");
  const amount = document.querySelector("#reserve-comparison-amount");
  const copy = document.querySelector("#reserve-comparison-copy");

  if (liquidCashCentavos < targetReserveCentavos) {
    title.textContent = "Reserve shortfall";
    amount.textContent = formatCentavosAsMXN(targetReserveCentavos - liquidCashCentavos);
    copy.textContent = "This is the amount needed to bring the cash held liquid up to the target reserve.";
  } else if (liquidCashCentavos > targetReserveCentavos) {
    title.textContent = "Money that has been sitting idle";
    amount.textContent = formatCentavosAsMXN(liquidCashCentavos - targetReserveCentavos);
    copy.textContent = "This excess is above the reserve target and may have been sitting idle in cash.";
  } else {
    title.textContent = "Reserve fully located";
    amount.textContent = formatCentavosAsMXN(0n);
    copy.textContent = "The liquid cash held today exactly matches the target reserve.";
  }

  comparison.hidden = false;
  document.querySelector("#continue-after-reserve").focus();
});

document.querySelector("#continue-after-reserve").addEventListener("click", () => {
  reserveLocateStep.hidden = true;
  document.querySelector("#income-step").hidden = false;
  document.querySelector("#income-title").focus();
});

const incomeStep = document.querySelector("#income-step");
const incomeForm = document.querySelector("#income-form");
const incomeError = document.querySelector("#income-error");
const answersStep = document.querySelector("#answers-step");
const answersForm = document.querySelector("#answers-form");
const answersError = document.querySelector("#answers-error");
const allocationSection = document.querySelector(".allocation");
const contributionAmountInput = document.querySelector("#contribution-amount");

document.querySelector("#answers-back").addEventListener("click", () => {
  answersStep.hidden = true;
  incomeStep.hidden = false;
  document.querySelector("#income-title").focus();
});

incomeForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const income = parsePesosAsCentavos(document.querySelector("#monthly-income").value);
  const setAside = parsePesosAsCentavos(document.querySelector("#monthly-set-aside").value);
  if (income === null || setAside === null) {
    incomeError.textContent = "Enter both amounts in pesos, using no more than two decimal places.";
    incomeError.hidden = false;
    return;
  }
  if (income <= 0n || setAside <= 0n) {
    incomeError.textContent = "Both amounts must be greater than zero.";
    incomeError.hidden = false;
    return;
  }
  if (setAside > income) {
    incomeError.textContent = "The monthly amount set aside cannot be greater than the monthly rental income.";
    incomeError.hidden = false;
    return;
  }

  monthlyIncomeCentavos = income;
  monthlySetAsideCentavos = setAside;
  incomeError.hidden = true;
  incomeStep.hidden = true;
  answersStep.hidden = false;
  document.querySelector("#answers-title").focus();
});

answersForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const purpose = document.querySelector("#purpose-answer").value.trim();
  const horizon = answersForm.querySelector('input[name="horizon"]:checked')?.value;
  const riskAnswer = answersForm.querySelector('input[name="riskAnswer"]:checked')?.value;
  if (!purpose || !horizon || !riskAnswer) {
    answersError.textContent = "Enter a purpose and choose one time horizon and one response.";
    answersError.hidden = false;
    return;
  }

  purposeAnswer = purpose;
  selectedHorizon = horizon;
  selectedRiskAnswer = riskAnswer;
  contributionAmountInput.value = formatCentavosAsPesoInput(monthlySetAsideCentavos);
  answersError.hidden = true;
  renderAllocation();
  answersStep.hidden = true;
  allocationSection.hidden = false;
  document.querySelector("#page-title").focus();
});

function renderAllocation() {
  const percentages = getSuggestedPercentages(selectedHorizon, selectedRiskAnswer);
  const allocationAmountCentavos = simulatedContribution.status === "confirmed"
    ? simulatedContribution.amountCentavos
    : monthlySetAsideCentavos;
  const buckets = splitAmountIntoBuckets(allocationAmountCentavos, percentages);

  document.querySelector("#scenario-amount").textContent = formatCentavosAsMXN(allocationAmountCentavos);
  document.querySelector("#scenario-purpose").textContent = purposeAnswer;
  document.querySelector("#scenario-horizon").textContent = horizonLabels[selectedHorizon];
  document.querySelector("#scenario-risk").textContent = riskLabels[selectedRiskAnswer];
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

const contributionForm = document.querySelector("#contribution-form");
const contributionStatus = document.querySelector("#contribution-status");
const confirmContributionButton = contributionForm.querySelector("button[type='submit']");

contributionForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const amountText = contributionAmountInput.value.trim();
  const amountCentavos = parsePesosAsCentavos(amountText);
  if (amountCentavos === null) {
    contributionStatus.textContent = "Enter the amount in pesos, using no more than two decimal places. The contribution remains pending.";
    return;
  }

  if (amountCentavos <= 0n) {
    contributionStatus.textContent = "Enter a positive amount. The contribution remains pending.";
    return;
  }

  simulatedContribution.amountCentavos = amountCentavos;
  simulatedContribution.status = "confirmed";
  renderAllocation();
  renderProjection(amountCentavos);
  contributionAmountInput.disabled = true;
  confirmContributionButton.disabled = true;
  contributionStatus.textContent = `Confirmed in this demo for ${formatCentavosAsMXN(amountCentavos)}. The buckets above now use this amount. No real transfer occurred.`;
});

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
  const guideAmountCentavos = simulatedContribution.status === "confirmed"
    ? simulatedContribution.amountCentavos
    : monthlySetAsideCentavos;
  document.querySelector("#guide-amount").textContent = formatCentavosAsMXN(guideAmountCentavos);
  document.querySelector("#guide-horizon").textContent = horizonLabels[selectedHorizon];
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