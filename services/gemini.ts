
import { GoogleGenAI, Type } from "@google/genai";

export const geminiSupport = {
  ask: async (question: string, context?: any) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Você é o PatoBot, o assistente inteligente do PatoPay. 
      Ajude o usuário com esta dúvida: "${question}". 
      Contexto técnico: ${JSON.stringify(context || {})}. 
      Responda como a voz oficial do PatoPay. Seja engraçado (use quacks), profissional e direto. Responda em Português Brasil.`,
    });
    return response.text;
  },

  parsePaymentCommand: async (command: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analise o seguinte comando: "${command}". 
      Identifique se o usuário deseja realizar uma cobrança no sistema PatoPay.
      Extraia o valor (amount), o nome da pessoa (name) e uma descrição curta.
      
      Regras:
      1. Se detectar intenção de cobrança, preencha o JSON.
      2. Se o nome não for citado, use "Cliente".
      3. O valor deve ser um número limpo.
      
      Retorne APENAS o JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCharge: { type: Type.BOOLEAN, description: "True se for uma intenção de cobrar alguém" },
            amount: { type: Type.NUMBER, description: "Valor numérico" },
            name: { type: Type.STRING, description: "Nome da pessoa a ser cobrada" },
            description: { type: Type.STRING, description: "Descrição do item" }
          },
          required: ["isCharge"]
        }
      }
    });
    
    try {
      const text = response.text || '{}';
      return JSON.parse(text);
    } catch (e) {
      console.error("Erro PatoBot Parsing:", e);
      return null;
    }
  }
};
