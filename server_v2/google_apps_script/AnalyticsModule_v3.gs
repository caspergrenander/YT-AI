// 📊 AnalyticsModule_v3.gs
// Förbättrad YouTubeAnalytics som skickar kanal- och videodata till AIConnector
// - Använder AIConnector.tryCatchWrapper för nätverksanrop
// - Skriver AI-svar till en ny kolumn "AI_Insights"
// - Behåller visuell formatering
// Testfunktioner: manualAnalytics(), testVisualFormatting()

/* globals AIConnector, YouTube, DriveApp, SpreadsheetApp, Utilities, Logger, AIUtils */

function YouTubeAnalytics_v3() {
  this.driveFolderName = "CG_YT_AutoPilot";
  this.logFolderName = "CG_YT_Logs";
  this.analyticsSheetName = "YT_Analytics_Data";
}

// 📈 Huvudflöde: hämta, spara, skicka till AI
YouTubeAnalytics_v3.prototype.fetchChannelAnalytics = function() {
  try {
    Logger.log('📊 Startar kanalanalys (v3)...');
    var channelStats = this.getChannelStatistics();
    var topVideos = this.getTopPerformingVideos(10);
    var sheet = this.getOrCreateAnalyticsSheet();
    this.saveAnalyticsToSheet(sheet, channelStats, topVideos);

    // Skicka till AI via wrapper och skriv in AI-insikter
    var payload = {
      timestamp: new Date().toISOString(),
      system_version: "yt_analytics_v3.0",
      channel_stats: channelStats,
      top_videos: topVideos
    };

    var aiResponse = null;
    if (typeof AIConnector !== 'undefined' && typeof AIConnector.tryCatchWrapper === 'function') {
      aiResponse = AIConnector.tryCatchWrapper(function() {
        return AIConnector.sendAnalytics(payload);
      });
    } else if (typeof AIConnector !== 'undefined' && typeof AIConnector.sendAnalytics === 'function') {
      aiResponse = AIConnector.sendAnalytics(payload);
    }

    // Försök tolka svar och skriv in i sheetet
    try {
      var parsed = (typeof aiResponse === 'string') ? JSON.parse(aiResponse) : aiResponse;
      this.writeAIInsightsToSheet(sheet, parsed);
      Logger.log('🧠 AI-analys mottagen och inskriven i sheet');
    } catch (e) {
      Logger.log('⚠️ Ingen giltig AI-respons att skriva: ' + e);
    }

    Logger.log('✅ Kanalanalys slutförd - ' + (topVideos ? topVideos.length : 0) + ' videor analyserade');
  } catch (error) {
    Logger.log('❌ Analytics error v3: ' + error.toString());
  }
};

// 📝 Spara analysdata + behåll visuell formatering
YouTubeAnalytics_v3.prototype.saveAnalyticsToSheet = function(sheet, channelStats, topVideos) {
  try {
    this.protectHeaderRows(sheet);
    this.saveChannelStats(sheet, channelStats);
    this.saveTopVideos(sheet, topVideos);
    this.applyVisualFormatting(sheet);
    Logger.log('📊 Analysdata sparad med visuell formatering (v3)');
  } catch (error) {
    Logger.log('❌ Kunde inte spara analysdata v3: ' + error.toString());
  }
};

// 🆕 Skriv AI-insikter till ny kolumn "AI_Insights"
YouTubeAnalytics_v3.prototype.writeAIInsightsToSheet = function(sheet, aiParsed) {
  try {
    if (!aiParsed) return;
    // Se till att kolumn AI_Insights finns (kolumn J)
    var headerRange = sheet.getRange('A10:J10');
    var headers = headerRange.getValues()[0];
    // Om "AI_Insights" inte finns, skriv in i kolumn J
    if (headers.indexOf('AI_Insights') === -1) {
      sheet.getRange('J10').setValue('AI_Insights').setFontWeight('bold').setBackground('#F3F3F3');
    }

    // Om AI returnerar en array av insikter per top video, matcha rader
    var insightsArray = aiParsed && (aiParsed.insights || aiParsed.top_video_insights || aiParsed.recommendations_array);
    if (Array.isArray(insightsArray)) {
      for (var i = 0; i < insightsArray.length; i++) {
        var r = 11 + i;
        var short = AIUtils ? AIUtils.preview(insightsArray[i]) : JSON.stringify(insightsArray[i]).slice(0, 300);
        sheet.getRange(r, 10).setValue(short);
      }
    } else {
      // Annars skriv generell analys i första rad under top-listan
      var summary = aiParsed.analysis || aiParsed.summary || aiParsed.recommendations || JSON.stringify(aiParsed);
      sheet.getRange(11, 10).setValue(AIUtils ? AIUtils.preview(summary) : String(summary).slice(0, 200));
    }
  } catch (e) {
    Logger.log('⚠️ writeAIInsightsToSheet failed: ' + e);
  }
};

