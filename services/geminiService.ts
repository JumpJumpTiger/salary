import { GoogleGenAI, Type } from "@google/genai";

export const generateMotivationalQuote = async (
  currentEarnings: number,
  progress: number,
  salary: number,
  isRestDay: boolean = false
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.warn("API Key not found, using fallback quotes.");
    return "";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    let prompt = "";

    if (isRestDay) {
        prompt = `
          You are a witty, cartoonish friend of a hard worker.
          Today is a REST DAY for the user.
          Generate a short, funny, or relaxing one-sentence quote (in Chinese) to encourage them to enjoy their break, recharge, or do something fun.
          Avoid talking about earning money today. Focus on "recharging" or "freedom".
          Keep it under 20 words.
        `;
    } else {
        prompt = `
          You are a witty, cartoonish financial assistant for a worker.
          The user has currently earned ¥${currentEarnings.toFixed(2)} today.
          They are ${progress.toFixed(1)}% through their workday.
          Their monthly salary is ¥${salary}.
          
          Generate a short, funny, or encouraging one-sentence quote (in Chinese) to motivate them.
          If earnings are low, be playful. If earnings are high, celebrate.
          Keep it under 20 words.
        `;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: { type: Type.STRING },
          }
        }
      }
    });

    const jsonStr = response.text?.trim();
    if (jsonStr) {
      const data = JSON.parse(jsonStr);
      return data.quote;
    }
    return "";

  } catch (error) {
    console.error("Error generating quote:", error);
    return "";
  }
};