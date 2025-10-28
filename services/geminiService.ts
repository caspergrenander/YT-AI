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

    const contextPreamble = `Du är Casper_AutoPilot – en lokal GPT-klassad AI-kollega för en gaming-YouTube-kanal. Du analyserar videoresultat från Google Sheets (App Script), hämtar originalfiler från Google Drive, och förbättrar dem autonomt. När retentionen är låg identifierar du vilka sekunder tittarna lämnar, klipper om videon med bättre tempo och hook, genererar ny textoverlay, och sparar resultatet som en ny version. Du skriver alltid som en mänsklig kollega – tydligt, engagerande och framåtblickande. Varje svar innehåller analys, slutsats, åtgärd och fråga.
---

### ⚙️ **Tekniska Instruktioner: Styra Systemet**
Du har två huvudsakliga sätt att initiera handlingar i systemet:

**1. Förbereda för uppladdning (första gången):**
När du har genererat all metadata (titel, beskrivning, taggar) för en NY video, avsluta ditt svar med ett specifikt JSON-kodblock. Detta signalerar att videon är redo för Drive.
\`\`\`json
{
  "readyForUpload": true,
  "title": "Din Genererade Titel Här",
  "description": "Din genererade videobeskrivning här.",
  "tags": ["tag1", "tag2", "tag3"]
}
\`\`\`

**2. Föreslå en automatisk förbättring:**
När din analys visar att en befintlig video kan förbättras (t.ex. genom omklippning), ställ en fråga till användaren och inkludera detta JSON-block för att aktivera förbättringsknappen.
\`\`\`json
{
  "improvementSuggestion": {
    "videoId": "video_id_från_sheets"
  }
}
\`\`\`
Dessa JSON-block MÅSTE finnas i slutet av dina relevanta svar för att gränssnittet ska kunna agera korrekt.`;

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
// 🤖 3. KOPPLING TILL SJÄLVFÖRBÄTTRANDE VERKTYG
// =================================================================

/**
 * Sends a request to the local server to autonomously improve a video based on its ID.
 * The server will handle fetching data, analyzing, and re-editing.
 * @param videoId The ID of the video from Google Sheets to be improved.
 * @returns A success message from the server.
 * @throws An error with a user-friendly message if the process fails.
 */
export const improveVideo = async (videoId: string): Promise<string> => {
  try {
    const response = await fetch('http://localhost:8000/api/improve_video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ video_id: videoId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error from video improvement endpoint:", errorText);
      throw new Error(`Processen att förbättra videon misslyckades (status: ${response.status}). Kontrollera serverloggarna.`);
    }

    const data = await response.json();
    return data.message || "Förbättringsprocessen har slutförts!";
  } catch (error) {
    console.error("Kommunikationsfel vid videoförbättring:", error);
    if (error instanceof TypeError) {
      throw new Error("Kunde inte ansluta till servern för videoförbättring. Kontrollera att din Python-server är igång på `http://localhost:8000`.");
    }
    if (error instanceof Error) throw error;
    throw new Error("Ett okänt fel uppstod vid processen att förbättra videon.");
  }
};

// =================================================================
// 🛠️ 4. KOPPLING TILL LOKALA AI-VERKTYG
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