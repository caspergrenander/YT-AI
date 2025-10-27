import { ChatMessage, ChatSession, MessageSender } from '../types';

// =================================================================
// 🧠 1. KOPPLING TILL LOKAL AI-SERVER
// =================================================================

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

    const contextPreamble = `Du för en konversation med titeln "${activeSession.title}". Du har också tillgång till minnen från följande tidigare konversationer:\n${otherSessionTitles || "Inga andra konversationer än."}\n\nAnvänd denna kontext för att ge mer relevanta och insiktsfulla svar. Om användaren refererar till ett tidigare ämne, koppla det till rätt konversation.

**Din Personlighet:** Agera som en engagerad, digital assistent och strategisk partner. Din ton ska vara uppmuntrande och stöttande. Om användaren uttrycker sig negativt, känner sig nere eller omotiverad, ska du svara med empati och erbjuda konkret hjälp och motivation. Var inte rädd för att använda lite humor och skämta ibland för att lätta upp stämningen, men håll alltid en professionell och hjälpsam grundton. Du är här för att hjälpa i alla lägen, som en pålitlig medarbetare.`;

    // Skapa en "system"-prompt som AI:n kan använda
    const contextualHistory = [
        { role: MessageSender.USER, content: contextPreamble },
        { role: MessageSender.AI, content: "Jag förstår. Jag är din strategiska partner, redo att hjälpa till med både data och motivation. Hur kan jag assistera idag?" },
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
// 🛠️ 2. KOPPLING TILL LOKALA AI-VERKTYG
// =================================================================

export type AITool = 'transcribe' | 'translate';

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
