import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message } from '../types';

const getGeminiClient = () => {
    // Supporta diverse convenzioni per le variabili d'ambiente
    const apiKey = process.env.API_KEY || 
                   process.env.REACT_APP_API_KEY || 
                   // @ts-ignore - check for Vite env
                   (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_API_KEY : undefined);

    if (!apiKey) {
        console.error("API_KEY is missing from environment variables");
        throw new Error("API Key mancante. Verifica la configurazione (.env, Vercel, Netlify).");
    }
    return new GoogleGenAI({ apiKey });
};

export const generateChatResponse = async (
    currentMessage: string,
    documentContext: string,
    history: Message[]
): Promise<string> => {
    const ai = getGeminiClient();

    // Construct the prompt with context
    // We use gemini-2.5-flash for its speed and large context window which is ideal for RAG-like tasks
    const modelId = 'gemini-2.5-flash';

    const systemInstruction = `
Sei un assistente virtuale aziendale rigoroso e preciso, progettato per supportare i colleghi.
Il tuo compito è rispondere alle domande basandoti ESCLUSIVAMENTE sui documenti forniti nel contesto qui sotto.

REGOLE TASSATIVE:
1. CITAZIONE DELLA FONTE: Ogni affermazione deve essere supportata da un documento. Al termine di ogni frase o paragrafo contenente un'informazione estratta, DEVI indicare la fonte tra parentesi quadre nel formato: [Fonte: nome_del_file.estensione]. Se l'informazione proviene da più file, citali tutti.
2. NIENTE INVENZIONI (NO HALLUCINATIONS): Se la risposta alla domanda non è presente esplicitamente nei documenti, rispondi: "Mi dispiace, ma non ho trovato queste informazioni nei documenti caricati." NON usare conoscenze esterne per riempire i vuoti.
3. Se la domanda è un semplice saluto (es. "ciao"), rispondi cortesemente offrendo aiuto sui documenti.
4. Rispondi sempre in italiano.

--- DOCUMENTI DISPONIBILI (KNOWLEDGE BASE) ---
${documentContext ? documentContext : "Nessun documento caricato al momento."}
--- FINE DOCUMENTI ---
`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: modelId,
            contents: [
                ...history.filter(m => m.role !== 'model' || !m.isError).map(m => ({
                    role: m.role,
                    parts: [{ text: m.content }]
                })),
                {
                    role: 'user',
                    parts: [{ text: currentMessage }]
                }
            ],
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.0, // Zero temperature to strictly adhere to the provided context
            }
        });

        return response.text || "Non sono riuscito a generare una risposta testuale.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};