function doPost(e) {
  var payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid JSON input' }))
                         .setMimeType(ContentService.MimeType.JSON);
  }

  var zip = payload.zip ? payload.zip.toString().trim() : '';
  var city = payload.city ? payload.city.toString().trim() : '';
  var state = payload.state ? payload.state.toString().trim().toUpperCase() : '';

  var rateData = null;

  try {
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

    if (!rateData) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'No rate data found.' }))
                           .setMimeType(ContentService.MimeType.JSON);
    }

    var result = {
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

    return ContentService.createTextOutput(JSON.stringify(result))
                         .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}
