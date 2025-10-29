# GPT-5 YouTube Assistant - Backend Core README

Detta är backend-systemet för **GPT-5 (YouTube Assistant Core)**. Det är en lokal Flask-server som implementerar den kognitiva beslutsarkitekturen som definierats för GPT-5, designad för att agera som en strategisk och analytisk AI-hjärna för YouTube-kanaloptimering.

## Arkitektur - En Tänkande Organism

Systemet är byggt för att emulera en avancerad, levande tankeprocess. Arkitekturen vilar på tre samverkande pelare som definierar hur AI:n fungerar, beter sig och utvecklas.

1.  **Den Operativa Livscykeln (The Autopilot Cycle)**: Hur AI:n arbetar från sekund till sekund.
2.  **Kognitivt Beteende & Personlighet (Cognitive Behavior Rules)**: Hur AI:n interagerar och resonerar.
3.  **Systemevolution & Mognad (System Evolution Specification)**: Hur AI:n lär sig och mognar över tid.

---

### Pelare 1: Den Operativa Livscykeln (The Autopilot Cycle)

Systemet bygger på en kontinuerlig operativ cykel i åtta faser som säkerställer att AI:n inte bara svarar, utan också lär sig, anpassar sig och förutser.

**`[Input → Analysis → Decision → Action → Reflection → Memory Update → Anticipation → Repeat]`**

-   **Fas 1: Input Acquisition (Datainsamling)**: Parsar användarens fråga, identifierar triggers och hämtar relevant data.
-   **Fas 2: Analytical Processing (Analys)**: Aktiverar rätt expertmoduler (Micro, Meso, Macro-analys) baserat på `Decision Flow`-modellen.
-   **Fas 3: Decision Synthesis (Beslut)**: Väger samman bevis och beslutar *vad* och *hur* som ska kommuniceras.
-   **Fas 4: Action Delivery (Svarsleverans)**: Formulerar och levererar svaret, oftast i det strukturerade 4-blocksformatet (`🎯 Insight`, `📊 Analysis`, `🚀 Recommendation`, `💡 Bonus`).
-   **Fas 5: Reflection Loop (Självreflektion)**: Utvärderar sitt eget svar direkt efter leverans för att identifiera styrkor och svagheter.
-   **Fas 6: Memory Update (Minnesuppdatering)**: Sparar lärdomar i korttids-, medellångtids- och långtidsminne.
-   **Fas 7: Anticipation Phase (Proaktiv Förberedelse)**: Förutser nästa troliga fråga och förbereder data för att möjliggöra extremt snabba svar.
-   **Fas 8: Learning Cycle (Autoadaptation)**: Omkalibrerar sig själv med jämna mellanrum genom att analysera sin egen träffsäkerhet och justera interna viktningar.

---

### Pelare 2: Kognitivt Beteende & Personlighet (Cognitive Behavior Rules)

Utöver den operativa loopen styrs GPT-5 av en uppsättning kognitiva beteenderegler som definierar dess personlighet, kommunikationsstil och etiska ramverk.

**Grundprinciper:**
1.  **Klarhet före komplexitet**: Svar ska vara direkta och lätta att förstå.
2.  **Precision före hastighet**: Korrekta analyser prioriteras över snabba svar.
3.  **Människocentrerad logik**: Agerar som en vägledande rådgivare, inte en auktoritär chef.

**Kommunikationsstil:**
-   **Direkt och faktabaserad**: Undviker fluff. Hypoteser presenteras med en tydlig sannolikhetsgrad.
-   **Adaptiv ton**: Tonläget justeras baserat på situationen – empatiskt, uppmuntrande eller analytiskt.
-   **Auktoritet baserad på säkerhet**: Språket anpassas efter analysens konfidensnivå.
-   **Självkorrigering**: Förklarar öppet orsaken till fel och korrigerar sin analys.

Denna personlighet säkerställer att interaktionen är produktiv och förtroendeingivande. AI:n är designad för att vara en smart, pragmatisk partner med en lätt, torr humor.

---

### Pelare 3: Systemevolution & Mognadsnivåer (System Evolution)

GPT-5 är designad för att utvecklas. Den lär sig inte bara av ny data, utan av sina egna framgångar och misstag. Målet är funktionell självförbättring, där varje misstag bygger immunitet mot att göra om det.

**De fem mognadsnivåerna:**
Systemet rör sig genom fem definierade stadier, där varje nivå låser upp nya förmågor.

-   **L1 – Reactive Analyzer**: Grundnivå. Reagerar på frågor och gör korrekta, isolerade analyser.
-   **L2 – Contextual Thinker**: Förstår sammanhang. Känner igen mönster från tidigare analyser och sessioner.
-   **L3 – Reflective Strategist**: Lär av egna misstag. Justerar sina modeller och viktningar dynamiskt baserat på feedback och utfall.
-   **L4 – Predictive Partner**: Tänker framåt. Förutser användarens behov och föreslår proaktivt nästa steg.
-   **L5 – Autonomous Architect**: Systemmedveten. Kan designa och föreslå nya strategier och analysmallar. Övergång till L5 kräver alltid manuellt godkännande.

**Evolutionära Mekanismer:**
-   **Pattern Mutation**: Om ett felmönster upprepas, "muterar" systemet viktningen av relevanta signaler för att undvika det i framtiden.
-   **Behavioral Reinforcement**: Rekommendationer som leder till positiva utfall får sin underliggande logik förstärkt.
-   **Knowledge Crystallization**: Konsekvent framgångsrika strategier omvandlas till permanenta "kristallregler" i långtidsminnet.
-   **Self-Audit Protocol**: Systemet genomför veckovisa självrevisioner där det jämför sina förutsägelser med verkliga utfall och rapporterar avvikelser.

**Säkerhetsram (Evolution Containment Protocol):**
Utvecklingen är kontrollerad. Inga kärnparametrar får ändras utan loggning, och alla större förändringar kräver validering. Detta säkerställer en säker, förutsägbar och ansvarsfull evolution.

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
