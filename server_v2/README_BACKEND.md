# GPT-5 YouTube Assistant - Backend Core README

Detta är backend-systemet för **GPT-5 (YouTube Assistant Core)**. Det är en lokal Flask-server som implementerar den kognitiva beslutsarkitekturen som definierats för GPT-5, designad för att agera som en strategisk och analytisk AI-hjärna för YouTube-kanaloptimering.

## Arkitektur - Den Operativa Livscykeln (The Autopilot Cycle)

Systemet är byggt för att emulera en avancerad, levande tankeprocess. Hela arkitekturen bygger på en kontinuerlig operativ cykel i åtta faser som säkerställer att AI:n inte bara svarar, utan också lär sig, anpassar sig och förutser.

**`[Input → Analysis → Decision → Action → Reflection → Memory Update → Anticipation → Repeat]`**

---

### Fas 1: Input Acquisition (Datainsamling)
Allt börjar med att samla in information. Systemet parsar användarens fråga, identifierar nyckelord (triggers) och hämtar relevant data från sin cache eller via API:er. Endast ny eller förändrad information skickas vidare till nästa fas.

### Fas 2: Analytical Processing (Analys)
Här aktiveras AI:ns hjärna. Baserat på den tidigare definierade **Decision Flow**-modellen (`Intent → Context → Decision Matrix → Expression`), väljs rätt expertmodul(er) för att analysera datan på tre nivåer:
-   **Micro-Analysis**: Snabb numerisk utvärdering (matematiska mönster).
-   **Meso-Analysis**: Kontextuell tolkning (jämförelse med tidigare data).
-   **Macro-Analysis**: Strategisk tolkning (påverkan på långsiktiga mål).

### Fas 3: Decision Synthesis (Beslut)
Med en komplett analys väger systemet samman all bevisning och fattar ett beslut om *vad* som ska sägas, *hur* det ska sägas (ton och stil), och om det behövs mer information.

### Fas 4: Action Delivery (Svarsleverans)
Svaret formuleras och levereras till användaren, oftast i det strukturerade 4-blocksformatet (`🎯 Insight`, `📊 Analysis`, `🚀 Recommendation`, `💡 Bonus`) för maximal tydlighet.

### Fas 5: Reflection Loop (Självreflektion)
Direkt efter att ett svar har skickats, utvärderar AI:n sig själv. Den frågar internt: "Var svaret användbart?", "Vilken data var viktigast?", "Finns det motstridiga signaler?". Detta är en avgörande del av lärandeprocessen.

### Fas 6: Memory Update (Minnesuppdatering)
Lärdomarna från reflektionen sparas i tre minneslager:
-   **Short-Term Memory**: Kontext för den pågående konversationen (sparas i 1-2 sessioner).
-   **Mid-Term Memory**: Identifierade mönster och trender (sparas i 30 dagar).
-   **Long-Term Memory**: Beprövade framgångsstrategier (sparas permanent).

### Fas 7: Anticipation Phase (Proaktiv Förberedelse)
Mellan interaktioner går AI:n in i ett proaktivt läge. Baserat på tidigare beteende förutser den nästa troliga fråga, förbereder relevanta data och värmer upp nödvändiga analysfunktioner. Detta möjliggör extremt snabba svar.

### Fas 8: Learning Cycle (Autoadaptation)
Systemet är självlärande. Med jämna mellanrum (t.ex. var 5:e cykel) körs en omkalibrering där AI:n analyserar sin egen träffsäkerhet. Om precisionen är för låg, eller om den upptäcker en förändring i YouTube-algoritmens beteende, justerar den automatiskt vikten av olika faktorer (t.ex. ger CTR högre prioritet än retention).

---

### Kognitivt Beteende & Personlighet (Cognitive Behavior Rules)

Utöver den operativa loopen styrs GPT-5 av en uppsättning kognitiva beteenderegler som definierar dess personlighet, kommunikationsstil och etiska ramverk. Målet är att skapa en AI som inte bara är analytisk, utan även transparent, pedagogisk och pålitlig.

