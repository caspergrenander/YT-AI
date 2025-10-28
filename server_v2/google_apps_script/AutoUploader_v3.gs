// 🎬 AutoUploader_v3.gs
// Bygger på din tidigare AutoUploader. Använder AIConnector för all nätverkskommunikation.
// - Ersätter direkta UrlFetchApp-anrop med AIConnector.sendAnalytics()
// - Fallback till getVideoMetadata() om AI inte svarar eller misslyckas
// - Loggar uppladdningsresultat via AIConnector.logResult()
// Testfunktioner: manualRun(), testAIMetadata()

/* globals AIConnector, YouTube, DriveApp, SpreadsheetApp, Utilities, Session, Logger, AIUtils */

var AU_CONFIG = {
  SHEET_ID: '', // valfritt: lägg till sheet-id om du vill läsa kö därifrån
  DEFAULT_UPLOAD_FOLDER_ID: ''
};

// 🧠 Konstruktor
function AutoUploader_v3() {
  this.driveFolderName = "CG_YT_AutoPilot";
  this.logFolderName = "CG_YT_Logs";
  this.uploadedFolderName = "Uploaded";
  this.retryCount = 0;
  this.maxRetries = 2;
  this.logRetentionDays = 30;
}

// 🎯 HUVUDFUNKTION
AutoUploader_v3.prototype.runAutopilot = function() {
  var startTime = new Date();
  var success = false;
  var logMessage = "";
  try {
    Logger.log('🔄 AutoUploader_v3 startar...');
    var uploadFolder = this.getUploadFolder();
    if (!uploadFolder) {
      throw new Error('Hittade inte mappen: ' + this.driveFolderName);
    }

    var newVideo = this.findNewVideo(uploadFolder);
    if (!newVideo) {
      logMessage = "ℹ️ Inga nya videor att ladda upp";
      Logger.log(logMessage);
      this.writeToLog(logMessage, startTime);
      this.cleanupOldLogs();
      return;
    }

    // Försök hämta AI-optimerad metadata via AIConnector
    var metadata = this.getAIMetadataSafe(newVideo.getName());

    // 4. Ladda upp till YouTube
    var youtubeUrl = this.uploadToYouTube(newVideo, metadata);

    // 5. FLYTTA TILL UPLOADED-MAPP
    this.moveToUploaded(newVideo, uploadFolder);

    var videoId = this.extractVideoId(youtubeUrl);
    logMessage = '✅ Uploaded: ' + metadata.title + '\n📺 Video ID: ' + videoId + '\n🕓 Time: ' + startTime.toISOString();
    Logger.log('✅ AutoUploader_v3 lyckades: ' + youtubeUrl);
    success = true;

    // Logga resultat till AIConnector (lokal webhook/logg)
    try {
      AIConnector.logResult({
        action: "upload",
        timestamp: AIUtils ? AIUtils.formatTimestamp(new Date()) : new Date().toISOString(),
        videoId: videoId,
        title: metadata.title,
        metadataPreview: AIUtils ? AIUtils.preview(metadata) : JSON.stringify(metadata).slice(0, 500)
      });
    } catch (logErr) {
      Logger.log("⚠️ AIConnector.logResult misslyckades: " + logErr);
    }

  } catch (error) {
    logMessage = '❌ Error: ' + error.message + '\n🕓 Time: ' + startTime.toISOString();
    Logger.log('❌ AutoUploader_v3 error: ' + error.toString());
  } finally {
    // 6. Skriv till loggfil + cleanup
    this.writeToLog(logMessage, startTime, success);
    this.cleanupOldLogs();
  }
};

