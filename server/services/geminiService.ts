import { GoogleGenerativeAI } from "@google/generative-ai";
import { InternalServerError } from "../utils/errors.js";

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY not set. AI Studio features will not work.");
}

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

/**
 * Enhance image using Gemini 2.5 Flash
 */
export async function enhanceImage(
  imageData: Buffer | string,
  prompt: string
): Promise<string> {
  if (!genAI) {
    throw new InternalServerError("Gemini API not configured");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Convert image to base64 if it's a buffer
    const imageBase64 =
      typeof imageData === "string"
        ? imageData
        : imageData.toString("base64");

    const result = await model.generateContent([
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg",
        },
      },
      {
        text: `Enhance this image according to the following prompt: ${prompt}. Return the enhanced image.`,
      },
    ]);

    const response = await result.response;
    // Note: Gemini API returns text, not images directly
    // For image generation/enhancement, you may need to use a different approach
    // This is a placeholder implementation

    return response.text();
  } catch (error) {
    throw new InternalServerError(
      `Failed to enhance image: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Generate image description
 */
export async function describeImage(imageData: Buffer | string): Promise<string> {
  if (!genAI) {
    throw new InternalServerError("Gemini API not configured");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const imageBase64 =
      typeof imageData === "string"
        ? imageData
        : imageData.toString("base64");

    const result = await model.generateContent([
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg",
        },
      },
      {
        text: "Describe this image in detail.",
      },
    ]);

    const response = await result.response;
    return response.text();
  } catch (error) {
    throw new InternalServerError(
      `Failed to describe image: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}




