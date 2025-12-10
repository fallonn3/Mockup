import { GoogleGenAI } from "@google/genai";
import { MockupCategory } from "../types";

// Helper to resize image before sending to API to avoid payload limits
const resizeImage = (base64Str: string, maxWidth = 1024): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8)); // Convert to JPEG 80% quality for lighter payload
    };
    img.onerror = () => resolve(base64Str); // Fallback to original if fail
  });
};

const apiKey = process.env.API_KEY;

// Debug log to help user verify configuration (visible in Browser Console)
console.log("Gemini Service Init - API Key Status:", apiKey ? `Present (Length: ${apiKey.length})` : "Missing");

// Initialize the client
const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

const MOCKUP_PROMPTS: Record<MockupCategory, string> = {
  [MockupCategory.STATIONERY]: "branding stationery set on a desk, business cards, notebook, clean aesthetic, overhead view",
  [MockupCategory.FACADE]: "modern shop facade sign, 3d logo signage, street view, photorealistic, cinematic lighting",
  [MockupCategory.PACKAGING]: "modern product packaging box, cardboard texture, studio lighting, depth of field",
  [MockupCategory.TSHIRT]: "cotton t-shirt on a hanger or model, fabric texture, realistic apparel mockup, studio light",
  [MockupCategory.HOODIE]: "hoodie sweatshirt, high quality fabric, studio mockup, soft lighting",
  [MockupCategory.MUG]: "ceramic coffee mug on a wooden table, warm lighting, photorealistic, steam rising",
  [MockupCategory.MOBILE]: "smartphone screen mockup held in hand or on table, blurred background, high tech vibe",
  [MockupCategory.DESKTOP]: "modern desktop computer monitor on a sleek office desk, workspace context, professional setup",
  [MockupCategory.TABLET]: "tablet device on a coffee shop table, natural lighting, sharp screen details",
  [MockupCategory.POSTER]: "framed poster hanging on a modern interior wall, art gallery style, soft shadows",
  [MockupCategory.TOTE_BAG]: "canvas tote bag hanging or being carried, realistic fabric folds, natural texture"
};

export const generateMockupImage = async (
  base64Image: string,
  category: MockupCategory,
  userDescription: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error("Chave de API não configurada (API_KEY missing)");
  }

  try {
    // 1. Optimization: Resize image to prevent timeouts/payload errors
    const optimizedImage = await resizeImage(base64Image);
    const cleanBase64 = optimizedImage.split(',')[1];

    const basePrompt = MOCKUP_PROMPTS[category];
    const fullPrompt = `You are a professional product photographer. 
    Task: Create a photorealistic product mockup.
    
    Context: ${basePrompt}.
    Style: ${userDescription || 'Professional, clean, realistic lighting'}.
    
    Instruction: Apply the provided logo/design (Input Image) onto the product in the scene naturally. 
    Ensure correct perspective, lighting, and texture blending.`;

    console.log(`Generating mockup for ${category}...`);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: fullPrompt
          }
        ]
      }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    
    if (!parts) throw new Error("Sem resposta do modelo");

    const imagePart = parts.find(p => p.inlineData);

    if (imagePart?.inlineData?.data) {
      return `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}`;
    }

    const textPart = parts.find(p => p.text);
    if (textPart?.text) {
      console.warn("Model text response:", textPart.text);
      throw new Error("O modelo não gerou imagem (Bloqueio de Segurança ou Contexto)");
    }

    throw new Error("Formato de resposta inválido");

  } catch (error: any) {
    console.error("Gemini API Error Detail:", error);
    
    // User friendly error mapping
    if (error.message.includes("429")) return Promise.reject("Muitas requisições. Aguarde um momento.");
    if (error.message.includes("403")) return Promise.reject("Chave de API inválida.");
    if (error.message.includes("Safety")) return Promise.reject("Conteúdo bloqueado por segurança.");
    
    throw error;
  }
};