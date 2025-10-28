import { ChatMessage } from '../types';

// Fix: Use `process.env.VITE_API_BASE` to align with the definition in `vite.config.ts`.
// @ts-ignore - This will be replaced by Vite during the build process, but TypeScript is unaware of it without Node.js types.
const API_BASE = process.env.VITE_API_BASE || "http://127.0.0.1:5000";

// Fix: Define and export the AITool type based on its usage across the application.
export type AITool = 'transcribe' | 'translate' | 'clip' | 'write' | 'optimize_video';

/**
 * Skickar prompt och kontext till den lokala AI-hjärnan.
 */
export const getAIResponse = async (
    prompt: string,
    history: ChatMessage[],
    attachment?: { data: string; mimeType: string; name: string }
): Promise<{ response: string }> => {
    const requestBody: any = { 
        prompt, 
        context: {
            history: history.map(m => ({ role: m.sender, content: m.text }))
        }
    };
    if (attachment) {
        const base64Data = attachment.data.split(',')[1];
        requestBody.attachment = { data: base64Data, mimeType: attachment.mimeType, name: attachment.name };
    }

    const response = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Fel vid AI-anrop: ${response.status} ${response.statusText} - ${errorText}`);
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
    // This helper function attempts to fetch data, with a fallback to localStorage.
    const cachedRequest = async (key: string, fn: () => Promise<any>) => {
        try {
            // Only attempt the network request if the user is online.
            if (!window.navigator.onLine) {
                // Throw to enter the catch block and try reading from cache.
                throw new Error("Offline, using cache.");
            }
            const data = await fn();
            localStorage.setItem(key, JSON.stringify(data));
            return data;
        } catch (e) {
            console.warn("API call failed or offline, trying to read from cache.", e);
            const cachedData = localStorage.getItem(key);
            if (cachedData) {
                return JSON.parse(cachedData);
            }
            // If the API call fails AND there's no cache, return an empty object
            // to prevent a hard crash on the first run without a network connection.
            console.error("Synk mot Apps Script misslyckades och ingen cache fanns tillgänglig. Fortsätter med tom data.");
            return {};
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