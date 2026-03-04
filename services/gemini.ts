
import { GoogleGenAI } from "@google/genai";
import { getIconStyleJson, StyleConfig } from "../types";

const API_KEY_STORAGE = "iconoanimate_api_key";

export const getStoredApiKey = (): string => {
  return localStorage.getItem(API_KEY_STORAGE) || "";
};

export const setStoredApiKey = (key: string): void => {
  if (key.trim()) {
    localStorage.setItem(API_KEY_STORAGE, key.trim());
  }
};

export const clearStoredApiKey = (): void => {
  localStorage.removeItem(API_KEY_STORAGE);
};

export const checkApiKey = async (): Promise<boolean> => {
  return !!getStoredApiKey();
};

const resolveApiKey = (): string => {
  return getStoredApiKey() || process.env.API_KEY || "";
};

export const generateIconImage = async (idea: string, config: StyleConfig): Promise<string> => {
  // Always create a new GoogleGenAI instance right before making an API call to ensure it uses the latest key.
  const apiKey = resolveApiKey();
  if (!apiKey) throw new Error("Missing API key");
  const ai = new GoogleGenAI({ apiKey });
  const styleJson = getIconStyleJson(config);
  const prompt = `generate a ${idea} ${config.format} with this json style ${JSON.stringify(styleJson)}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: config.format === 'banner' ? "16:9" : "1:1"
      }
    }
  });

  // Iterating through all parts to find the image part as it may not be the first part in the response.
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image data returned from model");
};

export const animateIconVideo = async (
  idea: string,
  base64Image: string,
  action: string,
  format: 'icon' | 'banner',
  onProgress: (status: string) => void
): Promise<string> => {
  // Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key.
  const apiKey = resolveApiKey();
  if (!apiKey) throw new Error("Missing API key");
  const ai = new GoogleGenAI({ apiKey });
  
  const videoPrompt = `Create a seamless loop animation of a soft 3D ${idea} ${format} performing a simple motion. The animation should include ${action}. All other elements must remain completely still. The background, lighting, and camera angle should match the reference image exactly. The motion should be smooth, subtle, and optimized for web or UI use. The animation must loop perfectly with no visible start or end.`;

  // Remove data URL prefix if present before passing to generateVideos as imageBytes.
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

  onProgress("Starting video generation...");
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: videoPrompt,
    image: {
      imageBytes: base64Data,
      mimeType: 'image/png',
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9' // Supported values for Veo are 16:9 or 9:16. Banners and icons will both use 16:9 canvas.
    }
  });

  const loadingMessages = [
    "Analyzing your design's structure...",
    "Modeling the 3D physics...",
    "Rendering light paths and shadows...",
    "Interpolating fluid motion...",
    "Optimizing for seamless loops...",
    "Almost there, finishing touches..."
  ];
  let msgIndex = 0;

  // Polling for video completion with reassuring progress messages.
  while (!operation.done) {
    onProgress(loadingMessages[msgIndex % loadingMessages.length]);
    msgIndex++;
    await new Promise(resolve => setTimeout(resolve, 8000));
    operation = await ai.operations.getVideosOperation({ operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed to return a URI");

  // Appending the API key to the fetch request as required for accessing video download links.
  const response = await fetch(`${downloadLink}&key=${apiKey}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
