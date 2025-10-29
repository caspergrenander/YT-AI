import { ChatMessage, KnowledgeBase } from '../types';

// @ts-ignore
const API_BASE = process.env.VITE_API_BASE || "http://127.0.0.1:5100";

export type AITool = 'transcribe' | 'translate' | 'clip' | 'write' | 'optimize_video';

const cachedRequest = async <T>(key: string, fn: () => Promise<T>): Promise<T | null> => {
    try {
        if (!window.navigator.onLine) {
            throw new Error("Offline, using cache.");
        }
        const data = await fn();
        localStorage.setItem(key, JSON.stringify(data));
        return data;
    } catch (e) {
        const cachedData = localStorage.getItem(key);
        if (cachedData) {
            console.log(`Could not sync ${key} with server, using cached data.`);
            return JSON.parse(cachedData);
        }
        return null;
    }
};

/**
 * Skickar prompt och kontext till GPT-5:s kärna.
 */
export const getAIResponse = async (
    prompt: string,
    history: ChatMessage[],
    attachment?: { data: string; mimeType: string; name: string }
): Promise<any> => {
    const requestBody: any = { 
        message: prompt, 
        context: {
            history: history.map(m => ({ role: m.sender, content: m.text }))
        }
    };
    if (attachment) {
        const base64Data = attachment.data.split(',')[1];
        requestBody.context.attachment = { data: base64Data, mimeType: attachment.mimeType, name: attachment.name };
    }

    const response = await fetch(`${API_BASE}/api/gpt5/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Fel vid GPT-5-anrop: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
};

/**
 * Kör ett specifikt verktyg (ex. transcribe, translate, clip, write).
 */
export const runAITool = async (tool: AITool, params: Record<string, any>): Promise<{ result: string }> => {
    const res = await fetch(`${API_BASE}/api/tools`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool, params }),
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Verktyget '${tool}' misslyckades (${res.status}): ${errorText}`);
    }
    return await res.json();
};

/**
 * Hämtar aktuell YouTube-data från Apps Script.
 */
export const syncAnalytics = async (): Promise<any> => {
    return cachedRequest('analytics-cache', async () => {
        const res = await fetch(`${API_BASE}/api/sync`, { method: "GET" });
        if (!res.ok) {
            throw new Error(`Synk mot Apps Script misslyckades med status ${res.status}`);
        }
        return await res.json();
    });
};

/**
 * Hämtar AI:ns kunskapsbas.
 */
export const getKnowledgeBase = async (): Promise<KnowledgeBase | null> => {
    const mockKnowledgeBase: KnowledgeBase = {
      rules: [
        { id: 'R001', pattern: 'CTR ↑ när titel < 45 tecken', confidence: 0.92, last_updated: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'Crystal' },
        { id: 'R002', pattern: 'Retention ↓ när intro > 8s', confidence: 0.85, last_updated: new Date(Date.now() - 86400000 * 5).toISOString(), status: 'Crystal' },
        { id: 'R007', pattern: 'Ljus tumnagel → Högre CTR på gaming-videos', confidence: 0.78, last_updated: new Date(Date.now() - 86400000 * 1).toISOString(), status: 'Rule' },
        { id: 'R015', pattern: 'Fråga i slutet → ↑ kommentarer', confidence: 0.65, last_updated: new Date(Date.now() - 86400000 * 3).toISOString(), status: 'Hypothesis' },
      ],
      graphSummary: [
        { id: 'ThumbnailContrast', connections: [{ target: 'CTR', type: 'positive_correlation', weight: 0.86 }] },
        { id: 'PublishTime', connections: [{ target: 'InitialViews', type: 'positive_correlation', weight: 0.65 }] },
        { id: 'IntroSpeed', connections: [{ target: 'Retention', type: 'negative_correlation', weight: 0.72 }] },
      ],
      learningQueue: [
        { topic: 'Effekten av slutskärm på sessionstid', confidence: 0.45 },
        { topic: 'Korrelation mellan kommentar-sentiment och tittartid', confidence: 0.51 },
      ],
      lastValidation: new Date(Date.now() - 86400000 * 4).toISOString(),
    };
    
    // Simulerar ett API-anrop, men returnerar mock-data.
    return cachedRequest('knowledge-base-cache', async () => {
      await new Promise(res => setTimeout(res, 300)); // Simulerar nätverkslatens
      // I en riktig app skulle detta vara:
      // const res = await fetch(`${API_BASE}/api/knowledge/summary`);
      // if (!res.ok) throw new Error("Kunde inte hämta kunskapsbas");
      // return await res.json();
      return mockKnowledgeBase;
    });
};
