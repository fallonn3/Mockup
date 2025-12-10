import { GoogleGenAI } from "@google/genai";
import { MockupCategory } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MOCKUP_PROMPTS: Record<MockupCategory, string> = {
  [MockupCategory.STATIONERY]: "branding stationery set on a desk, business cards, notebook, clean aesthetic",
  [MockupCategory.FACADE]: "modern shop facade sign, 3d logo signage, street view, photorealistic",
  [MockupCategory.PACKAGING]: "modern product packaging box, cardboard texture, studio lighting",
  [MockupCategory.TSHIRT]: "cotton t-shirt on a hanger or model, fabric texture, realistic apparel mockup",
  [MockupCategory.HOODIE]: "hoodie sweatshirt, high quality fabric, studio mockup",
  [MockupCategory.MUG]: "ceramic coffee mug on a wooden table, warm lighting, photorealistic",
  [MockupCategory.MOBILE]: "smartphone screen mockup held in hand or on table, blurred background",
  [MockupCategory.DESKTOP]: "modern desktop computer monitor on a sleek office desk, workspace context",
  [MockupCategory.TABLET]: "tablet device on a coffee shop table, natural lighting",
  [MockupCategory.POSTER]: "framed poster hanging on a modern interior wall, art gallery style",
  [MockupCategory.TOTE_BAG]: "canvas tote bag hanging or being carried, realistic fabric folds"
};

/**
 * Generates a single mockup image based on the provided source image and parameters.
 */
export const generateMockupImage = async (
  base64Image: string,
  category: MockupCategory,
  userDescription: string
): Promise<string> => {
  try {
    const basePrompt = MOCKUP_PROMPTS[category];
    const fullPrompt = `Create a high-quality, photorealistic product mockup. 
    Context: ${basePrompt}. 
    ${userDescription ? `Specific style details: ${userDescription}.` : ''}
    Important: Seamlessly integrate the provided design/logo onto the object (e.g., screen, fabric, paper) with correct perspective, lighting, shadows, and texture wrapping. Make it look like a real professional product photo.`;

    // Remove the prefix if present (e.g., "data:image/png;base64,")
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: fullPrompt
          },
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanBase64
            }
          }
        ]
      }
    });

    // Extract image from response
    // The model typically returns text + image parts. We need to find the image part.
    const parts = response.candidates?.[0]?.content?.parts;
    
    if (!parts) {
      throw new Error("No content generated");
    }

    // Search for inlineData (image)
    const imagePart = parts.find(p => p.inlineData);

    if (imagePart && imagePart.inlineData && imagePart.inlineData.data) {
      return `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}`;
    }

    throw new Error("No image data found in response");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
