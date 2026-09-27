/**
 * Google Apps Script Web App that appends survey submissions as rows
 * in a Google Sheet. Deploy this bound to the sheet (Extensions > Apps
 * Script), then deploy as a Web App (see apps-script/README.md).
 */

var SHEET_NAME = 'Responses';
var ACTIVITY_KEYS = ['work', 'meeting', 'phone_call', 'social_event', 'exercise'];

var COLUMNS = ['timestamp', 'time_of_day', 'sleep', 'mood', 'physical', 'seizures_scale', 'seizures_note']
  .concat(ACTIVITY_KEYS.reduce(function (acc, key) {
    return acc.concat([key + '_done', key + '_duration']);
  }, []))
  .concat(['difficulty', 'free_text']);

function getOrCreateSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS);
  }
  return sheet;
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = getOrCreateSheet_();

    var row = COLUMNS.map(function (key) {
      var value = data[key];
      if (value === undefined || value === null) return '';
      return value;
    });

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, message: 'Daily Tracker webhook is running.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