// 🧠 HÄMTA AI-METADATA MED FELHANTERING OCH FALLBACK
AutoUploader_v3.prototype.getAIMetadataSafe = function(filename) {
  var self = this;
  var fallback = function() {
    return self.getVideoMetadata(filename);
  };

  // Bygg payload för AI baserat på senaste analytics eller filnamn
  var payload = {
    event: "request_metadata",
    filename: filename,
    timestamp: new Date().toISOString(),
    analytics_snapshot: this.getLatestAnalyticsData()
  };

  // Anropa AIConnector via tryCatchWrapper om den finns
  try {
    if (typeof AIConnector !== 'undefined' && typeof AIConnector.tryCatchWrapper === 'function') {
      var response = AIConnector.tryCatchWrapper(function() {
        return AIConnector.sendAnalytics(payload);
      });
      if (response) {
        // response kan vara ett objekt eller sträng; försök tolka
        var parsed = response;
        if (typeof response === 'string') {
          try {
            parsed = JSON.parse(response);
          } catch (e) {
            parsed = null;
          }
        }
        if (parsed && (parsed.recommendations || parsed.analysis || parsed.metadata)) {
          // Normalisera svar till metadata-format som uploadToYouTube förstår
          var rec = parsed.recommendations || parsed.metadata || parsed.analysis;
          return {
            title: rec.recommended_title || rec.title || parsed.title || this.generateTitleFromFilename(filename),
            description: rec.recommended_description || rec.description || this.generateDescriptionFromAI(parsed) || this.getVideoMetadata(filename).description,
            tags: rec.recommended_tags || rec.tags || this.getVideoMetadata(filename).tags,
            category: rec.recommended_category || '20',
            privacy: rec.recommended_privacy || 'unlisted',
            scheduleTime: rec.recommended_upload_time || null
          };
        }
      }
    } else if (typeof AIConnector !== 'undefined' && typeof AIConnector.sendAnalytics === 'function') {
      // Fallback: direkt anrop om tryCatchWrapper saknas
      var resp = AIConnector.sendAnalytics(payload);
      if (resp) {
        try {
          var parsed2 = typeof resp === 'string' ? JSON.parse(resp) : resp;
          if (parsed2 && parsed2.recommendations) {
            var r = parsed2.recommendations;
            return {
              title: r.recommended_title || this.getVideoMetadata(filename).title,
              description: r.recommended_description || this.getVideoMetadata(filename).description,
              tags: r.recommended_tags || this.getVideoMetadata(filename).tags,
              category: r.recommended_category || '20',
              privacy: r.recommended_privacy || 'unlisted',
              scheduleTime: r.recommended_upload_time || null
            };
          }
        } catch (e) {
          // ignore parse errors
        }
      }
    }
  } catch (err) {
    Logger.log("⚠️ AIConnector failed: " + err);
  }

  // Om vi kommer hit: AI misslyckades eller svarade ej → fallback till lokal metadata
  Logger.log("ℹ️ Använder fallback getVideoMetadata för " + filename);
  return fallback();
};

// Hjälp: generera enkel titel utifrån filnamn
AutoUploader_v3.prototype.generateTitleFromFilename = function(filename) {
  var base = filename.replace(/\.[^/.]+$/, "").replace(/[_\-]+/g, " ");
  return base + " | Gameplay";
};

// Hjälp: skapa beskrivning om AI gav analystext
AutoUploader_v3.prototype.generateDescriptionFromAI = function(aiParsed) {
  if (!aiParsed) return null;
  if (aiParsed.analysis && typeof aiParsed.analysis === 'string') {
    return aiParsed.analysis + "\n\n---\nAutogenerated by AutoUploader_v3";
  }
  return null;
};

// 📁 Hitta upload-mapp
AutoUploader_v3.prototype.getUploadFolder = function() {
  try {
    if (AU_CONFIG.DEFAULT_UPLOAD_FOLDER_ID) {
      return DriveApp.getFolderById(AU_CONFIG.DEFAULT_UPLOAD_FOLDER_ID);
    }
    var folders = DriveApp.getFoldersByName(this.driveFolderName);
    return folders.hasNext() ? folders.next() : null;
  } catch (error) {
    Logger.log('❌ Kunde inte hitta mapp: ' + error.toString());
    return null;
  }
};

// 🎬 Hitta nya videofiler
AutoUploader_v3.prototype.findNewVideo = function(uploadFolder) {
  var files = uploadFolder.getFiles();
  while (files.hasNext()) {
    var file = files.next();
    var fileName = file.getName().toLowerCase();
    if (fileName.indexOf('.mp4') !== -1 && !this.isInUploadedFolder(file, uploadFolder)) {
      Logger.log('🎬 Ny video hittades: ' + file.getName());
      return file;
    }
  }
  return null;
};

