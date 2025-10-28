// 🔁 AI_Sync_Manager.gs
// Synkar Drive, Sheet och AI
// Funktioner:
//  • syncDriveWithSheet() – matchar nya filer i Drive med poster i sheetet.
//  • archiveOldAnalytics() – flyttar äldre data till en arkivmapp.
//  • triggerFullSync() – kör båda och loggar resultat via AIConnector.logResult()
// Testfunktioner: manualSync()

/* globals AIConnector, DriveApp, SpreadsheetApp, Utilities, Logger, AIUtils */

function AI_Sync_Manager() {
  this.driveFolderName = "CG_YT_AutoPilot";
  this.analyticsSheetName = "YT_Analytics_Data";
  this.archiveFolderName = "CG_YT_Archive";
}

// 🔎 syncDriveWithSheet - leta efter nya filer i Drive och skriv rader i sheet om saknas
AI_Sync_Manager.prototype.syncDriveWithSheet = function() {
  var results = {added: 0, matched: 0, errors: []};
  try {
    var folders = DriveApp.getFoldersByName(this.driveFolderName);
    if (!folders.hasNext()) {
      Logger.log('⚠️ syncDriveWithSheet: Ingen Drive-mapp med namn ' + this.driveFolderName);
      return results;
    }
    var folder = folders.next();

    // Hämta sheet
    var sheetFileIter = DriveApp.getFilesByName(this.analyticsSheetName);
    var sheet;
    if (sheetFileIter.hasNext()) {
      sheet = SpreadsheetApp.open(sheetFileIter.next()).getActiveSheet();
    } else {
      Logger.log('ℹ️ syncDriveWithSheet: Analytics sheet saknas, skapar nytt');
      var newSs = SpreadsheetApp.create(this.analyticsSheetName);
      sheet = newSs.getActiveSheet();
      // Lämna header-setup åt analytics-modulen
    }

    // Bygg upp en set med befintliga filnamn i sheet (kolumn D = title i topp-listan)
    var existing = {};
    try {
      var data = sheet.getRange('A11:D100').getValues();
      for (var i = 0; i < data.length; i++) {
        if (data[i] && data[i][3]) {
          existing[data[i][3].toString()] = true;
        }
      }
    } catch (e) {
      // Ignore range errors
    }

    // Iterera Drive-filer och lägg till nya poster
    var files = folder.getFiles();
    while (files.hasNext()) {
      var f = files.next();
      var name = f.getName();
      if (name.toLowerCase().indexOf('.mp4') === -1) continue;
      if (!existing[name]) {
        // Lägg till rad i sheet (under topp-listan)
        try {
          var now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
          sheet.appendRow([now, '', '', name, '', '', '', '', '', '']);
          existing[name] = true;
          results.added++;
        } catch (errRow) {
          results.errors.push('RowAddError: ' + errRow);
        }
      } else {
        results.matched++;
      }
    }
  } catch (err) {
    results.errors.push(err.toString());
  }

  return results;
};

// 📦 archiveOldAnalytics - flytta äldre sheet-filer till arkivmapp
AI_Sync_Manager.prototype.archiveOldAnalytics = function(daysThreshold) {
  var results = {moved: 0, errors: []};
  daysThreshold = daysThreshold || 90;
  try {
    var filesIter = DriveApp.getFilesByName(this.analyticsSheetName);
    if (!filesIter.hasNext()) {
      Logger.log('ℹ️ archiveOldAnalytics: Inga analytics-filer att arkivera');
      return results;
    }
    var file = filesIter.next();
    var created = file.getDateCreated();
    var cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysThreshold);
    if (created < cutoff) {
      // Hitta eller skapa arkivmapp
      var archives = DriveApp.getFoldersByName(this.archiveFolderName);
      var archiveFolder = archives.hasNext() ? archives.next() : DriveApp.createFolder(this.archiveFolderName);
      // Flytta fil (lägg till i arkiv och ta bort från root/mapp)
      archiveFolder.addFile(file);
      DriveApp.getRootFolder().removeFile(file);
      results.moved++;
      Logger.log('📦 Flyttade analytics till arkiv: ' + file.getName());
    } else {
      Logger.log('ℹ️ archiveOldAnalytics: Fil är inte gammal nog att arkivera');
    }
  } catch (e) {
    results.errors.push(e.toString());
  }
  return results;
};

// ⚡ triggerFullSync - kör båda sync-funktionerna och loggar via AIConnector.logResult
AI_Sync_Manager.prototype.triggerFullSync = function() {
  var timestamp = new Date();
  var report = {timestamp: timestamp.toISOString(), results: {}};
  try {
    var syncRes = this.syncDriveWithSheet();
    report.results.syncDriveWithSheet = syncRes;
    var archiveRes = this.archiveOldAnalytics(90);
    report.results.archiveOldAnalytics = archiveRes;

    // Logga rapport till AIConnector
    try {
      if (typeof AIConnector !== 'undefined' && typeof AIConnector.logResult === 'function') {
        AIConnector.logResult({action: 'full_sync', report: report});
      }
    } catch (logErr) {
      Logger.log('⚠️ AIConnector.logResult misslyckades: ' + logErr);
    }
  } catch (err) {
    report.error = err.toString();
  }
  return report;
};

// 🧪 MANUELL SYNC (test)
function manualSync() {
  var mgr = new AI_Sync_Manager();
  var report = mgr.triggerFullSync();
  Logger.log('manualSync report: ' + (AIUtils ? AIUtils.preview(report) : JSON.stringify(report)));
}
