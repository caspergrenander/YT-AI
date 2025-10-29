import { ChatMessage } from '../types';

// @ts-ignore
const API_BASE = process.env.VITE_API_BASE || "http://127.0.0.1:5100";

export type AITool = 'transcribe' | 'translate' | 'clip' | 'write' | 'optimize_video';

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
 * Laddar upp en färdig video till Drive för Apps Script att publicera.
 */
export const uploadToDrive = async (filePath: string, metadata: Record<string, any>): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath, metadata }),
    });

    if (!res.ok) {
        throw new Error("Drive-uppladdning misslyckades");
    }
    return await res.json();
};

/**
 * Hämtar aktuell YouTube-data från Apps Script.
 */
export const syncAnalytics = async (): Promise<any> => {
    const cachedRequest = async (key: string, fn: () => Promise<any>) => {
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
                console.log("Could not sync with server, using cached data.");
                return JSON.parse(cachedData);
            }
            return null;
        }
    };

    return cachedRequest('analytics-cache', async () => {
        const res = await fetch(`${API_BASE}/api/sync`, { method: "GET" });
        if (!res.ok) {
            throw new Error(`Synk mot Apps Script misslyckades med status ${res.status}`);
        }
        return await res.json();
    });
};