// 🆕 Se till att analytics-sheet har kolumn-AI_Insights (idempotent)
YouTubeAnalytics_v3.prototype.ensureAIInsightsHeader = function(sheet) {
  try {
    var headers = sheet.getRange('A10:J10').getValues()[0];
    if (headers.indexOf('AI_Insights') === -1) {
      sheet.getRange('J10').setValue('AI_Insights').setFontWeight('bold').setBackground('#F3F3F3');
    }
  } catch (e) {
    // ignore
  }
};

// 🏷️ Visuell formatering (behålls från tidigare)
YouTubeAnalytics_v3.prototype.applyVisualFormatting = function(sheet) {
  try {
    sheet.getRange('C2:C100').setNumberFormat('#,##0');
    sheet.getRange('D2:D100').setNumberFormat('#,##0');
    sheet.getRange('E2:E100').setNumberFormat('#,##0');
    sheet.getRange('C2:C100').setFontColor('#00AA00');
    sheet.getRange('D2:D100').setFontColor('#0066CC');
    sheet.getRange('E11:E100').setNumberFormat('#,##0');
    sheet.getRange('F11:F100').setNumberFormat('#,##0');
    sheet.getRange('G11:G100').setNumberFormat('#,##0');
    sheet.getRange('H11:H100').setNumberFormat('0.00%');
    sheet.getRange('I11:I100').setNumberFormat('0.00%');
    sheet.autoResizeColumns(1, 10);
    sheet.setFrozenRows(1);
    sheet.setFrozenRows(10);
    Logger.log('🎨 Visuell formatering applicerad (v3)');
    this.ensureAIInsightsHeader(sheet);
  } catch (error) {
    Logger.log('⚠️ applyVisualFormatting failed: ' + error.toString());
  }
};

// Följande funktioner är i stort sett oförändrade från din tidigare implementation:
YouTubeAnalytics_v3.prototype.getChannelStatistics = function() {
  try {
    var channel = YouTube.Channels.list('snippet,statistics', {mine: true});
    if (channel.items && channel.items.length > 0) {
      var stats = channel.items[0].statistics;
      var snippet = channel.items[0].snippet;
      return {
        timestamp: new Date(),
        channelTitle: snippet.title,
        subscribers: stats.subscriberCount,
        totalViews: stats.viewCount,
        totalVideos: stats.videoCount,
        dailyGrowth: this.calculateDailyGrowth(stats.subscriberCount)
      };
    }
    throw new Error('Ingen kanaldata hittades');
  } catch (error) {
    Logger.log('❌ Kunde inte hämta kanalstatistik: ' + error.toString());
    return null;
  }
};

YouTubeAnalytics_v3.prototype.getTopPerformingVideos = function(maxResults) {
  try {
    var searchResponse = YouTube.Search.list('id,snippet', {
      forMine: true,
      type: 'video',
      order: 'viewCount',
      maxResults: maxResults
    });
    var topVideos = [];
    for (var i = 0; i < searchResponse.items.length; i++) {
      var item = searchResponse.items[i];
      var videoId = item.id.videoId;
      Utilities.sleep(200);
      var videoStats = this.getVideoStatistics(videoId);
      if (videoStats) {
        topVideos.push({
          position: i + 1,
          videoId: videoId,
          title: item.snippet.title,
          publishedAt: item.snippet.publishedAt,
          views: videoStats.viewCount,
          likes: videoStats.likeCount,
          comments: videoStats.commentCount,
          engagement: this.calculateEngagementRate(videoStats),
          ctr: this.estimateCTR(videoStats)
        });
      }
    }
    return topVideos;
  } catch (error) {
    Logger.log('❌ Kunde inte hämta toppvideor: ' + error.toString());
    return [];
  }
};

YouTubeAnalytics_v3.prototype.getVideoStatistics = function(videoId) {
  try {
    var videoResponse = YouTube.Videos.list('statistics', {id: videoId});
    return videoResponse.items && videoResponse.items.length > 0 ? videoResponse.items[0].statistics : null;
  } catch (error) {
    Logger.log('❌ Kunde inte hämta videostatistik: ' + error.toString());
    return null;
  }
};

YouTubeAnalytics_v3.prototype.getOrCreateAnalyticsSheet = function() {
  try {
    var files = DriveApp.getFilesByName(this.analyticsSheetName);
    if (files.hasNext()) {
      return SpreadsheetApp.open(files.next()).getActiveSheet();
    } else {
      var newSheet = SpreadsheetApp.create(this.analyticsSheetName);
      var sheet = newSheet.getActiveSheet();
      this.moveSheetToDriveFolder(newSheet);
      this.setupSheetHeaders(sheet);
      return sheet;
    }
  } catch (error) {
    throw new Error('Kunde inte skapa analytics sheet: ' + error.toString());
  }
};

