const CONFIG = {
  GSA_API_KEY: 'YOUR_GSA_API_KEY', // replace with your GSA API key
  YEAR: '2025'
};

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('TAR Validator')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function validateTarWithPerDiem(data) {
  const duration = parseInt(data.duration);
  const claimedCost = parseFloat(data.totalCost);
  const city = encodeURIComponent(data.city.trim().replace(/[.’-]/g, ' '));
  const state = data.state.toUpperCase();
  const url = `https://api.gsa.gov/travel/perdiem/v2/rates/city/${city}/state/${state}/year/${CONFIG.YEAR}?api_key=${CONFIG.GSA_API_KEY}`;

  try {
    const response = UrlFetchApp.fetch(url);
    const perDiemData = JSON.parse(response.getContentText());

    if (!perDiemData || !perDiemData[0]) {
      return {
        expectedCost: 0,
        claimedCost: claimedCost.toFixed(2),
        duration,
        isValid: false,
        message: 'Per diem data not found for specified city/state.'
      };
    }

    const rate = perDiemData[0];
    const mie = parseFloat(rate.Meals);
    const avgLodging = average([
      rate.Jan, rate.Feb, rate.Mar, rate.Apr, rate.May, rate.Jun,
      rate.Jul, rate.Aug, rate.Sep, rate.Oct, rate.Nov, rate.Dec
    ]);

    const expectedCost = duration * (mie + avgLodging);
    const isValid = claimedCost <= expectedCost + 50; // small buffer

    return {
      expectedCost: expectedCost.toFixed(2),
      claimedCost: claimedCost.toFixed(2),
      duration,
      isValid,
      message: isValid
        ? "✅ Trip cost is within expected per diem."
        : "⚠️ Claimed cost exceeds expected per diem range."
    };
  } catch (e) {
    return {
      expectedCost: 0,
      claimedCost: claimedCost.toFixed(2),
      duration,
      isValid: false,
      message: `Error contacting GSA API: ${e.message}`
    };
  }
}

function average(values) {
  const nums = values.map(v => parseFloat(v)).filter(n => !isNaN(n));
  const total = nums.reduce((a, b) => a + b, 0);
  return nums.length ? total / nums.length : 0;
}