// 🔍 Kolla om fil finns i Uploaded-mappen
AutoUploader_v3.prototype.isInUploadedFolder = function(file, uploadFolder) {
  try {
    var uploadedFolders = uploadFolder.getFoldersByName(this.uploadedFolderName);
    if (!uploadedFolders.hasNext()) return false;
    var uploadedFolder = uploadedFolders.next();
    var uploadedFiles = uploadedFolder.getFiles();
    while (uploadedFiles.hasNext()) {
      var uploadedFile = uploadedFiles.next();
      if (uploadedFile.getId() === file.getId()) {
        return true;
      }
    }
    return false;
  } catch (error) {
    return false;
  }
};

// 📦 Flytta till uploaded
AutoUploader_v3.prototype.moveToUploaded = function(file, uploadFolder) {
  try {
    var uploadedFolders = uploadFolder.getFoldersByName(this.uploadedFolderName);
    var uploadedFolder = uploadedFolders.hasNext() ? uploadedFolders.next() : uploadFolder.createFolder(this.uploadedFolderName);
    file.moveTo(uploadedFolder);
    Logger.log('📦 Flyttad till Uploaded: ' + file.getName());
  } catch (error) {
    Logger.log("❌ Kunde inte flytta filen till Uploaded: " + error.toString());
  }
};

// 🎥 Upload till YouTube (samma som tidigare)
AutoUploader_v3.prototype.uploadToYouTube = function(videoFile, metadata) {
  Logger.log('📤 Laddar upp: ' + metadata.title);
  try {
    var blob = videoFile.getBlob();
    var video = YouTube.Videos.insert(
      {
        snippet: {
          title: metadata.title,
          description: metadata.description,
          tags: metadata.tags,
          categoryId: metadata.category
        },
        status: {
          privacyStatus: metadata.privacy,
          selfDeclaredMadeForKids: false
        }
      },
      "snippet,status",
      blob
    );
    Logger.log('✅ Video uppladdad: ' + video.id);
    return 'https://youtube.com/watch?v=' + video.id;
  } catch (error) {
    if (error.toString().indexOf("quota") !== -1 && this.retryCount < this.maxRetries) {
      Logger.log('⚠️ Quota error, försöker igen om 60 sekunder...');
      this.retryCount++;
      Utilities.sleep(60000);
      return this.uploadToYouTube(videoFile, metadata);
    }
    throw new Error('YouTube upload misslyckades: ' + error.toString());
  }
};

// 🔍 Extrahera video ID från URL
AutoUploader_v3.prototype.extractVideoId = function(url) {
  var match = url.match(/(?:watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? match[1] : 'unknown';
};

// 🗑️ Rensa gamla loggar
AutoUploader_v3.prototype.cleanupOldLogs = function() {
  try {
    var logFolder = this.getLogFolder();
    if (!logFolder) return;
    var cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.logRetentionDays);
    var logFiles = logFolder.getFiles();
    var deletedCount = 0;
    while (logFiles.hasNext()) {
      var file = logFiles.next();
      if (file.getDateCreated() < cutoffDate) {
        file.setTrashed(true);
        deletedCount++;
      }
    }
    if (deletedCount > 0) {
      Logger.log('🗑️ Rensade ' + deletedCount + ' gamla loggar');
    }
  } catch (error) {
    Logger.log('❌ Kunde inte rensa loggar: ' + error.toString());
  }
};

// 📝 Skriv till loggfil (Drive)
AutoUploader_v3.prototype.writeToLog = function(message, timestamp, isSuccess) {
  if (typeof isSuccess === 'undefined') isSuccess = false;
  try {
    var logFolder = this.getLogFolder();
    if (!logFolder) return;
    var dateString = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "yyyy-MM-dd_HH-mm-ss");
    var filename = (isSuccess ? '✅' : '❌') + '_log_' + dateString + '.txt';
    logFolder.createFile(filename, message);
    Logger.log('📝 Logg skapad: ' + filename);
  } catch (error) {
    Logger.log('❌ Kunde inte skriva logg: ' + error.toString());
  }
};