YouTubeAnalytics_v3.prototype.setupSheetHeaders = function(sheet) {
  sheet.getRange('A1:G1').setValues([[
    'Datum', 'Kanal', 'Prenumeranter', 'Totala Visningar',
    'Antal Videor', 'Daglig Tillväxt', 'Timestamp'
  ]]);
  sheet.getRange('A10:J10').setValues([[
    'Datum', 'Position', 'Video ID', 'Titel', 'Visningar',
    'Likes', 'Kommentarer', 'Engagement Rate', 'Uppskattad CTR', 'AI_Insights'
  ]]);
  sheet.getRange('A1:G1').setFontWeight('bold').setBackground('#F3F3F3');
  sheet.getRange('A10:J10').setFontWeight('bold').setBackground('#F3F3F3');
};

YouTubeAnalytics_v3.prototype.moveSheetToDriveFolder = function(newSheet) {
  try {
    var driveFolders = DriveApp.getFoldersByName(this.driveFolderName);
    if (driveFolders.hasNext()) {
      var driveFolder = driveFolders.next();
      var sheetFile = DriveApp.getFileById(newSheet.getId());
      driveFolder.addFile(sheetFile);
      DriveApp.getRootFolder().removeFile(sheetFile);
      Logger.log('📁 Sheet flyttad till mapp: ' + this.driveFolderName);
    }
  } catch (error) {
    Logger.log('⚠️ Kunde inte flytta sheet till mapp: ' + error.toString());
  }
};

YouTubeAnalytics_v3.prototype.protectHeaderRows = function(sheet) {
  try {
    var protection = sheet.getRange('A1:G1').protect();
    protection.setDescription('Analytics Header Row');
    protection.setWarningOnly(true);
    var protection2 = sheet.getRange('A10:J10').protect();
    protection2.setDescription('Top Videos Header Row');
    protection2.setWarningOnly(true);
  } catch (error) {
    Logger.log('⚠️ Kunde inte skydda rubriker: ' + error.toString());
  }
};

YouTubeAnalytics_v3.prototype.saveChannelStats = function(sheet, channelStats) {
  if (!channelStats) return;
  var rowData = [
    Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
    channelStats.channelTitle,
    parseInt(channelStats.subscribers),
    parseInt(channelStats.totalViews),
    parseInt(channelStats.totalVideos),
    channelStats.dailyGrowth,
    new Date()
  ];
  sheet.appendRow(rowData);
};

YouTubeAnalytics_v3.prototype.saveTopVideos = function(sheet, topVideos) {
  sheet.getRange('A11:J100').clearContent();
  var currentDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  for (var i = 0; i < topVideos.length; i++) {
    var video = topVideos[i];
    var rowData = [
      currentDate,
      video.position,
      video.videoId,
      video.title,
      parseInt(video.views),
      parseInt(video.likes),
      parseInt(video.comments),
      parseFloat(video.engagement) / 100,
      parseFloat(video.ctr) / 100,
      '' // AI_Insights - fylls senare
    ];
    sheet.getRange(11 + i, 1, 1, 10).setValues([rowData]);
  }
};

YouTubeAnalytics_v3.prototype.calculateDailyGrowth = function(currentSubscribers) {
  return 'N/A';
};

YouTubeAnalytics_v3.prototype.calculateEngagementRate = function(videoStats) {
  var views = parseInt(videoStats.viewCount || 0);
  var likes = parseInt(videoStats.likeCount || 0);
  var comments = parseInt(videoStats.commentCount || 0);
  if (views === 0) return 0;
  return ((likes + comments) / views * 100).toFixed(2);
};

YouTubeAnalytics_v3.prototype.estimateCTR = function(videoStats) {
  var views = parseInt(videoStats.viewCount || 0);
  var impressions = views * 3;
  if (impressions === 0) return 0;
  return (views / impressions * 100).toFixed(2);
};

// ⏰ Schemalagd analys
function scheduledAnalytics() {
  Logger.log('⏰ Schemalagd analys (v3) körs...');
  var analytics = new YouTubeAnalytics_v3();
  analytics.fetchChannelAnalytics();
}

// 🎯 Manuell analyskörning
function manualAnalytics() {
  var analytics = new YouTubeAnalytics_v3();
  analytics.fetchChannelAnalytics();
}

// 🧪 TEST: Visuell formatering
function testVisualFormatting() {
  var analytics = new YouTubeAnalytics_v3();
  var sheet = analytics.getOrCreateAnalyticsSheet();
  analytics.applyVisualFormatting(sheet);
  Logger.log('🎨 Visuell formatering testad (v3)');
}
