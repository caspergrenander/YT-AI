import { ChatMessage } from '../types';

// =================================================================
// 🧠 1. KOPPLING TILL LOKAL AI-SERVER
// =================================================================

/**
 * Sends a conversational message to the local AI server.
 * @param message The user's current message.
 * @param history An array of previous messages for context.
 * @returns A text response from the AI.
 * @throws An error with a user-friendly message if something goes wrong.
 */
export const getLocalAIResponse = async (message: string, history: ChatMessage[]): Promise<string> => {
  try {
    const response = await fetch('http://localhost:8000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: message,
        history: history.map(msg => ({ role: msg.sender, content: msg.text })),
      }),
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
