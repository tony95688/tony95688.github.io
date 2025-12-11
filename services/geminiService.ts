import { GoogleGenAI } from "@google/genai";
import { AIStyle } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const refineMessageWithAI = async (currentText: string, style: AIStyle): Promise<string> => {
  if (!currentText.trim()) return "";

  const prompt = `
    You are a helpful assistant assisting a user in writing a Discord message.
    
    Current Draft: "${currentText}"
    
    Task: Rewrite the draft above to be in a "${style}" tone.
    
    Rules:
    - Keep the core meaning.
    - Do not add conversational filler like "Here is the rewritten text".
    - Just output the final message content ready for Discord.
    - If the style is "Announcement", use bolding and appropriate emojis.
    - Return ONLY the text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate AI content. Please check your connection.");
  }
};
