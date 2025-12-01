import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to convert File/Blob to base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const editImageWithGemini = async (
  imageFile: File,
  prompt: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key not found. Please check your environment configuration.");
  }

  const base64Image = await fileToGenerativePart(imageFile);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Nano banana / Gemini Flash Image
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: imageFile.type,
              data: base64Image
            }
          },
          {
            text: prompt
          }
        ]
      }
    });

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image generated in response.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
