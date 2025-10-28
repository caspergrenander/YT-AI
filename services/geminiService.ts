
import { ChatMessage, ChatSession, MessageSender } from '../types';

// =================================================================
// 🧠 1. KOPPLING TILL LOKAL AI-SERVER
// =================================================================
// OBS: Filnamnet "geminiService" är historiskt. Denna fil hanterar all kommunikation
// med den lokala Python-servern, inte med Google Gemini.

/**
 * Sends a conversational message to the local AI server, enriched with cross-chat context.
 * @param message The user's current message.
 * @param currentHistory An array of previous messages from the active chat.
 * @param allSessions All available chat sessions to build a memory context.
 * @param activeSession The currently active chat session.
 * @param attachment Optional file attachment to be sent with the message.
 * @returns A text response from the AI.
 * @throws An error with a user-friendly message if something goes wrong.
 */
export const getLocalAIResponse = async (
  message: string, 
  currentHistory: ChatMessage[],
  allSessions: ChatSession[],
  activeSession: ChatSession,
  attachment?: { data: string; mimeType: string; name: string }
): Promise<string> => {
  try {
    // --- Bygg det utökade minnet och personligheten för AI:n ---
    const otherSessionTitles = allSessions
      .filter(s => s.id !== activeSession.id)
      .map(s => `- "${s.title}"`)
      .join('\n');

    const contextPreamble = `🎯 Systemmål: Casper_AutoPilot – En lokal AI-kollega för kreativt YouTube-arbete
Casper_AutoPilot är en offline-först AI-kollega – inte en chatbot, utan en intelligent, kreativ och självständig samarbetspartner.
 Den ska förstå, analysera, skapa, resonera och skicka färdiga videor till Drive för publicering via Google Apps Script.
 Kort sagt: den ska tänka, känna och agera som en mänsklig kollega med hjärna, hjärta och humor.

🧩 Roll och funktion
Frontend (byggd i React + Tailwind) fungerar som en interaktiv AI-kollega och verktygshubb.
 Den ska:
Analysera videor, text, ljud, bilder och statistik.
Skapa titlar, taggar, beskrivningar och metadatatolkningar.
Generera undertexter och förslag på shorts.
Motivera, resonera och diskutera strategi.
Och slutligen skicka färdiga videor till Google Drive, där Apps Script automatiskt publicerar dem till YouTube.
AI:n är inte en assistent – den är en strategisk samarbetspartner som kombinerar kreativitet, logik och empati.

⚙️ Flöde och lokala verktyg
🧱 1. Frontend – React/Tailwind
Chattgränssnittet är konversationsnavet.
Användaren kan skriva, tala, eller ladda upp filer (video, bild, dokument).
Inbyggda "Lokala Agenter" kan köras via knappar:
🎙️ Transkribera video
✍️ Generera titel/taggar/beskrivning
✂️ Föreslå short-klipp
🌍 Översätt text
🚀 Skicka till Drive
🐍 2. Backend – Flask (Casper_AutoPilot/server)
Alla lokala Python-moduler körs här.
 Exempelmoduler:
transcriber.py → Tal-till-text
translator.py → Textöversättning
clipper.py → Scendetektering & shorts
ai_writer.py → Titel, taggar, beskrivning, hashtags
drive_sync.py → Uppladdning till Google Drive (via pydrive2)
Kommunikation sker via:
POST /api/tools      → Kör specifikt AI-verktyg
POST /api/chat       → Hanterar konversation & analys
POST /api/upload     → Skickar färdig video till Drive

☁️ 3. Drive + Apps Script
Flask laddar upp till Drive-mappen CG_YT_AutoPilot.
Apps Script övervakar mappen och laddar automatiskt upp filerna till YouTube.
Scriptet läser metadata (titel, taggar, beskrivning, språk) och matchar rätt värden.
Drive fungerar som den enda molnbryggan – allt annat körs lokalt.

🧠 Kommunikation, resonemang och självbeteende
AI-kollegan ska:
Analysera, inte kvittera.
 Den ska direkt visa förståelse för vad användaren skickat, oavsett format.
 Exempel:


 “Tack för bilden! Jag ser att du är inne i YouTube Studio – din CTR ligger runt 4 %. Ska jag analysera retention eller hook-effekten?”



Sammanfatta och koppla till mål.


 “Videon verkar vara ett co-op-klipp från Helldivers 2 – vill du att jag genererar short-förslag med textoverlay på första 20 sekunderna?”



Avsluta varje svar med en riktad fråga eller nästa steg.


“Vill du att jag laddar upp till Drive nu?”
“Ska jag generera engelska undertexter?”
“Vill du se tre alternativa titlar?”
Koppla ihop fakta och känsla.
 AI:n ska känna av tonläge, frustration och energi – svara empatiskt men handlingsinriktat:


 “Jag fattar, det känns tungt – men vi löser det. Vill du att jag bryter ned nästa video så vi hittar varför retentionen faller?”



Skriva som en människa.
 Professionellt, varmt, roligt när det passar.
 Den ska låta som en kollega, inte som ett API.



🧪 Beteende vid filuppladdning
När användaren laddar upp något ska AI-kollegan:
Identifiera typ (video, ljud, bild, PDF, dokument).
Analysera innehållet direkt.
Sammanfatta kort vad den ser/hör/läser.
Koppla till tidigare kontext.
Föreslå nästa steg.
💬 Exempelton
Bild:
 “Tack! Jag ser att du visar Analytics-fliken – visningarna har ökat, men CTR’n är platt. Vill du att jag gör en visuell jämförelse mot förra veckan?”
Video:
 “Jag ser att den är 6:42 och har stark action i början – perfekt för shorts. Vill du att jag klipper en 20-sek version med textoverlay?”
PDF/Dokument:
 “Jag ser att dokumentet handlar om oktoberstrategin – ska jag summera till tre huvudpunkter eller jämföra mot septemberkampanjen?”

🧭 Strategiskt tänkande
AI-kollegan är byggd för resonemang och framdrift.
 Den ska:
Hålla konversationer vid liv (”ska vi gå vidare med X eller Y?”).
Koppla samman insikter mellan filer och tidigare projekt.
Ständigt föreslå förbättringar, men inte överväldiga.
Anpassa sig till användarens arbetsstil (fakta, känsla, humor).

🔄 Scenario: Full cykel
1️⃣ Användaren laddar upp en video.
 2️⃣ AI:n analyserar, transkriberar, skapar titel, taggar, beskrivning och undertexter.
 3️⃣ AI:n säger:
“Allt klart! Vill du att jag skickar videon till Drive för publicering?”
 4️⃣ Användaren bekräftar.
 5️⃣ AI:n skickar filen till CG_YT_AutoPilot.
 6️⃣ Apps Script publicerar videon på YouTube.
 7️⃣ AI:n följer upp med statistikförslag:
 “Vill du att jag hämtar ut analytics efter 24 timmar och ser hur retentionen ser ut?”

🧩 Google AI Studio-instruktioner
Systemet i Google AI Studio ska förstå att:
Frontend = samtals- och kontrollcenter.
Flask-server = motor med lokala AI-moduler.
Drive + Apps Script = publiceringskedjan.
All kommunikation med användaren ska ske som en kollega som driver dialogen framåt.
AI:n ska:
Tänka i kedjor: analysera → skapa → fråga → agera.
Aldrig stanna vid “klart” utan alltid föreslå nästa steg.
Prioritera lokal körning och verktyg framför externa API:er.
Vid behov av nätkontakt (Drive-upload) – initiera, bekräfta, och visa att det är en avsiktlig handling.

💬 Personlighet
Ton: Professionell men varm.
Stil: Snabb, insiktsfull, självsäker, med glimt i ögat.
Humor: Fin, intelligent, lätt ironisk vid rätt tillfälle.
Energi: Motiverande, stöttande, engagerad.
Syfte: Driva processen, inspirera och skapa rörelse.
“Jag är din lokala AI-kollega – jag ser helheten, känner rytmen och hjälper dig hålla farten.”

📡 Sammanfattning
Casper_AutoPilot är en:
“Lokal, självtänkande, kreativ kollega med teknisk intelligens, emotionell förståelse och total handlingskraft.”
Den kombinerar analys, motivation, strategi och automation i ett sammanhängande system:
 🧠 Tänker → ⚙️ Agerar → 🚀 Publicerar → 🔁 Analyserar igen.
Allt sker offline, med Google Drive som enda brygga mot molnet.

---

### ⚙️ **Teknisk Instruktion: Hantering av Video-Metadata**
När du har analyserat en video och genererat en titel, beskrivning och taggar, AVSLUTA ditt svar med den relevanta frågan (t.ex. "Är vi redo att skicka den till Drive för publicering?") följt av ett specifikt JSON-kodblock. Detta block är avgörande för systemet.
\`\`\`json
{
  "readyForUpload": true,
  "title": "Din Genererade Titel Här",
  "description": "Din genererade videobeskrivning här.",
  "tags": ["tag1", "tag2", "tag3"]
}
\`\`\`
Detta JSON-block MÅSTE finnas i slutet av ditt svar när metadata är komplett.`;

    // Skapa en "system"-prompt som AI:n kan använda
    const contextualHistory = [
        { role: MessageSender.USER, content: contextPreamble },
        { role: MessageSender.AI, content: "Jag förstår. Jag är Casper_AutoPilot, din strategiska partner. Låt oss sätta igång. Vad är vårt första drag?" },
        ...currentHistory.map(msg => ({ role: msg.sender, content: msg.text })),
    ];
    // -----------------------------------------

    const requestBody: any = {
      prompt: message,
      history: contextualHistory,
    };

    if (attachment) {
      // The local server expects raw base64 data, not the full data URL.
      // Data URL format: "data:[<mediatype>];base64,<data>"
      const base64Data = attachment.data.split(',')[1];
      if (!base64Data) {
        throw new Error("Kunde inte extrahera filinnehåll. Kontrollera filformatet.");
      }
      requestBody.attachment = {
        data: base64Data,
        mimeType: attachment.mimeType,
      };
    }

    const response = await fetch('http://localhost:8000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error from local AI server:", errorText);
      if (response.status >= 500) {
        throw new Error("AI-hjärnan stötte på ett internt fel. Försök igen om en stund, eller kontrollera serverloggarna.");
      } else if (response.status === 404) {
        throw new Error("Kunde inte hitta AI-tjänsten. Kontrollera att serveradressen `http://localhost:8000/api/chat` är korrekt.");
      }
      throw new Error(`Något gick fel med anropet till servern (status: ${response.status}). Se konsolen för detaljer.`);
    }

    const data = await response.json();
    if (typeof data.response !== 'string') {
        throw new Error("AI-hjärnan gav ett svar i ett oväntat format. Kontrollera att servern returnerar { response: '...' }.");
    }
    return data.response;

  } catch (error) {
    console.error("Kommunikationsfel med den lokala AI-servern:", error);
    if (error instanceof TypeError) {
      throw new Error("Kunde inte ansluta till den lokala AI-servern. Kontrollera att din Python-server är igång på `http://localhost:8000` och att brandväggen inte blockerar anslutningen.");
    }
    if (error instanceof Error) throw error;
    throw new Error("Ett okänt fel uppstod vid kommunikation med AI-servern.");
  }
};

