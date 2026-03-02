/**
 * Imports CSV data from a Google Drive file into the active spreadsheet.
 * This function is designed to be triggered manually or on a schedule.
 */
function importCSVFromDrive() {
  var fileName = "looker_activity_log.csv"; // The name of the file to import
  var sheetName = "ActivityData"; // The name of the sheet to update

  var files = DriveApp.getFilesByName(fileName);
  
  if (!files.hasNext()) {
    Logger.log("File not found: " + fileName);
    return;
  }

  var file = files.next();
  var csvData = Utilities.parseCsv(file.getBlob().getDataAsString());
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  
  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  } else {
    sheet.clear(); // Clear existing data
  }

  // Write data to sheet
  if (csvData.length > 0) {
    sheet.getRange(1, 1, csvData.length, csvData[0].length).setValues(csvData);
    Logger.log("Imported " + csvData.length + " rows from " + fileName);
  } else {
    Logger.log("CSV file is empty.");
  }
}

/**
 * Menu item to run the import manually
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Meet Stats')
      .addItem('Import CSV Data', 'importCSVFromDrive')
      .addToUi();
}
