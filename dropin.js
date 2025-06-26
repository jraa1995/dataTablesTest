var GSA = {};

GSA.fetchRates = function(input) {
  var zip = input.zip ? input.zip.toString().trim() : '';
  var city = input.city ? input.city.toString().trim() : '';
  var state = input.state ? input.state.toString().trim().toUpperCase() : '';

  var rateData = null;

  if (city && state) {
    rateData = fetchRatesByCity(city, state);
  }

  if (!rateData && zip) {
    var didData = fetchDidFromZip(zip);
    if (didData) {
      rateData = fetchRatesByDid(didData.ST, didData.DID);
      state = didData.ST;
    }
  }

  if (!rateData) return null;

  return {
    zip: zip || null,
    city: rateData.City,
    state: rateData.State,
    county: rateData.County,
    rates: {
      Jan: rateData.Jan,
      Feb: rateData.Feb,
      Mar: rateData.Mar,
      Apr: rateData.Apr,
      May: rateData.May,
      Jun: rateData.Jun,
      Jul: rateData.Jul,
      Aug: rateData.Aug,
      Sep: rateData.Sep,
      Oct: rateData.Oct,
      Nov: rateData.Nov,
      Dec: rateData.Dec,
      Meals: rateData.Meals
    }
  };
};