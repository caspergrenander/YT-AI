import { ChatMessage } from '../types';

// =================================================================
// 🧠 1. KOPPLING TILL LOKAL AI-SERVER
// =================================================================
// Denna fil har omarbetats för att kommunicera med en lokal backend-server
// istället för Gemini API. Det är på den servern du kör dina Python-verktyg
// (gpt4all, pandas, yt-dlp, etc.).

/**
 * Skickar ett meddelande till den lokala AI-servern och returnerar dess svar.
 * @param message Användarens nuvarande meddelande.
 * @param history En array av tidigare meddelanden för att ge kontext.
 * @returns Ett text-svar från AI:n.
 */
export const getLocalAIResponse = async (message: string, history: ChatMessage[]): Promise<string> => {
  try {
    // Frontend skickar användarens fråga och historik till din lokala backend.
    // Vi antar att din server körs på http://localhost:8000
    const response = await fetch('http://localhost:8000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: message,
        // Skicka historiken i ett format som din backend kan förstå
        history: history.map(msg => ({ role: msg.sender, content: msg.text })),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error from local AI server:", errorText);
      throw new Error(`Servern svarade med status: ${response.status}. Se webbläsarens konsol.`);
    }

    const data = await response.json();
    
    // Vi antar att din server returnerar ett JSON-objekt som ser ut så här:
    // { "response": "Här är AI:ns svar..." }
    if (typeof data.response !== 'string') {
        throw new Error("Svaret från servern hade ett ogiltigt format. Förväntade mig { response: '...' }.");
    }
    
    return data.response;

  } catch (error) {
    console.error("Kunde inte kommunicera med den lokala AI-servern:", error);
    return "Ett fel uppstod. Kontrollera att din lokala Python-server är igång på `http://localhost:8000` och att den kan ta emot anrop på `/api/chat`. Se webbläsarens konsol för mer information.";
  }
};
