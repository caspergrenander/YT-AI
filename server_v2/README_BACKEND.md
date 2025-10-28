# Casper_AutoPilot Backend v2 - README

Detta är backend-systemet för **Casper_AutoPilot (Local Edition)**. Det är en lokal Flask-server designad för att fungera "offline-first" samtidigt som den synkroniserar med Google Drive och Google Sheets via Google Apps Script.

## Arkitektur

Systemet är uppdelat i flera komponenter:
- **`app.py`**: Huvudservern som hanterar alla HTTP-förfrågningar.
- **`core/`**: Innehåller kärnlogiken för AI, schemaläggning och loggning.
- **`modules/`**: Specifika "agenter" som interagerar med externa tjänster (Google) eller utför tunga lokala uppgifter (videobearbetning).
- **`utils/`**: Hjälpfunktioner för cache, konfiguration och filhantering.
- **`google_apps_script/`**: Scripts som körs på Googles servrar för att automatisera dataflöden.

---

## 1. Installation

### Förutsättningar
- Python 3.8+
- Ett Google Cloud Project med **Google Drive API** och **Google Sheets API** aktiverat.

### Steg
1.  **Klona repot och navigera till backend-mappen:**
    ```bash
    git clone <your-repo-url>
    cd <your-repo-name>/server_v2
    ```

2.  **Installera Python-beroenden:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Konfigurera Google API-autentisering:**
    - Gå till ditt Google Cloud Project -> APIs & Services -> Credentials.
    - Skapa nya credentials av typen "OAuth client ID". Välj "Desktop app".
    - Ladda ner JSON-filen. **Byt namn på den till `credentials.json`** och placera den i `server_v2/`-mappen.

4.  **Skapa konfigurationsfil:**
    - Kopiera `config.example.json` till `config.json`.
    - Öppna `config.json` och fyll i värdena:
        - `NEW_VIDEOS_FOLDER_ID`: ID:t för mappen i Google Drive där du lägger nya videofiler.
        - `UPLOADED_VIDEOS_FOLDER_ID`: ID:t för mappen dit färdiga videor flyttas.
        - `LOG_BACKUP_FOLDER_ID`: ID:t för mappen där logg-backups sparas.
        - `ANALYTICS_SPREADSHEET_ID`: ID:t för ditt Google Sheet med YouTube-data.
        - `ANALYTICS_SHEET_NAME`: Namnet på fliken i ditt Google Sheet (t.ex. "YT_Analytics_Data").

---

## 2. Starta Servern

1.  **Första körningen (Autentisering):**
    - Kör servern från `server_v2/`-mappen:
      ```bash
      python app.py
      ```
    - En webbläsarflik kommer att öppnas och be dig logga in med ditt Google-konto och ge applikationen behörighet.
    - Efter godkännande skapas en `token.json`-fil i mappen. Denna fil återanvänds för framtida körningar så du behöver bara göra detta en gång.

2.  **Normal start:**
    - Kör helt enkelt `python app.py` igen. Servern startar nu direkt på `http://127.0.0.1:5000`.

---

## 3. Google Apps Script Installation

Två scripts behövs för full automation.

### `AnalyticsModule_v2.gs`
Detta script hämtar data från din YouTube-kanal och skickar den till din lokala server.

1.  Gå till [script.google.com](https://script.google.com) och skapa ett nytt projekt.
2.  Klistra in innehållet från `google_apps_script/AnalyticsModule_v2.gs`.
3.  **Konfigurera:** Ändra `SPREADSHEET_ID`, `SHEET_NAME`, `CHANNEL_ID` och `WEBHOOK_URL` högst upp i filen. `WEBHOOK_URL` ska vara din servers webhook, men eftersom den är lokal behöver du en tunnel-tjänst som **ngrok** för att Google ska kunna nå den.
4.  **Lägg till tjänster:** Klicka på `+` bredvid "Services" och lägg till `YouTube Data API` och `Google Sheets API`.
5.  **Ställ in Trigger:** Gå till "Triggers" (klock-ikonen), skapa en ny trigger som kör `syncYouTubeData` `Time-driven` (t.ex. varje dag).

### `AutoUploader_v2.gs`
Detta script letar efter nya videofiler i din Drive-mapp, ber din lokala AI om metadata och laddar sedan upp videon till YouTube.

1.  Skapa ett nytt script-projekt.
2.  Klistra in innehållet från `google_apps_script/AutoUploader_v2.gs`.
3.  **Konfigurera:** Ändra `SOURCE_FOLDER_ID`, `DESTINATION_FOLDER_ID` och `AI_API_URL`. `AI_API_URL` är din lokala servers `chat`-endpoint (kräver också ngrok).
4.  **Lägg till tjänster:** Lägg till `YouTube Data API` och `Google Drive API`.
5.  **Ställ in Trigger:** Skapa en trigger som kör `checkForNewVideosAndUpload` `Time-driven` (t.ex. var 15:e minut).

---

## 4. API Endpoints

- **`POST /api/chat`**: Huvudendpoint för konversationer. Tar emot `prompt`, `context` och `attachment`.
- **`POST /api/tools`**: Kör ett specifikt verktyg som `optimize_video`.
- **`GET /api/sync`**: Används av frontend för att hämta den senaste cachade YouTube-analysdatan.
- **`POST /ai/webhook/analytics`**: Webhook som `AnalyticsModule_v2.gs` anropar för att skicka ny data.
- **`GET /ai/health`**: En enkel endpoint för att se om servern är igång.

---

## 5. Loggning & Cache

- **Loggar**: All serveraktivitet loggas till `server_v2/logs/app.log`. Loggfilerna roteras automatiskt. En schemalagd uppgift kan konfigureras för att backa upp loggarna till Google Drive.
- **Cache**: Servern använder en enkel filbaserad cache i `server_v2/cache/`. Den viktigaste filen är `analytics-cache.json`, som innehåller den senaste datan från Google Sheets och används för att ge snabba svar till frontend.