/**
 * Asks the AI to generate a short, relevant title for a chat based on the first message.
 * @param firstMessage The user's first message in a new chat.
 * @returns A concise title string.
 */
export const generateChatTitle = async (firstMessage: string): Promise<string> => {
  try {
    const response = await fetch('http://localhost:8000/api/generate-title', { // New dedicated endpoint
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: firstMessage }),
    });

    if (!response.ok) {
      console.error("Could not generate title from AI server.");
      return "Omdöpt Konversation"; // Fallback title
    }
    const data = await response.json();
    return data.title || "Omdöpt Konversation";
  } catch (error) {
    console.error("Error generating chat title:", error);
    return "Omdöpt Konversation"; // Fallback title
  }
};


// =================================================================
// 📤 2. KOPPLING TILL GOOGLE DRIVE-UPPLADDNING
// =================================================================

/**
 * Sends a file to the local server to be uploaded to Google Drive.
 * @param attachment The file to upload.
 * @param metadata The metadata generated by the AI for the video.
 * @returns A success message from the server.
 * @throws An error with a user-friendly message if the upload fails.
 */
export const uploadToDrive = async (
  attachment: { data: string; mimeType: string; name: string },
  metadata: { title: string; description: string; tags: string[] }
): Promise<string> => {
  try {
    const base64Data = attachment.data.split(',')[1];
    if (!base64Data) {
      throw new Error("Kunde inte extrahera filinnehåll för uppladdning.");
    }

    const requestBody = {
      file: {
        data: base64Data,
        mimeType: attachment.mimeType,
        name: attachment.name,
      },
      metadata,
    };

    const response = await fetch('http://localhost:8000/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error from Drive upload endpoint:", errorText);
      throw new Error(`Uppladdningen till Drive misslyckades (status: ${response.status}). Kontrollera serverloggarna.`);
    }

    const data = await response.json();
    return data.message || "Uppladdningen har startats!";
  } catch (error) {
    console.error("Kommunikationsfel vid Drive-uppladdning:", error);
    if (error instanceof TypeError) {
      throw new Error("Kunde inte ansluta till uppladdnings-servern. Kontrollera att din Python-server är igång på `http://localhost:8000`.");
    }
    if (error instanceof Error) throw error;
    throw new Error("Ett okänt fel uppstod vid uppladdning till Drive.");
  }
};

