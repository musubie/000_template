/**
 * @fileoverview Legacy CSV import utility
 * Imports CSV data from Google Drive into a spreadsheet.
 * Note: Uses standalone GAS pattern with openById.
 */

/**
 * Imports CSV data from a Google Drive file into the target spreadsheet.
 */
function importCSVFromDrive() {
  const fileName = "looker_activity_log.csv";
  const sheetName = "ActivityData";
  const spreadsheetId = Config.get("SPREADSHEET_IDS").CALENDAR_ANALYSIS;

  const files = DriveApp.getFilesByName(fileName);

  if (!files.hasNext()) {
    Logger.log(`File not found: ${fileName}`);
    return { success: false, reason: "File not found" };
  }

  const file = files.next();
  const csvData = Utilities.parseCsv(file.getBlob().getDataAsString());

  const ss = SpreadsheetApp.openById(spreadsheetId);
  let sheet = ss.getSheetByName(sheetName);

  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  } else {
    sheet.clear();
  }

  // Write data to sheet
  if (csvData.length > 0) {
    sheet.getRange(1, 1, csvData.length, csvData[0].length).setValues(csvData);
    Logger.log(`Imported ${csvData.length} rows from ${fileName}`);
    return { success: true, rows: csvData.length };
  }
  Logger.log("CSV file is empty.");
  return { success: false, reason: "Empty file" };
}
