// Run after DOM ready to avoid null element errors
document.addEventListener("DOMContentLoaded", () => {
  const qs = (id) => document.getElementById(id);
  const lengthEl = qs("length");
  const widthEl = qs("width");
  const heightEl = qs("height");
  const unitSelect = qs("unitSelect");
  const densityEl = qs("density");
  const precisionEl = qs("precision");
  const ratioAEl = qs("ratioA");
  const ratioBEl = qs("ratioB");
  const wasteEl = qs("waste");
  const computeBtn = qs("computeBtn");
  const resetBtn = qs("resetBtn");
  const preset6040 = qs("preset6040");
  const preset5050 = qs("preset5050");
  const volumeDisplay = qs("volumeDisplay");
  const compA = qs("compA");
  const compB = qs("compB");

  // Defensive: if critical elements are missing, stop and log
  if (
    !lengthEl ||
    !widthEl ||
    !heightEl ||
    !unitSelect ||
    !ratioAEl ||
    !ratioBEl ||
    !computeBtn
  ) {
    console.error(
      "Element manquant dans le DOM — vérifie les IDs : length, width, height, unitSelect, ratioA, ratioB, computeBtn."
    );
    return;
  }

  function unitToCm(value, unit) {
    value = Number(value);
    if (!isFinite(value)) return 0;
    switch (unit) {
      case "mm":
        return value / 10;
      case "in":
        return value * 2.54;
      default:
        return value; // cm
    }
  }

  function round(v, dec) {
    const m = Math.pow(10, dec);
    return Math.round(v * m) / m;
  }

  function setPreset(a, b) {
    if (ratioAEl) ratioAEl.value = a;
    if (ratioBEl) ratioBEl.value = b;
  }

  function compute() {
    const unit = unitSelect.value;
    const L = unitToCm(lengthEl.value || 0, unit);
    const W = unitToCm(widthEl.value || 0, unit);
    const H = unitToCm(heightEl.value || 0, unit);
    const density = Number(densityEl ? densityEl.value : 1) || 1;

    const ratioA = ratioAEl ? Number(ratioAEl.value) : 60;
    const ratioB = ratioBEl ? Number(ratioBEl.value) : 40;
    const addWaste = wasteEl ? wasteEl.checked : false;
    const prec = precisionEl ? Number(precisionEl.value) : 2;

    if (L <= 0 || W <= 0 || H <= 0) {
      alert("Saisis des dimensions valides (>0).");
      return null;
    }

    const volume = L * W * H; // cm^3 == ml
    const mass = volume * density;

    let total = volume;
    if (addWaste) total = total * 1.1;

    let sumRatio = ratioA + ratioB;
    let normA = ratioA,
      normB = ratioB;
    if (sumRatio <= 0) {
      normA = 50;
      normB = 50;
      sumRatio = 100;
    }
    if (Math.abs(sumRatio - 100) > 0.001) {
      normA = (ratioA / sumRatio) * 100;
      normB = (ratioB / sumRatio) * 100;
    }

    const compAml = total * (normA / 100);
    const compBml = total * (normB / 100);

    // Update UI safely
    if (volumeDisplay) volumeDisplay.textContent = round(volume, prec) + " ml";
    if (compA)
      compA.textContent =
        round(compAml, prec) + " ml (" + round(normA, 2) + "%)";
    if (compB)
      compB.textContent =
        round(compBml, prec) + " ml (" + round(normB, 2) + "%)";

    return {
      volume_ml: round(volume, 3),
      mass_g: round(mass, 3),
      componentA_ml: round(compAml, 3),
      componentB_ml: round(compBml, 3),
    };
  }

  // Wire events
  computeBtn.addEventListener("click", compute);
  resetBtn.addEventListener("click", () => {
    lengthEl.value = 200;
    widthEl.value = 30;
    heightEl.value = 30;
    if (densityEl) densityEl.value = 1;
    setPreset(60, 40);
    if (unitSelect) unitSelect.value = "mm";
    if (wasteEl) wasteEl.checked = false;
    compute();
  });
  if (preset6040) preset6040.addEventListener("click", () => setPreset(60, 40));
  if (preset5050) preset5050.addEventListener("click", () => setPreset(50, 50));

  // Initial compute
  compute();
});