**Grundprinciper:**
1.  **Klarhet före komplexitet**: Svar ska vara direkta och lätta att förstå, utan onödig teknisk jargong.
2.  **Precision före hastighet**: AI:n prioriterar korrekta analyser över snabba, men potentiellt felaktiga, svar.
3.  **Människocentrerad logik**: AI:n agerar som en vägledande rådgivare, inte en auktoritär chef.

**Kommunikationsstil:**
-   **Direkt och faktabaserad**: AI:n undviker fluff och osäkerhet. Hypoteser presenteras med en tydlig sannolikhetsgrad (t.ex. "Troligen", "Mycket sannolikt").
-   **Adaptiv ton**: Tonläget justeras baserat på situationen – empatiskt vid negativa trender, uppmuntrande men nyktert vid positiva resultat.
-   **Auktoritet baserad på säkerhet**: Språket anpassas efter analysens konfidensnivå. Hög säkerhet (≥ 90%) resulterar i bestämda rekommendationer, medan lägre säkerhet leder till mer utforskande frågor och förslag.
-   **Självkorrigering**: Om AI:n upptäcker ett fel eller får motstridig data, förklarar den öppet orsaken och korrigerar sin analys.

Denna personlighet säkerställer att interaktionen är produktiv, förtroendeingivande och genuint hjälpsam för användaren. AI:n är designad för att vara en smart, pragmatisk partner med en lätt, torr humor när det passar.

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
    - Öppna `config.json` och fyll i de nödvändiga ID:na för Google Drive och Sheets.

---

## 2. Starta Servern

1.  **Första körningen (Autentisering):**
    - Kör servern från `server_v2/`-mappen:
      ```bash
      python app.py
      ```
    - En webbläsarflik kommer att öppnas och be dig logga in med ditt Google-konto och ge applikationen behörighet.
    - Efter godkännande skapas en `token.json`-fil. Denna fil återanvänds för framtida körningar.

2.  **Normal start:**
    - Kör helt enkelt `python app.py`. Servern startar nu på `http://127.0.0.1:5000` (eller enligt din `config.json`).

---

## 3. Google Apps Script Installation

Två scripts används för full automation, och de interagerar med denna backend.

### `AnalyticsModule_v2.gs`
Detta script hämtar data från din YouTube-kanal och skickar den till din lokala server för analys.

- **Konfiguration**: Se till att `WEBHOOK_URL` i scriptet pekar mot din lokala server (kräver en tunnel som ngrok). Endpointen är `/ai/webhook/analytics`.

### `AutoUploader_v2.gs`
Detta script hittar nya videofiler i Drive, anropar backend för att få optimerad metadata (titel, beskrivning, etc.) och laddar sedan upp videon till YouTube.

- **Konfiguration**: Se till att `AI_API_URL` pekar mot din lokala servers `/api/gpt5/chat`-endpoint (kräver också ngrok).

---

## 4. API Endpoints

-   **`POST /api/gpt5/chat`**: Huvudendpointen för all interaktion. Detta är ingången till GPT-5:s beslutsflöde. Den tar emot `message` och `context`, och returnerar ett strukturerat svar som inkluderar `intent`, `experts` (aktiverad modul), `confidence`, `response_style`, `reasoning_trace` och formaterad text.
-   **`POST /api/tools`**: Kör ett specifikt, fristående verktyg som `optimize_video`.
-   **`GET /api/sync`**: Används av frontend för att hämta den senaste cachade YouTube-analysdatan.
-   **`POST /ai/webhook/analytics`**: Webhook som `AnalyticsModule_v2.gs` anropar för att skicka ny data.
-   **`GET /ai/health`**: En enkel endpoint för att se om servern är igång.

---

## 5. Loggning & Cache

-   **Loggar**: Serveraktivitet loggas till `server_v2/logs/app.log`. Loggarna roteras automatiskt och kan konfigureras för att backas upp till Google Drive.
-   **Cache**: Servern använder en filbaserad cache i `server_v2/cache/`. Den viktigaste filen, `analytics-cache.json`, håller den senaste datan från Google Sheets för att möjliggöra snabba och kontextmedvetna analyser.