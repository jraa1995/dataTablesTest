// main.gs

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('GSA Tools')
    .addItem('Fetch Per Diem (ZIP/City)', 'getPerDiemRatesByZipOrCity')
    .addToUi();
}

function getPerDiemRatesByZipOrCity() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var inputSheet = ss.getSheetByName('Input');
  var outputSheet = ss.getSheetByName('PerDiemRates') || ss.insertSheet('PerDiemRates');

  if (!inputSheet) {
    SpreadsheetApp.getUi().alert('Missing "Input" sheet.');
    return;
  }

  var lastRow = inputSheet.getLastRow();
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('No data found in "Input" sheet (starting from row 2).');
    return;
  }

  var data = inputSheet.getRange(2, 1, lastRow - 1, 3).getValues(); // A2:C

  outputSheet.clearContents();
  outputSheet.appendRow([
    'ZIP', 'City', 'State', 'County', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Meals'
  ]);

  data.forEach(function(row) {
    var zip = row[0] ? row[0].toString().trim() : '';
    var city = row[1] ? row[1].toString().trim() : '';
    var state = row[2] ? row[2].toString().trim().toUpperCase() : '';

    try {
      var rateData = null;

      // Priority 1: City + State
      if (city && state) {
        rateData = fetchRatesByCity(city, state);
      }

      // Fallback: ZIP only
      if (!rateData && zip) {
        var didData = fetchDidFromZip(zip);
        if (didData) {
          rateData = fetchRatesByDid(didData.ST, didData.DID);
          state = didData.ST;
        }
      }

      if (!rateData) {
        Logger.log('No rate data found for ZIP=' + zip + ', City=' + city + ', State=' + state);
        return;
      }

      outputSheet.appendRow([
        zip,
        rateData.City,
        rateData.State,
        rateData.County,
        rateData.Jan,
        rateData.Feb,
        rateData.Mar,
        rateData.Apr,
        rateData.May,
        rateData.Jun,
        rateData.Jul,
        rateData.Aug,
        rateData.Sep,
        rateData.Oct,
        rateData.Nov,
        rateData.Dec,
        rateData.Meals
      ]);

    } catch (error) {
      Logger.log('Error processing input (ZIP=' + zip + ', City=' + city + ', State=' + state + '): ' + error.message);
    }
  });

  SpreadsheetApp.getUi().alert('Per diem rates fetched and written to "PerDiemRates".');
}
