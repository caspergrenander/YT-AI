/**
 * 📡 AIConnector - mellanlager för lokala AI-hjärnan
 * Syfte: Koppla AutoUploader_v3.gs och AnalyticsModule_v3.gs till en lokal Flask-server
 *
 * - aiWebhookUrl = "http://127.0.0.1:5000"
 * - getHealth() → GET /ai/health
 * - sendAnalytics(payload) → POST /ai/webhook/analytics
 * - logResult(result) → sparar logg i Drive-mappen "CG_YT_Logs"
 * - tryCatchWrapper(fn) → generell felhanterare för enklare återanrop
 *
 * Krav uppfyllda:
 * - Använder UrlFetchApp.fetch() för alla anrop
 * - Returnerar JavaScript-objekt (inte rå JSON-sträng)
 * - Använder JSON.stringify / JSON.parse
 * - Inga externa bibliotek (fungerar offline inom Google Apps Script-miljön)
 */

/* ========================================
   🔧 Konfiguration
   ======================================== */
var AIConnector = (function () {
  // Bas-URL till den lokala Flask-servern
  var aiWebhookUrl = "http://127.0.0.1:5000";

  // Namn på Drive-mappen där loggar sparas
  var LOG_FOLDER_NAME = "CG_YT_Logs";

  /* ===========================
     ⏱ Hjälpfunktioner
     =========================== */

  // Returnera ISO8601-tidsstämpel (UTC)
  function _nowIso() {
    return new Date().toISOString();
  }

  // Skapar eller hämtar Drive-mappen för loggar
  function _getOrCreateLogFolder() {
    var folders = DriveApp.getFoldersByName(LOG_FOLDER_NAME);
    if (folders.hasNext()) {
      return folders.next();
    }
    return DriveApp.createFolder(LOG_FOLDER_NAME);
  }

  // Skapar en loggfil med tidsstämplad filnamn och JSON-innehåll
  function _createLogFile(prefix, obj) {
    try {
      var folder = _getOrCreateLogFolder();
      var ts = _nowIso().replace(/[:.]/g, "-");
      var name = (prefix ? prefix + "_" : "log_") + ts + ".json";
      var content = JSON.stringify({
        timestamp: _nowIso(),
        prefix: prefix || "",
        payload: obj
      }, null, 2);
      folder.createFile(name, content, MimeType.PLAIN_TEXT);
      return { status: "ok", fileName: name };
    } catch (e) {
      // Om Drive misslyckas, returnera felobjekt men stör inte flödet
      return { status: "error", error: String(e) };
    }
  }

  // Säkerställ att responseText parsas till JS-objekt
  function _safeParseJson(text) {
    try {
      return JSON.parse(text);
    } catch (e) {
      return { __parse_error__: true, raw: text };
    }
  }

  /* ===========================
     🛡 tryCatchWrapper
     =========================== */
  /**
   * tryCatchWrapper(fn, context)
   * - fn: en parameterlös funktion som genomför jobbet (t.ex. lambda)
   * - context: kort text som beskriver sammanhanget (t.ex. "sendAnalytics")
   * Returnerar ett objekt:
   *   { status: "ok", result: ... } eller { status: "error", error: "...", stack: "..." }
   */
  function tryCatchWrapper(fn, context) {
    context = context || "AIConnector";
    try {
      var res = fn();
      return { status: "ok", result: res };
    } catch (e) {
      var errObj = {
        status: "error",
        context: context,
        error: String(e),
        stack: (e && e.stack) ? e.stack : null,
        timestamp: _nowIso()
      };
      // försök logga felet i Drive för spårbarhet
      try {
        _createLogFile("error_" + context, errObj);
      } catch (ignored) { /* ignored */ }
      return errObj;
    }
  }

  /* ===========================
     🔎 GET /ai/health
     =========================== */
  function getHealth() {
    return tryCatchWrapper(function () {
      var url = aiWebhookUrl.replace(/\/$/, "") + "/ai/health";
      var options = {
        method: "get",
        muteHttpExceptions: true
      };
      var resp = UrlFetchApp.fetch(url, options);
      var code = resp.getResponseCode();
      var text = resp.getContentText();
      var parsed = _safeParseJson(text);
      if (code >= 200 && code < 300) {
        return { statusCode: code, body: parsed };
      } else {
        return { statusCode: code, body: parsed, error: "Non-2xx response" };
      }
    }, "getHealth");
  }

  /* ===========================
     📤 POST /ai/webhook/analytics
     =========================== */
  /**
   * sendAnalytics(payload)
   * - payload: JavaScript-objekt som ska skickas till AI-servern
   * Returnerar: parsed response object eller felobjekt
   */
  function sendAnalytics(payload) {
    return tryCatchWrapper(function () {
      var url = aiWebhookUrl.replace(/\/$/, "") + "/ai/webhook/analytics";
      var bodyText = JSON.stringify(payload || {});
      var options = {
        method: "post",
        contentType: "application/json",
        muteHttpExceptions: true,
        payload: bodyText,
        headers: {
          "Accept": "application/json"
        }
      };

      // Logga request (kort preview) innan sändning
      try {
        var preview = {
          timestamp: _nowIso(),
          endpoint: "/ai/webhook/analytics",
          payload_preview: payload && typeof payload === "object" ? _shallowPreview(payload) : String(payload)
        };
        _createLogFile("request_analytics", preview);
      } catch (logErr) { /* continue */ }

      var resp = UrlFetchApp.fetch(url, options);
      var code = resp.getResponseCode();
      var text = resp.getContentText();
      var parsed = _safeParseJson(text);

      // Logga resultat i Drive
      try {
        var logResultObj = {
          timestamp: _nowIso(),
          endpoint: "/ai/webhook/analytics",
          request_preview: payload && typeof payload === "object" ? _shallowPreview(payload) : String(payload),
          response_code: code,
          response_preview: parsed && typeof parsed === "object" ? _shallowPreview(parsed) : parsed
        };
        _createLogFile("response_analytics", logResultObj);
      } catch (logErr) { /* continue */ }

      if (code >= 200 && code < 300) {
        // Om parsed innehåller wrapper {status:"ok", result:...} - returnera result direkt för enkel användning
        if (parsed && parsed.status === "ok" && parsed.result !== undefined) {
          return parsed.result;
        }
        return parsed;
      } else {
        return { statusCode: code, body: parsed, error: "Non-2xx response" };
      }
    }, "sendAnalytics");
  }

  // Hjälp för att bygga en liten förhandsvisning av stora objekt (för loggning)
  function _shallowPreview(obj) {
    try {
      if (obj === null) return null;
      if (typeof obj !== "object") return obj;
      var keys = Object.keys(obj).slice(0, 10);
      var preview = {};
      keys.forEach(function (k) {
        var v = obj[k];
        if (typeof v === "string" && v.length > 200) {
          preview[k] = v.slice(0, 200) + "...";
        } else if (Array.isArray(v)) {
          preview[k] = v.slice(0, 5);
        } else if (typeof v === "object") {
          preview[k] = "[object]";
        } else {
          preview[k] = v;
        }
      });
      return preview;
    } catch (e) {
      return { __preview_error__: String(e) };
    }
  }

  /* ===========================
     💾 logResult(result)
     =========================== */
  /**
   * logResult(result, prefix)
   * - Sparar resultatet (objekt) som en tidsstämplad JSON-fil i Drive/CG_YT_Logs
   * - Lägg till tidsstämpel och kort metadata
   */
  function logResult(result, prefix) {
    return tryCatchWrapper(function () {
      prefix = prefix || "analysis_result";
      var toSave = {
        timestamp: _nowIso(),
        result: result
      };
      return _createLogFile(prefix, toSave);
    }, "logResult");
  }

  /* ===========================
     🔁 Exponera publika funktioner
     =========================== */
  return {
    // Konfiguration
    aiWebhookUrl: aiWebhookUrl,

    // Funktioner
    getHealth: getHealth,
    sendAnalytics: sendAnalytics,
    logResult: logResult,
    tryCatchWrapper: tryCatchWrapper,

    // Internt (användbart för test/diagnostik)
    _nowIso: _nowIso,
    _getOrCreateLogFolder: _getOrCreateLogFolder
  };
})();

/* ===========================
   📌 Exempel på användning (kommentera bort i produktion)
   ===========================
function testAIConnector() {
  var health = AIConnector.getHealth();
  Logger.log("Health: %s", JSON.stringify(health));
  var payload = { event: "test", text: "Hej från Apps Script", lang: "sv" };
  var res = AIConnector.sendAnalytics(payload);
  Logger.log("Analysis: %s", JSON.stringify(res));
  AIConnector.logResult(res, "manual_test");
}
*/