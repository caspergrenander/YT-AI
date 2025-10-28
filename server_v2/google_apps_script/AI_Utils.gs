// 🛠️ AI_Utils.gs
// Hjälpverktyg för AutoUploader / Analytics / Sync
// - formatTimestamp() (svensk tidszon, ISO-format)
// - logInfo(prefix, msg) och logError(prefix, err) - skriver till Logger och skapar enkel loggfil i Drive
// - safeJsonParse(text) - JSON.parse med fallback
// - preview(obj) - returnerar förkortad JSON-förhandsvisning

/* globals DriveApp, Utilities, Session, Logger */

var AIUtils = AIUtils || {};

// 🕒 Svensk tidszon (ISO-format)
AIUtils.formatTimestamp = function(dateObj) {
  try {
    dateObj = dateObj || new Date();
    var tz = Session.getScriptTimeZone() || 'Europe/Stockholm';
    // Utilities.formatDate ger lokal representation; bygg ISO-liknande sträng med svenskt locale
    var formatted = Utilities.formatDate(dateObj, tz, "yyyy-MM-dd'T'HH:mm:ss");
    // Lägg till offset Z/ +01:00 beroende inte trivialt i GAS → vi returnerar lokal tid utan z-ändelse
    return formatted;
  } catch (e) {
    return (new Date()).toISOString();
  }
};

// 📝 Logga info - skriver till Logger och skapar en liten fil i loggmappen om möjligt
AIUtils.logInfo = function(prefix, msg) {
  try {
    var text = '[' + prefix + '] ' + (typeof msg === 'string' ? msg : JSON.stringify(msg));
    Logger.log(text);
    // Försök skriv fil (tyst felhantering)
    try {
      var folderName = "CG_YT_Logs";
      var folders = DriveApp.getFoldersByName(folderName);
      var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
      var name = 'INFO_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HH-mm-ss') + '.txt';
      folder.createFile(name, text);
    } catch (e2) {
      // ignore
    }
  } catch (e) {
    // ignore
  }
};

// ❌ Logga error
AIUtils.logError = function(prefix, err) {
  try {
    var text = '[' + prefix + '] ' + (err && err.toString ? err.toString() : JSON.stringify(err));
    Logger.log(text);
    try {
      var folderName = "CG_YT_Logs";
      var folders = DriveApp.getFoldersByName(folderName);
      var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
      var name = 'ERROR_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HH-mm-ss') + '.txt';
      folder.createFile(name, text);
    } catch (e2) {
      // ignore
    }
  } catch (e) {
    // ignore
  }
};

// 🔐 Säker JSON-parse med fallback
AIUtils.safeJsonParse = function(text) {
  if (!text) return null;
  try {
    if (typeof text === 'object') return text;
    return JSON.parse(text);
  } catch (e) {
    try {
      // Enkel heuristisk fallback: ersätt enkla citationstecken
      var fixed = text.replace(/(\r\n|\n|\r)/gm, " ").replace(/[\u0000-\u001F]+/g, "");
      return JSON.parse(fixed);
    } catch (e2) {
      return null;
    }
  }
};

// 🔍 Preview - förkorta stora objekt till en läsbar sträng
AIUtils.preview = function(obj, maxLen) {
  maxLen = maxLen || 400;
  try {
    var s = (typeof obj === 'string') ? obj : JSON.stringify(obj, null, 0);
    if (s.length <= maxLen) return s;
    return s.slice(0, maxLen) + '...';
  } catch (e) {
    try {
      return String(obj).slice(0, maxLen);
    } catch (e2) {
      return 'preview-error';
    }
  }
};

// 🧪 Enkel testfunktion för AI_Utils
function testAIUtils() {
  Logger.log('formatTimestamp: ' + AIUtils.formatTimestamp(new Date()));
  Logger.log('preview sample: ' + AIUtils.preview({a:1, b:2, long: new Array(200).fill('x').join('')} , 50));
}