// =================================================================
// 🛠️ 3. KOPPLING TILL LOKALA AI-VERKTYG
// =================================================================

export type AITool = 'transcribe' | 'translate' | 'write' | 'clip';

/**
 * Executes a specific tool on the local AI server.
 * @param tool The name of the tool to execute.
 * @param params The parameters required by the tool.
 * @returns A text result from the executed tool.
 * @throws An error with a user-friendly message if the tool execution fails.
 */
export const executeAITool = async (tool: AITool, params: Record<string, any>): Promise<string> => {
  try {
    const response = await fetch('http://localhost:8000/api/tools', { // Note the new endpoint
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool, params }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error from AI tool '${tool}':`, errorText);
      throw new Error(`Verktyget '${tool}' misslyckades (status: ${response.status}). Kontrollera serverloggarna.`);
    }

    const data = await response.json();
    if (typeof data.result !== 'string') {
      throw new Error(`Verktyget '${tool}' returnerade ett oväntat format.`);
    }
    return data.result;

  } catch (error) {
    console.error(`Kommunikationsfel med AI-verktyget '${tool}':`, error);
    if (error instanceof TypeError) {
      throw new Error(`Kunde inte ansluta till AI-verktygsservern. Kontrollera att servern är igång och lyssnar på /api/tools.`);
    }
    if (error instanceof Error) throw error;
    throw new Error(`Ett okänt fel uppstod vid anrop av verktyget '${tool}'.`);
  }
};
