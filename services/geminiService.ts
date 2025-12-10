import { GoogleGenAI } from "@google/genai";
import { MockupCategory } from "../types";

// Validate API Key
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY is missing. Please check your environment configuration.");
}

// Initialize the client
const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key-to-prevent-crash' });

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

/**
 * Generates a single mockup image based on the provided source image and parameters.
 */
export const generateMockupImage = async (
  base64Image: string,
  category: MockupCategory,
  userDescription: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error("Chave de API não configurada");
  }

  try {
    const basePrompt = MOCKUP_PROMPTS[category];
    const fullPrompt = `You are a professional product photographer and editor. 
    Task: Create a high-quality, photorealistic product mockup.
    
    1. Base Scene: ${basePrompt}.
    2. Input Image: The provided image is a logo or design pattern.
    3. Action: Seamlessly apply this design onto the main object in the scene (e.g., the paper, the sign, the screen, the shirt fabric).
    4. Style Details: ${userDescription || 'Professional, clean, realistic lighting and shadows'}.
    
    Ensure correct perspective, wrapping, and texture blending. The result must look like a real photo, not a digital overlay.`;

    // Remove the prefix if present (e.g., "data:image/png;base64,")
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          // Sending image first often helps the model understand it's the context/subject
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanBase64
            }
          },
          {
            text: fullPrompt
          }
        ]
      }
    });

    // Extract image from response
    const parts = response.candidates?.[0]?.content?.parts;
    
    if (!parts) {
      throw new Error("O modelo não retornou conteúdo.");
    }

    // Search for inlineData (image)
    const imagePart = parts.find(p => p.inlineData);

    if (imagePart && imagePart.inlineData && imagePart.inlineData.data) {
      return `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}`;
    }

    // If no image, check if there's text (error message from model)
    const textPart = parts.find(p => p.text);
    if (textPart && textPart.text) {
      console.warn("Model returned text instead of image:", textPart.text);
      throw new Error("O modelo não pôde gerar a imagem (Safety/Context). Tente outra imagem.");
    }

    throw new Error("Nenhuma imagem encontrada na resposta.");

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Return clean error messages for the UI
    if (error.message.includes("API_KEY")) return Promise.reject("Erro de Configuração (API Key)");
    if (error.message.includes("fetch")) return Promise.reject("Erro de Conexão");
    if (error.message.includes("403")) return Promise.reject("Acesso Negado (API Key inválida)");
    if (error.message.includes("Safety")) return Promise.reject("Bloqueio de Segurança");
    
    throw error;
  }
};