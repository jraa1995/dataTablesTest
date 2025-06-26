// config.gs

/**
 * Configuration constants for the TAR Validator + GSA Per Diem integration
 */
const CONFIG = {
  GSA_API_KEY: 'YOUR_GSA_API_KEY_HERE',  // Replace with your actual GSA API key
  YEAR: '2025',                          // Fiscal year for lookup
  DEFAULT_MIE: 79,                       // Default M&IE value fallback
  DEFAULT_LODGING: 150,                 // Default lodging fallback
  COST_BUFFER: 50                       // Acceptable buffer in overage (USD)
};


// utils.gs

/**
 * Utility to average numeric strings from GSA rate response
 */
function average(values) {
  const nums = values.map(v => parseFloat(v)).filter(n => !isNaN(n));
  const total = nums.reduce((a, b) => a + b, 0);
  return nums.length ? total / nums.length : 0;
}

/**
 * Fetch per diem rate from GSA API by city/state
 * @param {string} city
 * @param {string} state
 * @returns {object|null}
 */
function fetchPerDiemByCityState(city, state) {
  const cleanedCity = encodeURIComponent(city.trim().replace(/[.’-]/g, ' '));
  const url = `https://api.gsa.gov/travel/perdiem/v2/rates/city/${cleanedCity}/state/${state}/year/${CONFIG.YEAR}?api_key=${CONFIG.GSA_API_KEY}`;

  try {
    const response = UrlFetchApp.fetch(url);
    const data = JSON.parse(response.getContentText());
    return data.length ? data[0] : null;
  } catch (error) {
    Logger.log(`GSA fetch error: ${error.message}`);
    return null;
  }
}


// main.gs

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('TAR Validator')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Validates the TAR entry using per diem logic from GSA
 * @param {object} data
 */
function validateTarWithPerDiem(data) {
  const duration = parseInt(data.duration);
  const claimedCost = parseFloat(data.totalCost);
  const city = data.city;
  const state = data.state.toUpperCase();

  let rateData = fetchPerDiemByCityState(city, state);
  let mie = CONFIG.DEFAULT_MIE;
  let avgLodging = CONFIG.DEFAULT_LODGING;

  if (rateData) {
    mie = parseFloat(rateData.Meals) || CONFIG.DEFAULT_MIE;
    avgLodging = average([
      rateData.Jan, rateData.Feb, rateData.Mar, rateData.Apr,
      rateData.May, rateData.Jun, rateData.Jul, rateData.Aug,
      rateData.Sep, rateData.Oct, rateData.Nov, rateData.Dec
    ]);
  }

  const expectedCost = duration * (mie + avgLodging);
  const isValid = claimedCost <= expectedCost + CONFIG.COST_BUFFER;

  return {
    expectedCost: expectedCost.toFixed(2),
    claimedCost: claimedCost.toFixed(2),
    duration,
    isValid,
    message: isValid
      ? "✅ Trip cost is within expected per diem."
      : "⚠️ Claimed cost exceeds expected per diem range."
  };
}