AutoUploader_v3.prototype.getLogFolder = function() {
  try {
    var folders = DriveApp.getFoldersByName(this.logFolderName);
    if (folders.hasNext()) {
      return folders.next();
    } else {
      Logger.log('📁 Skapar ny loggmapp: ' + this.logFolderName);
      return DriveApp.createFolder(this.logFolderName);
    }
  } catch (error) {
    Logger.log('❌ Kunde inte skapa loggmapp: ' + error.toString());
    return null;
  }
};

// 🧠 Hjälp: hämta senaste analytics-data (samma som tidigare)
AutoUploader_v3.prototype.getLatestAnalyticsData = function() {
  try {
    var files = DriveApp.getFilesByName('YT_Analytics_Data');
    if (!files.hasNext()) return {};
    var sheet = SpreadsheetApp.open(files.next()).getActiveSheet();
    var data = sheet.getRange('A11:I20').getValues();
    var out = [];
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      if (row[0] && row[3]) {
        out.push({
          date: row[0],
          position: row[1],
          videoId: row[2],
          title: row[3],
          views: parseInt(row[4]) || 0,
          likes: parseInt(row[5]) || 0,
          comments: parseInt(row[6]) || 0,
          engagement: parseFloat(row[7]) || 0,
          ctr: parseFloat(row[8]) || 0
        });
      }
    }
    return { top_videos: out, timestamp: new Date().toISOString() };
  } catch (e) {
    return {};
  }
};

// 🧠 FALLBACK: lokal metadata generering (oförändrad logik)
AutoUploader_v3.prototype.getVideoMetadata = function(filename) {
  var gameMatch = filename.match(/(Generation Zero|Deep Rock|Helldivers)/i);
  var game = gameMatch ? gameMatch[1] : 'Gaming';
  var locationMatch = filename.match(/(Stockholm|Göteborg|Malmö|Uppsala|Goteborg|Malmo)/i);
  var location = locationMatch ? locationMatch[1] : '';
  var title = this.generateTitle(game, location);
  return {
    title: title,
    description: this.generateDescription(game, location, filename),
    tags: this.generateTags(game, location),
    category: '20',
    privacy: 'unlisted'
  };
};

AutoUploader_v3.prototype.generateTitle = function(game, location) {
  var baseTitles = [
    game + ' Gameplay ' + (location ? '| ' + location : ''),
    'Svensk ' + game + ' ' + (location ? '- ' + location : ''),
    game + ' Co-op ' + (location ? 'i ' + location : '')
  ];
  return baseTitles[Math.floor(Math.random() * baseTitles.length)];
};

AutoUploader_v3.prototype.generateDescription = function(game, location, filename) {
  return '🎮 ' + game + ' Gameplay ' + (location ? 'från ' + location : '') + '\n\n' +
         '📺 Prenumerera för mer gaming content!\n' +
         '🔔 Klicka på klockan för notiser\n\n' +
         '#' + game.replace(/\s+/g, '') + ' #Gaming #Sverige\n\n' +
         '---\n\n' +
         '🤖 Autogenererad via YouTube Autopilot System\n' +
         '🕒 Uppladdad: ' + new Date().toLocaleString('sv-SE');
};

AutoUploader_v3.prototype.generateTags = function(game, location) {
  var baseTags = [game, 'Gaming', 'Gameplay', 'Sverige'];
  if (location) baseTags.push(location);
  if (game.indexOf('Generation Zero') !== -1) {
    baseTags.push('GenerationZero', 'OpenWorld', 'Coop');
  } else if (game.indexOf('Deep Rock') !== -1) {
    baseTags.push('DeepRockGalactic', 'DRG');
  }
  return baseTags;
};

// 🎯 MANUELL KÖRNING (test)
function manualRun() {
  var au = new AutoUploader_v3();
  au.runAutopilot();
}

// 🧪 TEST: testa AI-metadata-anrop och fallback
function testAIMetadata() {
  var au = new AutoUploader_v3();
  var filename = "Generation Zero - Stockholm Gameplay.mp4";
  try {
    var metadata = au.getAIMetadataSafe(filename);
    Logger.log('Test metadata: ' + (AIUtils ? AIUtils.preview(metadata) : JSON.stringify(metadata)));
  } catch (e) {
    Logger.log('testAIMetadata failed: ' + e);
  }
}
